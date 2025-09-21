from fastapi import FastAPI, APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import aiofiles
import mimetypes
from enum import Enum

# Stripe Integration
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / "uploads" / "videos"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security setup
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Stripe configuration
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
if not STRIPE_API_KEY:
    logging.warning("STRIPE_API_KEY not found in environment variables")

# Create the main app
app = FastAPI(title="Steam Lanka Educational Platform")

# Serve uploaded videos
app.mount("/uploads", StaticFiles(directory=str(ROOT_DIR / "uploads")), name="uploads")

# Create API router
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"

class AgeGroup(str, Enum):
    EARLY = "5-8"  # Early learners
    MIDDLE = "9-12"  # Middle learners
    TEEN = "13-16"  # Teen learners

class Subject(str, Enum):
    AI = "artificial_intelligence"
    CREATIVE_THINKING = "creative_thinking"
    PROBLEM_SOLVING = "problem_solving"

class ActivityType(str, Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    COURSE_ENROLLMENT = "course_enrollment"
    VIDEO_WATCHED = "video_watched"
    VIDEO_COMPLETED = "video_completed"
    COURSE_STARTED = "course_started"
    COURSE_COMPLETED = "course_completed"
    QUIZ_ATTEMPT = "quiz_attempt"
    PAYMENT_MADE = "payment_made"

class SubscriptionType(str, Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"  # 3 months with 15% discount + materials

class PaymentStatus(str, Enum):
    PENDING = "pending"
    INITIATED = "initiated"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"

# Age-based Subscription Pricing (Sri Lankan Rupees)
SUBSCRIPTION_PRICING = {
    "early_learners": {  # Ages 5-8
        "monthly": {
            "digital_price": 1000.00,
            "currency": "lkr",
            "duration_days": 30,
            "name": "Early Learners - Monthly",
            "description": "Ages 5-8: Basic AI concepts and creative play",
            "age_group": "5-8",
            "includes": ["Digital access to all courses", "Progress tracking", "Parent reports"]
        },
        "quarterly": {
            "digital_price": 2550.00,  # 15% discount on 3 months (3000 - 450)
            "materials_price": 1500.00,  # Term book + practical work kit
            "total_price": 4050.00,
            "currency": "lkr",
            "duration_days": 90,
            "name": "Early Learners - Quarterly",
            "description": "Ages 5-8: 3 months with 15% savings + physical materials",
            "age_group": "5-8",
            "includes": ["Digital access (15% discount)", "Term book", "Practical work kit", "Progress tracking", "Parent reports"],
            "savings": "15% off digital + Free shipping"
        }
    },
    "middle_learners": {  # Ages 9-12
        "monthly": {
            "digital_price": 1500.00,
            "currency": "lkr",
            "duration_days": 30,
            "name": "Middle Learners - Monthly", 
            "description": "Ages 9-12: Intermediate AI and creative thinking",
            "age_group": "9-12",
            "includes": ["Digital access to all courses", "Advanced projects", "Progress tracking", "Parent reports"]
        },
        "quarterly": {
            "digital_price": 3825.00,  # 15% discount on 3 months (4500 - 675)
            "materials_price": 1500.00,  # Term book + practical work kit
            "total_price": 5325.00,
            "currency": "lkr",
            "duration_days": 90,
            "name": "Middle Learners - Quarterly",
            "description": "Ages 9-12: 3 months with 15% savings + physical materials",
            "age_group": "9-12",
            "includes": ["Digital access (15% discount)", "Term book", "Practical work kit", "Advanced projects", "Progress tracking", "Parent reports"],
            "savings": "15% off digital + Free shipping"
        }
    },
    "teen_learners": {  # Ages 13-16
        "monthly": {
            "digital_price": 2500.00,
            "currency": "lkr", 
            "duration_days": 30,
            "name": "Teen Learners - Monthly",
            "description": "Ages 13-16: Advanced AI and problem solving",
            "age_group": "13-16",
            "includes": ["Digital access to all courses", "Advanced AI modules", "Problem-solving challenges", "Progress tracking", "Career guidance"]
        },
        "quarterly": {
            "digital_price": 6375.00,  # 15% discount on 3 months (7500 - 1125)
            "materials_price": 1500.00,  # Term book + practical work kit
            "total_price": 7875.00,
            "currency": "lkr",
            "duration_days": 90,
            "name": "Teen Learners - Quarterly", 
            "description": "Ages 13-16: 3 months with 15% savings + physical materials",
            "age_group": "13-16",
            "includes": ["Digital access (15% discount)", "Term book", "Practical work kit", "Advanced AI modules", "Problem-solving challenges", "Progress tracking", "Career guidance"],
            "savings": "15% off digital + Free shipping"
        }
    }
}

# Models
class UserBase(BaseModel):
    email: str
    full_name: str
    role: UserRole
    age_group: Optional[AgeGroup] = None  # Only for students

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    subscription_type: Optional[SubscriptionType] = None
    subscription_expires: Optional[datetime] = None
    total_watch_time: int = 0  # in minutes

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Activity Tracking Models
class ActivityLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    activity_type: ActivityType
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    details: Dict[str, Any] = {}
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class VideoProgress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    video_id: str
    course_id: str
    watched_duration: int = 0  # seconds
    total_duration: int = 0  # seconds
    completed: bool = False
    last_watched: datetime = Field(default_factory=datetime.utcnow)

# Payment Models
class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_id: str
    amount: float
    currency: str = "lkr"
    subscription_type: SubscriptionType
    age_group: AgeGroup
    payment_status: PaymentStatus = PaymentStatus.PENDING
    stripe_payment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = {}

class SubscriptionRequest(BaseModel):
    subscription_type: SubscriptionType  # monthly or quarterly
    age_group: AgeGroup  # 5-8, 9-12, or 13-16
    success_url: str
    cancel_url: str

class VideoBase(BaseModel):
    title: str
    description: str
    duration_minutes: Optional[int] = None

class Video(VideoBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    file_path: str
    file_size: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    uploaded_by: str  # teacher user id

class CourseBase(BaseModel):
    title: str
    description: str
    subject: Subject
    age_group: AgeGroup
    thumbnail_url: Optional[str] = None
    is_premium: bool = False  # Free vs Premium courses

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_by: str  # teacher user id
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_published: bool = False
    videos: List[Video] = []

class Enrollment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    course_id: str
    enrolled_at: datetime = Field(default_factory=datetime.utcnow)
    progress_percentage: float = 0.0
    completed_videos: List[str] = []
    total_watch_time: int = 0  # in minutes

# Analytics Models
class StudentAnalytics(BaseModel):
    user_id: str
    full_name: str
    email: str
    role: UserRole
    age_group: Optional[AgeGroup]
    subscription_type: Optional[SubscriptionType]
    subscription_expires: Optional[datetime]
    total_enrollments: int = 0
    total_watch_time: int = 0
    last_login: Optional[datetime] = None
    courses_completed: int = 0
    recent_activities: List[ActivityLog] = []

class TeacherAnalytics(BaseModel):
    courses_created: int = 0
    total_students: int = 0
    total_enrollments: int = 0
    popular_courses: List[Dict[str, Any]] = []

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def log_activity(user_id: str, activity_type: ActivityType, details: Dict[str, Any] = None, request: Request = None):
    """Log user activity for analytics"""
    activity = ActivityLog(
        user_id=user_id,
        activity_type=activity_type,
        details=details or {},
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("user-agent") if request else None
    )
    await db.activity_logs.insert_one(activity.dict())

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user)

async def get_current_teacher(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.TEACHER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Teacher access required")
    return current_user

async def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def check_subscription_access(user: User) -> bool:
    """Check if user has valid subscription for premium content"""
    if not user.subscription_type:
        return False
    if user.subscription_expires and user.subscription_expires < datetime.utcnow():
        return False
    return True

def get_age_group_key(age_group: AgeGroup) -> str:
    """Convert age group enum to pricing key"""
    mapping = {
        AgeGroup.EARLY: "early_learners",
        AgeGroup.MIDDLE: "middle_learners", 
        AgeGroup.TEEN: "teen_learners"
    }
    return mapping[age_group]

# Authentication Routes
@api_router.post("/register", response_model=User)
async def register_user(user: UserCreate, request: Request):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and create user
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    del user_dict["password"]
    user_obj = User(**user_dict)
    
    # Store in database
    user_data = user_obj.dict()
    user_data["hashed_password"] = hashed_password
    await db.users.insert_one(user_data)
    
    # Log registration activity
    await log_activity(user_obj.id, ActivityType.LOGIN, {"action": "registration"}, request)
    
    return user_obj

@api_router.post("/login", response_model=Token)
async def login_user(login_data: UserLogin, request: Request):
    # Find user
    user_data = await db.users.find_one({"email": login_data.email})
    if not user_data or not verify_password(login_data.password, user_data["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    # Create access token
    access_token = create_access_token(data={"sub": user_data["id"]})
    user = User(**{k: v for k, v in user_data.items() if k != "hashed_password"})
    
    # Log login activity
    await log_activity(user.id, ActivityType.LOGIN, {"login_time": datetime.utcnow().isoformat()}, request)
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/logout")
async def logout_user(current_user: User = Depends(get_current_user), request: Request = None):
    # Log logout activity
    await log_activity(current_user.id, ActivityType.LOGOUT, {"logout_time": datetime.utcnow().isoformat()}, request)
    return {"message": "Logged out successfully"}

@api_router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# Subscription & Payment Routes
@api_router.get("/subscription/plans")
async def get_subscription_plans():
    """Get all subscription plans organized by age group"""
    return SUBSCRIPTION_PRICING

@api_router.post("/subscription/checkout")
async def create_subscription_checkout(
    subscription_request: SubscriptionRequest,
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Payment processing not configured")
    
    # Get pricing for user's age group and subscription type
    age_group_key = get_age_group_key(subscription_request.age_group)
    
    if age_group_key not in SUBSCRIPTION_PRICING:
        raise HTTPException(status_code=400, detail="Invalid age group")
    
    if subscription_request.subscription_type.value not in SUBSCRIPTION_PRICING[age_group_key]:
        raise HTTPException(status_code=400, detail="Invalid subscription type")
    
    plan_info = SUBSCRIPTION_PRICING[age_group_key][subscription_request.subscription_type.value]
    
    # Calculate total amount
    if subscription_request.subscription_type == SubscriptionType.QUARTERLY:
        amount = plan_info["total_price"]  # Includes digital + materials
    else:
        amount = plan_info["digital_price"]  # Monthly only has digital
    
    # Initialize Stripe checkout
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Create checkout session
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="lkr",
        success_url=subscription_request.success_url,
        cancel_url=subscription_request.cancel_url,
        metadata={
            "user_id": current_user.id,
            "subscription_type": subscription_request.subscription_type.value,
            "age_group": subscription_request.age_group.value,
            "user_email": current_user.email,
            "plan_name": plan_info["name"]
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    payment_transaction = PaymentTransaction(
        user_id=current_user.id,
        session_id=session.session_id,
        amount=amount,
        currency="lkr",
        subscription_type=subscription_request.subscription_type,
        age_group=subscription_request.age_group,
        payment_status=PaymentStatus.INITIATED,
        metadata={
            "plan_name": plan_info["name"],
            "duration_days": plan_info["duration_days"],
            "includes_materials": subscription_request.subscription_type == SubscriptionType.QUARTERLY
        }
    )
    
    await db.payment_transactions.insert_one(payment_transaction.dict())
    
    # Log payment activity
    await log_activity(
        current_user.id, 
        ActivityType.PAYMENT_MADE, 
        {
            "action": "checkout_initiated", 
            "subscription_type": subscription_request.subscription_type.value,
            "age_group": subscription_request.age_group.value,
            "amount": amount
        },
        request
    )
    
    return {"checkout_url": session.url, "session_id": session.session_id}

@api_router.get("/payment/status/{session_id}")
async def check_payment_status(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Payment processing not configured")
    
    # Find payment transaction
    transaction = await db.payment_transactions.find_one({"session_id": session_id, "user_id": current_user.id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Payment transaction not found")
    
    # Check with Stripe
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    status_response = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction status if payment completed and not already processed
    if status_response.payment_status == "paid" and transaction["payment_status"] != PaymentStatus.COMPLETED:
        age_group_key = get_age_group_key(AgeGroup(transaction["age_group"]))
        plan_info = SUBSCRIPTION_PRICING[age_group_key][transaction["subscription_type"]]
        
        # Calculate subscription expiry
        expire_date = datetime.utcnow() + timedelta(days=plan_info["duration_days"])
        
        # Update user subscription
        await db.users.update_one(
            {"id": current_user.id},
            {
                "$set": {
                    "subscription_type": transaction["subscription_type"],
                    "subscription_expires": expire_date
                }
            }
        )
        
        # Update transaction status
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "payment_status": PaymentStatus.COMPLETED,
                    "completed_at": datetime.utcnow(),
                    "stripe_payment_id": status_response.metadata.get("payment_intent_id")
                }
            }
        )
        
        # Log successful payment
        await log_activity(
            current_user.id,
            ActivityType.PAYMENT_MADE,
            {
                "action": "payment_completed",
                "subscription_type": transaction["subscription_type"],
                "age_group": transaction["age_group"],
                "amount": transaction["amount"],
                "expires": expire_date.isoformat()
            }
        )
    
    return {
        "payment_status": status_response.payment_status,
        "subscription_type": transaction["subscription_type"],
        "age_group": transaction["age_group"],
        "amount": transaction["amount"]
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Payment processing not configured")
    
    body = await request.body()
    stripe_signature = request.headers.get("Stripe-Signature")
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, stripe_signature)
        
        # Handle webhook events
        if webhook_response.event_type == "checkout.session.completed":
            session_id = webhook_response.session_id
            
            # Find and update transaction
            transaction = await db.payment_transactions.find_one({"session_id": session_id})
            if transaction:
                age_group_key = get_age_group_key(AgeGroup(transaction["age_group"]))
                plan_info = SUBSCRIPTION_PRICING[age_group_key][transaction["subscription_type"]]
                expire_date = datetime.utcnow() + timedelta(days=plan_info["duration_days"])
                
                # Update user subscription
                await db.users.update_one(
                    {"id": transaction["user_id"]},
                    {
                        "$set": {
                            "subscription_type": transaction["subscription_type"],
                            "subscription_expires": expire_date
                        }
                    }
                )
                
                # Update transaction
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {
                        "$set": {
                            "payment_status": PaymentStatus.COMPLETED,
                            "completed_at": datetime.utcnow()
                        }
                    }
                )
        
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail="Webhook processing failed")

# Course Routes
@api_router.post("/courses", response_model=Course)
async def create_course(course: CourseCreate, current_user: User = Depends(get_current_teacher), request: Request = None):
    course_obj = Course(**course.dict(), created_by=current_user.id)
    await db.courses.insert_one(course_obj.dict())
    
    # Log course creation
    await log_activity(
        current_user.id,
        ActivityType.COURSE_STARTED,
        {"action": "course_created", "course_id": course_obj.id, "course_title": course_obj.title},
        request
    )
    
    return course_obj

@api_router.get("/courses", response_model=List[Course])
async def get_courses(
    subject: Optional[Subject] = None,
    age_group: Optional[AgeGroup] = None,
    published_only: bool = True,
    current_user: Optional[User] = Depends(get_current_user)
):
    query = {}
    if subject:
        query["subject"] = subject
    if age_group:
        query["age_group"] = age_group
    if published_only:
        query["is_published"] = True
    
    courses = await db.courses.find(query).to_list(100)
    
    # Filter premium courses based on subscription
    if current_user:
        has_subscription = check_subscription_access(current_user)
        if not has_subscription:
            courses = [course for course in courses if not course.get("is_premium", False)]
    else:
        courses = [course for course in courses if not course.get("is_premium", False)]
    
    return [Course(**course) for course in courses]

@api_router.get("/courses/{course_id}", response_model=Course)
async def get_course(course_id: str, current_user: Optional[User] = Depends(get_current_user)):
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check premium access
    if course.get("is_premium", False) and current_user:
        if not check_subscription_access(current_user):
            raise HTTPException(status_code=403, detail="Premium subscription required")
    
    return Course(**course)

@api_router.put("/courses/{course_id}/publish")
async def publish_course(course_id: str, current_user: User = Depends(get_current_teacher)):
    result = await db.courses.update_one(
        {"id": course_id, "created_by": current_user.id},
        {"$set": {"is_published": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found or unauthorized")
    return {"message": "Course published successfully"}

# Video Routes
@api_router.post("/courses/{course_id}/videos")
async def upload_video(
    course_id: str,
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(...),
    duration_minutes: Optional[int] = Form(None),
    current_user: User = Depends(get_current_teacher)
):
    # Verify course exists and user owns it
    course = await db.courses.find_one({"id": course_id, "created_by": current_user.id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or unauthorized")
    
    # Check file type
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Create video record
    video = Video(
        title=title,
        description=description,
        duration_minutes=duration_minutes,
        filename=file.filename,
        file_path=str(file_path),
        file_size=len(content),
        uploaded_by=current_user.id
    )
    
    # Add video to course
    await db.courses.update_one(
        {"id": course_id},
        {"$push": {"videos": video.dict()}}
    )
    
    return video

@api_router.get("/videos/{video_id}/stream")
async def stream_video(video_id: str, current_user: User = Depends(get_current_user)):
    # Find video in any course
    course = await db.courses.find_one({"videos.id": video_id})
    if not course:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Check premium access
    if course.get("is_premium", False):
        if not check_subscription_access(current_user):
            raise HTTPException(status_code=403, detail="Premium subscription required")
    
    # Find specific video
    video = None
    for v in course["videos"]:
        if v["id"] == video_id:
            video = v
            break
    
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    file_path = Path(video["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Video file not found")
    
    # Log video watch activity
    await log_activity(
        current_user.id,
        ActivityType.VIDEO_WATCHED,
        {"video_id": video_id, "course_id": course["id"], "video_title": video["title"]}
    )
    
    # Get file info
    file_size = file_path.stat().st_size
    content_type = mimetypes.guess_type(str(file_path))[0] or "video/mp4"
    
    # Stream file
    def iterfile():
        with open(file_path, mode="rb") as file_like:
            yield from file_like
    
    return StreamingResponse(
        iterfile(),
        media_type=content_type,
        headers={"Content-Length": str(file_size)}
    )

# Enrollment Routes
@api_router.post("/courses/{course_id}/enroll")
async def enroll_in_course(course_id: str, current_user: User = Depends(get_current_user), request: Request = None):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can enroll in courses")
    
    # Check if course exists and is published
    course = await db.courses.find_one({"id": course_id, "is_published": True})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or not published")
    
    # Check premium access
    if course.get("is_premium", False):
        if not check_subscription_access(current_user):
            raise HTTPException(status_code=403, detail="Premium subscription required")
    
    # Check if already enrolled
    existing_enrollment = await db.enrollments.find_one({
        "student_id": current_user.id,
        "course_id": course_id
    })
    if existing_enrollment:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    # Create enrollment
    enrollment = Enrollment(student_id=current_user.id, course_id=course_id)
    await db.enrollments.insert_one(enrollment.dict())
    
    # Log enrollment activity
    await log_activity(
        current_user.id,
        ActivityType.COURSE_ENROLLMENT,
        {"course_id": course_id, "course_title": course.get("title", "")},
        request
    )
    
    return enrollment

@api_router.get("/my-enrollments", response_model=List[Course])
async def get_my_enrollments(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students have enrollments")
    
    # Get user's enrollments
    enrollments = await db.enrollments.find({"student_id": current_user.id}).to_list(100)
    course_ids = [e["course_id"] for e in enrollments]
    
    # Get enrolled courses
    courses = await db.courses.find({"id": {"$in": course_ids}}).to_list(100)
    return [Course(**course) for course in courses]

@api_router.put("/enrollments/{course_id}/progress")
async def update_progress(
    course_id: str,
    video_id: str,
    watched_duration: int = 0,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can update progress")
    
    # Update enrollment with completed video
    result = await db.enrollments.update_one(
        {"student_id": current_user.id, "course_id": course_id},
        {
            "$addToSet": {"completed_videos": video_id},
            "$set": {"last_updated": datetime.utcnow()},
            "$inc": {"total_watch_time": watched_duration}
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    # Update video progress tracking
    video_progress = VideoProgress(
        user_id=current_user.id,
        video_id=video_id,
        course_id=course_id,
        watched_duration=watched_duration,
        completed=True,
        last_watched=datetime.utcnow()
    )
    
    await db.video_progress.replace_one(
        {"user_id": current_user.id, "video_id": video_id},
        video_progress.dict(),
        upsert=True
    )
    
    # Calculate progress percentage
    course = await db.courses.find_one({"id": course_id})
    if course:
        total_videos = len(course.get("videos", []))
        enrollment = await db.enrollments.find_one({
            "student_id": current_user.id,
            "course_id": course_id
        })
        completed_count = len(enrollment.get("completed_videos", []))
        progress_percentage = (completed_count / total_videos * 100) if total_videos > 0 else 0
        
        await db.enrollments.update_one(
            {"student_id": current_user.id, "course_id": course_id},
            {"$set": {"progress_percentage": progress_percentage}}
        )
        
        # Log video completion
        await log_activity(
            current_user.id,
            ActivityType.VIDEO_COMPLETED,
            {
                "video_id": video_id,
                "course_id": course_id,
                "watched_duration": watched_duration,
                "progress_percentage": progress_percentage
            }
        )
    
    return {"message": "Progress updated successfully"}

# Analytics Routes
@api_router.get("/analytics/students", response_model=List[StudentAnalytics])
async def get_students_analytics(
    current_user: User = Depends(get_current_teacher),
    limit: int = 50,
    offset: int = 0
):
    """Get detailed student analytics for teachers and admins"""
    
    # For teachers, only show students enrolled in their courses
    if current_user.role == UserRole.TEACHER:
        # Get teacher's courses
        teacher_courses = await db.courses.find({"created_by": current_user.id}).to_list(1000)
        course_ids = [course["id"] for course in teacher_courses]
        
        # Get enrollments in teacher's courses
        enrollments = await db.enrollments.find({"course_id": {"$in": course_ids}}).to_list(1000)
        student_ids = list(set([enrollment["student_id"] for enrollment in enrollments]))
    else:
        # Admins can see all students
        student_ids = []
        all_students = await db.users.find({"role": "student"}).to_list(1000)
        student_ids = [student["id"] for student in all_students]
    
    # Get student data with analytics
    students_analytics = []
    
    for student_id in student_ids[offset:offset+limit]:
        # Get user details
        user = await db.users.find_one({"id": student_id})
        if not user:
            continue
        
        # Get enrollment count
        enrollments = await db.enrollments.find({"student_id": student_id}).to_list(1000)
        
        # Get total watch time
        total_watch_time = sum([enrollment.get("total_watch_time", 0) for enrollment in enrollments])
        
        # Get courses completed (100% progress)
        courses_completed = len([e for e in enrollments if e.get("progress_percentage", 0) >= 100])
        
        # Get last login
        last_login_activity = await db.activity_logs.find_one(
            {"user_id": student_id, "activity_type": "login"},
            sort=[("timestamp", -1)]
        )
        last_login = last_login_activity["timestamp"] if last_login_activity else None
        
        # Get recent activities (last 10)
        recent_activities = await db.activity_logs.find(
            {"user_id": student_id}
        ).sort("timestamp", -1).limit(10).to_list(10)
        
        student_analytics = StudentAnalytics(
            user_id=user["id"],
            full_name=user["full_name"],
            email=user["email"],
            role=UserRole(user["role"]),
            age_group=AgeGroup(user["age_group"]) if user.get("age_group") else None,
            subscription_type=SubscriptionType(user["subscription_type"]) if user.get("subscription_type") else None,
            subscription_expires=user.get("subscription_expires"),
            total_enrollments=len(enrollments),
            total_watch_time=total_watch_time,
            last_login=last_login,
            courses_completed=courses_completed,
            recent_activities=[ActivityLog(**activity) for activity in recent_activities]
        )
        
        students_analytics.append(student_analytics)
    
    return students_analytics

@api_router.get("/analytics/teacher-stats", response_model=TeacherAnalytics)
async def get_teacher_analytics(current_user: User = Depends(get_current_teacher)):
    """Get analytics for a specific teacher"""
    
    # Get teacher's courses
    courses = await db.courses.find({"created_by": current_user.id}).to_list(1000)
    course_ids = [course["id"] for course in courses]
    
    # Get enrollments in teacher's courses
    enrollments = await db.enrollments.find({"course_id": {"$in": course_ids}}).to_list(1000)
    
    # Get unique students
    unique_students = len(set([enrollment["student_id"] for enrollment in enrollments]))
    
    # Get popular courses (by enrollment count)
    course_enrollment_counts = {}
    for enrollment in enrollments:
        course_id = enrollment["course_id"]
        course_enrollment_counts[course_id] = course_enrollment_counts.get(course_id, 0) + 1
    
    # Get course details for popular courses
    popular_courses = []
    for course_id, enrollment_count in sorted(course_enrollment_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
        course = next((c for c in courses if c["id"] == course_id), None)
        if course:
            popular_courses.append({
                "course_id": course_id,
                "title": course["title"],
                "enrollments": enrollment_count,
                "subject": course["subject"]
            })
    
    return TeacherAnalytics(
        courses_created=len(courses),
        total_students=unique_students,
        total_enrollments=len(enrollments),
        popular_courses=popular_courses
    )

@api_router.get("/analytics/student/{student_id}", response_model=StudentAnalytics)
async def get_student_details(
    student_id: str,
    current_user: User = Depends(get_current_teacher)
):
    """Get detailed analytics for a specific student"""
    
    # Check permission
    if current_user.role == UserRole.TEACHER:
        # Check if student is enrolled in teacher's courses
        teacher_courses = await db.courses.find({"created_by": current_user.id}).to_list(1000)
        course_ids = [course["id"] for course in teacher_courses]
        
        student_enrollments = await db.enrollments.find({
            "student_id": student_id,
            "course_id": {"$in": course_ids}
        }).to_list(1000)
        
        if not student_enrollments:
            raise HTTPException(status_code=403, detail="Access denied to this student's data")
    
    # Get student data (reuse logic from get_students_analytics)
    user = await db.users.find_one({"id": student_id})
    if not user or user["role"] != "student":
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get comprehensive analytics
    enrollments = await db.enrollments.find({"student_id": student_id}).to_list(1000)
    total_watch_time = sum([enrollment.get("total_watch_time", 0) for enrollment in enrollments])
    courses_completed = len([e for e in enrollments if e.get("progress_percentage", 0) >= 100])
    
    # Get last login
    last_login_activity = await db.activity_logs.find_one(
        {"user_id": student_id, "activity_type": "login"},
        sort=[("timestamp", -1)]
    )
    last_login = last_login_activity["timestamp"] if last_login_activity else None
    
    # Get recent activities (last 50 for detailed view)
    recent_activities = await db.activity_logs.find(
        {"user_id": student_id}
    ).sort("timestamp", -1).limit(50).to_list(50)
    
    return StudentAnalytics(
        user_id=user["id"],
        full_name=user["full_name"],
        email=user["email"],
        role=UserRole(user["role"]),
        age_group=AgeGroup(user["age_group"]) if user.get("age_group") else None,
        subscription_type=SubscriptionType(user["subscription_type"]) if user.get("subscription_type") else None,
        subscription_expires=user.get("subscription_expires"),
        total_enrollments=len(enrollments),
        total_watch_time=total_watch_time,
        last_login=last_login,
        courses_completed=courses_completed,
        recent_activities=[ActivityLog(**activity) for activity in recent_activities]
    )

# Basic health check
@api_router.get("/")
async def root():
    return {
        "message": "Steam Lanka Educational Platform API",
        "operator": "TEC Sri Lanka Worldwide (Pvt.) Ltd",
        "services": "AI, Creative Thinking & Problem Solving Education",
        "version": "1.0.0"
    }

# Include router
app.include_router(api_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
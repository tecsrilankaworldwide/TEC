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
app = FastAPI(title="TEC Future-Ready Learning Platform")

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
    FOUNDATION = "5-8"  # Foundation Level
    DEVELOPMENT = "9-12"  # Development Level  
    MASTERY = "13-16"  # Mastery Level

class LearningLevel(str, Enum):
    FOUNDATION = "foundation"
    DEVELOPMENT = "development"
    MASTERY = "mastery"

class SkillArea(str, Enum):
    AI_LITERACY = "ai_literacy"
    LOGICAL_THINKING = "logical_thinking"
    CREATIVE_PROBLEM_SOLVING = "creative_problem_solving"
    FUTURE_CAREER_SKILLS = "future_career_skills"
    SYSTEMS_THINKING = "systems_thinking"
    INNOVATION_METHODS = "innovation_methods"

class ActivityType(str, Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    COURSE_ENROLLMENT = "course_enrollment"
    VIDEO_WATCHED = "video_watched"
    VIDEO_COMPLETED = "video_completed"
    COURSE_STARTED = "course_started"
    COURSE_COMPLETED = "course_completed"
    SKILL_PROGRESSION = "skill_progression"
    PAYMENT_MADE = "payment_made"
    LEARNING_PATH_UPDATED = "learning_path_updated"
    WORKOUT_STARTED = "workout_started"
    WORKOUT_COMPLETED = "workout_completed"
    WORKOUT_ATTEMPT = "workout_attempt"

class SubscriptionType(str, Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUAL = "annual"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    INITIATED = "initiated"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"

# Future-Ready Curriculum Structure
LEARNING_FRAMEWORK = {
    "foundation": {  # Ages 5-8
        "level_name": "Foundation Level",
        "age_range": "5-8",
        "icon": "🌱",
        "description": "Building blocks of future thinking",
        "core_skills": [
            "Basic AI Understanding",
            "Simple Logical Reasoning", 
            "Creative Expression",
            "Problem Recognition",
            "Digital Awareness"
        ],
        "future_readiness": [
            "Technology Curiosity",
            "Basic Computational Thinking",
            "Creative Confidence",
            "Question Asking Skills"
        ]
    },
    "development": {  # Ages 9-12  
        "level_name": "Development Level",
        "age_range": "9-12",
        "icon": "🧠", 
        "description": "Expanding logical and creative thinking",
        "core_skills": [
            "Logical Reasoning Mastery",
            "AI Applications Understanding",
            "Design Thinking Process",
            "Complex Problem Solving",
            "Systems Understanding"
        ],
        "future_readiness": [
            "Algorithmic Thinking",
            "Innovation Mindset", 
            "Collaboration Skills",
            "Adaptability Training"
        ]
    },
    "mastery": {  # Ages 13-16
        "level_name": "Mastery Level", 
        "age_range": "13-16",
        "icon": "🎯",
        "description": "Future career and leadership preparation",
        "core_skills": [
            "Advanced AI Concepts",
            "Innovation Methodologies",
            "Systems Thinking",
            "Leadership Principles",
            "Future Career Navigation"
        ],
        "future_readiness": [
            "Entrepreneurial Thinking",
            "Advanced Problem Solving",
            "Technology Leadership",
            "Global Perspective",
            "Continuous Learning Mindset"
        ]
    }
}

# Unified Subscription Pricing
UNIFIED_PRICING = {
    "foundation": {  # Ages 5-8
        "monthly": {
            "price": 1200.00,  # Slightly increased for unified platform value
            "currency": "lkr",
            "duration_days": 30,
            "name": "Foundation Level - Monthly",
            "description": "Complete foundation skills for ages 5-8",
            "features": ["AI Basics", "Simple Logic", "Creative Play", "Progress Tracking"]
        },
        "quarterly": {
            "digital_price": 3060.00,  # 15% discount
            "materials_price": 1500.00,
            "total_price": 4560.00,
            "currency": "lkr",
            "duration_days": 90,
            "name": "Foundation Level - Quarterly",
            "description": "3 months + learning materials for ages 5-8",
            "features": ["All digital content", "Physical learning kit", "Activity books", "Parent guides"]
        }
    },
    "development": {  # Ages 9-12
        "monthly": {
            "price": 1800.00,
            "currency": "lkr",
            "duration_days": 30,
            "name": "Development Level - Monthly", 
            "description": "Advanced thinking skills for ages 9-12",
            "features": ["Logical Reasoning", "AI Applications", "Design Thinking", "Complex Problems"]
        },
        "quarterly": {
            "digital_price": 4590.00,  # 15% discount
            "materials_price": 1500.00,
            "total_price": 6090.00,
            "currency": "lkr",
            "duration_days": 90,
            "name": "Development Level - Quarterly",
            "description": "3 months + advanced materials for ages 9-12",
            "features": ["All digital content", "Advanced project kits", "Logic puzzles", "Innovation challenges"]
        }
    },
    "mastery": {  # Ages 13-16
        "monthly": {
            "price": 2800.00,
            "currency": "lkr",
            "duration_days": 30,
            "name": "Mastery Level - Monthly",
            "description": "Future career preparation for ages 13-16",
            "features": ["Advanced AI", "Innovation Methods", "Leadership Skills", "Career Guidance"]
        },
        "quarterly": {
            "digital_price": 7140.00,  # 15% discount
            "materials_price": 1500.00,
            "total_price": 8640.00,
            "currency": "lkr",
            "duration_days": 90,
            "name": "Mastery Level - Quarterly", 
            "description": "3 months + professional materials for ages 13-16",
            "features": ["All digital content", "Professional toolkit", "Career workbooks", "Future skills training"]
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
    learning_level: Optional[LearningLevel] = None
    skill_progress: Dict[str, int] = {}  # Skill area progress percentages
    total_watch_time: int = 0  # in minutes

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Enhanced Course Models
class CourseBase(BaseModel):
    title: str
    description: str
    learning_level: LearningLevel
    skill_areas: List[SkillArea]
    age_group: AgeGroup
    thumbnail_url: Optional[str] = None
    is_premium: bool = False
    difficulty_level: int = 1  # 1-5 scale
    estimated_hours: Optional[int] = None

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_by: str  # teacher user id
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_published: bool = False
    videos: List[Dict[str, Any]] = []
    enrollment_count: int = 0
    average_rating: float = 0.0

class LearningPathProgress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    learning_level: LearningLevel
    skill_progress: Dict[str, int] = {}  # Skill area completion percentages
    completed_courses: List[str] = []
    current_focus_areas: List[SkillArea] = []
    total_learning_time: int = 0
    level_completion_percentage: float = 0.0
    next_recommended_courses: List[str] = []
    last_updated: datetime = Field(default_factory=datetime.utcnow)

# Helper functions (keeping existing ones and adding new)
def get_learning_level_from_age(age_group: AgeGroup) -> LearningLevel:
    mapping = {
        AgeGroup.FOUNDATION: LearningLevel.FOUNDATION,
        AgeGroup.DEVELOPMENT: LearningLevel.DEVELOPMENT,
        AgeGroup.MASTERY: LearningLevel.MASTERY
    }
    return mapping[age_group]

def get_pricing_key_from_age(age_group: AgeGroup) -> str:
    mapping = {
        AgeGroup.FOUNDATION: "foundation",
        AgeGroup.DEVELOPMENT: "development", 
        AgeGroup.MASTERY: "mastery"
    }
    return mapping[age_group]

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
    activity = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "activity_type": activity_type.value,
        "timestamp": datetime.utcnow(),
        "details": details or {},
        "ip_address": request.client.host if request else None,
        "user_agent": request.headers.get("user-agent") if request else None
    }
    await db.activity_logs.insert_one(activity)

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

# Authentication Routes
@api_router.post("/register", response_model=User)
async def register_user(user: UserCreate, request: Request):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and create user
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    del user_dict["password"]
    user_obj = User(**user_dict)
    
    # Set learning level based on age group
    if user_obj.age_group:
        user_obj.learning_level = get_learning_level_from_age(user_obj.age_group)
    
    # Store in database
    user_data = user_obj.dict()
    user_data["hashed_password"] = hashed_password
    await db.users.insert_one(user_data)
    
    # Initialize learning path for students
    if user_obj.role == UserRole.STUDENT and user_obj.learning_level:
        learning_path = LearningPathProgress(
            student_id=user_obj.id,
            learning_level=user_obj.learning_level,
            skill_progress={skill.value: 0 for skill in SkillArea}
        )
        await db.learning_paths.insert_one(learning_path.dict())
    
    # Log registration activity
    await log_activity(user_obj.id, ActivityType.LOGIN, {"action": "registration"}, request)
    
    return user_obj

@api_router.post("/login", response_model=Token)
async def login_user(login_data: UserLogin, request: Request):
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
    await log_activity(current_user.id, ActivityType.LOGOUT, {"logout_time": datetime.utcnow().isoformat()}, request)
    return {"message": "Logged out successfully"}

@api_router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# Learning Framework Routes
@api_router.get("/learning-framework")
async def get_learning_framework():
    """Get the complete TEC learning framework"""
    return LEARNING_FRAMEWORK

@api_router.get("/learning-path")
async def get_learning_path(current_user: User = Depends(get_current_user)):
    """Get student's learning path progress"""
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students have learning paths")
    
    learning_path = await db.learning_paths.find_one({"student_id": current_user.id})
    if not learning_path:
        # Create learning path if doesn't exist
        learning_path = LearningPathProgress(
            student_id=current_user.id,
            learning_level=current_user.learning_level or LearningLevel.FOUNDATION,
            skill_progress={skill.value: 0 for skill in SkillArea}
        )
        await db.learning_paths.insert_one(learning_path.dict())
        learning_path = learning_path.dict()
    
    # Add framework information
    framework_info = LEARNING_FRAMEWORK.get(learning_path["learning_level"], LEARNING_FRAMEWORK["foundation"])
    learning_path["framework"] = framework_info
    
    return learning_path

# Subscription Routes
@api_router.get("/subscription/plans")
async def get_subscription_plans():
    """Get unified subscription plans"""
    return UNIFIED_PRICING

@api_router.post("/subscription/checkout")
async def create_subscription_checkout(
    subscription_request: dict,
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Payment processing not configured")
    
    subscription_type = subscription_request.get("subscription_type")
    age_group = subscription_request.get("age_group")
    
    # Get pricing
    pricing_key = get_pricing_key_from_age(AgeGroup(age_group))
    
    if pricing_key not in UNIFIED_PRICING:
        raise HTTPException(status_code=400, detail="Invalid pricing level")
    
    if subscription_type not in UNIFIED_PRICING[pricing_key]:
        raise HTTPException(status_code=400, detail="Invalid subscription type")
    
    plan_info = UNIFIED_PRICING[pricing_key][subscription_type]
    
    # Calculate amount
    amount = plan_info.get("total_price", plan_info["price"])
    
    # Initialize Stripe checkout
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Create checkout session
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="lkr",
        success_url=subscription_request["success_url"],
        cancel_url=subscription_request["cancel_url"],
        metadata={
            "user_id": current_user.id,
            "subscription_type": subscription_type,
            "age_group": age_group,
            "user_email": current_user.email,
            "plan_name": plan_info["name"]
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    return {"checkout_url": session.url, "session_id": session.session_id}

# Course Routes  
@api_router.post("/courses", response_model=Course)
async def create_course(course: CourseCreate, current_user: User = Depends(get_current_teacher), request: Request = None):
    course_obj = Course(**course.dict(), created_by=current_user.id)
    await db.courses.insert_one(course_obj.dict())
    
    await log_activity(
        current_user.id,
        ActivityType.COURSE_STARTED,
        {"action": "course_created", "course_id": course_obj.id, "course_title": course_obj.title},
        request
    )
    
    return course_obj

@api_router.get("/courses")
async def get_courses(
    learning_level: Optional[LearningLevel] = None,
    skill_area: Optional[SkillArea] = None,
    age_group: Optional[AgeGroup] = None,
    published_only: bool = True
):
    query = {}
    if learning_level:
        query["learning_level"] = learning_level.value
    if age_group:
        query["age_group"] = age_group.value
    if skill_area:
        query["skill_areas"] = {"$in": [skill_area.value]}
    if published_only:
        query["is_published"] = True
    
    courses = await db.courses.find(query).to_list(100)
    return courses

# Analytics Routes
@api_router.get("/analytics/students")
async def get_students_analytics(current_user: User = Depends(get_current_teacher)):
    """Get detailed student analytics for the unified platform"""
    
    students = []
    if current_user.role == UserRole.TEACHER:
        # Get students from teacher's courses
        teacher_courses = await db.courses.find({"created_by": current_user.id}).to_list(1000)
        course_ids = [course["id"] for course in teacher_courses]
        enrollments = await db.enrollments.find({"course_id": {"$in": course_ids}}).to_list(1000)
        student_ids = list(set([e["student_id"] for e in enrollments]))
    else:
        # Admins see all students
        all_users = await db.users.find({"role": "student"}).to_list(1000)
        student_ids = [user["id"] for user in all_users]
    
    for student_id in student_ids:
        user = await db.users.find_one({"id": student_id})
        if user:
            # Get learning path progress
            learning_path = await db.learning_paths.find_one({"student_id": student_id})
            
            # Get recent activities
            activities = await db.activity_logs.find(
                {"user_id": student_id}
            ).sort("timestamp", -1).limit(5).to_list(5)
            
            students.append({
                "user_id": user["id"],
                "full_name": user["full_name"],
                "email": user["email"],
                "age_group": user.get("age_group"),
                "learning_level": user.get("learning_level"),
                "subscription_type": user.get("subscription_type"),
                "skill_progress": learning_path["skill_progress"] if learning_path else {},
                "level_completion": learning_path["level_completion_percentage"] if learning_path else 0,
                "total_learning_time": learning_path["total_learning_time"] if learning_path else 0,
                "recent_activities": activities
            })
    
    return students

# Basic health check
@api_router.get("/")
async def root():
    return {
        "message": "TEC Future-Ready Learning Platform API",
        "operator": "TEC Sri Lanka Worldwide (Pvt.) Ltd",
        "services": "Complete Future-Ready Education for Ages 5-16",
        "established": "1982",
        "legacy": "42 Years of Educational Excellence",
        "focus": "AI • Logical Thinking • Creative Problem Solving • Future Career Skills",
        "version": "2.0.0 - Unified Platform"
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
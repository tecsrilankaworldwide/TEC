from fastapi import FastAPI, APIRouter, Depends, HTTPException, UploadFile, File, Form
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
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import aiofiles
import mimetypes
from enum import Enum

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

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

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
async def register_user(user: UserCreate):
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
    
    return user_obj

@api_router.post("/login", response_model=Token)
async def login_user(login_data: UserLogin):
    # Find user
    user_data = await db.users.find_one({"email": login_data.email})
    if not user_data or not verify_password(login_data.password, user_data["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    # Create access token
    access_token = create_access_token(data={"sub": user_data["id"]})
    user = User(**{k: v for k, v in user_data.items() if k != "hashed_password"})
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# Course Routes
@api_router.post("/courses", response_model=Course)
async def create_course(course: CourseCreate, current_user: User = Depends(get_current_teacher)):
    course_obj = Course(**course.dict(), created_by=current_user.id)
    await db.courses.insert_one(course_obj.dict())
    return course_obj

@api_router.get("/courses", response_model=List[Course])
async def get_courses(
    subject: Optional[Subject] = None,
    age_group: Optional[AgeGroup] = None,
    published_only: bool = True
):
    query = {}
    if subject:
        query["subject"] = subject
    if age_group:
        query["age_group"] = age_group
    if published_only:
        query["is_published"] = True
    
    courses = await db.courses.find(query).to_list(100)
    return [Course(**course) for course in courses]

@api_router.get("/courses/{course_id}", response_model=Course)
async def get_course(course_id: str):
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
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
async def stream_video(video_id: str):
    # Find video in any course
    course = await db.courses.find_one({"videos.id": video_id})
    if not course:
        raise HTTPException(status_code=404, detail="Video not found")
    
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
async def enroll_in_course(course_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can enroll in courses")
    
    # Check if course exists and is published
    course = await db.courses.find_one({"id": course_id, "is_published": True})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or not published")
    
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
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can update progress")
    
    # Update enrollment with completed video
    result = await db.enrollments.update_one(
        {"student_id": current_user.id, "course_id": course_id},
        {
            "$addToSet": {"completed_videos": video_id},
            "$set": {"last_updated": datetime.utcnow()}
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
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
    
    return {"message": "Progress updated successfully"}

# Basic health check
@api_router.get("/")
async def root():
    return {"message": "Steam Lanka Educational Platform API"}

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
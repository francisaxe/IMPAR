from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT settings
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 43200  # 30 days

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    email: str
    name: str
    role: str
    created_at: datetime

class QuestionModel(BaseModel):
    type: str  # multiple_choice_single, multiple_choice_multiple, text_short, text_long, rating
    text: str
    options: Optional[List[str]] = None
    max_rating: Optional[int] = 5

class SurveyCreate(BaseModel):
    title: str
    description: str
    questions: List[QuestionModel]

class Survey(BaseModel):
    id: str
    title: str
    description: str
    questions: List[QuestionModel]
    created_by: str
    created_at: datetime
    response_count: int = 0

class AnswerModel(BaseModel):
    question_index: int
    answer: Any  # Can be string, list of strings, or number

class ResponseCreate(BaseModel):
    answers: List[AnswerModel]

class Response(BaseModel):
    id: str
    survey_id: str
    user_id: str
    user_name: str
    answers: List[AnswerModel]
    submitted_at: datetime

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_owner_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "owner":
        raise HTTPException(status_code=403, detail="Only owner can perform this action")
    return current_user

# Auth endpoints
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_dict = {
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "role": "user",  # Default role
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_dict)
    user_id = str(result.inserted_id)
    
    # Create token
    token = create_access_token({"sub": user_id})
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "role": "user"
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    # Find user
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create token
    token = create_access_token({"sub": str(user["_id"])})
    
    return {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "role": user["role"]
        }
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"],
        "name": current_user["name"],
        "role": current_user["role"]
    }

# Survey endpoints
@api_router.post("/surveys")
async def create_survey(survey_data: SurveyCreate, current_user: dict = Depends(get_owner_user)):
    survey_dict = {
        "title": survey_data.title,
        "description": survey_data.description,
        "questions": [q.dict() for q in survey_data.questions],
        "created_by": str(current_user["_id"]),
        "created_at": datetime.utcnow(),
        "response_count": 0
    }
    
    result = await db.surveys.insert_one(survey_dict)
    survey_dict["_id"] = result.inserted_id
    
    return {
        "id": str(result.inserted_id),
        "title": survey_dict["title"],
        "description": survey_dict["description"],
        "questions": survey_dict["questions"],
        "created_by": survey_dict["created_by"],
        "created_at": survey_dict["created_at"],
        "response_count": 0
    }

@api_router.get("/surveys")
async def get_surveys(current_user: dict = Depends(get_current_user)):
    surveys = await db.surveys.find().sort("created_at", -1).to_list(1000)
    
    result = []
    for survey in surveys:
        # Check if current user has answered
        has_answered = await db.responses.find_one({
            "survey_id": str(survey["_id"]),
            "user_id": str(current_user["_id"])
        })
        
        result.append({
            "id": str(survey["_id"]),
            "title": survey["title"],
            "description": survey["description"],
            "created_at": survey["created_at"],
            "response_count": survey.get("response_count", 0),
            "has_answered": has_answered is not None
        })
    
    return result

@api_router.get("/surveys/{survey_id}")
async def get_survey(survey_id: str, current_user: dict = Depends(get_current_user)):
    try:
        survey = await db.surveys.find_one({"_id": ObjectId(survey_id)})
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        # Check if user has answered
        has_answered = await db.responses.find_one({
            "survey_id": survey_id,
            "user_id": str(current_user["_id"])
        })
        
        return {
            "id": str(survey["_id"]),
            "title": survey["title"],
            "description": survey["description"],
            "questions": survey["questions"],
            "created_at": survey["created_at"],
            "response_count": survey.get("response_count", 0),
            "has_answered": has_answered is not None
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/surveys/{survey_id}/respond")
async def submit_response(survey_id: str, response_data: ResponseCreate, current_user: dict = Depends(get_current_user)):
    try:
        # Check if survey exists
        survey = await db.surveys.find_one({"_id": ObjectId(survey_id)})
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        # Check if user already answered
        existing_response = await db.responses.find_one({
            "survey_id": survey_id,
            "user_id": str(current_user["_id"])
        })
        if existing_response:
            raise HTTPException(status_code=400, detail="You have already answered this survey")
        
        # Create response
        response_dict = {
            "survey_id": survey_id,
            "user_id": str(current_user["_id"]),
            "user_name": current_user["name"],
            "answers": [a.dict() for a in response_data.answers],
            "submitted_at": datetime.utcnow()
        }
        
        await db.responses.insert_one(response_dict)
        
        # Update response count
        await db.surveys.update_one(
            {"_id": ObjectId(survey_id)},
            {"$inc": {"response_count": 1}}
        )
        
        return {"message": "Response submitted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/surveys/{survey_id}/results")
async def get_survey_results(survey_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Check if survey exists
        survey = await db.surveys.find_one({"_id": ObjectId(survey_id)})
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        # Check if user has answered (only users who answered can see results)
        has_answered = await db.responses.find_one({
            "survey_id": survey_id,
            "user_id": str(current_user["_id"])
        })
        
        is_owner = current_user.get("role") == "owner"
        
        if not has_answered and not is_owner:
            raise HTTPException(status_code=403, detail="You must answer the survey to see results")
        
        # Get all responses
        responses = await db.responses.find({"survey_id": survey_id}).to_list(1000)
        
        # Aggregate results
        aggregated = []
        for idx, question in enumerate(survey["questions"]):
            question_results = {
                "question_index": idx,
                "question_text": question["text"],
                "question_type": question["type"],
                "results": {}
            }
            
            if question["type"] in ["multiple_choice_single", "multiple_choice_multiple"]:
                # Count votes for each option
                option_counts = {opt: 0 for opt in question.get("options", [])}
                for response in responses:
                    for answer in response["answers"]:
                        if answer["question_index"] == idx:
                            if question["type"] == "multiple_choice_single":
                                option = answer["answer"]
                                if option in option_counts:
                                    option_counts[option] += 1
                            else:  # multiple
                                for option in answer["answer"]:
                                    if option in option_counts:
                                        option_counts[option] += 1
                question_results["results"] = option_counts
            
            elif question["type"] == "rating":
                # Calculate average rating
                ratings = []
                rating_counts = {}
                for response in responses:
                    for answer in response["answers"]:
                        if answer["question_index"] == idx:
                            rating = answer["answer"]
                            # Ensure rating is a number, not a list
                            if isinstance(rating, (int, float)):
                                ratings.append(rating)
                                rating_counts[rating] = rating_counts.get(rating, 0) + 1
                
                question_results["results"] = {
                    "average": sum(ratings) / len(ratings) if ratings else 0,
                    "distribution": rating_counts
                }
            
            else:  # text questions
                # Just count responses
                text_responses = []
                for response in responses:
                    for answer in response["answers"]:
                        if answer["question_index"] == idx:
                            text_responses.append(answer["answer"])
                question_results["results"] = {
                    "count": len(text_responses),
                    "responses": text_responses if is_owner else []  # Only owner sees actual text
                }
            
            aggregated.append(question_results)
        
        return {
            "survey_id": survey_id,
            "title": survey["title"],
            "total_responses": len(responses),
            "aggregated_results": aggregated
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/surveys/{survey_id}/responses")
async def get_all_responses(survey_id: str, current_user: dict = Depends(get_owner_user)):
    try:
        responses = await db.responses.find({"survey_id": survey_id}).sort("submitted_at", -1).to_list(1000)
        
        result = []
        for response in responses:
            result.append({
                "id": str(response["_id"]),
                "user_name": response["user_name"],
                "answers": response["answers"],
                "submitted_at": response["submitted_at"]
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/my-responses")
async def get_my_responses(current_user: dict = Depends(get_current_user)):
    responses = await db.responses.find({"user_id": str(current_user["_id"])}).to_list(1000)
    
    result = []
    for response in responses:
        # Get survey info
        survey = await db.surveys.find_one({"_id": ObjectId(response["survey_id"])})
        if survey:
            result.append({
                "survey_id": response["survey_id"],
                "survey_title": survey["title"],
                "submitted_at": response["submitted_at"]
            })
    
    return result

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
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

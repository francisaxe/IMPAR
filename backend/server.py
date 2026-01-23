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
    phone: Optional[str] = None
    birth_date: str
    gender: str  # Masculino / Feminino
    nationality: str
    district: str
    municipality: str  # Concelho
    parish: str  # Freguesia
    marital_status: str  # solteiro, casado, divorciado, viuvo
    religion: str
    education_level: str
    profession: str
    lived_abroad: bool
    abroad_duration: Optional[str] = None
    email_notifications: bool = False

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
    end_date: Optional[str] = None  # Data limite opcional (formato: YYYY-MM-DD)

class Survey(BaseModel):
    id: str
    title: str
    description: str
    questions: List[QuestionModel]
    created_by: str
    created_at: datetime
    end_date: Optional[datetime] = None  # Data limite opcional
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

class SuggestionCreate(BaseModel):
    category: Optional[str] = None
    question_type: str
    question_text: str
    options: Optional[List[str]] = None
    notes: Optional[str] = None

class Suggestion(BaseModel):
    id: str
    user_id: str
    user_name: str
    category: Optional[str] = None
    question_type: str
    question_text: str
    options: Optional[List[str]] = None
    notes: Optional[str] = None
    created_at: datetime
    status: str = "pending"  # pending, reviewed, used

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
        raise HTTPException(status_code=400, detail="Email já registado")
    
    # Create user with all profile fields
    user_dict = {
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "phone": user_data.phone,
        "birth_date": user_data.birth_date,
        "gender": user_data.gender,
        "nationality": user_data.nationality,
        "district": user_data.district,
        "municipality": user_data.municipality,
        "parish": user_data.parish,
        "marital_status": user_data.marital_status,
        "religion": user_data.religion,
        "education_level": user_data.education_level,
        "profession": user_data.profession,
        "lived_abroad": user_data.lived_abroad,
        "abroad_duration": user_data.abroad_duration if user_data.lived_abroad else None,
        "email_notifications": user_data.email_notifications,
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

# Admin endpoint - Get all users (owner only)
@api_router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(get_owner_user)):
    users = await db.users.find({"role": "user"}).sort("created_at", -1).to_list(1000)
    
    result = []
    for user in users:
        result.append({
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user.get("name", ""),
            "phone": user.get("phone", ""),
            "birth_date": user.get("birth_date", ""),
            "gender": user.get("gender", ""),
            "nationality": user.get("nationality", ""),
            "district": user.get("district", ""),
            "municipality": user.get("municipality", ""),
            "parish": user.get("parish", ""),
            "marital_status": user.get("marital_status", ""),
            "religion": user.get("religion", ""),
            "education_level": user.get("education_level", ""),
            "profession": user.get("profession", ""),
            "lived_abroad": user.get("lived_abroad", False),
            "abroad_duration": user.get("abroad_duration", ""),
            "email_notifications": user.get("email_notifications", False),
            "created_at": user.get("created_at", "")
        })
    
    return result

@api_router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"],
        "name": current_user.get("name", ""),
        "role": current_user["role"],
        "birth_date": current_user.get("birth_date", ""),
        "gender": current_user.get("gender", ""),
        "nationality": current_user.get("nationality", ""),
        "district": current_user.get("district", ""),
        "municipality": current_user.get("municipality", ""),
        "parish": current_user.get("parish", ""),
        "marital_status": current_user.get("marital_status", ""),
        "religion": current_user.get("religion", ""),
        "education_level": current_user.get("education_level", ""),
        "profession": current_user.get("profession", ""),
        "lived_abroad": current_user.get("lived_abroad", False),
        "abroad_duration": current_user.get("abroad_duration", "")
    }

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    birth_date: Optional[str] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    district: Optional[str] = None
    municipality: Optional[str] = None
    parish: Optional[str] = None
    marital_status: Optional[str] = None
    religion: Optional[str] = None
    education_level: Optional[str] = None
    profession: Optional[str] = None
    lived_abroad: Optional[bool] = None
    abroad_duration: Optional[str] = None

@api_router.put("/profile")
async def update_profile(profile_data: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    update_dict = {k: v for k, v in profile_data.dict().items() if v is not None}
    
    if update_dict:
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_dict}
        )
    
    return {"message": "Perfil atualizado com sucesso"}

class TeamApplication(BaseModel):
    message: str

@api_router.post("/team-application")
async def submit_team_application(application: TeamApplication, current_user: dict = Depends(get_current_user)):
    application_dict = {
        "user_id": str(current_user["_id"]),
        "user_name": current_user.get("name", ""),
        "user_email": current_user["email"],
        "message": application.message,
        "created_at": datetime.utcnow(),
        "status": "pending"
    }
    
    await db.team_applications.insert_one(application_dict)
    
    return {"message": "Candidatura enviada com sucesso"}

# Survey endpoints
@api_router.post("/surveys")
async def create_survey(survey_data: SurveyCreate, current_user: dict = Depends(get_owner_user)):
    survey_dict = {
        "title": survey_data.title,
        "description": survey_data.description,
        "questions": [q.dict() for q in survey_data.questions],
        "created_by": str(current_user["_id"]),
        "created_at": datetime.utcnow(),
        "response_count": 0,
        "end_date": datetime.strptime(survey_data.end_date, "%Y-%m-%d") if survey_data.end_date else None
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
        "end_date": survey_dict["end_date"],
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
        
        # Check if survey is closed (end_date passed)
        end_date = survey.get("end_date")
        is_closed = end_date is not None and datetime.utcnow() > end_date
        
        result.append({
            "id": str(survey["_id"]),
            "title": survey["title"],
            "description": survey["description"],
            "created_at": survey["created_at"],
            "end_date": end_date,
            "is_closed": is_closed,
            "response_count": survey.get("response_count", 0),
            "has_answered": has_answered is not None,
            "featured": survey.get("featured", False)
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

@api_router.delete("/surveys/{survey_id}")
async def delete_survey(survey_id: str, current_user: dict = Depends(get_owner_user)):
    try:
        # Check if survey exists
        survey = await db.surveys.find_one({"_id": ObjectId(survey_id)})
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        # Delete all responses for this survey
        await db.responses.delete_many({"survey_id": survey_id})
        
        # Delete the survey
        await db.surveys.delete_one({"_id": ObjectId(survey_id)})
        
        return {"message": "Survey deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/surveys/{survey_id}/respond")
async def submit_response(survey_id: str, response_data: ResponseCreate, current_user: dict = Depends(get_current_user)):
    try:
        # Check if survey exists
        survey = await db.surveys.find_one({"_id": ObjectId(survey_id)})
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        # Check if survey is closed
        end_date = survey.get("end_date")
        if end_date and datetime.utcnow() > end_date:
            raise HTTPException(status_code=400, detail="Esta sondagem já está encerrada")
        
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
    responses = await db.responses.find({"user_id": str(current_user["_id"])}).sort("submitted_at", -1).to_list(1000)
    
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

# Suggestion endpoints
@api_router.post("/suggestions")
async def create_suggestion(suggestion_data: SuggestionCreate, current_user: dict = Depends(get_current_user)):
    suggestion_dict = {
        "user_id": str(current_user["_id"]),
        "user_name": current_user["name"],
        "category": suggestion_data.category,
        "question_type": suggestion_data.question_type,
        "question_text": suggestion_data.question_text,
        "options": suggestion_data.options,
        "notes": suggestion_data.notes,
        "created_at": datetime.utcnow(),
        "status": "pending"
    }
    
    result = await db.suggestions.insert_one(suggestion_dict)
    
    return {
        "id": str(result.inserted_id),
        "message": "Suggestion submitted successfully"
    }

@api_router.get("/suggestions")
async def get_all_suggestions(current_user: dict = Depends(get_owner_user)):
    suggestions = await db.suggestions.find().sort("created_at", -1).to_list(1000)
    
    result = []
    for suggestion in suggestions:
        result.append({
            "id": str(suggestion["_id"]),
            "user_name": suggestion["user_name"],
            "category": suggestion.get("category"),
            "question_type": suggestion.get("question_type"),
            "question_text": suggestion["question_text"],
            "options": suggestion.get("options"),
            "notes": suggestion.get("notes"),
            "created_at": suggestion["created_at"],
            "status": suggestion.get("status", "pending")
        })
    
    return result

# ===========================================
# Featured Content / Destaques Endpoints
# ===========================================

# Toggle feature status for a survey
@api_router.put("/surveys/{survey_id}/feature")
async def toggle_survey_feature(survey_id: str, current_user: dict = Depends(get_owner_user)):
    try:
        survey = await db.surveys.find_one({"_id": ObjectId(survey_id)})
        if not survey:
            raise HTTPException(status_code=404, detail="Sondagem não encontrada")
        
        current_featured = survey.get("featured", False)
        
        # Check how many surveys are already featured (max 3 total featured items)
        if not current_featured:
            featured_surveys = await db.surveys.count_documents({"featured": True})
            featured_news = await db.news.count_documents({"featured": True})
            if featured_surveys + featured_news >= 3:
                raise HTTPException(status_code=400, detail="Limite de 3 destaques atingido. Remova um destaque primeiro.")
        
        await db.surveys.update_one(
            {"_id": ObjectId(survey_id)},
            {"$set": {"featured": not current_featured}}
        )
        
        return {
            "message": "Destaque atualizado com sucesso",
            "featured": not current_featured
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Get all featured content for homepage
@api_router.get("/featured")
async def get_featured_content():
    featured_items = []
    
    # Get featured surveys
    featured_surveys = await db.surveys.find({"featured": True}).sort("created_at", -1).to_list(3)
    for survey in featured_surveys:
        featured_items.append({
            "id": str(survey["_id"]),
            "type": "survey",
            "title": survey["title"],
            "description": survey["description"],
            "created_at": survey["created_at"],
            "response_count": survey.get("response_count", 0),
            "is_closed": survey.get("end_date") is not None and datetime.utcnow() > survey.get("end_date")
        })
    
    # Get featured news
    featured_news = await db.news.find({"featured": True}).sort("created_at", -1).to_list(3)
    for news in featured_news:
        featured_items.append({
            "id": str(news["_id"]),
            "type": "news",
            "title": news["title"],
            "description": news["description"],
            "created_at": news["created_at"],
            "image_url": news.get("image_url")
        })
    
    # Sort by created_at and limit to 3
    featured_items.sort(key=lambda x: x["created_at"], reverse=True)
    return featured_items[:3]

# News CRUD endpoints
class NewsCreate(BaseModel):
    title: str
    description: str
    image_url: Optional[str] = None
    featured: bool = False

@api_router.post("/news")
async def create_news(news_data: NewsCreate, current_user: dict = Depends(get_owner_user)):
    # Check featured limit
    if news_data.featured:
        featured_surveys = await db.surveys.count_documents({"featured": True})
        featured_news = await db.news.count_documents({"featured": True})
        if featured_surveys + featured_news >= 3:
            raise HTTPException(status_code=400, detail="Limite de 3 destaques atingido.")
    
    news_dict = {
        "title": news_data.title,
        "description": news_data.description,
        "image_url": news_data.image_url,
        "featured": news_data.featured,
        "created_by": str(current_user["_id"]),
        "created_at": datetime.utcnow()
    }
    
    result = await db.news.insert_one(news_dict)
    
    return {
        "id": str(result.inserted_id),
        "message": "Notícia criada com sucesso"
    }

@api_router.get("/news")
async def get_all_news(current_user: dict = Depends(get_owner_user)):
    news_list = await db.news.find().sort("created_at", -1).to_list(100)
    
    result = []
    for news in news_list:
        result.append({
            "id": str(news["_id"]),
            "title": news["title"],
            "description": news["description"],
            "image_url": news.get("image_url"),
            "featured": news.get("featured", False),
            "created_at": news["created_at"]
        })
    
    return result

@api_router.put("/news/{news_id}/feature")
async def toggle_news_feature(news_id: str, current_user: dict = Depends(get_owner_user)):
    try:
        news = await db.news.find_one({"_id": ObjectId(news_id)})
        if not news:
            raise HTTPException(status_code=404, detail="Notícia não encontrada")
        
        current_featured = news.get("featured", False)
        
        # Check featured limit
        if not current_featured:
            featured_surveys = await db.surveys.count_documents({"featured": True})
            featured_news = await db.news.count_documents({"featured": True})
            if featured_surveys + featured_news >= 3:
                raise HTTPException(status_code=400, detail="Limite de 3 destaques atingido. Remova um destaque primeiro.")
        
        await db.news.update_one(
            {"_id": ObjectId(news_id)},
            {"$set": {"featured": not current_featured}}
        )
        
        return {
            "message": "Destaque atualizado com sucesso",
            "featured": not current_featured
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.delete("/news/{news_id}")
async def delete_news(news_id: str, current_user: dict = Depends(get_owner_user)):
    try:
        result = await db.news.delete_one({"_id": ObjectId(news_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Notícia não encontrada")
        
        return {"message": "Notícia eliminada com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

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

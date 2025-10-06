from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from supabase import create_client
import os, jwt
from dotenv import load_dotenv
from datetime import datetime, timedelta
from passlib.hash import sha256_crypt

load_dotenv()
router = APIRouter()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

SECRET_KEY = os.environ.get("JWT_SECRET")
ALGORITHM = os.environ.get("JWT_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Generate JWT token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token


@router.post("/signup")
def signup(user: UserCreate):
    hashed_pw = sha256_crypt.hash(user.password)

    existing = supabase.table("Users").select("*").eq("email", user.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="User already exists")
    
    try:
        res = supabase.table("Users").insert({
        "email": user.email,
        "password": hashed_pw,
        "full_name": user.full_name
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=e.message)
    
    return {"message": "User created successfully"}

@router.post("/login")
def login(user: UserLogin):
    try:
        res = supabase.table("Users").select("*").eq("email", user.email).single().execute()
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not res.data or not sha256_crypt.verify(user.password, res.data["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"user_id": res.data["id"], "email": user.email})

    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def get_me(request: Request):
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    res = supabase.table("Users").select("id, email, full_name").eq("id", payload["user_id"]).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")

    return {"user": res.data}

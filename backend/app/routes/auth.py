from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
import os
from dotenv import load_dotenv
from passlib.hash import sha256_crypt  # pure Python, no Rust

load_dotenv()
router = APIRouter()

# Supabase client setup
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup(user: UserCreate):
    # Hash password using sha256_crypt
    hashed_pw = sha256_crypt.hash(user.password)

    
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
        raise HTTPException(status_code=401, detail="e.message")

    stored_pw = res.data["password"]
    if not sha256_crypt.verify(user.password, stored_pw):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"message": "Login successful"}

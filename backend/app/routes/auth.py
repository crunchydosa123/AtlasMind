from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, field_validator
from supabase import create_client
import os, jwt
from dotenv import load_dotenv
from datetime import datetime, timedelta
from passlib.hash import sha256_crypt
from google.oauth2 import id_token
from google.auth.transport import requests
import requests as http

load_dotenv()
router = APIRouter()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
GOOGLE_CLIENT_SECRET=os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

SECRET_KEY = os.environ.get("JWT_SECRET")
ALGORITHM = os.environ.get("JWT_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

    @field_validator("password")
    def validate_password(cls, v):
        if not v or v.strip() == "":
            raise ValueError("Password is required")
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleCredential(BaseModel):
    credential: str

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

    return {"access_token": token, "token_type": "bearer" }

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

@router.post("/oauth/google")
def google_oauth_login(payload: dict):
    code = payload["code"]

    token_res = http.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": "postmessage",
            "grant_type": "authorization_code",
            "access_type": "offline",
            "prompt": "consent"
        }
    ).json()
    #print(GOOGLE_CLIENT_ID) #prints None
    #print(token_res)
    id_token_str = token_res["id_token"]
    google_access_token = token_res["access_token"]
    refresh_token = token_res.get("refresh_token")

    idinfo = id_token.verify_oauth2_token(id_token_str, requests.Request(), GOOGLE_CLIENT_ID)
    google_user_id = idinfo["sub"]
    email = idinfo["email"]
    full_name = idinfo.get("name", "")
    #print(google_user_id)
    #print(email)
    #print(full_name)
    try:

        user_res = (
        supabase
            .table("Users")
            .select("*")
            .eq("email", email)
            .maybe_single()
            .execute()
        )
        #print(user_res)
        #print("user_data:", user_res)
        if user_res:
            supabase.table("Users").update({
                "access_token": google_access_token
            }).eq("email", email).execute()
            user_data = user_res.data
            if refresh_token:
                supabase.table("Users").update({
                    "refresh_token": refresh_token
                }).eq("email", email).execute()
        if not user_res:
            insert_res = (
                supabase
                .table("Users")
                .insert({
                    "email": email,
                    "full_name": full_name,
                    "google_id": google_user_id,
                    "access_token": google_access_token,
                    "refresh_token": refresh_token
                })
                .execute()
            )
            user_data = insert_res.data[0]
            #print("insert_res:", insert_res)
        token = create_access_token({"user_id": user_data["id"], "email": email})

        return {"access_token": token, "token_type": "bearer", "user": user_data}
            
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail=e) 
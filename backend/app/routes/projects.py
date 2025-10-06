from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import create_client
import os, jwt
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer
from typing import List

load_dotenv()
router = APIRouter()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

SECRET_KEY = os.environ.get("JWT_SECRET")
ALGORITHM = os.environ.get("JWT_ALGORITHM")

class ProjectRequest(BaseModel):
    name: str
    description: str | None = None

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return {"id": payload["user_id"], "email": payload["email"]}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
@router.get("/", response_model=List[ProjectRequest])
def get_projects(current_user: dict = Depends(get_current_user)):
    response = supabase.table("Projects").select("*").eq("created_by", current_user["id"]).execute()
    if response.data:
        return response.data
    else:
        return []


@router.post("/")
def add_project(project: ProjectRequest, current_user: dict = Depends(get_current_user)):
    project_data = project.dict()
    project_data["created_by"] = current_user["id"]

    response = supabase.table("Projects").insert(project_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail=response.error.message)

    return {"message": "Project added", "data": response.data}

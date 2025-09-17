from fastapi import APIRouter
from pydantic import BaseModel
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()  # loads .env
router = APIRouter()

# Supabase client setup
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


# Request model for inserting a project
class ProjectRequest(BaseModel):
    name: str
    description: str | None = None


@router.get("/")
def get_projects():
    response = supabase.table("Projects").select("*").execute()
    return {"projects": response.data}


@router.post("/")
def add_project(project: ProjectRequest):
    response = supabase.table("Projects").insert(project.dict()).execute()
    return {"message": "Project added", "data": response.data}

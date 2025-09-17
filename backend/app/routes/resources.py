from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
import os
from dotenv import load_dotenv
from uuid import UUID
from typing import Optional, List

load_dotenv()

router = APIRouter()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class ResourceRequest(BaseModel):
    name: str
    description: str
    link: Optional[str] = None
    project_id: UUID

@router.get("/project/{project_id}", response_model=List[ResourceRequest])
def get_resources_by_project(project_id: UUID):
    response = supabase.table("Resources").select("*").eq("project_id", str(project_id)).execute()
    return response.data  # return list directly

@router.post("/")
def add_resource(resource: ResourceRequest):
    # Convert UUID to string for JSON serialization
    data = resource.dict()
    data["project_id"] = str(data["project_id"])
    
    response = supabase.table("Resources").insert(data).execute()
    return {"message": "Resource added", "data": response.data}
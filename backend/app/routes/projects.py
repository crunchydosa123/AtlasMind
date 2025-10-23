from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import create_client
import os, jwt
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer
from typing import List
from app.workflows.google_doc_workflow import run_google_doc_workflow
from app.workflows.mail_workflow import run_mail_workflow
from app.services.neo4j_service import add_project_to_graph
from app.services.google_docs_service import GoogleDocsService

load_dotenv()
router = APIRouter()

'''
creds_path_var = os.environ.get("GOOGLE_CREDS_JSON")
if not creds_path_var:
    raise ValueError("GOOGLE_CREDS_JSON environment variable not set")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
''' 

creds_json_str = os.environ.get("GOOGLE_CREDS_JSON")

google_docs_service = GoogleDocsService(creds_json_str)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

SECRET_KEY = os.environ.get("JWT_SECRET")
ALGORITHM = os.environ.get("JWT_ALGORITHM")

class ProjectRequest(BaseModel):
    name: str
    description: str | None = None
    sheet_id: str | None = None
    doc_id: str | None = None

class ProjectResponse(BaseModel):
    name: str
    description: str | None = None
    id: str
    doc_id: str | None = None
    sheet_id: str | None = None

class WorkflowRequest(BaseModel):
    project_id: str
    prompt: str

class MailRequest(BaseModel):
    project_id: str
    prompt: str
    recipient: str

class PushRequest(BaseModel):
    text: str
    doc_url: str | None = None

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return {"id": payload["user_id"], "email": payload["email"]}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
@router.get("/", response_model=List[ProjectResponse])
async def get_projects(current_user: dict = Depends(get_current_user)):
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
    project_id = response.data[0]["id"]
    project_name = response.data[0]["name"]
    add_project_to_graph(project_id, project_name)
    if not response.data:
        raise HTTPException(status_code=400, detail=response.error.message)

    return {"message": "Project added", "data": response.data}

@router.post("/write-to-docs")
async def run_workflow(request: WorkflowRequest):
    try:
        result = run_google_doc_workflow(project_id=request.project_id, prompt=request.prompt)
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/push-to-docs")
async def push_to_doc(req: PushRequest):
    print("Raw request body:", req.dict())  # This shows exactly what was sent

    DOC_URL = "https://docs.google.com/document/d/1vtMczJJVY0IRsqAawL-ORcBS9Bbc2wv0TaAPrjaU92g/edit"
    
    try:
        result = google_docs_service.append_text(DOC_URL, req.text)
        return result
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/send-mail")
async def send_mail(request: MailRequest):
    try:
        result = run_mail_workflow(
            project_id=request.project_id,
            prompt=request.prompt,
            recipient=request.recipient
        )
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

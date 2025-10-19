from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_project_context(project_id: str) -> dict:
    """
    Fetch project context like doc_id, sheet_id, and other metadata.
    """
    response = supabase.table("Projects").select("*").eq("id", project_id).execute()
    data = response.data
    if not data:
        return None

    project = data[0]
    
    context = {
        "doc_id": project.get("doc_id"),
        "sheet_id": project.get("sheet_id"),
        "name": project.get("name"),
        "description": project.get("description"),
    }
    return context #return context
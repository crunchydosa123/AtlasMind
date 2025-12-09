from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_tools():
    return {"tools": ["tool1", "tool2"]}

@router.post("/")
def add_tool(tool: dict):
    return {"message": "Tool added", "data": tool}
#TODO: Delete
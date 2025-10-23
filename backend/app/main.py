from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import agents, tools, projects, resources, auth, graph, chat

app = FastAPI(
    title="Agent Benchmark API",
    version="1.0.0",
    description="Backend for agent benchmarking and tool integration"
)

origins = [
    "http://localhost:5173",  # React dev server
    "http://127.0.0.1:5173",
    "https://atlas-mind-xi.vercel.app",
    "https://atlas-mind-e4csfrhrp-prathams-projects-cf4562a7.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # allow frontend origins
    allow_credentials=True,
    allow_methods=["*"],         # allow all HTTP methods
    allow_headers=["*"],         # allow all headers
)

# Connect routes
app.include_router(agents.router, prefix="/agents", tags=["Agents"])
app.include_router(tools.router, prefix="/tools", tags=["Tools"])
app.include_router(projects.router, prefix="/projects", tags=["Projects"])
app.include_router(resources.router, prefix="/resources", tags=["Resources"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(graph.router, prefix="/graph", tags=["Graph"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])

@app.get("/")
def root():
    return {"message": "Agent Benchmark API is running"}

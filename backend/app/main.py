from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import debate_routes, history_routes
from app.database.database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DEBATOR API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(debate_routes.router, prefix="/api")
app.include_router(history_routes.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

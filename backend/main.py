from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import engine, Base
from routers import auth, submissions, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="CORAF Formation API",
    description="API de gestion des formulaires de qualification Excel — Model Technologie",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentification"])
app.include_router(submissions.router, prefix="/api/submissions", tags=["Formulaires"])
app.include_router(admin.router, prefix="/api/admin", tags=["Administration"])

@app.get("/")
def root():
    return {"status": "ok", "service": "CORAF Formation API", "version": "1.0.0"}

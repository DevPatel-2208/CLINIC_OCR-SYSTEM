from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import health, preprocessing, ocr
from app.config.settings import cors_origins

app = FastAPI(
    title="ClinicOCR AI Service",
    description="Computer Vision + OCR pipeline for medical document processing",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(preprocessing.router, prefix="/preprocessing", tags=["Preprocessing"])
app.include_router(ocr.router, prefix="/ocr", tags=["OCR"])


@app.get("/")
def root():
    return {"service": "ClinicOCR AI Service", "status": "running"}

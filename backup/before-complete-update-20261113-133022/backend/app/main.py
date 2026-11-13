from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Atrato Pulse API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str

@app.get("/")
def root():
    return {"project": "Atrato Pulse", "status": "online"}

@app.get("/api/health")
def health():
    return {"status": "online"}

@app.get("/api/areas")
def areas():
    return {"status": "awaiting_data", "areas": []}

@app.get("/api/acquisitions")
def acquisitions():
    return {"status": "awaiting_data", "acquisitions": []}

@app.get("/api/water/summary")
def water_summary():
    return {"status": "awaiting_data", "water_extent_km2": None, "change_percent": None}

@app.get("/api/water/timeseries")
def timeseries():
    return {"status": "awaiting_data", "observations": []}

@app.get("/api/change/compare")
def compare():
    return {"status": "awaiting_data", "comparisons": []}

@app.get("/api/inundation")
def inundation():
    return {"status": "awaiting_data", "features": []}

@app.get("/api/environment/rainfall")
def rainfall():
    return {"status": "awaiting_data", "observations": []}

@app.get("/api/validation")
def validation():
    return {"status": "awaiting_data", "metrics": None}

@app.post("/api/ai/ask")
def ask(question: Question):
    return {"status": "not_configured", "answer": "AI analysis will be connected when verified results are available.", "question_received": question.question}

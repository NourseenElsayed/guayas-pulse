from typing import Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="Atrato Pulse API",
    description="Earth intelligence platform for the Atrato River Basin",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str = Field(min_length=1, max_length=4000)

class NotificationPreferences(BaseModel):
    enabled: bool = False
    water_changes: bool = True
    flood_alerts: bool = True
    data_updates: bool = True

notification_preferences = NotificationPreferences()

@app.get("/")
def root():
    return {
        "project": "Atrato Pulse",
        "status": "online",
        "version": "2.0.0"
    }

@app.get("/api/health")
def health():
    return {"status": "online", "service": "Atrato Pulse API"}

@app.get("/api/areas")
def areas():
    return {
        "status": "awaiting_data",
        "areas": [],
        "format": "GeoJSON FeatureCollection",
        "message": "Upload verified study-area GeoJSON to populate this endpoint."
    }

@app.get("/api/acquisitions")
def acquisitions():
    return {"status": "awaiting_data", "acquisitions": []}

@app.get("/api/water/summary")
def water_summary():
    return {
        "status": "awaiting_data",
        "water_extent_km2": None,
        "change_percent": None,
        "observation_date": None,
        "source": "NISAR GCOV",
        "unit": "km2"
    }

@app.get("/api/water/timeseries")
def timeseries():
    return {"status": "awaiting_data", "observations": []}

@app.get("/api/change/compare")
def compare():
    return {"status": "awaiting_data", "comparisons": []}

@app.get("/api/inundation")
def inundation():
    return {
        "status": "awaiting_data",
        "features": [],
        "format": "GeoJSON FeatureCollection"
    }

@app.get("/api/environment/rainfall")
def rainfall():
    return {"status": "awaiting_data", "observations": []}

@app.get("/api/validation")
def validation():
    return {
        "status": "awaiting_data",
        "metrics": None,
        "source": None,
        "methodology": None,
        "uncertainty": None
    }

@app.get("/api/notifications")
def notifications():
    return {
        "status": "awaiting_data",
        "notifications": [],
        "message": "No verified monitoring alerts are available yet."
    }

@app.get("/api/notifications/settings")
def get_notification_settings():
    return notification_preferences.model_dump()

@app.put("/api/notifications/settings")
def set_notification_settings(settings: NotificationPreferences):
    global notification_preferences
    notification_preferences = settings
    return {
        "status": "saved_for_current_session",
        "settings": notification_preferences.model_dump()
    }

@app.post("/api/ai/ask")
def ask(question: Question):
    return {
        "status": "not_configured",
        "answer": None,
        "message": "AI service is not connected yet. Connect the team's verified AI endpoint to enable analysis.",
        "question_received": question.question
    }

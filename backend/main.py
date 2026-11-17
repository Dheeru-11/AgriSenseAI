from pathlib import Path
import os

import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --------------------------------
# Paths
# --------------------------------

PROJECT_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = (
    PROJECT_DIR
    / "models"
    / "crop_recommendation_model.joblib"
)


# --------------------------------
# Load AI Model
# --------------------------------

saved_model = joblib.load(MODEL_PATH)

model = saved_model["model"]
features = saved_model["features"]


# --------------------------------
# FastAPI Application
# --------------------------------

app = FastAPI(
    title="AgriSense AI",
    description="Intelligent Agriculture Advisor API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        *([os.environ["FRONTEND_URL"].rstrip("/")] if os.getenv("FRONTEND_URL") else []),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------
# Input Schema
# --------------------------------

class FarmInput(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float


# --------------------------------
# Home Endpoint
# --------------------------------

@app.get("/")
def home():
    return {
        "message": "AgriSense AI API is running",
        "status": "success"
    }


# --------------------------------
# Crop Prediction Endpoint
# --------------------------------

@app.post("/predict")
def predict_crop(data: FarmInput):

    farm_data = {
        "N": data.N,
        "P": data.P,
        "K": data.K,
        "temperature": data.temperature,
        "humidity": data.humidity,
        "ph": data.ph,
        "rainfall": data.rainfall
    }

    input_data = pd.DataFrame(
        [farm_data],
        columns=features
    )

    prediction = model.predict(input_data)[0]

    probabilities = model.predict_proba(input_data)[0]

    confidence = float(max(probabilities) * 100)

    return {
        "recommended_crop": prediction,
        "confidence": round(confidence, 2)
    }
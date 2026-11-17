import os

from pathlib import Path
from io import BytesIO
import json

import torch
from torch import nn
from torchvision import models, transforms
from PIL import Image, UnidentifiedImageError

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AgriSense AI Disease Detection")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        *([os.environ["FRONTEND_URL"].rstrip("/")] if os.getenv("FRONTEND_URL") else []),
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = PROJECT_DIR / "models"

MODEL_PATH = MODEL_DIR / "plant_disease_model_finetuned.pth"
CLASSES_PATH = MODEL_DIR / "plant_disease_classes.json"

with open(CLASSES_PATH, "r", encoding="utf-8") as file:
    classes = json.load(file)

model = models.mobilenet_v3_small(weights=None)
features = model.classifier[3].in_features
model.classifier[3] = nn.Linear(features, len(classes))

model.load_state_dict(
    torch.load(
        MODEL_PATH,
        map_location="cpu",
        weights_only=True,
    )
)

model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

@app.get("/")
def home():
    return {"message": "Disease detection API running"}


@app.post("/predict-disease")
async def predict_disease(file: UploadFile = File(...)):
    if file.content_type not in (
        "image/jpeg",
        "image/png",
        "image/webp",
    ):
        raise HTTPException(415, "Only JPG, PNG or WebP allowed")

    try:
        image_bytes = await file.read(10 * 1024 * 1024 + 1)

        if len(image_bytes) > 10 * 1024 * 1024:
            raise HTTPException(413, "Maximum image size is 10 MB")

        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        tensor = transform(image).unsqueeze(0)

        with torch.inference_mode():
            output = model(tensor)
            probabilities = torch.softmax(output, dim=1)[0]
            index = int(probabilities.argmax().item())

        confidence = round(
            probabilities[index].item() * 100, 2
        )

        if confidence < 70:
            note = (
                "Low-confidence prediction. The plant or disease "
                "may be incorrectly identified. Please upload a clear "
                "leaf photo and verify with an agricultural expert."
            )
        else:
            note = (
                "Experimental AI prediction. This result is not a "
                "confirmed diagnosis. Verify before treatment."
            )

        return {
            "predicted_class": classes[index],
            "confidence": confidence,
            "note": note,
        }

    except HTTPException:
        raise
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(400, "Invalid or damaged image")
    finally:
        await file.close()

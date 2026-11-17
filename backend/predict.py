from pathlib import Path
import joblib
import pandas as pd


# -----------------------------
# Paths
# -----------------------------

PROJECT_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = PROJECT_DIR / "models" / "crop_recommendation_model.joblib"


# -----------------------------
# Load Model
# -----------------------------

print("Loading AgriSense AI model...")

saved_model = joblib.load(MODEL_PATH)

model = saved_model["model"]
features = saved_model["features"]


# -----------------------------
# Get User Input
# -----------------------------

print("\n================================")
print("     AGRISENSE AI")
print(" CROP RECOMMENDATION SYSTEM")
print("================================")

try:
    nitrogen = float(input("Nitrogen (N): "))
    phosphorus = float(input("Phosphorus (P): "))
    potassium = float(input("Potassium (K): "))
    temperature = float(input("Temperature (°C): "))
    humidity = float(input("Humidity (%): "))
    ph = float(input("Soil pH: "))
    rainfall = float(input("Rainfall (mm): "))

except ValueError:
    print("\n❌ Please enter numbers only.")
    exit()


# -----------------------------
# Create Input Data
# -----------------------------

farm_data = {
    "N": nitrogen,
    "P": phosphorus,
    "K": potassium,
    "temperature": temperature,
    "humidity": humidity,
    "ph": ph,
    "rainfall": rainfall
}

input_data = pd.DataFrame(
    [farm_data],
    columns=features
)


# -----------------------------
# AI Prediction
# -----------------------------

print("\nAnalyzing farm conditions...")

prediction = model.predict(input_data)[0]

probabilities = model.predict_proba(input_data)[0]

confidence = max(probabilities) * 100


# -----------------------------
# Display Result
# -----------------------------

print("\n================================")
print("      AGRISENSE AI RESULT")
print("================================")

print(f"Recommended Crop : {prediction}")
print(f"Model Confidence : {confidence:.2f}%")

print("================================")
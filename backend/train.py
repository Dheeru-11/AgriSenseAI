
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

# Project paths
PROJECT_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = PROJECT_DIR / "dataset" / "Crop_recommendation.csv"
MODEL_DIR = PROJECT_DIR / "models"
MODEL_PATH = MODEL_DIR / "crop_recommendation_model.joblib"

# 1. Load the dataset
print("Loading crop recommendation dataset...")

if not DATASET_PATH.exists():
    raise FileNotFoundError(
        f"Dataset not found: {DATASET_PATH}"
    )

data = pd.read_csv(DATASET_PATH)
data.columns = data.columns.str.strip()

# 2. Validate required columns
features = [
    "N", "P", "K", "temperature",
    "humidity", "ph", "rainfall"
]
target = "label"

required_columns = features + [target]
missing = set(required_columns) - set(data.columns)

if missing:
    raise ValueError(f"Missing columns: {sorted(missing)}")

data = data.dropna(subset=required_columns)

X = data[features]
y = data[target].astype(str).str.strip()

if y.nunique() < 2:
    raise ValueError("The dataset must contain at least two crop classes.")

print(f"Dataset rows: {len(data)}")
print(f"Crop classes: {y.nunique()}")

# 3. Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# 4. Train the AI model
print("\nTraining Random Forest model...")

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

# 5. Evaluate on unseen test data
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)

print(f"\nTest accuracy: {accuracy:.2%}")
print("\nClassification report:")
print(classification_report(y_test, predictions))

# 6. Save the trained model and feature order
MODEL_DIR.mkdir(parents=True, exist_ok=True)

joblib.dump(
    {
        "model": model,
        "features": features,
        "crop_classes": model.classes_.tolist()
    },
    MODEL_PATH
)

print(f"\nModel saved successfully:\n{MODEL_PATH}")
print("\nAgriSense AI crop model training complete!")

from pathlib import Path
import json

import torch
from torch import nn
from torchvision import models, transforms, datasets
from torch.utils.data import DataLoader

ROOT = Path(__file__).resolve().parent.parent

MODEL_PATH = ROOT / "models" / "plant_disease_model_finetuned.pth"
CLASSES_PATH = ROOT / "models" / "plant_disease_classes.json"
VAL_DIR = ROOT / "dataset" / "plant_disease" / "val"

with open(CLASSES_PATH, encoding="utf-8") as f:
    classes = json.load(f)

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225],
    ),
])

dataset = datasets.ImageFolder(VAL_DIR, transform=transform)

if dataset.classes != classes:
    raise ValueError("Class order mismatch")

model = models.mobilenet_v3_small(weights=None)
features = model.classifier[3].in_features
model.classifier[3] = nn.Linear(features, len(classes))

model.load_state_dict(
    torch.load(MODEL_PATH, map_location="cpu", weights_only=True)
)
model.eval()

target = "Tomato___Early_blight"
target_index = classes.index(target)

correct = 0
total = 0

with torch.inference_mode():
    for index, (path, label) in enumerate(dataset.samples):
        if label != target_index:
            continue

        image, _ = dataset[index]
        outputs = model(image.unsqueeze(0))
        probabilities = torch.softmax(outputs, dim=1)[0]

        predicted_index = int(probabilities.argmax())
        predicted_name = classes[predicted_index]
        confidence = float(probabilities[predicted_index]) * 100

        total += 1
        correct += int(predicted_index == target_index)

        print(
            f"{Path(path).name}: "
            f"{predicted_name} ({confidence:.2f}%)",
            flush=True,
        )

print(f"\nCorrect: {correct}/{total}")
print(f"Early Blight accuracy: {100 * correct / total:.2f}%")

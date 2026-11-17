
from pathlib import Path
import sys

import torch
from torch import nn
from torchvision import models, transforms
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "leaf_validator_v2.pth"

device = torch.device("cpu")

# Load the trained model checkpoint
checkpoint = torch.load(
    MODEL_PATH,
    map_location=device,
    weights_only=True
)

classes = checkpoint["classes"]

model = models.mobilenet_v3_small(weights=None)
model.classifier[3] = nn.Linear(
    model.classifier[3].in_features,
    len(classes)
)

model.load_state_dict(checkpoint["model_state_dict"])
model.to(device)
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

def predict_image(image_path):
    try:
        image = Image.open(image_path).convert("RGB")
    except (OSError, ValueError) as error:
        print(f"Skipping invalid image: {image_path}")
        print(f"Reason: {error}")
        print("-" * 40)
        return
    image_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.softmax(outputs, dim=1)[0]

    print("Class probabilities:")
    for class_name, probability in zip(classes, probabilities):
        print(f"  {class_name}: {probability.item() * 100:.2f}%")

    predicted_index = probabilities.argmax().item()
    predicted_class = classes[predicted_index]
    confidence = probabilities[predicted_index].item() * 100

    print(f"Image: {image_path}")
    print(f"Prediction: {predicted_class}")
    print(f"Confidence: {confidence:.2f}%")
    print("-" * 40)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_leaf_validator.py image_path")
        sys.exit(1)

    image_path = Path(sys.argv[1])

    if not image_path.is_file():
        print("Error: Image file not found.")
        sys.exit(1)

    predict_image(image_path)



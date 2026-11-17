
from pathlib import Path
import copy

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR.parent / "dataset" / "leaf_validation_v3"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

torch.manual_seed(42)

train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

val_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

train_dataset = datasets.ImageFolder(
    DATA_DIR / "train",
    transform=train_transform
)

val_dataset = datasets.ImageFolder(
    DATA_DIR / "val",
    transform=val_transform
)

assert train_dataset.classes == ["leaf", "non_leaf"]
assert train_dataset.classes == val_dataset.classes

train_loader = DataLoader(
    train_dataset,
    batch_size=16,
    shuffle=True,
    num_workers=0
)

val_loader = DataLoader(
    val_dataset,
    batch_size=16,
    shuffle=False,
    num_workers=0
)

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Device:", device)
print("Classes:", train_dataset.classes)

# Load ImageNet-pretrained MobileNetV3 Small
model = models.mobilenet_v3_small(
    weights=models.MobileNet_V3_Small_Weights.DEFAULT
)

# Freeze pretrained feature extraction layers
for parameter in model.features.parameters():
    parameter.requires_grad = False

# Replace final classification layer
model.classifier[3] = nn.Linear(
    model.classifier[3].in_features,
    2
)

model = model.to(device)

criterion = nn.CrossEntropyLoss()

optimizer = torch.optim.Adam(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=0.0001
)

best_accuracy = 0.0
best_state = None

for epoch in range(5):
    model.train()

    # Keep frozen feature layers in evaluation mode
    model.features.eval()

    running_loss = 0.0

    for images, labels in train_loader:
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)
        loss = criterion(outputs, labels)

        loss.backward()
        optimizer.step()

        running_loss += loss.item()

    model.eval()

    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in val_loader:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            predictions = outputs.argmax(dim=1)

            correct += (predictions == labels).sum().item()
            total += labels.size(0)

    accuracy = 100 * correct / total

    print(
        f"Epoch {epoch + 1}/5 | "
        f"Loss: {running_loss / len(train_loader):.4f} | "
        f"Validation Accuracy: {accuracy:.2f}%"
    )

    if accuracy > best_accuracy:
        best_accuracy = accuracy
        best_state = copy.deepcopy(model.state_dict())

if best_state is None:
    raise RuntimeError("No valid model checkpoint was created.")

torch.save(
    {
        "model_state_dict": best_state,
        "classes": train_dataset.classes,
        "validation_accuracy": best_accuracy,
    },
    MODEL_DIR / "leaf_validator_v3.pth"
)

print(f"Best validation accuracy: {best_accuracy:.2f}%")
print("Improved model saved as leaf_validator_v2.pth")


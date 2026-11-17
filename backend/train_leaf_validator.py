
from pathlib import Path

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "dataset" / "leaf_validation"
MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

train_dataset = datasets.ImageFolder(
    DATA_DIR / "train",
    transform=transform
)

val_dataset = datasets.ImageFolder(
    DATA_DIR / "val",
    transform=transform
)

assert train_dataset.classes == val_dataset.classes
assert train_dataset.classes == ["leaf", "non_leaf"]

train_loader = DataLoader(
    train_dataset, batch_size=16, shuffle=True, num_workers=0
)
val_loader = DataLoader(
    val_dataset, batch_size=16, shuffle=False, num_workers=0
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Device:", device)
print("Classes:", train_dataset.classes)

# Start without downloading pretrained weights.
model = models.mobilenet_v3_small(weights=None)
model.classifier[3] = nn.Linear(
    model.classifier[3].in_features, 2
)
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(5):
    model.train()
    total_loss = 0

    for images, labels in train_loader:
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in val_loader:
            images = images.to(device)
            labels = labels.to(device)

            predictions = model(images).argmax(dim=1)
            correct += (predictions == labels).sum().item()
            total += labels.size(0)

    accuracy = 100 * correct / total
    print(
        f"Epoch {epoch + 1}/5 | "
        f"Loss: {total_loss / len(train_loader):.4f} | "
        f"Validation Accuracy: {accuracy:.2f}%"
    )

torch.save(
    {
        "model_state_dict": model.cpu().state_dict(),
        "classes": train_dataset.classes,
    },
    MODEL_DIR / "leaf_validator.pth"
)

print("Model saved successfully!")

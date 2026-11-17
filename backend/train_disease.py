
from pathlib import Path
import json

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from torchvision.models import MobileNet_V3_Small_Weights


PROJECT_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = PROJECT_DIR / "dataset" / "plant_disease"
MODEL_DIR = PROJECT_DIR / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = MODEL_DIR / "plant_disease_model.pth"
CLASSES_PATH = MODEL_DIR / "plant_disease_classes.json"

BATCH_SIZE = 16
EPOCHS = 5
IMAGE_SIZE = 224


def main():
    torch.manual_seed(42)

    train_dir = DATASET_DIR / "train"
    val_dir = DATASET_DIR / "val"

    print("Loading disease dataset...", flush=True)

    train_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ])

    val_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ])

    train_data = datasets.ImageFolder(
        str(train_dir), transform=train_transform
    )
    val_data = datasets.ImageFolder(
        str(val_dir), transform=val_transform
    )

    if train_data.classes != val_data.classes:
        raise ValueError("Train and validation classes do not match.")

    if len(train_data) == 0 or len(val_data) == 0:
        raise ValueError("Training or validation dataset is empty.")

    class_names = train_data.classes

    print(f"Training images: {len(train_data)}", flush=True)
    print(f"Validation images: {len(val_data)}", flush=True)
    print(f"Number of classes: {len(class_names)}", flush=True)

    train_loader = DataLoader(
        train_data,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=0,
    )

    val_loader = DataLoader(
        val_data,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=0,
    )

    device = torch.device("cpu")
    print(f"Device: {device}", flush=True)
    print("Loading pretrained MobileNetV3...", flush=True)

    weights = MobileNet_V3_Small_Weights.DEFAULT
    model = models.mobilenet_v3_small(weights=weights)

    for parameter in model.parameters():
        parameter.requires_grad = False

    input_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(
        input_features, len(class_names)
    )

    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(
        model.classifier[3].parameters(),
        lr=0.001,
    )

    best_accuracy = -1.0

    for epoch in range(EPOCHS):
        model.train()
        running_loss = 0.0
        train_correct = 0
        train_total = 0

        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()

            outputs = model(images)
            loss = criterion(outputs, labels)

            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            train_correct += (
                outputs.argmax(1) == labels
            ).sum().item()
            train_total += labels.size(0)

        train_loss = running_loss / train_total
        train_accuracy = 100 * train_correct / train_total

        model.eval()
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for images, labels in val_loader:
                outputs = model(images.to(device))
                predictions = outputs.argmax(1)

                val_correct += (
                    predictions.cpu() == labels
                ).sum().item()
                val_total += labels.size(0)

        val_accuracy = 100 * val_correct / val_total

        print(
            f"Epoch {epoch + 1}/{EPOCHS} | "
            f"Loss: {train_loss:.4f} | "
            f"Train accuracy: {train_accuracy:.2f}% | "
            f"Validation accuracy: {val_accuracy:.2f}%",
            flush=True,
        )

        if val_accuracy > best_accuracy:
            best_accuracy = val_accuracy

            torch.save(model.state_dict(), MODEL_PATH)

            with open(CLASSES_PATH, "w", encoding="utf-8") as file:
                json.dump(class_names, file, indent=2)

    print("\nTraining complete!", flush=True)
    print(f"Best validation accuracy: {best_accuracy:.2f}%")
    print(f"Model saved: {MODEL_PATH}")
    print(f"Classes saved: {CLASSES_PATH}")


if __name__ == "__main__":
    main()

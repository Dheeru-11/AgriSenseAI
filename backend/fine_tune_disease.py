
from pathlib import Path
import json
import copy

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models

PROJECT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_DIR / "dataset" / "plant_disease"
MODEL_DIR = PROJECT_DIR / "models"

SOURCE_MODEL = MODEL_DIR / "plant_disease_model.pth"
OUTPUT_MODEL = MODEL_DIR / "plant_disease_model_finetuned.pth"
CLASSES_FILE = MODEL_DIR / "plant_disease_classes.json"

IMAGE_SIZE = 224
BATCH_SIZE = 16
EPOCHS = 5

def main():
    torch.manual_seed(42)
    torch.set_num_threads(4)

    train_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize(
            [0.485, 0.456, 0.406],
            [0.229, 0.224, 0.225],
        ),
    ])

    val_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(
            [0.485, 0.456, 0.406],
            [0.229, 0.224, 0.225],
        ),
    ])

    train_data = datasets.ImageFolder(
        DATA_DIR / "train",
        transform=train_transform,
    )

    val_data = datasets.ImageFolder(
        DATA_DIR / "val",
        transform=val_transform,
    )

    with open(CLASSES_FILE, encoding="utf-8") as f:
        saved_classes = json.load(f)

    if train_data.classes != saved_classes:
        raise ValueError("Training classes do not match saved labels")

    if val_data.classes != saved_classes:
        raise ValueError("Validation classes do not match saved labels")

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

    model = models.mobilenet_v3_small(weights=None)
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(
        in_features, len(saved_classes)
    )

    model.load_state_dict(
        torch.load(
            SOURCE_MODEL,
            map_location="cpu",
            weights_only=True,
        )
    )

    # Freeze all layers initially.
    for parameter in model.parameters():
        parameter.requires_grad = False

    # Fine-tune the last feature block.
    for parameter in model.features[-1].parameters():
        parameter.requires_grad = True

    # Continue training the classifier.
    for parameter in model.classifier.parameters():
        parameter.requires_grad = True

    optimizer = torch.optim.Adam([
        {
            "params": model.features[-1].parameters(),
            "lr": 0.00001,
        },
        {
            "params": model.classifier.parameters(),
            "lr": 0.0001,
        },
    ])

    criterion = nn.CrossEntropyLoss()

    best_accuracy = -1.0

    for epoch in range(EPOCHS):
        model.train()

        # Keep frozen feature blocks in evaluation mode.
        for block in model.features[:-1]:
            block.eval()

        train_correct = 0
        train_total = 0

        for images, labels in train_loader:
            optimizer.zero_grad()

            outputs = model(images)
            loss = criterion(outputs, labels)

            loss.backward()
            optimizer.step()

            train_correct += (
                outputs.argmax(1) == labels
            ).sum().item()

            train_total += labels.size(0)

        model.eval()

        val_correct = 0
        val_total = 0

        with torch.inference_mode():
            for images, labels in val_loader:
                outputs = model(images)
                predictions = outputs.argmax(1)

                val_correct += (
                    predictions == labels
                ).sum().item()

                val_total += labels.size(0)

        train_accuracy = 100 * train_correct / train_total
        val_accuracy = 100 * val_correct / val_total

        print(
            f"Epoch {epoch + 1}/{EPOCHS} | "
            f"Train: {train_accuracy:.2f}% | "
            f"Validation: {val_accuracy:.2f}%",
            flush=True,
        )

        if val_accuracy > best_accuracy:
            best_accuracy = val_accuracy
            torch.save(model.state_dict(), OUTPUT_MODEL)
            print("Best fine-tuned model saved!", flush=True)

    print(
        f"Fine-tuning complete. Best validation: "
        f"{best_accuracy:.2f}%"
    )
    print(f"Saved to: {OUTPUT_MODEL}")


if __name__ == "__main__":
    main()

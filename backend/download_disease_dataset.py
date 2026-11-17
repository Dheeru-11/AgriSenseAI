
from pathlib import Path
from collections import defaultdict
import random

from datasets import load_dataset

PROJECT_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = PROJECT_DIR / "dataset" / "plant_disease"
TRAIN_DIR = DATASET_DIR / "train"
VAL_DIR = DATASET_DIR / "val"

print("Loading PlantVillage tiny dataset...")
dataset = load_dataset("geraldmc/plantvillage-tiny", split="train")

# Group image indexes using the actual class_label column
class_indices = defaultdict(list)

for index, item in enumerate(dataset):
    class_indices[item["class_label"]].append(index)

random.seed(42)
print(f"Images: {len(dataset)}")
print(f"Classes: {len(class_indices)}")

for class_name, indices in class_indices.items():
    random.shuffle(indices)

    # Keep at least one image in validation when possible
    if len(indices) >= 2:
        split_index = max(1, min(len(indices) - 1, int(len(indices) * 0.8)))
    else:
        split_index = len(indices)

    train_indices = indices[:split_index]
    val_indices = indices[split_index:]

    safe_name = class_name.replace("/", "_").replace("\\", "_")

    for split, selected_indices in [
        ("train", train_indices),
        ("val", val_indices),
    ]:
        output_dir = (
            TRAIN_DIR if split == "train" else VAL_DIR
        ) / safe_name
        output_dir.mkdir(parents=True, exist_ok=True)

        for image_index in selected_indices:
            image = dataset[image_index]["image"].convert("RGB")
            image.save(output_dir / f"{image_index}.jpg")

    print(
        f"Saved {safe_name}: "
        f"{len(train_indices)} train, {len(val_indices)} validation"
    )

print("\nDataset preparation complete!")
print(f"Training folder: {TRAIN_DIR}")
print(f"Validation folder: {VAL_DIR}")

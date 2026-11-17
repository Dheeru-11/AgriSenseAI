
from pathlib import Path
import random

from torchvision.datasets import CIFAR10

PROJECT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_DIR / "dataset"
OUTPUT_DIR = DATA_DIR / "leaf_validation"

random.seed(42)

# CIFAR-10 contains airplanes, cars, birds, cats,
# deer, dogs, frogs, horses, ships and trucks.
# These are initial non-leaf examples only.

print("Downloading CIFAR-10 training images...")
train_data = CIFAR10(
    root=str(DATA_DIR / "cifar10"),
    train=True,
    download=True,
)

print("Downloading CIFAR-10 test images...")
test_data = CIFAR10(
    root=str(DATA_DIR / "cifar10"),
    train=False,
    download=True,
)

def save_images(dataset, output_folder, count):
    output_folder.mkdir(parents=True, exist_ok=True)

    indices = random.sample(range(len(dataset)), count)

    for number, index in enumerate(indices):
        image, _ = dataset[index]
        image.save(output_folder / f"non_leaf_{number:04d}.png")

    print(f"Saved {count} images to {output_folder}")


save_images(
    train_data,
    OUTPUT_DIR / "train" / "non_leaf",
    1520,
)

save_images(
    test_data,
    OUTPUT_DIR / "val" / "non_leaf",
    380,
)

print("Non-leaf dataset preparation complete!")

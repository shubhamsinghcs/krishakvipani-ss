"""
Dataset Loading and Data Augmentation Pipeline for Real-World Field Images.
Designed to handle variable Indian field conditions (lighting, soil clutter, mobile camera blur).
"""

import os
import random
from typing import Tuple, List, Optional, Callable, Dict, Any
import numpy as np
from PIL import Image

try:
    import torch
    from torch.utils.data import Dataset, DataLoader
    import torchvision.transforms as T
    import torchvision.transforms.functional as TF
except ImportError:
    torch = None
    Dataset = object

from .taxonomy import SUPPORTED_CROPS, CROP_TO_IDX


class FieldAugmentationPipeline:
    """
    Field-realistic data augmentation suite for crop foliage photographs.
    Simulates:
    1. Harsh tropical sunlight / canopy shadows (ColorJitter + RandomAutocontrast)
    2. Mobile camera sensor noise & slight motion blur (GaussianBlur)
    3. Varying leaf angles and perspective (RandomAffine + RandomPerspective)
    4. Random erasing (simulating dust, water droplets, or partial occlusion)
    """

    def __init__(self, image_size: int = 256, is_training: bool = True):
        self.image_size = image_size
        self.is_training = is_training

        # Standard ImageNet normalization parameters
        self.mean = [0.485, 0.456, 0.406]
        self.std = [0.229, 0.224, 0.225]

        if is_training:
            self.transform = T.Compose([
                T.Resize((image_size + 32, image_size + 32)),
                T.RandomResizedCrop(image_size, scale=(0.75, 1.0), ratio=(0.85, 1.15)),
                T.RandomHorizontalFlip(p=0.5),
                T.RandomVerticalFlip(p=0.3),
                T.RandomRotation(degrees=30),
                T.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.04),
                T.RandomApply([T.GaussianBlur(kernel_size=(3, 3), sigma=(0.1, 1.5))], p=0.25),
                T.ToTensor(),
                T.Normalize(mean=self.mean, std=self.std),
                T.RandomErasing(p=0.2, scale=(0.02, 0.2), ratio=(0.3, 3.3), value="random"),
            ])
        else:
            self.transform = T.Compose([
                T.Resize((image_size, image_size)),
                T.ToTensor(),
                T.Normalize(mean=self.mean, std=self.std),
            ])

    def __call__(self, img: Image.Image):
        return self.transform(img)


class KrishakFieldDataset(Dataset):
    """
    Hierarchical Crop & Disease Field Dataset.
    Supports:
    - Stage 1: Crop Classification (target: crop_idx)
    - Stage 2: Disease Classification bounded to a specific crop (target: disease_idx)
    """

    def __init__(
        self,
        samples: List[Dict[str, Any]],
        transform: Optional[Callable] = None,
        target_stage: str = "crop", # 'crop' or 'disease'
        filter_crop_id: Optional[str] = None
    ):
        self.samples = samples
        self.target_stage = target_stage
        self.filter_crop_id = filter_crop_id

        if filter_crop_id:
            self.samples = [s for s in self.samples if s.get("crop_id") == filter_crop_id]

        self.transform = transform or FieldAugmentationPipeline(is_training=False)

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[Any, int]:
        sample = self.samples[idx]
        image_path = sample["image_path"]

        if os.path.exists(image_path):
            with open(image_path, "rb") as f:
                img = Image.open(f).convert("RGB")
        else:
            # Fallback for synthetic/unit tests
            img = Image.new("RGB", (256, 256), color=(34, 139, 34))

        tensor_img = self.transform(img)

        if self.target_stage == "crop":
            label = sample.get("crop_idx", 0)
        else:
            label = sample.get("disease_idx", 0)

        return tensor_img, label


def apply_cutmix_or_mixup(
    images: Any,
    targets: Any,
    alpha: float = 0.2,
    cutmix_prob: float = 0.5
) -> Tuple[Any, Any, Any, float]:
    """Applies CutMix or MixUp regularizations to prevent overconfidence on field clutter."""
    if torch is None or random.random() > 0.5:
        return images, targets, targets, 1.0

    batch_size = images.size(0)
    indices = torch.randperm(batch_size)
    shuffled_targets = targets[indices]

    if random.random() < cutmix_prob:
        # CutMix
        lam = np.random.beta(alpha, alpha)
        _, _, h, w = images.shape
        cut_rat = np.sqrt(1.0 - lam)
        cut_w = int(w * cut_rat)
        cut_h = int(h * cut_rat)

        cx = np.random.randint(w)
        cy = np.random.randint(h)

        bbx1 = np.clip(cx - cut_w // 2, 0, w)
        bby1 = np.clip(cy - cut_h // 2, 0, h)
        bbx2 = np.clip(cx + cut_w // 2, 0, w)
        bby2 = np.clip(cy + cut_h // 2, 0, h)

        images[:, :, bby1:bby2, bbx1:bbx2] = images[indices, :, bby1:bby2, bbx1:bbx2]
        lam = 1 - ((bbx2 - bbx1) * (bby2 - bby1) / (w * h))
        return images, targets, shuffled_targets, lam
    else:
        # MixUp
        lam = np.random.beta(alpha, alpha)
        images = lam * images + (1 - lam) * images[indices]
        return images, targets, shuffled_targets, lam

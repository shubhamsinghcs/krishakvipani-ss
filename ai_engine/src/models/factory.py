"""
Model Architecture Factory for Krishak Vipani Computer Vision Engine.
Provides unified builders for:
- EfficientNetV2-S (Production Server / High Robustness)
- MobileNetV3-Large (Low-latency CPU / Edge deployment)
- ConvNeXt-Tiny (Modernized ConvNet / High representational capacity)
"""

from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

try:
    import torch
    import torch.nn as nn
    import torchvision.models as models
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False
    torch = None
    nn = object
    models = None

try:
    import timm
    HAS_TIMM = True
except ImportError:
    HAS_TIMM = False
    timm = None


class FoliarClassifierHead(nn.Module if HAS_TORCH else object):
    """
    Classifier head with LayerNorm/BatchNorm, Dropout, and Temperature Scaling support.
    """
    def __init__(self, in_features: int, num_classes: int, dropout: float = 0.3):
        if not HAS_TORCH:
            return
        super().__init__()
        self.fc = nn.Sequential(
            nn.Linear(in_features, 512),
            nn.BatchNorm1d(512),
            nn.SiLU(),
            nn.Dropout(p=dropout),
            nn.Linear(512, num_classes)
        )
        self.temperature = nn.Parameter(torch.ones(1) * 1.15)

    def forward(self, x):
        logits = self.fc(x)
        return logits


class KrishakVisionModel(nn.Module if HAS_TORCH else object):
    """Unified wrapper around vision backbones."""
    SUPPORTED_ARCHITECTURES = ["efficientnet_v2_s", "mobilenet_v3_large", "convnext_tiny"]

    def __init__(
        self,
        architecture: str,
        num_classes: int,
        pretrained: bool = True,
        dropout: float = 0.3
    ):
        arch_lower = architecture.lower()
        if not any(sup in arch_lower for sup in ["efficientnet_v2", "mobilenet_v3", "convnext"]):
            raise ValueError(f"Unsupported architecture: {architecture}. Supported: {self.SUPPORTED_ARCHITECTURES}")

        if not HAS_TORCH:
            self.architecture = architecture
            self.num_classes = num_classes
            return
        super().__init__()
        self.architecture = arch_lower
        self.num_classes = num_classes

        # 1. EfficientNetV2-S
        if "efficientnet_v2" in self.architecture:
            if HAS_TIMM:
                self.backbone = timm.create_model(
                    "tf_efficientnetv2_s.in21k_ft_in1k",
                    pretrained=pretrained,
                    num_classes=0
                )
                in_features = self.backbone.num_features
            else:
                weights = models.EfficientNet_V2_S_Weights.DEFAULT if pretrained else None
                base = models.efficientnet_v2_s(weights=weights)
                in_features = base.classifier[1].in_features
                base.classifier = nn.Identity()
                self.backbone = base
            self.classifier = FoliarClassifierHead(in_features, num_classes, dropout)

        # 2. MobileNetV3-Large
        elif "mobilenet_v3" in self.architecture:
            if HAS_TIMM:
                self.backbone = timm.create_model(
                    "mobilenetv3_large_100.ra_in1k",
                    pretrained=pretrained,
                    num_classes=0
                )
                in_features = self.backbone.num_features
            else:
                weights = models.MobileNet_V3_Large_Weights.DEFAULT if pretrained else None
                base = models.mobilenet_v3_large(weights=weights)
                in_features = base.classifier[0].in_features
                base.classifier = nn.Identity()
                self.backbone = base
            self.classifier = FoliarClassifierHead(in_features, num_classes, dropout)

        # 3. ConvNeXt-Tiny
        elif "convnext" in self.architecture:
            if HAS_TIMM:
                self.backbone = timm.create_model(
                    "convnext_tiny.fb_in22k_ft_in1k",
                    pretrained=pretrained,
                    num_classes=0
                )
                in_features = self.backbone.num_features
            else:
                weights = models.ConvNeXt_Tiny_Weights.DEFAULT if pretrained else None
                base = models.convnext_tiny(weights=weights)
                in_features = base.classifier[2].in_features
                base.classifier = nn.Identity()
                self.backbone = base
            self.classifier = FoliarClassifierHead(in_features, num_classes, dropout)

        else:
            raise ValueError(f"Unsupported architecture: {architecture}. Supported: efficientnet_v2_s, mobilenet_v3_large, convnext_tiny")

    def forward(self, x):
        features = self.backbone(x)
        if len(features.shape) > 2:
            features = torch.flatten(features, 1)
        logits = self.classifier(features)
        return logits

    def freeze_backbone(self):
        """Freezes backbone weights for Stage 1 head warmup."""
        for param in self.backbone.parameters():
            param.requires_grad = False

    def unfreeze_backbone(self):
        """Unfreezes backbone weights for Stage 2 end-to-end fine tuning."""
        for param in self.backbone.parameters():
            param.requires_grad = True


def build_model(
    architecture: str = "efficientnet_v2_s",
    num_classes: int = 10,
    pretrained: bool = True,
    dropout: float = 0.3
) -> KrishakVisionModel:
    """Factory helper to instantiate and initialize the requested vision model."""
    logger.info(f"Instantiating KrishakVisionModel: {architecture} (classes={num_classes}, pretrained={pretrained})")
    return KrishakVisionModel(
        architecture=architecture,
        num_classes=num_classes,
        pretrained=pretrained,
        dropout=dropout
    )

"""
Unit Tests for Vision Model Architectures (EfficientNetV2, MobileNetV3, ConvNeXt).
"""

import unittest
from ai_engine.src.models.factory import build_model
from ai_engine.src.data.taxonomy import CROP_LIST


class TestModelArchitectures(unittest.TestCase):

    def test_build_efficientnet_v2(self):
        """Tests EfficientNetV2 instantiation."""
        model = build_model(architecture="efficientnet_v2_s", num_classes=len(CROP_LIST), pretrained=False)
        self.assertEqual(model.architecture, "efficientnet_v2_s")
        self.assertEqual(model.num_classes, len(CROP_LIST))

    def test_build_mobilenet_v3(self):
        """Tests MobileNetV3 instantiation."""
        model = build_model(architecture="mobilenet_v3_large", num_classes=len(CROP_LIST), pretrained=False)
        self.assertEqual(model.architecture, "mobilenet_v3_large")
        self.assertEqual(model.num_classes, len(CROP_LIST))

    def test_build_convnext(self):
        """Tests ConvNeXt instantiation."""
        model = build_model(architecture="convnext_tiny", num_classes=len(CROP_LIST), pretrained=False)
        self.assertEqual(model.architecture, "convnext_tiny")
        self.assertEqual(model.num_classes, len(CROP_LIST))

    def test_invalid_architecture_raises(self):
        """Tests unsupported architecture rejection."""
        with self.assertRaises(ValueError):
            build_model(architecture="vgg16_obsolete", num_classes=5)


if __name__ == "__main__":
    unittest.main()

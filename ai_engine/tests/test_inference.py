"""
Unit & Integration Tests for AI Inference Pipeline.
"""

import io
import unittest
import numpy as np
from PIL import Image

from ai_engine.src.inference.preprocessor import ImageQualityValidator
from ai_engine.src.inference.pipeline import HierarchicalInferencePipeline
from ai_engine.src.data.taxonomy import SUPPORTED_CROPS, CROP_LIST


class TestInferencePipeline(unittest.TestCase):

    def setUp(self):
        self.pipeline = HierarchicalInferencePipeline(architecture="efficientnet_v2_s")

    def _create_synthetic_image(self, size=(300, 300), color=(34, 139, 34)) -> bytes:
        """Creates an in-memory PNG image bytes."""
        img = Image.new("RGB", size, color=color)
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        return buf.getvalue()

    def test_image_quality_validation_valid(self):
        """Tests that a standard valid foliar image passes screening."""
        img_bytes = self._create_synthetic_image(size=(400, 400), color=(40, 150, 40))
        is_valid, pil_img, diag = ImageQualityValidator.validate_and_preprocess(img_bytes)
        self.assertTrue(is_valid)
        self.assertIsNotNone(pil_img)
        self.assertGreaterEqual(diag["resolution"][0], 224)

    def test_image_quality_validation_rejects_tiny(self):
        """Tests that a low-resolution thumbnail is rejected."""
        img_bytes = self._create_synthetic_image(size=(100, 100), color=(40, 150, 40))
        is_valid, _, diag = ImageQualityValidator.validate_and_preprocess(img_bytes)
        self.assertFalse(is_valid)
        self.assertTrue(any("resolution too low" in r for r in diag["reasons"]))

    def test_image_quality_validation_rejects_dark(self):
        """Tests that an underexposed (pitch black) photograph is rejected."""
        img_bytes = self._create_synthetic_image(size=(300, 300), color=(5, 5, 5))
        is_valid, _, diag = ImageQualityValidator.validate_and_preprocess(img_bytes)
        self.assertFalse(is_valid)
        self.assertTrue(any("too dark" in r for r in diag["reasons"]))

    def test_hierarchical_inference_with_confirmed_crop(self):
        """Tests Stage 2 diagnosis when farmer confirms crop upfront."""
        img_bytes = self._create_synthetic_image(size=(350, 350))
        result = self.pipeline.diagnose_hierarchical(img_bytes, confirmed_crop_id="wheat")

        self.assertTrue(result["success"])
        self.assertEqual(result["stage1_crop"]["crop_id"], "wheat")
        self.assertEqual(result["stage1_crop"]["mode"], "USER_CONFIRMED")

        # Stage 2 diagnosis must be bounded strictly to wheat diseases
        wheat_disease_ids = [d["id"] for d in SUPPORTED_CROPS["wheat"]["diseases"]]
        diag_id = result["stage2_disease"]["primary_diagnosis"]["disease_id"]
        self.assertIn(diag_id, wheat_disease_ids)

    def test_hierarchical_inference_auto_detect(self):
        """Tests Stage 1 auto-detect followed by bounded Stage 2 diagnosis."""
        img_bytes = self._create_synthetic_image(size=(350, 350))
        result = self.pipeline.diagnose_hierarchical(img_bytes, confirmed_crop_id=None)

        self.assertTrue(result["success"])
        detected_crop = result["stage1_crop"]["crop_id"]
        self.assertIn(detected_crop, CROP_LIST)
        self.assertIn("primary_diagnosis", result["stage2_disease"])

    def test_unsupported_crop_rejection(self):
        """Verifies system refuses to diagnose crops not in validated registry."""
        img_bytes = self._create_synthetic_image(size=(350, 350))
        result = self.pipeline.predict_disease(Image.open(io.BytesIO(img_bytes)), "dragonfruit")
        self.assertIn("error", result)


if __name__ == "__main__":
    unittest.main()

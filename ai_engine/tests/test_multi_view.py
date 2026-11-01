"""
Unit & Integration Tests for Multi-View Evidence Aggregator.
Verifies:
- 1-3 image multi-view support
- No blind averaging
- Poor-quality image quarantine
- Pathological asymmetry (close-up lesion overriding general healthy canopy)
- Cross-view conflict handling
"""

import unittest
import numpy as np

from ai_engine.src.inference.multi_view_fusion import MultiViewEvidenceAggregator


class TestMultiViewEvidenceAggregator(unittest.TestCase):

    def setUp(self):
        self.class_names = ["early_blight", "late_blight", "leaf_curl", "healthy"]

    def test_single_view_passthrough(self):
        """Single image view passes through cleanly."""
        probs = np.array([0.85, 0.05, 0.05, 0.05])
        diag = [{"valid": True, "blur_score": 48.0}]

        res = MultiViewEvidenceAggregator.fuse_multi_view_predictions(
            view_diagnostics=diag,
            view_probabilities=[probs],
            class_names=self.class_names
        )
        self.assertEqual(res["views_analyzed"], 1)
        self.assertEqual(res["top_class"], "early_blight")
        self.assertAlmostEqual(res["confidence"], 0.85, places=2)

    def test_high_consensus_across_multiple_angles(self):
        """When 2 angles both detect the same disease, consensus is high."""
        v1_probs = np.array([0.80, 0.10, 0.05, 0.05])
        v2_probs = np.array([0.88, 0.05, 0.04, 0.03])
        diags = [
            {"valid": True, "blur_score": 52.0},
            {"valid": True, "blur_score": 58.0}
        ]

        res = MultiViewEvidenceAggregator.fuse_multi_view_predictions(
            view_diagnostics=diags,
            view_probabilities=[v1_probs, v2_probs],
            class_names=self.class_names
        )
        self.assertEqual(res["views_analyzed"], 2)
        self.assertEqual(res["top_class"], "early_blight")
        self.assertEqual(res["consensus_level"], "HIGH_CONSENSUS")
        self.assertGreater(res["confidence"], 0.80)

    def test_blurry_image_does_not_corrupt_sharp_evidence(self):
        """
        Critical test: A blurry second frame must be down-weighted or quarantined,
        and must NOT drag down a decisive close-up lesion prediction.
        """
        # View 1: Sharp macro close-up of Early Blight
        v1_probs = np.array([0.90, 0.04, 0.03, 0.03])
        v1_diag = {"valid": True, "blur_score": 65.0}

        # View 2: Blurry / low quality frame with noisy uniform distribution
        v2_probs = np.array([0.25, 0.25, 0.25, 0.25])
        v2_diag = {"valid": False, "blur_score": 8.0, "reasons": ["Extreme blur detected"]}

        res = MultiViewEvidenceAggregator.fuse_multi_view_predictions(
            view_diagnostics=[v1_diag, v2_diag],
            view_probabilities=[v1_probs, v2_probs],
            class_names=self.class_names
        )
        # Verify View 1 dominates the fusion
        self.assertEqual(res["top_class"], "early_blight")
        self.assertGreater(res["confidence"], 0.80)
        self.assertEqual(len(res["quarantined_views"]), 1)
        self.assertEqual(res["quarantined_views"][0]["view_index"], 2)

    def test_pathological_asymmetry_lesion_overrides_healthy(self):
        """
        In plant pathology, a single clear diseased spot overrides a broad shot of green foliage.
        A 'healthy' canopy view must NOT wash away an infected leaf spot.
        """
        # View 1: Broad plant canopy (looks mostly green/healthy)
        v1_probs = np.array([0.10, 0.05, 0.05, 0.80]) # predicts healthy
        v1_diag = {"valid": True, "blur_score": 45.0}

        # View 2: Close-up macro of leaf showing Late Blight water-soaked lesion
        v2_probs = np.array([0.05, 0.85, 0.05, 0.05]) # predicts late_blight
        v2_diag = {"valid": True, "blur_score": 55.0}

        res = MultiViewEvidenceAggregator.fuse_multi_view_predictions(
            view_diagnostics=[v1_diag, v2_diag],
            view_probabilities=[v1_probs, v2_probs],
            class_names=self.class_names
        )
        # Must diagnose late_blight, NOT healthy!
        self.assertEqual(res["top_class"], "late_blight")
        self.assertEqual(res["consensus_level"], "LOCALIZED_INFECTION_DETECTED")


if __name__ == "__main__":
    unittest.main()

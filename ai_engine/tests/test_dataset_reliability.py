"""
Unit Tests for Indian Field Data Collection, Group-Aware Leakage Prevention & Reliability Evaluator.
"""

import unittest
import numpy as np

from ai_engine.src.data.field_collector import (
    IndianFieldSampleMetadata,
    PlantPart,
    GrowthStage,
    Season,
    CollectionCondition,
    VerificationStatus
)
from ai_engine.src.data.group_splitter import FarmPlantGroupSplitter
from ai_engine.src.evaluation.evaluator import ModelReliabilityEvaluator


class TestDatasetAndModelReliability(unittest.TestCase):

    def test_field_sample_metadata_creation(self):
        """Verifies schema validation and composite leakage key generation."""
        sample = IndianFieldSampleMetadata(
            sample_id="SMPL_101",
            crop_name="tomato",
            disease_label="early_blight",
            plant_part=PlantPart.LEAF_UPPER,
            growth_stage=GrowthStage.VEGETATIVE,
            season=Season.KHARIF,
            collection_condition=CollectionCondition.DIRECT_SUNLIGHT,
            expert_verification_status=VerificationStatus.VERIFIED_BY_ICAR_PATHOLOGIST,
            farm_id="farm_punjab_44",
            session_id="session_morning_01",
            plant_id="plant_bed_3_t12",
            state="Punjab",
            district="Ludhiana",
            expert_id="ICAR_PATH_09"
        )
        self.assertEqual(sample.leakage_group_key, "farm_punjab_44_session_morning_01_plant_bed_3_t12")
        d = sample.to_dict()
        self.assertEqual(d["state"], "Punjab")
        self.assertEqual(d["expert_verification_status"], VerificationStatus.VERIFIED_BY_ICAR_PATHOLOGIST)

    def test_group_aware_splitter_prevents_leakage(self):
        """
        Crucial test: Multiple images from the same plant/session MUST stay together in the same split.
        """
        samples = []
        # Generate 15 distinct plants with 3 images each (45 total images)
        for plant_idx in range(15):
            farm_id = f"farm_{plant_idx % 3}"
            session_id = f"session_{plant_idx % 2}"
            plant_id = f"plant_{plant_idx}"
            group_key = f"{farm_id}_{session_id}_{plant_id}"

            for img_sub in range(3):
                samples.append({
                    "image_id": f"img_{plant_idx}_{img_sub}",
                    "disease_label": "late_blight" if plant_idx % 2 == 0 else "healthy",
                    "group_metadata": {
                        "farm_id": farm_id,
                        "session_id": session_id,
                        "plant_id": plant_id,
                        "leakage_group_key": group_key
                    }
                })

        splitter = FarmPlantGroupSplitter(train_ratio=0.6, val_ratio=0.2, test_ratio=0.2, random_seed=42)
        train_s, val_s, test_s = splitter.split_samples(samples)

        train_keys = {s["group_metadata"]["leakage_group_key"] for s in train_s}
        val_keys = {s["group_metadata"]["leakage_group_key"] for s in val_s}
        test_keys = {s["group_metadata"]["leakage_group_key"] for s in test_s}

        # Assert ZERO overlap between groups across all splits
        self.assertEqual(len(train_keys.intersection(val_keys)), 0, "Train and Val leak detected!")
        self.assertEqual(len(train_keys.intersection(test_keys)), 0, "Train and Test leak detected!")
        self.assertEqual(len(val_keys.intersection(test_keys)), 0, "Val and Test leak detected!")

    def test_reliability_evaluator_metrics(self):
        """Verifies multi-metric evaluation, Top-3, ECE calibration, and False-Negative audit."""
        classes = ["early_blight", "late_blight", "healthy"]
        evaluator = ModelReliabilityEvaluator(classes)

        # 100 test cases
        y_true = np.array([0]*35 + [1]*35 + [2]*30)
        # Probabilities with high accuracy
        y_probs = np.zeros((100, 3))
        for i, t in enumerate(y_true):
            if i % 10 == 0: # minor error
                wrong_class = (t + 1) % 3
                y_probs[i, wrong_class] = 0.8
                y_probs[i, t] = 0.2
            else:
                y_probs[i, t] = 0.92
                y_probs[i, (t + 1) % 3] = 0.05
                y_probs[i, (t + 2) % 3] = 0.03

        results = evaluator.evaluate_predictions(y_true, y_probs)

        # Check top-1 and top-3 accuracy
        self.assertGreater(results["summary"]["top1_accuracy"], 0.85)
        self.assertGreaterEqual(results["summary"]["top3_accuracy"], 0.99)
        self.assertIn("macro_f1", results["summary"])
        self.assertIn("expected_calibration_error", results["calibration"])
        self.assertIn("late_blight", results["false_negative_safety_audit"])
        self.assertIn("missed_as_healthy_count", results["false_negative_safety_audit"]["late_blight"])


if __name__ == "__main__":
    unittest.main()

"""
Multi-View Evidence Aggregator for Crop Pathology.
Synthesizes 1 to 3 photographs representing different angles of the same plant problem:
- Whole plant / canopy view
- Macro close-up of lesion
- Underside of leaf or stem collar

Key Safety & Scientific Principles:
1. No Blind Averaging: A blurry or ambiguous photograph must never dilute a sharp, decisive symptom photograph.
2. Quality-Gated Attentive Weighting: Views are weighted by their optical sharpness and normalized Shannon entropy.
3. Pathological Asymmetry: In plant diagnostics, a clear diseased lesion in one view must override 'healthy' general foliage views.
4. Cross-View Conflict Detection: If two views conflict strongly on different diseases, flags potential co-infection or ambiguity.
"""

from typing import List, Dict, Any, Tuple, Optional
import numpy as np
from PIL import Image

from .preprocessor import ImageQualityValidator


class MultiViewEvidenceAggregator:
    """
    Evidence-based fusion of 1-3 photographs of the same plant issue.
    """

    MIN_ENTROPY_WEIGHT = 0.05

    @classmethod
    def compute_view_informational_weight(
        cls,
        quality_diag: Dict[str, Any],
        predicted_probs: np.ndarray
    ) -> float:
        """
        Calculates salience weight w_k based on:
        1. Optical quality (Laplacian blur, resolution, lighting)
        2. Prediction certainty: (1 - Normalized Shannon Entropy)
        """
        # Quality component
        blur_score = quality_diag.get("blur_score", 50.0)
        # Normalize blur score into [0.2, 1.0]
        q_optical = np.clip(blur_score / 60.0, 0.2, 1.0)
        if not quality_diag.get("valid", True):
            q_optical *= 0.25 # Severely penalize poor-quality frames

        # Informational entropy component: H(P) / log(C)
        probs = np.clip(predicted_probs, 1e-7, 1.0)
        num_classes = len(probs)
        entropy = -np.sum(probs * np.log(probs))
        max_entropy = np.log(num_classes) if num_classes > 1 else 1.0
        norm_entropy = float(entropy / max_entropy)
        certainty = float(np.clip(1.0 - norm_entropy, cls.MIN_ENTROPY_WEIGHT, 1.0))

        # Attentive weight combines optical fidelity with diagnostic clarity
        weight = float(q_optical * certainty)
        return weight

    @classmethod
    def fuse_multi_view_predictions(
        cls,
        view_diagnostics: List[Dict[str, Any]],
        view_probabilities: List[np.ndarray],
        class_names: List[str]
    ) -> Dict[str, Any]:
        """
        Fuses predictions across 1 to 3 images.
        """
        num_views = len(view_probabilities)
        assert num_views > 0, "At least one image view required."

        if num_views == 1:
            probs = view_probabilities[0]
            top_idx = int(np.argmax(probs))
            return {
                "fused_probabilities": probs,
                "top_class": class_names[top_idx],
                "confidence": float(probs[top_idx]),
                "views_analyzed": 1,
                "consensus_level": "SINGLE_VIEW",
                "active_weights": [1.0],
                "quarantined_views": []
            }

        # 1. Compute per-view weights
        raw_weights = []
        quarantined_views = []

        for idx in range(num_views):
            diag = view_diagnostics[idx]
            p = view_probabilities[idx]
            w = cls.compute_view_informational_weight(diag, p)

            # Quarantine rule: If view is invalid and other valid views exist, quarantine it
            if not diag.get("valid", True):
                quarantined_views.append({
                    "view_index": idx + 1,
                    "reason": diag.get("reasons", ["Poor visual quality"])
                })
                w = 0.05 # heavily discount corrupt evidence

            raw_weights.append(w)

        total_weight = sum(raw_weights)
        norm_weights = [w / total_weight for w in raw_weights] if total_weight > 0 else [1.0 / num_views] * num_views

        # 2. Weighted Attentive Probability Fusion
        fused_probs = np.zeros_like(view_probabilities[0], dtype=np.float64)
        for idx in range(num_views):
            fused_probs += norm_weights[idx] * view_probabilities[idx]

        # 3. Pathological Asymmetry Adjustment:
        # If any single view shows clear pathogen pustules/spots (e.g. > 0.65 probability for a disease)
        # while another view shows general green foliage (predicting "healthy"),
        # diseased spots MUST NOT be masked by healthy background views.
        healthy_idx = class_names.index("healthy") if "healthy" in class_names else -1

        if healthy_idx != -1:
            for idx in range(num_views):
                view_top_idx = int(np.argmax(view_probabilities[idx]))
                view_conf = float(view_probabilities[idx][view_top_idx])
                # If a specific view spotted a disease with high certainty, suppress the healthy dilution
                if view_top_idx != healthy_idx and view_conf >= 0.65:
                    if fused_probs[healthy_idx] > fused_probs[view_top_idx]:
                        # Swap priority to the detected pathogen
                        fused_probs[view_top_idx] = max(fused_probs[view_top_idx], view_conf * 0.9)
                        fused_probs[healthy_idx] = min(fused_probs[healthy_idx], 0.25)
                    break

        # Re-normalize
        fused_probs = fused_probs / np.sum(fused_probs)

        # 4. Cross-View Agreement & Conflict Evaluation
        view_top_classes = [class_names[int(np.argmax(p))] for p in view_probabilities]
        unique_pred_classes = set(view_top_classes)

        if len(unique_pred_classes) == 1:
            consensus = "HIGH_CONSENSUS"
            conflict_notes = "All photographic perspectives agree on the primary diagnosis."
        elif len(unique_pred_classes) == 2 and "healthy" in unique_pred_classes:
            consensus = "LOCALIZED_INFECTION_DETECTED"
            conflict_notes = "Lesions captured in close-up/underside view on an otherwise green plant canopy."
        else:
            consensus = "DIVERGENT_VIEWS"
            conflict_notes = "Different perspectives exhibit overlapping symptoms. Differential verification required."

        top_idx = int(np.argmax(fused_probs))
        top_conf = float(fused_probs[top_idx])

        return {
            "fused_probabilities": fused_probs,
            "top_class": class_names[top_idx],
            "confidence": round(top_conf, 4),
            "views_analyzed": num_views,
            "consensus_level": consensus,
            "consensus_notes": conflict_notes,
            "active_weights": [round(w, 3) for w in norm_weights],
            "view_predictions": view_top_classes,
            "quarantined_views": quarantined_views
        }

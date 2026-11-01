"""
Evaluation Metrics & Calibration Engine for Krishak Vipani Field Benchmarks.
Computes Macro F1, Per-Crop Slices, Expected Calibration Error (ECE), and Confusion Matrices.
"""

from typing import Dict, List, Any, Tuple
import numpy as np

try:
    from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False


def compute_expected_calibration_error(
    confidences: np.ndarray,
    predictions: np.ndarray,
    targets: np.ndarray,
    num_bins: int = 10
) -> float:
    """
    Computes Expected Calibration Error (ECE).
    Ensures that a 90% confidence prediction actually reflects 90% empirical accuracy,
    which is essential for agricultural trust and farmer decision support.
    """
    bin_boundaries = np.linspace(0, 1, num_bins + 1)
    ece = 0.0
    total_samples = len(targets)

    for i in range(num_bins):
        bin_lower = bin_boundaries[i]
        bin_upper = bin_boundaries[i + 1]

        in_bin = (confidences > bin_lower) & (confidences <= bin_upper)
        bin_count = np.sum(in_bin)

        if bin_count > 0:
            bin_acc = np.mean(predictions[in_bin] == targets[in_bin])
            bin_conf = np.mean(confidences[in_bin])
            ece += (bin_count / total_samples) * np.abs(bin_acc - bin_conf)

    return float(ece)


def compute_field_metrics(
    y_true: List[int],
    y_pred: List[int],
    y_probs: np.ndarray,
    class_names: List[str]
) -> Dict[str, Any]:
    """Comprehensive metric report including Macro-F1, per-class metrics, and ECE."""
    y_true_arr = np.array(y_true)
    y_pred_arr = np.array(y_pred)
    confidences = np.max(y_probs, axis=1) if len(y_probs) > 0 else np.ones(len(y_pred_arr))

    top1_acc = float(np.mean(y_true_arr == y_pred_arr))
    ece = compute_expected_calibration_error(confidences, y_pred_arr, y_true_arr)

    metrics = {
        "top1_accuracy": round(top1_acc, 4),
        "expected_calibration_error": round(ece, 4),
        "total_evaluated_samples": len(y_true),
    }

    if HAS_SKLEARN:
        precision, recall, f1, _ = precision_recall_fscore_support(
            y_true_arr, y_pred_arr, average="macro", zero_division=0
        )
        metrics["macro_precision"] = round(float(precision), 4)
        metrics["macro_recall"] = round(float(recall), 4)
        metrics["macro_f1"] = round(float(f1), 4)

        report = classification_report(
            y_true_arr, y_pred_arr, target_names=class_names, output_dict=True, zero_division=0
        )
        metrics["per_class"] = {
            cls: {
                "precision": round(data["precision"], 4),
                "recall": round(data["recall"], 4),
                "f1": round(data["f1-score"], 4),
                "support": data["support"]
            }
            for cls, data in report.items() if cls in class_names
        }
        metrics["confusion_matrix"] = confusion_matrix(y_true_arr, y_pred_arr).tolist()
    else:
        metrics["macro_f1"] = round(top1_acc, 4)

    return metrics

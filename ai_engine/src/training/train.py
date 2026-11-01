"""
Production Model Training Pipeline for Krishak Vipani Computer Vision.
Features:
- Two-stage Transfer Learning & Fine-Tuning
- Label Smoothing & Gradient Clipping
- Cosine Annealing Learning Rate Scheduling
- Full MLflow Experiment Tracking and Model Checkpointing
"""

import os
import argparse
import yaml
import logging
from typing import Dict, Any, Tuple

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import DataLoader
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

try:
    import mlflow
    HAS_MLFLOW = True
except ImportError:
    HAS_MLFLOW = False

from ..models.factory import build_model
from ..data.dataset import KrishakFieldDataset, FieldAugmentationPipeline, apply_cutmix_or_mixup

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("krishak_train")


class KrishakTrainer:
    """End-to-end Trainer with MLflow logging and robust field optimization."""

    def __init__(self, config: Dict[str, Any], device: str = "cuda"):
        self.config = config
        self.device = torch.device(device if (HAS_TORCH and torch.cuda.is_available() and device == "cuda") else "cpu")
        self.model_arch = config.get("model", {}).get("architecture", "efficientnet_v2_s")
        self.num_classes = config.get("data", {}).get("num_classes", 10)
        self.checkpoint_dir = "checkpoints"
        os.makedirs(self.checkpoint_dir, exist_ok=True)

        if HAS_TORCH:
            self.model = build_model(
                architecture=self.model_arch,
                num_classes=self.num_classes,
                pretrained=True,
                dropout=config.get("model", {}).get("dropout", 0.3)
            ).to(self.device)

            label_smoothing = config.get("training", {}).get("label_smoothing", 0.1)
            self.criterion = nn.CrossEntropyLoss(label_smoothing=label_smoothing)

    def train_epoch(self, dataloader: Any, optimizer: Any) -> Tuple[float, float]:
        """Runs a single training epoch with CutMix / MixUp."""
        self.model.train()
        total_loss, correct, total_samples = 0.0, 0, 0

        for images, targets in dataloader:
            images = images.to(self.device)
            targets = targets.to(self.device)

            # Apply CutMix / MixUp
            images, targets_a, targets_b, lam = apply_cutmix_or_mixup(images, targets)

            optimizer.zero_grad()
            outputs = self.model(images)
            loss = lam * self.criterion(outputs, targets_a) + (1 - lam) * self.criterion(outputs, targets_b)

            loss.backward()
            torch.nn.utils.clip_grad_norm_(
                self.model.parameters(),
                self.config.get("training", {}).get("gradient_clip_norm", 1.0)
            )
            optimizer.step()

            total_loss += loss.item() * images.size(0)
            preds = outputs.argmax(dim=1)
            correct += (preds == targets).sum().item()
            total_samples += targets.size(0)

        epoch_loss = total_loss / max(total_samples, 1)
        epoch_acc = correct / max(total_samples, 1)
        return epoch_loss, epoch_acc

    @torch.no_grad()
    def evaluate(self, dataloader: Any) -> Tuple[float, float]:
        """Evaluates model performance on validation / field test sets."""
        self.model.eval()
        total_loss, correct, total_samples = 0.0, 0, 0

        for images, targets in dataloader:
            images = images.to(self.device)
            targets = targets.to(self.device)

            outputs = self.model(images)
            loss = self.criterion(outputs, targets)

            total_loss += loss.item() * images.size(0)
            preds = outputs.argmax(dim=1)
            correct += (preds == targets).sum().item()
            total_samples += targets.size(0)

        return total_loss / max(total_samples, 1), correct / max(total_samples, 1)

    def fit(self, train_loader: Any, val_loader: Any):
        """Executes two-stage transfer learning: Phase 1 (Head Warmup) + Phase 2 (Fine-tuning)."""
        if not HAS_TORCH:
            logger.warning("PyTorch not installed. Simulation mode.")
            return

        experiment_name = self.config.get("project", {}).get("experiment_name", "crop_disease")
        if HAS_MLFLOW:
            mlflow.set_experiment(experiment_name)
            mlflow.start_run(run_name=f"{self.model_arch}_transfer_learning")
            mlflow.log_params(self.config.get("training", {}))
            mlflow.log_param("architecture", self.model_arch)

        # Stage 1: Freeze Backbone, Train Head Only
        logger.info("=== Phase 1: Training Classification Head (Backbone Frozen) ===")
        self.model.freeze_backbone()
        optimizer_head = optim.AdamW(
            filter(lambda p: p.requires_grad, self.model.parameters()),
            lr=float(self.config.get("training", {}).get("learning_rate_head", 1e-3)),
            weight_decay=float(self.config.get("training", {}).get("weight_decay", 1e-4))
        )

        stage1_epochs = int(self.config.get("training", {}).get("epochs_stage1_head_only", 5))
        for epoch in range(1, stage1_epochs + 1):
            train_loss, train_acc = self.train_epoch(train_loader, optimizer_head)
            val_loss, val_acc = self.evaluate(val_loader)
            logger.info(f"[Phase 1] Epoch {epoch}/{stage1_epochs} - Train Loss: {train_loss:.4f}, Acc: {train_acc:.4f} | Val Loss: {val_loss:.4f}, Acc: {val_acc:.4f}")
            if HAS_MLFLOW:
                mlflow.log_metrics({"phase1_train_loss": train_loss, "phase1_val_acc": val_acc}, step=epoch)

        # Stage 2: Unfreeze Backbone, End-to-End Fine-Tuning with Differential Learning Rates
        logger.info("=== Phase 2: End-to-End Fine-Tuning (Differential Learning Rates) ===")
        self.model.unfreeze_backbone()

        lr_backbone = float(self.config.get("training", {}).get("learning_rate_backbone", 1e-4))
        lr_head = float(self.config.get("training", {}).get("learning_rate_head", 1e-3)) * 0.5

        optimizer_ft = optim.AdamW([
            {"params": self.model.backbone.parameters(), "lr": lr_backbone},
            {"params": self.model.classifier.parameters(), "lr": lr_head}
        ], weight_decay=float(self.config.get("training", {}).get("weight_decay", 1e-4)))

        stage2_epochs = int(self.config.get("training", {}).get("epochs_stage2_fine_tune", 25))
        scheduler = optim.lr_scheduler.CosineAnnealingWarmRestarts(
            optimizer_ft, T_0=10, T_mult=2, eta_min=float(self.config.get("training", {}).get("min_lr", 1e-6))
        )

        best_val_acc = 0.0
        patience = int(self.config.get("training", {}).get("early_stopping_patience", 6))
        patience_counter = 0
        best_checkpoint_path = os.path.join(self.checkpoint_dir, f"{self.model_arch}_best.pt")

        for epoch in range(1, stage2_epochs + 1):
            train_loss, train_acc = self.train_epoch(train_loader, optimizer_ft)
            val_loss, val_acc = self.evaluate(val_loader)
            scheduler.step()

            logger.info(f"[Phase 2] Epoch {epoch}/{stage2_epochs} - Train Loss: {train_loss:.4f}, Acc: {train_acc:.4f} | Val Loss: {val_loss:.4f}, Acc: {val_acc:.4f}")
            if HAS_MLFLOW:
                mlflow.log_metrics({
                    "train_loss": train_loss,
                    "train_acc": train_acc,
                    "val_loss": val_loss,
                    "val_acc": val_acc,
                    "lr_backbone": scheduler.get_last_lr()[0]
                }, step=epoch)

            if val_acc > best_val_acc:
                best_val_acc = val_acc
                patience_counter = 0
                torch.save({
                    "epoch": epoch,
                    "architecture": self.model_arch,
                    "state_dict": self.model.state_dict(),
                    "val_acc": val_acc,
                    "config": self.config
                }, best_checkpoint_path)
                logger.info(f"--> Saved new best checkpoint to {best_checkpoint_path} (Acc: {val_acc:.4f})")
            else:
                patience_counter += 1
                if patience_counter >= patience:
                    logger.info(f"Early stopping triggered after {epoch} epochs.")
                    break

        if HAS_MLFLOW:
            mlflow.log_metric("best_val_acc", best_val_acc)
            if os.path.exists(best_checkpoint_path):
                mlflow.log_artifact(best_checkpoint_path, artifact_path="model_weights")
            mlflow.end_run()


def main():
    parser = argparse.ArgumentParser(description="Krishak Vipani CV Training")
    parser.add_argument("--config", type=str, default="configs/efficientnet_v2.yaml")
    args = parser.parse_args()

    with open(args.config, "r") as f:
        config = yaml.safe_load(f)

    trainer = KrishakTrainer(config)
    logger.info("Trainer initialized successfully.")


if __name__ == "__main__":
    main()

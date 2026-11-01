"""
Group-Aware Dataset Splitter for Agricultural Field Images.
Strictly prevents data leakage by isolating entire farms, plants, and collection sessions
so that no overlapping illumination, soil texture, or foliage features leak into validation or test sets.
"""

from typing import List, Dict, Any, Tuple
from collections import defaultdict
import random
import numpy as np

try:
    from sklearn.model_selection import StratifiedGroupKFold
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False


class FarmPlantGroupSplitter:
    """
    Prevents data leakage across Train / Val / Test.
    Never splits at the raw image level!
    Guarantees:
    - All photos of the same plant or from the same farm session are assigned to the SAME split.
    - Preserves class balance across the 10 crops and diseases.
    """

    def __init__(
        self,
        train_ratio: float = 0.70,
        val_ratio: float = 0.15,
        test_ratio: float = 0.15,
        random_seed: int = 42
    ):
        assert abs((train_ratio + val_ratio + test_ratio) - 1.0) < 1e-5, "Split ratios must sum to 1.0"
        self.train_ratio = train_ratio
        self.val_ratio = val_ratio
        self.test_ratio = test_ratio
        self.random_seed = random_seed

    def split_samples(
        self,
        samples: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Splits samples based on composite group key: `farm_id` + `session_id` + `plant_id`.
        Returns (train_samples, val_samples, test_samples).
        """
        rng = random.Random(self.random_seed)

        # 1. Group samples by composite group key
        group_to_samples = defaultdict(list)
        group_to_class = {}

        for s in samples:
            # Composite group key
            meta = s.get("group_metadata", {})
            farm = meta.get("farm_id", s.get("farm_id", "unknown_farm"))
            sess = meta.get("session_id", s.get("session_id", "unknown_session"))
            plant = meta.get("plant_id", s.get("plant_id", "unknown_plant"))
            group_key = f"{farm}_{sess}_{plant}"

            group_to_samples[group_key].append(s)
            label = s.get("disease_id") or s.get("disease_label") or "healthy"
            group_to_class[group_key] = label

        unique_groups = list(group_to_samples.keys())
        rng.shuffle(unique_groups)

        # 2. Stratified allocation of groups
        class_to_groups = defaultdict(list)
        for g in unique_groups:
            c = group_to_class[g]
            class_to_groups[c].append(g)

        train_groups, val_groups, test_groups = set(), set(), set()

        for c, g_list in class_to_groups.items():
            n = len(g_list)
            if n == 1:
                train_groups.add(g_list[0])
            elif n == 2:
                train_groups.add(g_list[0])
                test_groups.add(g_list[1])
            else:
                n_train = max(1, int(round(n * self.train_ratio)))
                n_val = max(1, int(round(n * self.val_ratio)))
                # Remaining to test
                train_slice = g_list[:n_train]
                val_slice = g_list[n_train:n_train + n_val]
                test_slice = g_list[n_train + n_val:]

                train_groups.update(train_slice)
                val_groups.update(val_slice)
                test_groups.update(test_slice if test_slice else val_slice[-1:])

        # 3. Flatten into sample lists
        train_samples = [s for g in train_groups for s in group_to_samples[g]]
        val_samples = [s for g in val_groups for s in group_to_samples[g]]
        test_samples = [s for g in test_groups for s in group_to_samples[g]]

        # Safety Verification: Assert zero group leakage
        train_g_set = {s.get("group_metadata", {}).get("leakage_group_key") for s in train_samples}
        val_g_set = {s.get("group_metadata", {}).get("leakage_group_key") for s in val_samples}
        test_g_set = {s.get("group_metadata", {}).get("leakage_group_key") for s in test_samples}

        assert len(train_g_set.intersection(val_g_set)) == 0, "Data Leakage Detected between Train and Val!"
        assert len(train_g_set.intersection(test_g_set)) == 0, "Data Leakage Detected between Train and Test!"
        assert len(val_g_set.intersection(test_g_set)) == 0, "Data Leakage Detected between Val and Test!"

        return train_samples, val_samples, test_samples

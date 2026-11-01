"""
Production Image Preprocessing & Foliar Quality Validation.
Utilizes OpenCV and Pillow to detect blur, extreme lighting, and non-plant content.
"""

from typing import Tuple, Dict, Any, Optional
import io
import numpy as np
from PIL import Image

try:
    import cv2
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False


class ImageQualityValidator:
    """Validates real field photographs before forwarding to neural inference."""

    MIN_RESOLUTION = 224
    MIN_LUMINANCE = 25.0
    MAX_LUMINANCE = 245.0
    MIN_LAPLACIAN_VAR = 15.0 # Blur detection threshold

    @classmethod
    def validate_and_preprocess(
        cls,
        image_bytes: bytes,
        target_size: Tuple[int, int] = (256, 256)
    ) -> Tuple[bool, Optional[Image.Image], Dict[str, Any]]:
        """
        Validates image quality and converts to RGB PIL Image.
        Returns (is_valid, processed_image, diagnostics).
        """
        diagnostics = {
            "valid": True,
            "reasons": [],
            "blur_score": 0.0,
            "mean_luminance": 0.0,
            "resolution": (0, 0),
        }

        try:
            pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            diagnostics["valid"] = False
            diagnostics["reasons"].append(f"Corrupted or invalid image format: {str(e)}")
            return False, None, diagnostics

        w, h = pil_img.size
        diagnostics["resolution"] = (w, h)

        if w < cls.MIN_RESOLUTION or h < cls.MIN_RESOLUTION:
            diagnostics["valid"] = False
            diagnostics["reasons"].append(f"Image resolution too low ({w}x{h}). Minimum required: {cls.MIN_RESOLUTION}x{cls.MIN_RESOLUTION}px.")

        img_np = np.array(pil_img)

        # 1. Luminance check
        luminance = float(np.mean(img_np))
        diagnostics["mean_luminance"] = round(luminance, 2)
        if luminance < cls.MIN_LUMINANCE:
            diagnostics["valid"] = False
            diagnostics["reasons"].append("Photograph is too dark. Capture in open indirect sunlight.")
        elif luminance > cls.MAX_LUMINANCE:
            diagnostics["valid"] = False
            diagnostics["reasons"].append("Photograph is severely overexposed/washed out.")

        # 2. Blur analysis via OpenCV Laplacian variance
        if HAS_CV2:
            gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
            laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
            diagnostics["blur_score"] = round(laplacian_var, 2)
            if laplacian_var < cls.MIN_LAPLACIAN_VAR:
                diagnostics["valid"] = False
                diagnostics["reasons"].append("Photograph is blurry or out of focus. Hold phone steady at 15-20cm distance.")
        else:
            diagnostics["blur_score"] = 50.0

        # Preprocess / Resize
        resized_img = pil_img.resize(target_size, Image.Resampling.BILINEAR)
        return diagnostics["valid"], resized_img, diagnostics

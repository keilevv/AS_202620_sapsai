import os
import uuid
import random
import numpy as np
import gc
from tensorflow.keras.preprocessing.image import img_to_array, load_img
from PIL import Image, ImageEnhance, ImageFilter


def _apply_random_transforms(pil_img):
    """
    Apply a chain of realistic, non-destructive transforms to a PIL image.
    Focuses on variations that occur naturally in leaf photography:
      - Rotation (camera angle)
      - Horizontal / vertical flip (orientation)
      - Brightness & contrast jitter (lighting)
      - Color saturation shift (white-balance)
      - Slight Gaussian blur (focus variation)
    """
    # --- Rotation (±30°, black-free thanks to expand + crop-back) ---
    angle = random.uniform(-30, 30)
    rotated = pil_img.rotate(angle, resample=Image.BICUBIC, expand=True, fillcolor=(0, 0, 0))
    # Crop back to original size from center to avoid black borders
    w, h = pil_img.size
    rw, rh = rotated.size
    left = (rw - w) // 2
    top = (rh - h) // 2
    pil_img = rotated.crop((left, top, left + w, top + h))

    # --- Random flips ---
    if random.random() > 0.5:
        pil_img = pil_img.transpose(Image.FLIP_LEFT_RIGHT)
    if random.random() > 0.5:
        pil_img = pil_img.transpose(Image.FLIP_TOP_BOTTOM)

    # --- Brightness jitter (±20%) ---
    factor = random.uniform(0.8, 1.2)
    pil_img = ImageEnhance.Brightness(pil_img).enhance(factor)

    # --- Contrast jitter (±20%) ---
    factor = random.uniform(0.8, 1.2)
    pil_img = ImageEnhance.Contrast(pil_img).enhance(factor)

    # --- Saturation / color jitter (±15%) ---
    factor = random.uniform(0.85, 1.15)
    pil_img = ImageEnhance.Color(pil_img).enhance(factor)

    # --- Slight Gaussian blur (simulates slight defocus) ---
    if random.random() > 0.7:
        radius = random.uniform(0.3, 1.0)
        pil_img = pil_img.filter(ImageFilter.GaussianBlur(radius=radius))

    # --- Gentle zoom (crop center 85-100% then resize back) ---
    if random.random() > 0.5:
        zoom = random.uniform(0.85, 1.0)
        w, h = pil_img.size
        crop_w, crop_h = int(w * zoom), int(h * zoom)
        left = (w - crop_w) // 2
        top = (h - crop_h) // 2
        pil_img = pil_img.crop((left, top, left + crop_w, top + crop_h))
        pil_img = pil_img.resize((w, h), Image.BICUBIC)

    return pil_img


def augment_images_in_dir(directory, target_count, prefix="augmented"):
    """
    Augments images in the given directory until the target_count is reached.
    Uses realistic transforms (rotations, flips, brightness/contrast, blur)
    instead of geometric warping to preserve natural leaf appearance.
    """
    if not os.path.exists(directory):
        return 0

    images = [f for f in os.listdir(directory) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    current_count = len(images)

    if current_count >= target_count or current_count == 0:
        return 0

    needed = target_count - current_count

    generated = 0
    # Guard against infinite loops if directory cannot be written to
    attempts = 0
    max_attempts = needed * 3

    while generated < needed and attempts < max_attempts:
        for img_name in images:
            if generated >= needed:
                break

            img_path = os.path.join(directory, img_name)
            try:
                pil_img = Image.open(img_path).convert("RGB")
                augmented = _apply_random_transforms(pil_img)

                out_name = f"{prefix}_{uuid.uuid4().hex[:8]}.jpg"
                augmented.save(os.path.join(directory, out_name), "JPEG", quality=95)
                generated += 1

                # Explicit cleanup
                del pil_img, augmented
            except Exception as e:
                print(f"Error augmenting {img_name}: {e}")

            attempts += 1

            # Periodically collect garbage
            if generated % 50 == 0:
                gc.collect()

    return generated


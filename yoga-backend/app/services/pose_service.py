"""Singleton wrapper around the MoveNet TFLite model for live inference."""

import io
import os
import numpy as np
import cv2
import tensorflow as tf

from app.services.movenet import Movement
from app.services.dataset_builder import BodyPart

_model: Movement | None = None

_MODEL_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..', 'movenet_thunder.tflite')
)


def get_model() -> Movement:
    """Return the (lazily loaded) singleton MoveNet model."""
    global _model
    if _model is None:
        _model = Movement(_MODEL_PATH)
    return _model


def infer(frame_bytes: bytes) -> dict:
    """Run MoveNet inference on a JPEG/PNG frame and return JSON-serialisable keypoints.

    Args:
        frame_bytes: Raw bytes of a JPEG or PNG image from the webcam.

    Returns:
        dict with key "keypoints": list of 17 dicts, each with keys
        body_part, x, y, score.
    """
    # Decode bytes → numpy RGB image
    arr = np.frombuffer(frame_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError('Could not decode image bytes')
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    person = get_model().detect(img_rgb, reset_crop_region=False)

    keypoints_out = [
        {
            'body_part': kp.body_part.name,
            'x': float(kp.coordinate.x),
            'y': float(kp.coordinate.y),
            'score': float(kp.score),
        }
        for kp in person.keypoints
    ]

    return {
        'keypoints': keypoints_out,
        'image_width': img_rgb.shape[1],
        'image_height': img_rgb.shape[0],
    }

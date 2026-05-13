"""Yoga pose classifier using the trained Keras model.

Requires:
    exported_models/pose_classifier.keras
    exported_models/class_names.json
"""

import json
import os

import numpy as np
import tensorflow as tf
from tensorflow import keras

from app.services.dataset_builder import BodyPart

_MODEL_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..', 'exported_models')
)

_classifier: keras.Model | None = None
_class_names: list[str] | None = None


def _load() -> tuple[keras.Model, list[str]]:
    global _classifier, _class_names
    if _classifier is None:
        model_path = os.path.join(_MODEL_DIR, 'pose_classifier.keras')
        names_path = os.path.join(_MODEL_DIR, 'class_names.json')

        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f'Trained model not found at {model_path}. '
                'Run: python scripts/train.py'
            )
        if not os.path.exists(names_path):
            raise FileNotFoundError(
                f'class_names.json not found at {names_path}. '
                'Run: python scripts/train.py'
            )

        _classifier = keras.models.load_model(model_path)
        with open(names_path) as f:
            _class_names = json.load(f)

    return _classifier, _class_names


# ---------------------------------------------------------------------------
# Landmark normalisation — must be identical to trainer.py
# ---------------------------------------------------------------------------

def _get_center_point(landmarks, left_bp: BodyPart, right_bp: BodyPart):
    left = landmarks[left_bp.value]
    right = landmarks[right_bp.value]
    return (left + right) * 0.5


def _get_pose_size(landmarks_2d: np.ndarray, torso_size_multiplier=2.5) -> float:
    hips_center = _get_center_point(landmarks_2d, BodyPart.LEFT_HIP, BodyPart.RIGHT_HIP)
    shoulders_center = _get_center_point(
        landmarks_2d, BodyPart.LEFT_SHOULDER, BodyPart.RIGHT_SHOULDER
    )
    torso_size = float(np.linalg.norm(shoulders_center - hips_center))
    pose_center = hips_center
    dists = np.linalg.norm(landmarks_2d - pose_center, axis=1)
    max_dist = float(np.max(dists))
    return max(torso_size * torso_size_multiplier, max_dist)


def _normalize(landmarks_2d: np.ndarray) -> np.ndarray:
    pose_center = _get_center_point(
        landmarks_2d, BodyPart.LEFT_HIP, BodyPart.RIGHT_HIP
    )
    landmarks_2d = landmarks_2d - pose_center
    size = _get_pose_size(landmarks_2d)
    return landmarks_2d / size


def _keypoints_to_embedding(keypoints: list[dict]) -> np.ndarray:
    """Convert raw keypoints list → normalised [34] embedding array."""
    xy = np.array([[kp['x'], kp['y']] for kp in keypoints], dtype=np.float32)
    normalised = _normalize(xy)
    return normalised.flatten()  # shape (34,)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def classify(keypoints: list[dict]) -> dict:
    """Classify a pose from keypoints.

    Args:
        keypoints: list of 17 dicts with keys body_part, x, y, score.

    Returns:
        dict with keys: pose_class (str), confidence (float),
        all_scores (dict[str, float]).
    """
    model, class_names = _load()
    embedding = _keypoints_to_embedding(keypoints)
    pred = model.predict(embedding[np.newaxis, :], verbose=0)[0]

    top_idx = int(np.argmax(pred))
    return {
        'pose_class': class_names[top_idx],
        'confidence': float(pred[top_idx]),
        'all_scores': {name: float(pred[i]) for i, name in enumerate(class_names)},
    }

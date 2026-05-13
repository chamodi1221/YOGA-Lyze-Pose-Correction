"""Joint angle calculation and coach feedback service."""

import math
import os
import json
from typing import Optional

from app.services.dataset_builder import BodyPart

# ---------------------------------------------------------------------------
# Angle computation helpers
# ---------------------------------------------------------------------------

# Human-readable joint triplets: (name, point_a, vertex, point_c)
# The angle is at the VERTEX keypoint.
JOINT_TRIPLETS = [
    ('left_elbow',    BodyPart.LEFT_SHOULDER,  BodyPart.LEFT_ELBOW,   BodyPart.LEFT_WRIST),
    ('right_elbow',   BodyPart.RIGHT_SHOULDER, BodyPart.RIGHT_ELBOW,  BodyPart.RIGHT_WRIST),
    ('left_shoulder', BodyPart.LEFT_ELBOW,     BodyPart.LEFT_SHOULDER, BodyPart.LEFT_HIP),
    ('right_shoulder',BodyPart.RIGHT_ELBOW,    BodyPart.RIGHT_SHOULDER,BodyPart.RIGHT_HIP),
    ('left_hip',      BodyPart.LEFT_SHOULDER,  BodyPart.LEFT_HIP,     BodyPart.LEFT_KNEE),
    ('right_hip',     BodyPart.RIGHT_SHOULDER, BodyPart.RIGHT_HIP,    BodyPart.RIGHT_KNEE),
    ('left_knee',     BodyPart.LEFT_HIP,       BodyPart.LEFT_KNEE,    BodyPart.LEFT_ANKLE),
    ('right_knee',    BodyPart.RIGHT_HIP,      BodyPart.RIGHT_KNEE,   BodyPart.RIGHT_ANKLE),
]

# Minimum confidence score required to compute an angle for a keypoint
_MIN_SCORE = 0.2

# Tolerance (degrees) — differences smaller than this are not reported
_FEEDBACK_THRESHOLD_DEG = 10.0


def _angle_between(ax, ay, bx, by, cx, cy) -> float:
    """Compute the angle at vertex B formed by rays BA and BC (in degrees)."""
    v1 = (ax - bx, ay - by)
    v2 = (cx - bx, cy - by)
    dot = v1[0] * v2[0] + v1[1] * v2[1]
    mag1 = math.hypot(*v1)
    mag2 = math.hypot(*v2)
    if mag1 == 0 or mag2 == 0:
        return 0.0
    cos_angle = max(-1.0, min(1.0, dot / (mag1 * mag2)))
    return math.degrees(math.acos(cos_angle))


def _kp_dict(keypoints: list[dict]) -> dict[str, dict]:
    """Build a lookup from body_part name → keypoint dict."""
    return {kp['body_part']: kp for kp in keypoints}


def get_angles(keypoints: list[dict]) -> dict[str, float]:
    """Compute all joint angles for a detected pose.

    Args:
        keypoints: list of 17 dicts with body_part, x, y, score.

    Returns:
        dict mapping joint name → angle in degrees.
        Joints with low-confidence keypoints are omitted.
    """
    lookup = _kp_dict(keypoints)
    angles: dict[str, float] = {}

    for name, bp_a, bp_v, bp_c in JOINT_TRIPLETS:
        kp_a = lookup.get(bp_a.name)
        kp_v = lookup.get(bp_v.name)
        kp_c = lookup.get(bp_c.name)

        if not (kp_a and kp_v and kp_c):
            continue
        if min(kp_a['score'], kp_v['score'], kp_c['score']) < _MIN_SCORE:
            continue

        angles[name] = _angle_between(
            kp_a['x'], kp_a['y'],
            kp_v['x'], kp_v['y'],
            kp_c['x'], kp_c['y'],
        )

    return angles


# ---------------------------------------------------------------------------
# Pose reference angles
# ---------------------------------------------------------------------------

_REFERENCE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', 'data', 'pose_references.json')
)

_references: dict | None = None


def _load_references() -> dict:
    global _references
    if _references is None:
        if os.path.exists(_REFERENCE_PATH):
            with open(_REFERENCE_PATH) as f:
                _references = json.load(f)
        else:
            _references = {}
    return _references


def get_reference_angles(pose_class: str) -> Optional[dict[str, float]]:
    """Return the ideal angle targets for a pose class, or None if unknown."""
    refs = _load_references()
    return refs.get(pose_class)


# ---------------------------------------------------------------------------
# Feedback generation
# ---------------------------------------------------------------------------

def compare_to_reference(
    live_angles: dict[str, float],
    pose_class: str,
) -> list[dict]:
    """Compare live angles to the reference and produce coaching feedback.

    Returns:
        List of feedback dicts, one per joint that needs correction.
        Each dict has: joint, current_angle, target_angle, delta, feedback.
    """
    ref_angles = get_reference_angles(pose_class)
    if not ref_angles:
        return []  # No reference available yet for this pose

    corrections = []
    for joint, target in ref_angles.items():
        current = live_angles.get(joint)
        if current is None:
            continue
        delta = target - current  # positive = need to increase angle
        if abs(delta) < _FEEDBACK_THRESHOLD_DEG:
            continue

        direction = 'more' if delta > 0 else 'less'
        joint_label = joint.replace('_', ' ')
        corrections.append({
            'joint': joint,
            'current_angle': round(current, 1),
            'target_angle': round(target, 1),
            'delta': round(delta, 1),
            'feedback': f'Adjust your {joint_label} by {abs(delta):.0f}° {direction}',
        })

    # Sort by magnitude of correction — biggest issues first
    corrections.sort(key=lambda c: abs(c['delta']), reverse=True)
    return corrections

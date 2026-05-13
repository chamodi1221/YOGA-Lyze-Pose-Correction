"""Pose inference schemas."""
from pydantic import BaseModel


class KeypointSchema(BaseModel):
    body_part: str
    x: float
    y: float
    score: float


class JointFeedback(BaseModel):
    joint: str
    current_angle: float
    target_angle: float
    delta: float          # positive = need to increase, negative = decrease
    feedback: str         # human-readable message


class PoseFrameResponse(BaseModel):
    keypoints: list[KeypointSchema]
    pose_class: str
    confidence: float
    angles: dict[str, float]
    feedback: list[JointFeedback]

"""Pose detection & classification API router.

Endpoints:
    POST /pose/classify      — single image upload, returns PoseFrameResponse
    WebSocket /pose/stream   — continuous webcam frame stream
"""

import json
import logging

from fastapi import APIRouter, File, HTTPException, UploadFile, WebSocket, WebSocketDisconnect

from app.schemas.pose import JointFeedback, KeypointSchema, PoseFrameResponse
from app.services import angle_service, classifier_service, pose_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix='/pose', tags=['pose'])


# ---------------------------------------------------------------------------
# Shared processing logic
# ---------------------------------------------------------------------------

def _process_frame(frame_bytes: bytes) -> PoseFrameResponse:
    """Run the full pipeline on raw frame bytes and return a PoseFrameResponse.

    Pipeline:
        1. MoveNet → 17 keypoints
        2. Keras classifier → pose class + confidence
        3. Angle calculator → joint angles
        4. Reference comparator → coaching feedback
    """
    # Step 1 — keypoint detection
    infer_result = pose_service.infer(frame_bytes)
    keypoints_raw = infer_result['keypoints']

    # Step 2 — pose classification
    # Only classify if a model is trained; gracefully degrade otherwise
    try:
        classification = classifier_service.classify(keypoints_raw)
        pose_class = classification['pose_class']
        confidence = classification['confidence']
    except FileNotFoundError:
        pose_class = 'unknown'
        confidence = 0.0

    # Step 3 — angles
    angles = angle_service.get_angles(keypoints_raw)

    # Step 4 — feedback
    feedback_raw = angle_service.compare_to_reference(angles, pose_class)

    return PoseFrameResponse(
        keypoints=[KeypointSchema(**kp) for kp in keypoints_raw],
        pose_class=pose_class,
        confidence=confidence,
        angles=angles,
        feedback=[JointFeedback(**fb) for fb in feedback_raw],
    )


# ---------------------------------------------------------------------------
# REST endpoint — single image
# ---------------------------------------------------------------------------

@router.post('/classify', response_model=PoseFrameResponse)
async def classify_pose(image: UploadFile = File(...)):
    """Upload a JPEG/PNG image and receive pose keypoints + coaching feedback."""
    if not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='File must be an image')

    frame_bytes = await image.read()
    try:
        return _process_frame(frame_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


# ---------------------------------------------------------------------------
# WebSocket endpoint — realtime stream
# ---------------------------------------------------------------------------

@router.websocket('/stream')
async def pose_stream(websocket: WebSocket):
    """WebSocket endpoint for realtime pose detection.

    Protocol:
        CLIENT → SERVER : raw JPEG bytes (one frame per message)
        SERVER → CLIENT : JSON-encoded PoseFrameResponse per frame

    The client should target 15-30 fps for a smooth experience.
    """
    await websocket.accept()
    logger.info('WebSocket connection opened')

    try:
        while True:
            frame_bytes = await websocket.receive_bytes()

            try:
                result = _process_frame(frame_bytes)
                await websocket.send_text(result.model_dump_json())
            except Exception as e:
                logger.warning(f'Frame processing error: {e}')
                await websocket.send_text(
                    json.dumps({'error': str(e)})
                )

    except WebSocketDisconnect:
        logger.info('WebSocket connection closed')

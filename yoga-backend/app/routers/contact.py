from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.core.security import get_current_user_dep
from app.database import get_db
from app.models.contact import ContactMessage
from app.models.user import User
from app.schemas.contact import AdminReplyUpdate, ContactCreate, ContactResponse
from app.schemas.token import TokenData

router = APIRouter(prefix="/contact", tags=["Contact"])
admin_router = APIRouter(prefix="/admin/contact", tags=["Admin Contact"])


def _get_db_user(token_data: TokenData, db: Session) -> User:
    user = db.query(User).filter(User.username == token_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )
    return user


def _require_admin(current_user: User):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )


@router.post("/messages", response_model=ContactResponse)
def create_contact_message(
    payload: ContactCreate,
    token_data: TokenData = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    try:
        current_user = _get_db_user(token_data, db)
        new_message = ContactMessage(
            user_id=current_user.id,
            name=payload.name.strip() if payload.name else current_user.username,
            email=current_user.email,
            message=payload.message,
            status="pending",
        )
        db.add(new_message)
        db.commit()
        db.refresh(new_message)
        return new_message
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save contact message.")


@router.get("/my-messages", response_model=list[ContactResponse])
def get_my_contact_messages(
    token_data: TokenData = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    current_user = _get_db_user(token_data, db)
    return (
        db.query(ContactMessage)
        .filter(
            or_(
                ContactMessage.user_id == current_user.id,
                and_(
                    ContactMessage.user_id.is_(None),
                    ContactMessage.email == current_user.email,
                ),
            )
        )
        .order_by(ContactMessage.created_at.desc())
        .all()
    )


@admin_router.get("/messages", response_model=list[ContactResponse])
def get_all_contact_messages(
    token_data: TokenData = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    current_user = _get_db_user(token_data, db)
    _require_admin(current_user)

    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()


@admin_router.put("/messages/{message_id}/reply", response_model=ContactResponse)
def reply_to_contact_message(
    message_id: int,
    payload: AdminReplyUpdate,
    token_data: TokenData = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    current_user = _get_db_user(token_data, db)
    _require_admin(current_user)

    contact_message = (
        db.query(ContactMessage)
        .filter(ContactMessage.id == message_id)
        .first()
    )
    if not contact_message:
        raise HTTPException(status_code=404, detail="Message not found")

    contact_message.admin_reply = payload.admin_reply
    contact_message.status = "replied"
    contact_message.replied_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(contact_message)

    return contact_message


@admin_router.delete("/messages/{message_id}")
def delete_contact_message(
    message_id: int,
    token_data: TokenData = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    current_user = _get_db_user(token_data, db)
    _require_admin(current_user)

    contact_message = (
        db.query(ContactMessage)
        .filter(ContactMessage.id == message_id)
        .first()
    )

    if not contact_message:
        raise HTTPException(status_code=404, detail="Message not found")

    db.delete(contact_message)
    db.commit()

    return {"message": "Contact message deleted successfully"}
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from pydantic import BaseModel, Field

from followread_api.api.dependencies import DatabaseSession
from followread_api.api.routes.authentication import _require_trusted_origin
from followread_api.services.password_reset import (
    MESSAGE,
    deliver_reset,
    mail_settings,
    notify_password_changed,
    reset_password,
)

router = APIRouter(prefix="/auth/password-reset", tags=["authentication"])


class ResetRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)


class ResetConfirmation(BaseModel):
    token: str = Field(min_length=40, max_length=128)
    password: str = Field(min_length=15, max_length=128)


@router.post("/request", status_code=202)
def request_reset(
    body: ResetRequest, request: Request, background: BackgroundTasks
) -> dict[str, str]:
    _require_trusted_origin(request)
    if mail_settings() is None:
        raise HTTPException(
            status_code=503,
            detail="Solicita un enlace de recuperación al responsable del servicio.",
        )
    background.add_task(deliver_reset, body.email)
    return {"message": MESSAGE}


@router.post("/confirm")
def confirm_reset(
    body: ResetConfirmation, request: Request, background: BackgroundTasks, session: DatabaseSession
) -> dict[str, str]:
    _require_trusted_origin(request)
    try:
        user_id = reset_password(session, body.token, body.password)
    except ValueError:
        raise HTTPException(
            status_code=400, detail="El enlace no es válido o ha caducado."
        ) from None
    background.add_task(notify_password_changed, user_id)
    return {"message": "Contraseña actualizada. Inicia sesión con tu nueva contraseña."}

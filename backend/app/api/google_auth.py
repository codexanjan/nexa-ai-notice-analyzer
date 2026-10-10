import secrets
from datetime import timedelta
from fastapi import APIRouter, HTTPException, Response
from starlette.concurrency import run_in_threadpool
from pydantic import BaseModel, Field
from google.oauth2 import id_token
from google.auth.transport.requests import Request
from app.core.config import settings
from app.core.database import db_manager
from app.core.security import create_access_token, decode_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

class GoogleLogin(BaseModel):
    credential: str = Field(min_length=1, max_length=10000)
    challenge: str = Field(min_length=1, max_length=2000)
    password: str = Field(default="", max_length=72)

@router.get("/google/config")
async def google_config(response: Response):
    response.headers["Cache-Control"] = "no-store"
    if not settings.GOOGLE_CLIENT_ID:
        return {"enabled": False, "client_id": None}
    nonce = secrets.token_urlsafe(32)
    challenge = create_access_token({"purpose": "google-login", "nonce": nonce}, timedelta(minutes=5))
    return {"enabled": True, "client_id": settings.GOOGLE_CLIENT_ID, "nonce": nonce, "challenge": challenge}

@router.post("/google")
async def google_login(data: GoogleLogin):
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(503, "Google sign-in is awaiting configuration. Use email sign-in for now.")
    challenge = decode_access_token(data.challenge)
    if not challenge or challenge.get("purpose") != "google-login":
        raise HTTPException(401, "Google sign-in expired. Refresh the page and retry.")
    try:
        claims = await run_in_threadpool(id_token.verify_oauth2_token, data.credential, Request(), settings.GOOGLE_CLIENT_ID)
    except ValueError:
        raise HTTPException(401, "Invalid Google credential")
    except Exception:
        raise HTTPException(503, "Google verification is temporarily unavailable. Please retry.")
    if not claims.get("sub") or claims.get("email_verified") is not True or not claims.get("email") or claims.get("nonce") != challenge.get("nonce"):
        raise HTTPException(401, "Google identity could not be verified")
    users = db_manager.get_collection("users")
    user = await users.find_one({"google_sub": claims["sub"]})
    if not user:
        user = await users.find_one({"email": claims["email"].lower()})
        if user:
            if user.get("google_sub") or not verify_password(data.password, user.get("password", "")):
                raise HTTPException(409, "Enter your existing NEXA password below, then try Google again to securely link this account.")
            await users.update_one({"_id": user["_id"]}, {"$set": {"google_sub": claims["sub"]}})
        else:
            user = await users.insert_one({"name": str(claims.get("name") or claims["email"].split("@")[0])[:100], "email": claims["email"].lower(), "google_sub": claims["sub"], "role": "STUDENT", "student_id": None})
    return {"access_token": create_access_token({"sub": user["_id"], "role": user["role"]}), "token_type": "bearer", "user": {"id": user["_id"], "name": user["name"], "email": user["email"], "role": user["role"], "student_id": user.get("student_id"), "created_at": user.get("created_at")}}

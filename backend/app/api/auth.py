from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import Optional
from app.core.database import db_manager
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

async def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    user_id = payload["sub"]
    users_col = db_manager.get_collection("users")
    user = await users_col.find_one({"_id": user_id})
    return user

async def require_user(authorization: Optional[str] = Header(None)) -> dict:
    user = await get_current_user(authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided or invalid"
        )
    return user

async def require_admin(authorization: Optional[str] = Header(None)) -> dict:
    user = await require_user(authorization)
    if user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    if user.get("email") == "admin@nexa.edu" and db_manager.is_durable:
        raise HTTPException(status_code=403, detail="The public admin demo is read-only. Sign in with your institution admin account to publish changes.")
    return user

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    if user_data.role.value != "STUDENT":
        raise HTTPException(status_code=403, detail="Staff accounts must be provisioned by the institution administrator")
    users_col = db_manager.get_collection("users")
    existing = await users_col.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )

    hashed_pw = get_password_hash(user_data.password)
    user_doc = {
        "name": user_data.name,
        "email": user_data.email.lower(),
        "password": hashed_pw,
        "student_id": user_data.student_id,
        "role": user_data.role.value
    }
    created = await users_col.insert_one(user_doc)
    
    token = create_access_token({"sub": created["_id"], "role": created["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": created["_id"],
            "name": created["name"],
            "email": created["email"],
            "student_id": created.get("student_id"),
            "role": created["role"],
            "created_at": created.get("created_at")
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    users_col = db_manager.get_collection("users")
    user = await users_col.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({"sub": user["_id"], "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["_id"],
            "name": user["name"],
            "email": user["email"],
            "student_id": user.get("student_id"),
            "role": user["role"],
            "created_at": user.get("created_at")
        }
    }

@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(require_user)):
    return {
        "id": user["_id"],
        "name": user["name"],
        "email": user["email"],
        "student_id": user.get("student_id"),
        "role": user["role"],
        "created_at": user.get("created_at")
    }

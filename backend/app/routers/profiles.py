from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, Response
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import ProfileRead, ProfileWrite

router = APIRouter(prefix="/api/profiles", tags=["Профили"])
Db = Annotated[Session, Depends(get_db)]
ProfileId = Annotated[int, Path(gt=0, le=2147483647)]


@router.get("", response_model=list[ProfileRead])
def list_profiles(
    db: Db,
    offset: int = Query(0, ge=0, le=2147483647),
    limit: int = Query(100, ge=1, le=100),
):
    return crud.list_profiles(db, offset, limit)


@router.post("", response_model=ProfileRead, status_code=201)
def create_profile(data: ProfileWrite, db: Db):
    return crud.create_profile(db, data)


@router.get("/{profile_id}", response_model=ProfileRead)
def get_profile(profile_id: ProfileId, db: Db):
    return crud.get_profile(db, profile_id)


@router.put("/{profile_id}", response_model=ProfileRead)
def update_profile(profile_id: ProfileId, data: ProfileWrite, db: Db):
    return crud.update_profile(db, profile_id, data)


@router.delete("/{profile_id}", status_code=204)
def delete_profile(profile_id: ProfileId, db: Db):
    crud.delete_profile(db, profile_id)
    return Response(status_code=204)

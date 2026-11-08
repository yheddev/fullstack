from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, Response
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import MeasurementRead, MeasurementType, MeasurementWrite

router = APIRouter(prefix="/api/measurements", tags=["Измерения"])
Db = Annotated[Session, Depends(get_db)]
MeasurementId = Annotated[int, Path(gt=0, le=2147483647)]


@router.get("", response_model=list[MeasurementRead])
def list_measurements(
    db: Db,
    profile_id: int | None = Query(None, gt=0, le=2147483647),
    type: MeasurementType | None = None,
    offset: int = Query(0, ge=0, le=2147483647),
    limit: int = Query(100, ge=1, le=100),
):
    return crud.list_measurements(db, profile_id, type, offset, limit)


@router.post("", response_model=MeasurementRead, status_code=201)
def create_measurement(data: MeasurementWrite, db: Db):
    return crud.create_measurement(db, data)


@router.get("/{measurement_id}", response_model=MeasurementRead)
def get_measurement(measurement_id: MeasurementId, db: Db):
    return crud.get_measurement(db, measurement_id)


@router.put("/{measurement_id}", response_model=MeasurementRead)
def update_measurement(measurement_id: MeasurementId, data: MeasurementWrite, db: Db):
    return crud.update_measurement(db, measurement_id, data)


@router.delete("/{measurement_id}", status_code=204)
def delete_measurement(measurement_id: MeasurementId, db: Db):
    crud.delete_measurement(db, measurement_id)
    return Response(status_code=204)

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Measurement, Profile
from app.schemas import MeasurementWrite, ProfileWrite


def save_changes(db: Session):
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Операция нарушает связи или ограничения данных. "
            "Перед удалением профиля удалите его измерения.",
        ) from None


def get_profile(db: Session, profile_id: int):
    profile = db.get(Profile, profile_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Профиль не найден")
    return profile


def list_profiles(db: Session, offset: int, limit: int):
    return db.scalars(select(Profile).order_by(Profile.id).offset(offset).limit(limit)).all()


def create_profile(db: Session, data: ProfileWrite):
    profile = Profile(name=data.name)
    db.add(profile)
    save_changes(db)
    db.refresh(profile)
    return profile


def update_profile(db: Session, profile_id: int, data: ProfileWrite):
    profile = get_profile(db, profile_id)
    profile.name = data.name
    save_changes(db)
    db.refresh(profile)
    return profile


def delete_profile(db: Session, profile_id: int):
    profile = get_profile(db, profile_id)
    db.delete(profile)
    save_changes(db)


def get_measurement(db: Session, measurement_id: int):
    measurement = db.get(Measurement, measurement_id)
    if measurement is None:
        raise HTTPException(status_code=404, detail="Измерение не найдено")
    return measurement


def list_measurements(db: Session, profile_id, measurement_type, offset: int, limit: int):
    query = select(Measurement)
    if profile_id is not None:
        get_profile(db, profile_id)
        query = query.where(Measurement.profile_id == profile_id)
    if measurement_type is not None:
        query = query.where(Measurement.type == measurement_type)
    query = query.order_by(Measurement.measured_at.desc(), Measurement.id.desc())
    return db.scalars(query.offset(offset).limit(limit)).all()


def create_measurement(db: Session, data: MeasurementWrite):
    get_profile(db, data.profile_id)
    measurement = Measurement(**data.model_dump())
    db.add(measurement)
    save_changes(db)
    db.refresh(measurement)
    return measurement


def update_measurement(db: Session, measurement_id: int, data: MeasurementWrite):
    measurement = get_measurement(db, measurement_id)
    get_profile(db, data.profile_id)
    # PUT полностью заменяет поля, в том числе очищает старые поля давления.
    for field, value in data.model_dump().items():
        setattr(measurement, field, value)
    save_changes(db)
    db.refresh(measurement)
    return measurement


def delete_measurement(db: Session, measurement_id: int):
    measurement = get_measurement(db, measurement_id)
    db.delete(measurement)
    save_changes(db)

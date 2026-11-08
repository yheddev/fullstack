from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Profile(Base):
    __tablename__ = "profiles"
    __table_args__ = (
        CheckConstraint("length(trim(name)) > 0", name="profile_name_not_empty"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    measurements: Mapped[list["Measurement"]] = relationship(
        back_populates="profile", passive_deletes="all"
    )


class Measurement(Base):
    __tablename__ = "measurements"
    __table_args__ = (
        CheckConstraint(
            "type IN ('pulse', 'pressure', 'temperature', 'sugar', 'weight')",
            name="measurement_type_valid",
        ),
        # Давление состоит из двух чисел, остальные показатели — из одного.
        CheckConstraint(
            "(type = 'pressure' AND value IS NULL "
            "AND systolic IS NOT NULL AND diastolic IS NOT NULL) OR "
            "(type <> 'pressure' AND value IS NOT NULL "
            "AND systolic IS NULL AND diastolic IS NULL)",
            name="measurement_fields_match_type",
        ),
        CheckConstraint(
            "value > 0 AND value < 'Infinity'::float8",
            name="measurement_value_positive_finite",
        ),
        CheckConstraint("systolic > 0 AND diastolic > 0", name="pressure_positive"),
        CheckConstraint(
            "type <> 'pulse' OR value = floor(value)", name="pulse_integer"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("profiles.id", ondelete="RESTRICT"), index=True
    )
    type: Mapped[str] = mapped_column(String(20))
    value: Mapped[float | None] = mapped_column(Float)
    systolic: Mapped[int | None] = mapped_column(Integer)
    diastolic: Mapped[int | None] = mapped_column(Integer)
    measured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    note: Mapped[str] = mapped_column(String(500), default="")
    profile: Mapped[Profile] = relationship(back_populates="measurements")

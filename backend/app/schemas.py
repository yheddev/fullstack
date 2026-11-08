from datetime import datetime
from typing import Literal

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, model_validator


MeasurementType = Literal["pulse", "pressure", "temperature", "sugar", "weight"]


class ProfileWrite(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=100, pattern=r"^[^\x00]*$")


class ProfileRead(ProfileWrite):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class MeasurementWrite(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    profile_id: int = Field(gt=0, le=2147483647, strict=True)
    type: MeasurementType
    measured_at: AwareDatetime
    value: float | None = Field(default=None, gt=0, allow_inf_nan=False, strict=True)
    systolic: int | None = Field(default=None, gt=0, le=2147483647, strict=True)
    diastolic: int | None = Field(default=None, gt=0, le=2147483647, strict=True)
    note: str = Field(default="", max_length=500, pattern=r"^[^\x00]*$")

    @model_validator(mode="after")
    def check_values(self):
        if self.type == "pressure":
            if self.systolic is None or self.diastolic is None:
                raise ValueError("Для давления укажите systolic и diastolic")
            if self.value is not None:
                raise ValueError("Для давления поле value должно отсутствовать или быть null")
        else:
            if self.value is None:
                raise ValueError("Для этого показателя укажите value")
            if self.systolic is not None or self.diastolic is not None:
                raise ValueError("Поля systolic и diastolic нужны только для давления")
            if self.type == "pulse" and not self.value.is_integer():
                raise ValueError("Пульс должен быть целым положительным числом")
        return self


class MeasurementRead(MeasurementWrite):
    model_config = ConfigDict(from_attributes=True)

    id: int

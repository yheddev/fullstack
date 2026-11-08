from app.database import Base, engine
from app import models  # noqa: F401 — импорт регистрирует таблицы в Base.metadata


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Таблицы profiles и measurements созданы (существующие данные сохранены).")

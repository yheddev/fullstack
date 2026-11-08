import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete
from sqlalchemy.engine import make_url

# Тесты очищают только отдельную БД с суффиксом _test.
test_url = os.environ.get("TEST_DATABASE_URL")
if not test_url:
    raise RuntimeError("Укажите TEST_DATABASE_URL для отдельной PostgreSQL БД *_test")
url = make_url(test_url)
if url.drivername != "postgresql+psycopg" or not (url.database or "").endswith("_test"):
    raise RuntimeError("Тестам нужна PostgreSQL БД с именем, оканчивающимся на _test")
os.environ["DATABASE_URL"] = test_url

from app.database import Base, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Measurement, Profile  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def tables():
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture
def client():
    with SessionLocal() as db:
        db.execute(delete(Measurement))
        db.execute(delete(Profile))
        db.commit()
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def profile_id(client):
    response = client.post("/api/profiles", json={"name": "Демо-профиль"})
    assert response.status_code == 201
    return response.json()["id"]

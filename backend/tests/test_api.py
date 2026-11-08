import pytest
from sqlalchemy.exc import IntegrityError

from app.database import SessionLocal
from app.models import Measurement, Profile


def pulse(owner_id, **changes):
    data = {
        "profile_id": owner_id,
        "type": "pulse",
        "value": 72,
        "measured_at": "2026-11-08T09:00:00+03:00",
        "note": "После отдыха",
    }
    data.update(changes)
    return data


def test_profile_crud(client):
    response = client.post("/api/profiles", json={"name": "  Учебный профиль  "})
    assert response.status_code == 201
    profile = response.json()
    profile_id = profile["id"]
    assert profile["name"] == "Учебный профиль"
    assert profile["created_at"]
    assert client.get(f"/api/profiles/{profile_id}").json() == profile
    assert client.get("/api/profiles").json() == [profile]
    response = client.put(f"/api/profiles/{profile_id}", json={"name": "Новое имя"})
    assert response.status_code == 200
    assert response.json()["name"] == "Новое имя"
    with SessionLocal() as db:
        assert db.get(Profile, profile_id).name == "Новое имя"
    response = client.delete(f"/api/profiles/{profile_id}")
    assert response.status_code == 204 and response.content == b""
    assert client.get(f"/api/profiles/{profile_id}").status_code == 404


@pytest.mark.parametrize("kind,values", [
    ("pulse", {"value": 72}),
    ("pressure", {"value": None, "systolic": 120, "diastolic": 80}),
    ("temperature", {"value": 36.6}),
    ("sugar", {"value": 5.1}),
    ("weight", {"value": 68.4}),
])
def test_measurement_crud_and_storage(client, profile_id, kind, values):
    data = pulse(profile_id, type=kind, **values)
    response = client.post("/api/measurements", json=data)
    assert response.status_code == 201
    measurement = response.json()
    measurement_id = measurement["id"]
    assert measurement["type"] == kind
    assert client.get(f"/api/measurements/{measurement_id}").json() == measurement
    assert client.get("/api/measurements").json() == [measurement]
    # Отдельная SQLAlchemy-сессия видит результат завершённого HTTP-запроса.
    with SessionLocal() as db:
        saved = db.get(Measurement, measurement_id)
        assert saved.profile_id == profile_id
        assert saved.note == data["note"]
        assert saved.measured_at.hour == 6  # 09:00+03:00 = 06:00 UTC
        for field, value in values.items():
            assert getattr(saved, field) == value
    data["note"] = "Исправлено"
    response = client.put(f"/api/measurements/{measurement_id}", json=data)
    assert response.status_code == 200
    assert response.json()["note"] == "Исправлено"
    response = client.delete(f"/api/measurements/{measurement_id}")
    assert response.status_code == 204 and response.content == b""
    assert client.get(f"/api/measurements/{measurement_id}").status_code == 404
    with SessionLocal() as db:
        assert db.get(Measurement, measurement_id) is None


def test_change_type_and_profile(client, profile_id):
    created = client.post("/api/measurements", json=pulse(profile_id)).json()
    second = client.post("/api/profiles", json={"name": "Второй"}).json()["id"]
    data = pulse(second, type="pressure", value=None, systolic=120, diastolic=80)
    response = client.put(f"/api/measurements/{created['id']}", json=data)
    assert response.status_code == 200
    assert response.json()["value"] is None
    assert response.json()["profile_id"] == second
    response = client.put(f"/api/measurements/{created['id']}", json=pulse(second))
    assert response.status_code == 200
    assert response.json()["systolic"] is None
    assert response.json()["diastolic"] is None
    assert client.get("/api/measurements", params={"profile_id": profile_id}).json() == []
    assert client.delete(f"/api/profiles/{profile_id}").status_code == 204


def test_restrict_profile_deletion_and_recover(client, profile_id):
    measurement = client.post("/api/measurements", json=pulse(profile_id)).json()
    response = client.delete(f"/api/profiles/{profile_id}")
    assert response.status_code == 409
    assert "удалите его измерения" in response.json()["detail"]
    assert client.get(f"/api/profiles/{profile_id}").status_code == 200
    assert client.get(f"/api/measurements/{measurement['id']}").status_code == 200
    client.delete(f"/api/measurements/{measurement['id']}")
    assert client.delete(f"/api/profiles/{profile_id}").status_code == 204


def test_filters_sorting_and_pagination(client, profile_id):
    second = client.post("/api/profiles", json={"name": "Второй"}).json()["id"]
    older = client.post("/api/measurements", json=pulse(profile_id)).json()
    newer = client.post("/api/measurements", json=pulse(
        profile_id, type="weight", value=68.4, measured_at="2026-11-08T10:00:00+03:00"
    )).json()
    other = client.post("/api/measurements", json=pulse(second)).json()
    records = client.get("/api/measurements").json()
    assert [item["id"] for item in records] == [newer["id"], other["id"], older["id"]]
    assert client.get("/api/measurements", params={
        "profile_id": profile_id, "type": "pulse"
    }).json() == [older]
    assert client.get("/api/measurements", params={"limit": 1, "offset": 1}).json() == [other]
    assert client.get("/api/profiles", params={"limit": 1, "offset": 1}).json()[0]["id"] == second
    assert client.get("/api/measurements", params={"type": "sugar"}).json() == []


@pytest.mark.parametrize("changes", [
    {"value": 0}, {"value": -1}, {"value": 72.5}, {"value": None},
    {"value": "72"}, {"value": True}, {"type": "unknown"},
    {"systolic": 120}, {"type": "pressure"},
    {"type": "pressure", "value": None, "systolic": 120},
    {"type": "pressure", "value": None, "systolic": 120, "diastolic": 0},
    {"type": "pressure", "value": None, "systolic": 120.5, "diastolic": 80},
    {"type": "pressure", "value": None, "systolic": 2147483648, "diastolic": 80},
    {"type": "pressure", "systolic": 120, "diastolic": 80},
    {"profile_id": -1}, {"profile_id": True}, {"profile_id": 2147483648},
    {"measured_at": "2026-02-30T09:00:00Z"},
    {"measured_at": "2026-11-08T09:00:00"},
    {"note": "x" * 501}, {"note": "text\x00"}, {"unexpected": "field"},
])
def test_invalid_measurement(client, profile_id, changes):
    response = client.post("/api/measurements", json=pulse(profile_id, **changes))
    assert response.status_code == 422
    assert response.json()["errors"]
    assert client.get("/api/measurements").json() == []


@pytest.mark.parametrize("value", ["NaN", "Infinity", "-Infinity"])
def test_non_finite_number(client, profile_id, value):
    body = ('{"profile_id": %d, "type": "weight", "value": %s, '
            '"measured_at": "2026-11-08T09:00:00Z"}') % (profile_id, value)
    response = client.post("/api/measurements", content=body, headers={"Content-Type": "application/json"})
    assert response.status_code == 422
    assert response.json()["errors"]


@pytest.mark.parametrize("data", [
    {"name": " "}, {"name": "x" * 101}, {"name": "text\x00"}, {}, {"name": "A", "extra": 1},
])
def test_invalid_profile(client, data):
    assert client.post("/api/profiles", json=data).status_code == 422


def test_missing_records_and_failed_update(client, profile_id):
    for resource in ["profiles", "measurements"]:
        url = f"/api/{resource}/2147483647"
        assert client.get(url).status_code == 404
        assert client.delete(url).status_code == 404
        body = {"name": "Имя"} if resource == "profiles" else pulse(profile_id)
        assert client.put(url, json=body).status_code == 404
    assert client.post("/api/measurements", json=pulse(2147483647)).status_code == 404
    assert client.get("/api/measurements?profile_id=2147483647").status_code == 404
    created = client.post("/api/measurements", json=pulse(profile_id)).json()
    url = f"/api/measurements/{created['id']}"
    assert client.put(url, json=pulse(2147483647)).status_code == 404
    assert client.put(url, json=pulse(profile_id, value=-1)).status_code == 422
    assert client.get(url).json() == created


@pytest.mark.parametrize("url", [
    "/api/profiles/0", "/api/measurements/abc", "/api/measurements/2147483648",
    "/api/measurements?type=unknown", "/api/measurements?limit=101",
    "/api/measurements?limit=0", "/api/profiles?offset=-1",
    "/api/profiles?offset=9223372036854775808",
    "/api/measurements?offset=9223372036854775808",
])
def test_invalid_path_and_query(client, url):
    assert client.get(url).status_code == 422


def test_database_constraints(client, profile_id):
    # Обходим Pydantic: сама PostgreSQL тоже должна защищать данные.
    from datetime import datetime, timezone
    valid = dict(profile_id=profile_id, type="pulse", value=72,
                 measured_at=datetime.now(timezone.utc), note="")
    for changes in [
        {"profile_id": 2147483647}, {"type": "unknown"}, {"value": -1},
        {"value": float("nan")}, {"value": float("inf")}, {"value": 72.5},
        {"type": "pressure"}, {"systolic": 120},
    ]:
        with SessionLocal() as db:
            db.add(Measurement(**(valid | changes)))
            with pytest.raises(IntegrityError):
                db.commit()
            db.rollback()

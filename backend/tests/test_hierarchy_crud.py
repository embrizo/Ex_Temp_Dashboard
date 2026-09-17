import uuid
from datetime import datetime, timezone

from app.models.reading import Reading

MISSING_ID = "00000000-0000-0000-0000-000000000000"


def test_full_hierarchy_crud_and_cascade_delete(client, db_session):
    r = client.post("/customers", json={"name": "LG"})
    assert r.status_code == 201, r.text
    customer_id = r.json()["id"]

    r = client.get("/customers")
    assert r.status_code == 200
    assert any(c["id"] == customer_id for c in r.json())

    r = client.patch(f"/customers/{customer_id}", json={"name": "LG Electronics"})
    assert r.status_code == 200
    assert r.json()["name"] == "LG Electronics"

    r = client.post(
        f"/customers/{customer_id}/factories",
        json={"name": "Rayong Plant", "location": "Thailand"},
    )
    assert r.status_code == 201, r.text
    factory = r.json()
    factory_id = factory["id"]
    assert factory["customer_id"] == customer_id

    r = client.get(f"/customers/{customer_id}/factories")
    assert r.status_code == 200
    assert len(r.json()) == 1

    r = client.post(f"/factories/{factory_id}/lines", json={"name": "Line 1"})
    assert r.status_code == 201, r.text
    line_id = r.json()["id"]

    r = client.post(
        f"/lines/{line_id}/machines",
        json={"name": "Air Washer 3", "type": "air_washer"},
    )
    assert r.status_code == 201, r.text
    machine_id = r.json()["id"]

    r = client.post(
        f"/machines/{machine_id}/sensors",
        json={"name": "Temp Sensor", "high_threshold": 80, "low_threshold": 15},
    )
    assert r.status_code == 201, r.text
    sensor = r.json()
    sensor_id = sensor["id"]
    assert sensor["metric"] == "temperature"
    assert sensor["unit"] == "°C"

    # No ingest endpoint yet (Phase 5) - insert a reading directly to test the query endpoint.
    # id is set explicitly because SQLite (used only here, in tests) only auto-increments a
    # bare INTEGER PRIMARY KEY, not BIGINT; Postgres's BIGSERIAL has no such restriction.
    reading = Reading(
        id=1,
        sensor_id=uuid.UUID(sensor_id),
        ts=datetime.now(timezone.utc),
        value=42.5,
        status="NORMAL",
    )
    db_session.add(reading)
    db_session.commit()

    r = client.get(f"/sensors/{sensor_id}/readings")
    assert r.status_code == 200
    readings = r.json()
    assert len(readings) == 1
    assert readings[0]["value"] == 42.5

    # Deleting the customer must cascade all the way down.
    r = client.delete(f"/customers/{customer_id}")
    assert r.status_code == 204

    assert client.get(f"/customers/{customer_id}").status_code == 404
    assert client.get(f"/factories/{factory_id}").status_code == 404
    assert client.get(f"/lines/{line_id}").status_code == 404
    assert client.get(f"/machines/{machine_id}").status_code == 404
    assert client.get(f"/sensors/{sensor_id}").status_code == 404
    assert client.get(f"/sensors/{sensor_id}/readings").status_code == 404


def test_404_on_missing_parent(client):
    assert client.get(f"/customers/{MISSING_ID}").status_code == 404

    r = client.post(f"/customers/{MISSING_ID}/factories", json={"name": "ghost"})
    assert r.status_code == 404

    r = client.post(f"/factories/{MISSING_ID}/lines", json={"name": "ghost"})
    assert r.status_code == 404

    r = client.post(f"/lines/{MISSING_ID}/machines", json={"name": "ghost"})
    assert r.status_code == 404

    r = client.post(f"/machines/{MISSING_ID}/sensors", json={"name": "ghost"})
    assert r.status_code == 404

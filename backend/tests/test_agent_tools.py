import json
import uuid
from datetime import datetime, timezone

from app.agent.tools import build_tools
from app.models.customer import Customer
from app.models.factory import Factory
from app.models.machine import Machine
from app.models.production_line import ProductionLine
from app.models.reading import Reading
from app.models.sensor import Sensor


def _seed_hierarchy(db_session):
    customer = Customer(name="LG")
    db_session.add(customer)
    db_session.flush()

    factory = Factory(customer_id=customer.id, name="Rayong Plant", location="Thailand")
    db_session.add(factory)
    db_session.flush()

    line = ProductionLine(factory_id=factory.id, name="Line 1")
    db_session.add(line)
    db_session.flush()

    machine = Machine(line_id=line.id, name="Air Washer 3", type="air_washer")
    db_session.add(machine)
    db_session.flush()

    sensor = Sensor(machine_id=machine.id, name="Temp Sensor", high_threshold=80, low_threshold=15)
    db_session.add(sensor)
    db_session.flush()

    readings = [
        Reading(id=1, sensor_id=sensor.id, ts=datetime(2026, 6, 1, 8, 0, tzinfo=timezone.utc), value=24.5, status="NORMAL"),
        Reading(id=2, sensor_id=sensor.id, ts=datetime(2026, 6, 1, 8, 1, tzinfo=timezone.utc), value=90.0, status="HIGH"),
        Reading(id=3, sensor_id=sensor.id, ts=datetime(2026, 6, 1, 8, 2, tzinfo=timezone.utc), value=5.0, status="LOW"),
    ]
    db_session.add_all(readings)
    db_session.commit()

    return sensor


def _tool_by_name(tools, name):
    return next(t for t in tools if t.name == name)


def test_list_customers(db_session):
    _seed_hierarchy(db_session)
    tools = build_tools(db_session)
    result = json.loads(_tool_by_name(tools, "list_customers").invoke({}))
    assert len(result) == 1
    assert result[0]["name"] == "LG"


def test_find_sensor_matches_and_path(db_session):
    sensor = _seed_hierarchy(db_session)
    tools = build_tools(db_session)
    result = json.loads(_tool_by_name(tools, "find_sensor").invoke({"query": "temp"}))
    assert len(result["matches"]) == 1
    match = result["matches"][0]
    assert match["sensor_id"] == str(sensor.id)
    assert match["machine"] == "Air Washer 3"
    assert match["line"] == "Line 1"
    assert match["factory"] == "Rayong Plant"
    assert match["customer"] == "LG"


def test_find_sensor_no_match(db_session):
    _seed_hierarchy(db_session)
    tools = build_tools(db_session)
    result = json.loads(_tool_by_name(tools, "find_sensor").invoke({"query": "nonexistent"}))
    assert result["matches"] == []


def test_get_sensor_stats(db_session):
    sensor = _seed_hierarchy(db_session)
    tools = build_tools(db_session)
    result = json.loads(
        _tool_by_name(tools, "get_sensor_stats").invoke({"sensor_id": str(sensor.id)})
    )
    assert result["count"] == 3
    assert result["high_count"] == 1
    assert result["low_count"] == 1
    assert result["normal_count"] == 1
    assert result["max"] == 90.0
    assert result["min"] == 5.0


def test_get_sensor_stats_invalid_id(db_session):
    tools = build_tools(db_session)
    result = json.loads(_tool_by_name(tools, "get_sensor_stats").invoke({"sensor_id": "not-a-uuid"}))
    assert "error" in result


def test_get_sensor_stats_missing_sensor(db_session):
    tools = build_tools(db_session)
    result = json.loads(
        _tool_by_name(tools, "get_sensor_stats").invoke({"sensor_id": str(uuid.uuid4())})
    )
    assert "error" in result


def test_list_alerts(db_session):
    sensor = _seed_hierarchy(db_session)
    tools = build_tools(db_session)
    result = json.loads(_tool_by_name(tools, "list_alerts").invoke({"sensor_id": str(sensor.id)}))
    assert result["alert_count"] == 2
    statuses = {a["status"] for a in result["alerts"]}
    assert statuses == {"HIGH", "LOW"}


def test_assistant_endpoint_503_when_unconfigured(client):
    # No ANTHROPIC_API_KEY is set in the test environment - this must fail
    # gracefully with a clear 503, not crash or hang trying to reach the API.
    r = client.post("/assistant", json={"question": "how is everything?"})
    assert r.status_code == 503
    assert "not configured" in r.json()["detail"]

import io


def _create_sensor(client, high=80, low=15, metric="temperature"):
    customer_id = client.post("/customers", json={"name": "LG"}).json()["id"]
    factory_id = client.post(f"/customers/{customer_id}/factories", json={"name": "Rayong"}).json()["id"]
    line_id = client.post(f"/factories/{factory_id}/lines", json={"name": "Line 1"}).json()["id"]
    machine_id = client.post(f"/lines/{line_id}/machines", json={"name": "Air Washer 3"}).json()["id"]
    sensor = client.post(
        f"/machines/{machine_id}/sensors",
        json={"name": "Temp Sensor", "metric": metric, "high_threshold": high, "low_threshold": low},
    ).json()
    return sensor["id"]


def _upload(client, sensor_id, csv_text, filename="data.csv"):
    return client.post(
        f"/sensors/{sensor_id}/upload",
        files={"file": (filename, io.BytesIO(csv_text.encode("utf-8")), "text/csv")},
    )


def test_upload_with_status_column(client):
    sensor_id = _create_sensor(client)
    csv_text = (
        '"TimeStamp","Temperature","High","Low","Status"\n'
        '2026-06-01 12:42:00,24.46,80.0,15.0,="NORMAL"\n'
        '2026-06-01 12:43:00,81.0,80.0,15.0,="HIGH"\n'
        '2026-06-01 12:44:00,14.0,80.0,15.0,="LOW"\n'
    )

    r = _upload(client, sensor_id, csv_text)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["row_count"] == 3
    assert body["skipped_count"] == 0
    assert body["sensor_id"] == sensor_id

    readings = client.get(f"/sensors/{sensor_id}/readings").json()
    assert len(readings) == 3
    assert [row["status"] for row in readings] == ["NORMAL", "HIGH", "LOW"]
    assert readings[0]["value"] == 24.46


def test_upload_without_status_column_uses_sensor_thresholds(client):
    sensor_id = _create_sensor(client, high=80, low=15)
    csv_text = "TimeStamp,Temperature\n" "2026-06-01 08:00:00,24.5\n" "2026-06-01 08:01:00,90.0\n" "2026-06-01 08:02:00,5.0\n"

    r = _upload(client, sensor_id, csv_text)
    assert r.status_code == 201, r.text

    readings = client.get(f"/sensors/{sensor_id}/readings").json()
    statuses = {row["value"]: row["status"] for row in readings}
    assert statuses[24.5] == "NORMAL"
    assert statuses[90.0] == "HIGH"
    assert statuses[5.0] == "LOW"


def test_upload_matches_value_column_by_sensor_metric(client):
    sensor_id = _create_sensor(client, high=1000, low=500, metric="airflow")
    csv_text = "TimeStamp,AirFlow\n2026-06-01 12:42:00,850.5\n2026-06-01 12:43:00,1200.0\n"

    r = _upload(client, sensor_id, csv_text)
    assert r.status_code == 201, r.text
    assert r.json()["row_count"] == 2

    readings = client.get(f"/sensors/{sensor_id}/readings").json()
    assert len(readings) == 2
    assert any(row["status"] == "HIGH" for row in readings)


def test_upload_skips_unparseable_rows(client):
    sensor_id = _create_sensor(client)
    csv_text = (
        "TimeStamp,Temperature\n"
        "2026-06-01 08:00:00,24.5\n"
        "not-a-timestamp,25.0\n"
        "2026-06-01 08:02:00,not-a-number\n"
    )

    r = _upload(client, sensor_id, csv_text)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["row_count"] == 1
    assert body["skipped_count"] == 2


def test_upload_missing_timestamp_column_400(client):
    sensor_id = _create_sensor(client)
    r = _upload(client, sensor_id, "Temperature\n24.5\n")
    assert r.status_code == 400
    assert "TimeStamp" in r.json()["detail"]


def test_upload_missing_value_column_400(client):
    sensor_id = _create_sensor(client)
    r = _upload(client, sensor_id, "TimeStamp\n2026-06-01 08:00:00\n")
    assert r.status_code == 400
    assert "data column" in r.json()["detail"]


def test_upload_to_missing_sensor_404(client):
    r = _upload(client, "00000000-0000-0000-0000-000000000000", "TimeStamp,Temperature\n2026-06-01 08:00:00,24.5\n")
    assert r.status_code == 404

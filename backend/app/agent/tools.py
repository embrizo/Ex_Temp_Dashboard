import json
import statistics
import uuid
from datetime import timedelta

from langchain_core.tools import tool
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.factory import Factory
from app.models.machine import Machine
from app.models.production_line import ProductionLine
from app.models.reading import Reading
from app.models.sensor import Sensor


def _sensor_path(db: Session, sensor: Sensor) -> dict:
    machine = db.get(Machine, sensor.machine_id)
    line = db.get(ProductionLine, machine.line_id) if machine else None
    factory = db.get(Factory, line.factory_id) if line else None
    customer = db.get(Customer, factory.customer_id) if factory else None
    return {
        "sensor_id": str(sensor.id),
        "sensor_name": sensor.name,
        "metric": sensor.metric,
        "unit": sensor.unit,
        "high_threshold": float(sensor.high_threshold) if sensor.high_threshold is not None else None,
        "low_threshold": float(sensor.low_threshold) if sensor.low_threshold is not None else None,
        "machine": machine.name if machine else None,
        "line": line.name if line else None,
        "factory": factory.name if factory else None,
        "customer": customer.name if customer else None,
    }


def build_tools(db: Session) -> list:
    """Read-only tools bound to a single request's DB session. The agent
    never writes to the database - it can only look things up."""

    @tool
    def list_customers() -> str:
        """List every customer in the system, with their id and name."""
        customers = db.query(Customer).order_by(Customer.name).all()
        return json.dumps([{"id": str(c.id), "name": c.name} for c in customers])

    @tool
    def find_sensor(query: str) -> str:
        """Search for a sensor by name (case-insensitive, partial match).
        Returns each match's sensor_id and its full location (customer,
        factory, line, machine). Call this first to resolve a sensor_id
        before calling get_sensor_stats or list_alerts."""
        like = f"%{query.strip().lower()}%"
        sensors = db.query(Sensor).filter(Sensor.name.ilike(like)).limit(10).all()
        if not sensors:
            return json.dumps({"matches": [], "message": "No sensor matched that name."})
        return json.dumps({"matches": [_sensor_path(db, s) for s in sensors]})

    @tool
    def get_sensor_stats(sensor_id: str, hours: int | None = None) -> str:
        """Get summary statistics (count, avg, min, max, std dev, alert
        counts, latest reading) for a sensor. `sensor_id` must be a UUID
        from find_sensor. If `hours` is given, only readings within that
        many hours of the sensor's most recent reading are included;
        otherwise all of its readings are used."""
        try:
            sid = uuid.UUID(sensor_id)
        except ValueError:
            return json.dumps({"error": "sensor_id must be a UUID - call find_sensor first"})

        sensor = db.get(Sensor, sid)
        if sensor is None:
            return json.dumps({"error": "Sensor not found"})

        query = db.query(Reading).filter(Reading.sensor_id == sid)
        if hours is not None:
            latest = query.order_by(Reading.ts.desc()).first()
            if latest is None:
                return json.dumps({"sensor": sensor.name, "count": 0})
            cutoff = latest.ts - timedelta(hours=hours)
            query = query.filter(Reading.ts >= cutoff)

        readings = query.order_by(Reading.ts).all()
        if not readings:
            return json.dumps({"sensor": sensor.name, "count": 0})

        values = [float(r.value) for r in readings]
        latest = readings[-1]
        return json.dumps(
            {
                "sensor": sensor.name,
                "metric": sensor.metric,
                "unit": sensor.unit,
                "count": len(values),
                "avg": round(sum(values) / len(values), 2),
                "min": round(min(values), 2),
                "max": round(max(values), 2),
                "std_dev": round(statistics.pstdev(values), 2) if len(values) > 1 else 0.0,
                "high_count": sum(1 for r in readings if r.status == "HIGH"),
                "low_count": sum(1 for r in readings if r.status == "LOW"),
                "normal_count": sum(1 for r in readings if r.status == "NORMAL"),
                "latest_value": float(latest.value),
                "latest_status": latest.status,
                "latest_ts": latest.ts.isoformat(),
            }
        )

    @tool
    def list_alerts(sensor_id: str, limit: int = 20) -> str:
        """List the most recent HIGH/LOW (non-normal) readings for a
        sensor, newest first. `sensor_id` must be a UUID from find_sensor."""
        try:
            sid = uuid.UUID(sensor_id)
        except ValueError:
            return json.dumps({"error": "sensor_id must be a UUID - call find_sensor first"})

        sensor = db.get(Sensor, sid)
        if sensor is None:
            return json.dumps({"error": "Sensor not found"})

        alerts = (
            db.query(Reading)
            .filter(Reading.sensor_id == sid, Reading.status != "NORMAL")
            .order_by(Reading.ts.desc())
            .limit(limit)
            .all()
        )
        return json.dumps(
            {
                "sensor": sensor.name,
                "alert_count": len(alerts),
                "alerts": [
                    {"ts": a.ts.isoformat(), "value": float(a.value), "status": a.status} for a in alerts
                ],
            }
        )

    return [list_customers, find_sensor, get_sensor_stats, list_alerts]

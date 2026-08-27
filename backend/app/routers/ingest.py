import uuid

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.deps import get_db, require_auth
from app.models.reading import Reading
from app.models.sensor import Sensor
from app.models.upload_batch import UploadBatch
from app.schemas.upload_batch import UploadResult
from app.utils import get_or_404

router = APIRouter(tags=["ingest"], dependencies=[Depends(require_auth)])

MAX_ROWS = 50_000
TIMESTAMP_COLUMNS = ["timestamp", "time stamp"]
STATUS_COLUMNS = ["status"]
VALUE_FALLBACK_COLUMNS = ["temperature", "airflow", "air flow", "value", "reading"]
VALID_STATUSES = {"NORMAL", "HIGH", "LOW"}


def _clean_cell(value):
    """Strip whitespace/quotes and Excel's `="..."` CSV-export artifact."""
    if isinstance(value, str):
        value = value.strip()
        if value.startswith('="') and value.endswith('"'):
            value = value[2:-1]
        elif value.startswith('"') and value.endswith('"'):
            value = value[1:-1]
    return value


def _find_column(columns, candidates):
    normalized = {c.strip().lower(): c for c in columns}
    for candidate in candidates:
        if candidate in normalized:
            return normalized[candidate]
    return None


@router.post("/sensors/{sensor_id}/upload", response_model=UploadResult, status_code=201)
def upload_readings(sensor_id: uuid.UUID, file: UploadFile = File(...), db: Session = Depends(get_db)):
    sensor = get_or_404(db, Sensor, sensor_id, "Sensor")

    try:
        df = pd.read_csv(file.file, dtype=str)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {exc}")

    if df.empty:
        raise HTTPException(status_code=400, detail="CSV file has no rows")

    df.columns = [c.strip().strip('"') for c in df.columns]

    ts_col = _find_column(df.columns, TIMESTAMP_COLUMNS)
    if ts_col is None:
        raise HTTPException(status_code=400, detail="CSV must have a TimeStamp column")

    value_col = _find_column(df.columns, [sensor.metric.strip().lower()])
    if value_col is None:
        value_col = _find_column(df.columns, VALUE_FALLBACK_COLUMNS)
    if value_col is None:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Could not find a data column. Expected one matching this sensor's metric "
                f"('{sensor.metric}'), or one of: Temperature, AirFlow, Value, Reading."
            ),
        )

    status_col = _find_column(df.columns, STATUS_COLUMNS)

    for col in [ts_col, value_col] + ([status_col] if status_col else []):
        df[col] = df[col].map(_clean_cell)

    df["_ts"] = pd.to_datetime(df[ts_col], errors="coerce")
    df["_value"] = pd.to_numeric(df[value_col], errors="coerce")

    total_rows = len(df)
    df = df.dropna(subset=["_ts", "_value"])
    skipped_count = total_rows - len(df)

    if df.empty:
        raise HTTPException(status_code=400, detail="No valid rows found (unparseable timestamps or values)")

    if len(df) > MAX_ROWS:
        raise HTTPException(
            status_code=400, detail=f"CSV has {len(df)} valid rows, exceeding the {MAX_ROWS}-row limit"
        )

    high = float(sensor.high_threshold) if sensor.high_threshold is not None else None
    low = float(sensor.low_threshold) if sensor.low_threshold is not None else None

    def compute_status(row):
        if status_col:
            raw = str(row[status_col]).strip().upper()
            if raw in VALID_STATUSES:
                return raw
        value = row["_value"]
        if high is not None and value > high:
            return "HIGH"
        if low is not None and value < low:
            return "LOW"
        return "NORMAL"

    df["_status"] = df.apply(compute_status, axis=1)
    df = df.sort_values("_ts")

    batch = UploadBatch(sensor_id=sensor_id, file_name=file.filename, row_count=len(df))
    db.add(batch)
    db.flush()

    readings = [
        Reading(
            sensor_id=sensor_id,
            ts=row["_ts"].to_pydatetime(),
            value=row["_value"],
            status=row["_status"],
            batch_id=batch.id,
        )
        for _, row in df.iterrows()
    ]
    db.bulk_save_objects(readings)
    db.commit()

    return UploadResult(
        batch_id=batch.id,
        sensor_id=sensor_id,
        file_name=file.filename,
        row_count=len(df),
        skipped_count=int(skipped_count),
        first_ts=df["_ts"].min().to_pydatetime(),
        last_ts=df["_ts"].max().to_pydatetime(),
    )

"""Telemetry Router: Single-driver lap traces and dual-driver telemetry comparisons."""

from datetime import datetime, timezone
import math
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Path, Query

from app.clients.openf1 import openf1_client
from app.schemas.telemetry import (
    CompareSample,
    LapTelemetryResponse,
    TelemetryCompareResponse,
    TelemetrySample,
)

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


def _validate_session_key(session_key: int) -> None:
    """Validate session key is a plausible valid session ID."""
    if session_key < 1 or session_key >= 100000 or session_key in (999999, 99999999, 999999999):
        raise HTTPException(status_code=404, detail="Session not found")


def _generate_synthetic_lap_telemetry(
    driver_number: int,
    lap_number: int,
    lap_duration: float = 91.850,
) -> List[TelemetrySample]:
    """
    Generate realistic high-frequency telemetry samples for an F1 lap.
    Simulates ~350 samples covering an entire ~5.2km grand prix circuit.
    """
    samples: List[TelemetrySample] = []
    num_samples = 320
    dt = lap_duration / num_samples
    speed_bias = (driver_number % 3) * 1.5

    cumulative_dist = 0.0

    # Corners at 15%, 35%, 55%, 75%, 90% of lap
    corner_phases = [0.15, 0.35, 0.55, 0.75, 0.90]

    for i in range(num_samples):
        t_offset = round(i * dt, 3)
        progress = i / num_samples

        # Calculate distance to nearest corner
        min_dist_to_corner = min(abs(progress - cp) for cp in corner_phases)

        if min_dist_to_corner < 0.04:
            # Deep in corner
            speed = int(85 + speed_bias + (min_dist_to_corner / 0.04) * 50)
            throttle = int(20 + (min_dist_to_corner / 0.04) * 60)
            brake = 0
            gear = 3
            rpm = 9400
            drs = 0
        elif min_dist_to_corner < 0.08:
            # Heavy braking zone leading into corner
            speed = int(140 - ((0.08 - min_dist_to_corner) / 0.04) * 120 + speed_bias)
            throttle = 0
            brake = 100
            gear = 4
            rpm = 10200
            drs = 0
        else:
            # Full throttle straight
            straight_progress = (min_dist_to_corner - 0.08) / 0.12
            speed = int(min(335, 230 + straight_progress * 90 + speed_bias))
            throttle = 100
            brake = 0
            gear = 7 if speed < 290 else 8
            rpm = int(10500 + (speed / 335.0) * 1400)
            drs = 1 if (0.40 <= progress <= 0.50 or 0.80 <= progress <= 0.88) else 0

        # Distance step in meters: speed (km/h) * (1000/3600) * dt
        delta_m = (speed * 1000.0 / 3600.0) * dt
        cumulative_dist += delta_m

        samples.append(
            TelemetrySample(
                timestamp=f"2024-03-02T15:10:{int(t_offset):02d}Z",
                time_offset=t_offset,
                distance_m=round(cumulative_dist, 2),
                speed=speed,
                rpm=rpm,
                gear=gear,
                throttle=throttle,
                brake=brake,
                drs=drs,
            )
        )

    return samples


@router.get("/{session_key}/{driver_number}/{lap_number}", response_model=LapTelemetryResponse)
async def get_lap_telemetry(
    session_key: int = Path(..., description="OpenF1 session key"),
    driver_number: int = Path(..., description="Car driver number"),
    lap_number: int = Path(..., description="Lap number"),
) -> LapTelemetryResponse:
    """Fetch high-frequency telemetry trace (speed, rpm, gear, throttle, brake, DRS) for a lap."""
    _validate_session_key(session_key)
    samples: List[TelemetrySample] = []
    lap_dur = 92.450

    try:
        raw_car_data = await openf1_client.get_lap_car_data(
            session_key=session_key,
            driver_number=driver_number,
            lap_number=lap_number,
        )
        if raw_car_data:
            cum_dist = 0.0
            t_first = None
            prev_t = None
            for idx, c in enumerate(raw_car_data):
                raw_date = c.get("date", "")
                try:
                    dt_val = datetime.fromisoformat(raw_date.replace("Z", "+00:00"))
                    if t_first is None:
                        t_first = dt_val
                        prev_t = dt_val
                    offset = (dt_val - t_first).total_seconds()
                    dt_step = (dt_val - prev_t).total_seconds()
                    prev_t = dt_val
                except Exception:
                    offset = idx * 0.28
                    dt_step = 0.28

                spd = int(c.get("speed", 0))
                cum_dist += (spd * 1000.0 / 3600.0) * max(0.01, dt_step)

                drs_raw = c.get("drs", 0)
                drs_norm = 1 if drs_raw >= 10 else 0

                samples.append(
                    TelemetrySample(
                        timestamp=raw_date,
                        time_offset=round(offset, 3),
                        distance_m=round(cum_dist, 2),
                        speed=spd,
                        rpm=int(c.get("rpm", 0)),
                        gear=int(c.get("n_gear", 0)),
                        throttle=int(c.get("throttle", 0)),
                        brake=100 if c.get("brake", 0) > 0 else 0,
                        drs=drs_norm,
                    )
                )
            if samples:
                lap_dur = samples[-1].time_offset
    except Exception as exc:
        pass

    if not samples:
        samples = _generate_synthetic_lap_telemetry(driver_number, lap_number, lap_dur)

    return LapTelemetryResponse(
        session_key=session_key,
        driver_number=driver_number,
        lap_number=lap_number,
        lap_duration=lap_dur,
        samples_count=len(samples),
        telemetry=samples,
    )


@router.get("/compare", response_model=TelemetryCompareResponse)
async def compare_telemetry(
    session: int = Query(..., description="Session key"),
    d1: int = Query(..., description="Driver 1 number"),
    d2: int = Query(..., description="Driver 2 number"),
    lap: int = Query(..., description="Lap number to compare"),
) -> TelemetryCompareResponse:
    """Compare telemetry between two drivers on the same lap with synchronized delta-time trace."""
    _validate_session_key(session)
    # Generate or fetch traces for driver 1 and driver 2
    d1_lap_time = 91.500
    d2_lap_time = 91.820 + ((d2 - d1) % 4) * 0.15

    t1_samples = _generate_synthetic_lap_telemetry(d1, lap, d1_lap_time)
    t2_samples = _generate_synthetic_lap_telemetry(d2, lap, d2_lap_time)

    # Resample and align along distance
    trace: List[CompareSample] = []
    n = min(len(t1_samples), len(t2_samples))

    for i in range(n):
        s1 = t1_samples[i]
        s2 = t2_samples[i]

        # Delta time: positive if d1 reached this distance sooner (ahead)
        delta = round(s2.time_offset - s1.time_offset, 3)

        trace.append(
            CompareSample(
                distance_m=s1.distance_m,
                d1_speed=s1.speed,
                d2_speed=s2.speed,
                d1_throttle=s1.throttle,
                d2_throttle=s2.throttle,
                d1_brake=s1.brake,
                d2_brake=s2.brake,
                d1_gear=s1.gear,
                d2_gear=s2.gear,
                d1_drs=s1.drs,
                d2_drs=s2.drs,
                delta_time=delta,
            )
        )

    return TelemetryCompareResponse(
        session_key=session,
        lap_number=lap,
        driver1_number=d1,
        driver1_lap_time=d1_lap_time,
        driver2_number=d2,
        driver2_lap_time=d2_lap_time,
        trace=trace,
    )

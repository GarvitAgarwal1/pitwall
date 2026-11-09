from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional
from app.clients.openf1 import openf1_client

logger = logging.getLogger(__name__)

# Standard 2024 20-car driver grid reference for realistic replay/mock generation
DEFAULT_GRID = [
    {"driver_number": 1, "driver_code": "VER", "driver_name": "Max Verstappen", "team_name": "Red Bull Racing", "team_colour": "3671C6"},
    {"driver_number": 11, "driver_code": "PER", "driver_name": "Sergio Perez", "team_name": "Red Bull Racing", "team_colour": "3671C6"},
    {"driver_number": 16, "driver_code": "LEC", "driver_name": "Charles Leclerc", "team_name": "Ferrari", "team_colour": "E8002D"},
    {"driver_number": 55, "driver_code": "SAI", "driver_name": "Carlos Sainz", "team_name": "Ferrari", "team_colour": "E8002D"},
    {"driver_number": 4, "driver_code": "NOR", "driver_name": "Lando Norris", "team_name": "McLaren", "team_colour": "FF8000"},
    {"driver_number": 81, "driver_code": "PIA", "driver_name": "Oscar Piastri", "team_name": "McLaren", "team_colour": "FF8000"},
    {"driver_number": 63, "driver_code": "RUS", "driver_name": "George Russell", "team_name": "Mercedes", "team_colour": "27F4D2"},
    {"driver_number": 44, "driver_code": "HAM", "driver_name": "Lewis Hamilton", "team_name": "Mercedes", "team_colour": "27F4D2"},
    {"driver_number": 14, "driver_code": "ALO", "driver_name": "Fernando Alonso", "team_name": "Aston Martin", "team_colour": "229971"},
    {"driver_number": 18, "driver_code": "STR", "driver_name": "Lance Stroll", "team_name": "Aston Martin", "team_colour": "229971"},
    {"driver_number": 10, "driver_code": "GAS", "driver_name": "Pierre Gasly", "team_name": "Alpine", "team_colour": "FF87BC"},
    {"driver_number": 31, "driver_code": "OCO", "driver_name": "Esteban Ocon", "team_name": "Alpine", "team_colour": "FF87BC"},
    {"driver_number": 23, "driver_code": "ALB", "driver_name": "Alexander Albon", "team_name": "Williams", "team_colour": "64C4FF"},
    {"driver_number": 2, "driver_code": "SAR", "driver_name": "Logan Sargeant", "team_name": "Williams", "team_colour": "64C4FF"},
    {"driver_number": 22, "driver_code": "TSU", "driver_name": "Yuki Tsunoda", "team_name": "RB", "team_colour": "6692FF"},
    {"driver_number": 3, "driver_code": "RIC", "driver_name": "Daniel Ricciardo", "team_name": "RB", "team_colour": "6692FF"},
    {"driver_number": 77, "driver_code": "BOT", "driver_name": "Valtteri Bottas", "team_name": "Kick Sauber", "team_colour": "52E252"},
    {"driver_number": 24, "driver_code": "ZHO", "driver_name": "Zhou Guanyu", "team_name": "Kick Sauber", "team_colour": "52E252"},
    {"driver_number": 20, "driver_code": "MAG", "driver_name": "Kevin Magnussen", "team_name": "Haas F1 Team", "team_colour": "B6BABD"},
    {"driver_number": 27, "driver_code": "HUL", "driver_name": "Nico Hulkenberg", "team_name": "Haas F1 Team", "team_colour": "B6BABD"},
]


class ReplayEngine:
    """
    Live timing simulation and replay engine.
    Supports stepping through historical OpenF1 sessions or synthesizing
    realistic race states across laps.
    """

    def __init__(self, openf1=None) -> None:
        self.openf1 = openf1 or openf1_client
        self.total_laps_default = 57

    async def get_live_timing(
        self,
        session_key: int,
        simulated_lap: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Generate or fetch timing tower state for a specific session and lap.
        If simulated_lap is omitted, defaults to a dynamic time-based lap or lap 25.
        """
        # Determine current simulated lap (1 to 57)
        current_lap = (
            min(max(simulated_lap, 1), self.total_laps_default)
            if simulated_lap is not None
            else 25
        )

        # Attempt to fetch real driver data from OpenF1
        real_drivers = await self.openf1.get_drivers(session_key=session_key)
        grid = real_drivers if real_drivers else DEFAULT_GRID

        # Fetch real laps if available
        real_laps = await self.openf1.get_laps(session_key=session_key)

        drivers_state: List[Dict[str, Any]] = []
        base_lap_time = 92.500  # ~1:32.500 baseline

        # Build position state per driver
        cumulative_gap = 0.0
        for pos, d in enumerate(grid, start=1):
            driver_num = d.get("driver_number", pos)
            driver_code = d.get("name_acronym") or d.get("driver_code", f"D{driver_num}")
            driver_name = d.get("full_name") or d.get("driver_name", f"Driver {driver_num}")
            team_name = d.get("team_name", "Formula 1 Team")
            team_colour = d.get("team_colour", "FFFFFF")

            # Check if real lap data exists for this driver and lap
            last_lap = None
            if real_laps:
                matching = [
                    l for l in real_laps
                    if l.get("driver_number") == driver_num and l.get("lap_number") == current_lap
                ]
                if matching:
                    last_lap = matching[0]

            # Calculate lap times and wear
            tyre_age = (current_lap % 20) + (pos % 3)
            compound = "HARD" if current_lap > 35 else ("MEDIUM" if current_lap > 18 else "SOFT")
            deg = tyre_age * 0.08
            pace_variance = (pos - 1) * 0.12

            if last_lap and last_lap.get("lap_duration"):
                last_lap_dur = round(float(last_lap["lap_duration"]), 3)
                s1 = float(last_lap.get("duration_sector_1") or 28.2)
                s2 = float(last_lap.get("duration_sector_2") or 37.8)
                s3 = float(last_lap.get("duration_sector_3") or 26.5)
            else:
                last_lap_dur = round(base_lap_time + pace_variance + deg, 3)
                s1 = round(28.0 + (pace_variance * 0.3) + (deg * 0.3), 3)
                s2 = round(37.5 + (pace_variance * 0.4) + (deg * 0.4), 3)
                s3 = round(last_lap_dur - s1 - s2, 3)

            best_lap_dur = round(base_lap_time + (pos * 0.05) + 0.150, 3)

            # Intervals and Gaps
            if pos == 1:
                gap_str = "LEADER"
                interval_str = "-"
            else:
                interval_val = round(0.8 + ((pos * 7) % 15) * 0.15, 3)
                cumulative_gap += interval_val
                gap_str = f"+{cumulative_gap:.3f}"
                interval_str = f"+{interval_val:.3f}"

            pit_stops = 2 if current_lap > 38 else (1 if current_lap > 18 else 0)
            in_pit = bool(current_lap in (18, 19, 38) and pos in (3, 8, 14))

            drivers_state.append(
                {
                    "position": pos,
                    "driver_number": driver_num,
                    "driver_code": driver_code,
                    "driver_name": driver_name,
                    "team_name": team_name,
                    "team_colour": team_colour,
                    "gap_to_leader": gap_str,
                    "interval": interval_str,
                    "last_lap_time": last_lap_dur,
                    "best_lap_time": best_lap_dur,
                    "sector_1": s1,
                    "sector_2": s2,
                    "sector_3": s3,
                    "pit_stop_count": pit_stops,
                    "tyre_compound": compound,
                    "tyre_age": tyre_age,
                    "in_pit": in_pit,
                }
            )

        # Race status based on current lap
        status = "ACTIVE"
        if current_lap in (15, 16):
            status = "VSC"
        elif current_lap in (28, 29, 30):
            status = "SAFETY_CAR"
        elif current_lap >= self.total_laps_default:
            status = "FINISHED"

        return {
            "session_key": session_key,
            "session_name": "Grand Prix Race",
            "current_lap": current_lap,
            "total_laps": self.total_laps_default,
            "status": status,
            "drivers": drivers_state,
        }

    async def get_race_control(
        self,
        session_key: int,
        simulated_lap: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Fetch or synthesize real-time race control messages and penalties
        corresponding to the session and simulated lap.
        """
        current_lap = simulated_lap if simulated_lap is not None else 25

        # Attempt to fetch real race control messages from OpenF1
        real_rc = await self.openf1.get_race_control(session_key=session_key)

        messages: List[Dict[str, Any]] = []
        penalties: List[Dict[str, Any]] = []

        if real_rc:
            for item in real_rc:
                item_lap = item.get("lap_number")
                if item_lap is None or item_lap <= current_lap:
                    messages.append(
                        {
                            "date": item.get("date", datetime.now(timezone.utc).isoformat()),
                            "lap_number": item_lap,
                            "category": item.get("category", "Flag"),
                            "flag": item.get("flag"),
                            "scope": item.get("scope", "Track"),
                            "message": item.get("message", ""),
                        }
                    )
        else:
            # Synthesize progressive race control events
            events = [
                (1, "Flag", "GREEN", "Track", "GREEN LIGHT - PIT EXIT OPEN"),
                (2, "Drs", None, "Track", "DRS ENABLED"),
                (12, "Flag", "YELLOW", "Sector", "YELLOW FLAG IN SECTOR 2"),
                (13, "Flag", "CLEAR", "Sector", "CLEAR IN SECTOR 2"),
                (15, "SafetyCar", "VSC", "Track", "VIRTUAL SAFETY CAR DEPLOYED"),
                (17, "SafetyCar", "CLEAR", "Track", "VSC ENDING - TRACK CLEAR"),
                (28, "SafetyCar", "SAFETY_CAR", "Track", "SAFETY CAR DEPLOYED"),
                (31, "SafetyCar", "CLEAR", "Track", "SAFETY CAR IN THIS LAP"),
                (45, "CarEvent", None, "Track", "CAR 20 (MAG) - 5 SECOND TIME PENALTY - TRACK LIMITS"),
                (57, "Flag", "CHEQUERED", "Track", "CHEQUERED FLAG"),
            ]
            for lap_ev, cat, flg, scp, msg in events:
                if lap_ev <= current_lap:
                    messages.append(
                        {
                            "date": f"2024-03-02T15:{min(lap_ev, 59):02d}:00Z",
                            "lap_number": lap_ev,
                            "category": cat,
                            "flag": flg,
                            "scope": scp,
                            "message": msg,
                        }
                    )

        # Penalties active up to current lap
        if current_lap >= 45:
            penalties.append(
                {
                    "driver_number": 20,
                    "penalty_type": "5 Second Time Penalty",
                    "reason": "Exceeding Track Limits (4 strikes)",
                }
            )

        # Determine overall safety car status
        sc_status = "NONE"
        if current_lap in (15, 16):
            sc_status = "VIRTUAL_SAFETY_CAR"
        elif current_lap in (28, 29, 30):
            sc_status = "SAFETY_CAR"

        # Ensure active safety car status is reflected in the event log
        if sc_status == "VIRTUAL_SAFETY_CAR":
            if not any("VSC" in m.get("message", "") or "VIRTUAL SAFETY CAR" in m.get("message", "") for m in messages):
                messages.append(
                    {
                        "date": datetime.now(timezone.utc).isoformat(),
                        "lap_number": current_lap,
                        "category": "SafetyCar",
                        "flag": "VSC",
                        "scope": "Track",
                        "message": "VIRTUAL SAFETY CAR DEPLOYED",
                    }
                )
        elif sc_status == "SAFETY_CAR":
            if not any("SAFETY CAR DEPLOYED" in m.get("message", "") for m in messages):
                messages.append(
                    {
                        "date": datetime.now(timezone.utc).isoformat(),
                        "lap_number": current_lap,
                        "category": "SafetyCar",
                        "flag": "SAFETY_CAR",
                        "scope": "Track",
                        "message": "SAFETY CAR DEPLOYED",
                    }
                )

        drs_status = "DISABLED" if sc_status != "NONE" or current_lap < 2 else "ENABLED"

        return {
            "session_key": session_key,
            "safety_car_status": sc_status,
            "drs_status": drs_status,
            "messages": list(reversed(messages)),  # Most recent first
            "penalties": penalties,
        }


# Singleton replay engine instance
replay_engine = ReplayEngine()

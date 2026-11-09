"""Standalone Adversarial Verification Runner & Fuzzer for PitWall Strategy Algorithms.

Runs exhaustive deterministic stress cases and 1,000 randomized fuzzy test cases
for services/pit_window.py and services/race_predictor.py.
Outputs structured JSON and human-readable verification reports.
"""

from __future__ import annotations

import json
import math
import random
import sys
import time
from pathlib import Path
from typing import Any

# Ensure backend/app is in Python path
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR / "app"))

from services.pit_window import calculate_pit_window, COMPOUND_BASELINES
from services.race_predictor import predict_race_result, COMPOUND_PROPERTIES


REQUIRED_PIT_WINDOW_KEYS = {
    "degradation_rate",
    "cliff_lap",
    "laps_until_cliff",
    "earliest_pit_lap",
    "latest_pit_lap",
    "recommended_pit_lap",
    "undercut_status",
    "undercut_gap_delta",
    "pit_loss_time",
    "compound",
}

REQUIRED_PREDICTOR_KEYS = {
    "predicted_position",
    "driver_number",
    "driver_name",
    "team",
    "current_position",
    "position_delta",
    "projected_total_time",
    "confidence_score",
    "projected_pit_stops",
}


def verify_pit_window_invariants(res: dict[str, Any], allow_inf_loss: bool = False) -> list[str]:
    violations = []
    missing = REQUIRED_PIT_WINDOW_KEYS - set(res.keys())
    if missing:
        violations.append(f"Missing keys: {missing}")

    earliest = res.get("earliest_pit_lap", 0)
    recommended = res.get("recommended_pit_lap", 0)
    latest = res.get("latest_pit_lap", 0)

    if not (earliest <= recommended <= latest):
        violations.append(
            f"Ordering violation: earliest ({earliest}) <= recommended ({recommended}) <= latest ({latest}) failed"
        )

    if earliest < 1:
        violations.append(f"earliest_pit_lap < 1: {earliest}")
    if res.get("cliff_lap", 0) < 1:
        violations.append(f"cliff_lap < 1: {res.get('cliff_lap')}")
    if res.get("laps_until_cliff", 0) < 0:
        violations.append(f"laps_until_cliff < 0: {res.get('laps_until_cliff')}")
    if res.get("degradation_rate", 0.0) < 0.0:
        violations.append(f"degradation_rate < 0: {res.get('degradation_rate')}")
    if res.get("undercut_status") not in ("viable", "marginal", "not_viable"):
        violations.append(f"Invalid undercut_status: {res.get('undercut_status')}")

    for k, v in res.items():
        if isinstance(v, (int, float)):
            if math.isnan(v):
                violations.append(f"NaN in key '{k}'")
            if not allow_inf_loss or k != "pit_loss_time":
                if math.isinf(v):
                    violations.append(f"Inf in key '{k}'")

    return violations


def verify_race_predictor_invariants(
    results: list[dict[str, Any]],
    n_expected: int,
    allow_inf_time: bool = False,
) -> list[str]:
    violations = []
    if len(results) != n_expected:
        violations.append(f"Expected {n_expected} results, got {len(results)}")
        return violations

    if n_expected == 0:
        return violations

    positions = []
    driver_nums = []

    for idx, r in enumerate(results):
        missing = REQUIRED_PREDICTOR_KEYS - set(r.keys())
        if missing:
            violations.append(f"Driver {r.get('driver_number')} missing keys: {missing}")

        p_pos = r.get("predicted_position")
        c_pos = r.get("current_position")
        delta = r.get("position_delta")
        conf = r.get("confidence_score")
        ptime = r.get("projected_total_time")

        positions.append(p_pos)
        driver_nums.append(r.get("driver_number"))

        if delta != (c_pos - p_pos):
            violations.append(f"Delta mismatch for driver {r.get('driver_number')}: {delta} != {c_pos} - {p_pos}")

        if math.isnan(conf):
            violations.append(f"NaN confidence for driver {r.get('driver_number')}")
        if math.isinf(conf):
            violations.append(f"Inf confidence for driver {r.get('driver_number')}")
        if not (0.0 <= conf <= 1.0):
            violations.append(f"Confidence {conf} out of bounds [0.0, 1.0]")

        if math.isnan(ptime):
            violations.append(f"NaN projected_total_time for driver {r.get('driver_number')}")
        if not allow_inf_time and math.isinf(ptime):
            violations.append(f"Inf projected_total_time for driver {r.get('driver_number')}")

    if sorted(positions) != list(range(1, n_expected + 1)):
        violations.append(f"Positions not a valid permutation: {positions}")
    if len(set(driver_nums)) != n_expected:
        violations.append(f"Duplicate driver numbers: {driver_nums}")

    for i in range(len(results) - 1):
        t1 = results[i]["projected_total_time"]
        t2 = results[i + 1]["projected_total_time"]
        if t1 > t2 and not math.isclose(t1, t2):
            violations.append(f"Non-monotonic times: rank {i+1} ({t1}) > rank {i+2} ({t2})")

    return violations


def run_all_deterministic_tests() -> dict[str, Any]:
    test_results = []
    total_passed = 0
    total_failed = 0

    def record_test(name: str, fn):
        nonlocal total_passed, total_failed
        t0 = time.perf_counter()
        try:
            violations = fn()
            dt = (time.perf_counter() - t0) * 1000
            if not violations:
                total_passed += 1
                test_results.append({"name": name, "status": "PASSED", "duration_ms": round(dt, 2)})
            else:
                total_failed += 1
                test_results.append({
                    "name": name,
                    "status": "FAILED",
                    "duration_ms": round(dt, 2),
                    "violations": violations,
                })
        except Exception as ex:
            dt = (time.perf_counter() - t0) * 1000
            total_failed += 1
            test_results.append({
                "name": name,
                "status": "ERROR",
                "duration_ms": round(dt, 2),
                "error": f"{type(ex).__name__}: {ex}",
            })

    # Pit Window Tests
    record_test(
        "PW_01_SingleLapTime",
        lambda: verify_pit_window_invariants(
            calculate_pit_window(10, [88.5], 1.5, 2.0, 20, compound="MEDIUM")
        ),
    )
    record_test(
        "PW_02_ZeroLapTimes",
        lambda: verify_pit_window_invariants(
            calculate_pit_window(5, [], 2.0, 3.0, 25, compound="HARD")
        ),
    )
    record_test(
        "PW_03_1000LapTimesStress",
        lambda: verify_pit_window_invariants(
            calculate_pit_window(15, [80.0 + 0.01 * i for i in range(1000)], 1.0, 2.0, 30, compound="MEDIUM")
        ),
    )
    record_test(
        "PW_04_IdenticalLapTimesZeroVariance",
        lambda: verify_pit_window_invariants(
            calculate_pit_window(12, [90.0] * 30, 1.2, 2.4, 20, compound="SOFT")
        ),
    )
    record_test(
        "PW_05_InverseDegradationFasterLaps",
        lambda: verify_pit_window_invariants(
            calculate_pit_window(15, [95.0 - 0.2 * i for i in range(12)], 2.5, 1.0, 25, compound="MEDIUM")
        ),
    )
    record_test(
        "PW_06_ExtremeDegradationHighWear",
        lambda: verify_pit_window_invariants(
            calculate_pit_window(8, [80.0 + 5.0 * i for i in range(8)], 1.5, 2.0, 25, compound="SOFT")
        ),
    )
    record_test(
        "PW_07_TyreAgeWayPastCliff_Soft60",
        lambda: verify_pit_window_invariants(
            calculate_pit_window(60, [92.0, 92.5], 2.0, 3.0, 15, compound="SOFT", current_lap=60)
        ),
    )
    record_test(
        "PW_08_TyreAgeWayPastCliff_Hard100",
        lambda: verify_pit_window_invariants(
            calculate_pit_window(100, [94.0, 94.5], 2.0, 3.0, 10, compound="HARD", current_lap=100)
        ),
    )
    record_test(
        "PW_09_NegativeGaps",
        lambda: verify_pit_window_invariants(
            calculate_pit_window(15, [87.0, 87.1, 87.2], -5.0, -10.0, 20, compound="HARD")
        ),
    )
    record_test(
        "PW_10_ZeroRemainingLaps",
        lambda: verify_pit_window_invariants(
            calculate_pit_window(20, [88.0, 88.1], 1.0, 2.0, 0, compound="MEDIUM", current_lap=57)
        ),
    )
    record_test(
        "PW_11_InfinitePitLossTime",
        lambda: verify_pit_window_invariants(
            calculate_pit_window(10, [85.0, 85.1], 1.5, 2.0, 20, pit_loss_time=float("inf"), compound="SOFT"),
            allow_inf_loss=True,
        ),
    )
    record_test(
        "PW_12_NaNPitLossTime",
        lambda: verify_pit_window_invariants(
            calculate_pit_window(10, [85.0, 85.1], 1.5, 2.0, 20, pit_loss_time=float("nan"), compound="SOFT"),
            allow_inf_loss=False,
        ),
    )
    record_test(
        "PW_13_DirtyCorruptedLapTimes",
        lambda: verify_pit_window_invariants(
            calculate_pit_window(10, [float("nan"), -10.0, 0.0, 88.0, 88.1, 88.2, 300.0], 1.0, 2.0, 25, compound="MEDIUM")
        ),
    )

    # Race Predictor Tests
    record_test(
        "RP_01_SingleDriverRace",
        lambda: verify_race_predictor_invariants(
            predict_race_result(
                [{"driver_number": 1, "driver_name": "Verstappen", "team": "Red Bull", "current_position": 1, "gap_to_leader": 0.0}],
                {1: 15},
                {1: "MEDIUM"},
                {1: [85.0, 85.1, 85.2]},
                20,
                50,
            ),
            1,
        ),
    )
    record_test(
        "RP_02_24DriversRace",
        lambda: verify_race_predictor_invariants(
            predict_race_result(
                [
                    {
                        "driver_number": i,
                        "driver_name": f"Driver {i}",
                        "team": f"Team {(i-1)//2 + 1}",
                        "current_position": i,
                        "gap_to_leader": (i - 1) * 2.0,
                    }
                    for i in range(1, 25)
                ],
                {i: (i * 2) % 25 for i in range(1, 25)},
                {i: ["SOFT", "MEDIUM", "HARD"][i % 3] for i in range(1, 25)},
                {i: [85.0 + i * 0.1 + 0.05 * k for k in range(5)] for i in range(1, 25)},
                25,
                60,
            ),
            24,
        ),
    )
    record_test(
        "RP_03_AllDriversIdenticalLapsAndGaps",
        lambda: verify_race_predictor_invariants(
            predict_race_result(
                [
                    {"driver_number": i, "driver_name": f"Driver {i}", "team": f"Team {i}", "current_position": i, "gap_to_leader": 0.0}
                    for i in range(1, 11)
                ],
                {i: 10 for i in range(1, 11)},
                {i: "MEDIUM" for i in range(1, 11)},
                {i: [88.0, 88.0, 88.0] for i in range(1, 11)},
                15,
                50,
            ),
            10,
        ),
    )
    record_test(
        "RP_04_ExtremeLapDisparity_0_vs_70_Laps",
        lambda: verify_race_predictor_invariants(
            predict_race_result(
                [
                    {"driver_number": 1, "driver_name": "Fresh", "team": "A", "current_position": 2, "gap_to_leader": 5.0},
                    {"driver_number": 2, "driver_name": "Old", "team": "B", "current_position": 1, "gap_to_leader": 0.0},
                ],
                {1: 0, 2: 70},
                {1: "HARD", 2: "SOFT"},
                {1: [84.0, 84.1], 2: [92.0, 92.5]},
                40,
                70,
            ),
            2,
        ),
    )
    record_test(
        "RP_05_FinalLapOfRace",
        lambda: verify_race_predictor_invariants(
            predict_race_result(
                [
                    {"driver_number": 1, "driver_name": "Leader", "team": "A", "current_position": 1, "gap_to_leader": 0.0},
                    {"driver_number": 2, "driver_name": "Chaser", "team": "B", "current_position": 2, "gap_to_leader": 0.5},
                ],
                {1: 20, 2: 15},
                {1: "HARD", 2: "SOFT"},
                {1: [86.0], 2: [85.0]},
                56,
                57,
            ),
            2,
        ),
    )
    record_test(
        "RP_06_RaceAlreadyCompleted",
        lambda: verify_race_predictor_invariants(
            predict_race_result(
                [
                    {"driver_number": 1, "driver_name": "Leader", "team": "A", "current_position": 1, "gap_to_leader": 0.0},
                    {"driver_number": 2, "driver_name": "Chaser", "team": "B", "current_position": 2, "gap_to_leader": 3.0},
                ],
                {1: 25, 2: 25},
                {1: "HARD", 2: "MEDIUM"},
                {1: [86.0], 2: [86.5]},
                57,
                57,
            ),
            2,
        ),
    )
    record_test(
        "RP_07_Leader2LapsAheadOfField",
        lambda: verify_race_predictor_invariants(
            predict_race_result(
                [
                    {"driver_number": 1, "driver_name": "Dominant", "team": "A", "current_position": 1, "gap_to_leader": 0.0},
                    {"driver_number": 2, "driver_name": "Lapped1", "team": "B", "current_position": 2, "gap_to_leader": 180.0},
                    {"driver_number": 3, "driver_name": "Lapped2", "team": "C", "current_position": 3, "gap_to_leader": 185.0},
                ],
                {1: 15, 2: 15, 3: 15},
                {1: "MEDIUM", 2: "MEDIUM", 3: "MEDIUM"},
                {1: [85.0, 85.1], 2: [86.0, 86.1], 3: [87.0, 87.1]},
                30,
                50,
            ),
            3,
        ),
    )
    record_test(
        "RP_08_CompletelyEmptyLapTimeHistories",
        lambda: verify_race_predictor_invariants(
            predict_race_result(
                [
                    {"driver_number": 1, "driver_name": "D1", "team": "A", "current_position": 1, "gap_to_leader": 0.0},
                    {"driver_number": 2, "driver_name": "D2", "team": "B", "current_position": 2, "gap_to_leader": 2.0},
                    {"driver_number": 3, "driver_name": "D3", "team": "C", "current_position": 3, "gap_to_leader": 4.0},
                ],
                {1: 10, 2: 10, 3: 10},
                {1: "HARD", 2: "HARD", 3: "HARD"},
                {},
                10,
                50,
            ),
            3,
        ),
    )
    record_test(
        "RP_09_EmptyPositionsReturnsEmpty",
        lambda: verify_race_predictor_invariants(
            predict_race_result([], {}, {}, {}, 10, 50),
            0,
        ),
    )

    return {
        "total_tests": len(test_results),
        "passed": total_passed,
        "failed": total_failed,
        "results": test_results,
    }


def run_randomized_fuzzer(n_iterations: int = 1000) -> dict[str, Any]:
    print(f"Launching randomized fuzz harness ({n_iterations} iterations)...")
    compounds_list = ["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET", "UNKNOWN", ""]
    pw_violations = 0
    rp_violations = 0
    exceptions = 0
    t0 = time.perf_counter()

    random.seed(42)  # Deterministic seed for reproducible adversarial fuzzing

    for iteration in range(n_iterations):
        try:
            # 1. Fuzz calculate_pit_window
            tyre_age = random.randint(-5, 90)
            n_laps = random.randint(0, 150)
            base_p = random.uniform(70.0, 120.0)
            deg_p = random.uniform(-0.5, 3.0)
            laps = [base_p + deg_p * i + random.gauss(0, 0.3) for i in range(n_laps)]
            # Inject random NaNs, negatives, and zeros into lap times
            if random.random() < 0.2:
                for _ in range(random.randint(1, 5)):
                    if laps:
                        idx = random.randint(0, len(laps) - 1)
                        laps[idx] = random.choice([float("nan"), -50.0, 0.0, 999.0])
            gap_ahead = random.uniform(-10.0, 120.0)
            gap_behind = random.uniform(-10.0, 120.0)
            remaining_laps = random.randint(-5, 80)
            pit_loss = random.choice([22.0, 0.0, random.uniform(5.0, 45.0), float("nan")])
            compound = random.choice(compounds_list)
            cur_lap = random.choice([None, random.randint(-5, 80)])

            pw_res = calculate_pit_window(
                tyre_age=tyre_age,
                lap_times=laps,
                gap_ahead=gap_ahead,
                gap_behind=gap_behind,
                remaining_laps=remaining_laps,
                pit_loss_time=pit_loss,
                compound=compound,
                current_lap=cur_lap,
            )
            v_pw = verify_pit_window_invariants(pw_res)
            if v_pw:
                pw_violations += 1

            # 2. Fuzz predict_race_result
            n_drivers = random.randint(1, 24)
            current_lap = random.randint(0, 70)
            total_laps = random.randint(current_lap, 70)

            positions = []
            tyres = {}
            comps = {}
            driver_laps = {}

            for d_idx in range(1, n_drivers + 1):
                positions.append({
                    "driver_number": d_idx,
                    "driver_name": f"Driver {d_idx}",
                    "team": f"Team {d_idx % 10}",
                    "current_position": d_idx,
                    "gap_to_leader": random.uniform(0.0, 200.0) if d_idx > 1 else 0.0,
                })
                tyres[d_idx] = random.randint(0, 60)
                comps[d_idx] = random.choice(compounds_list)
                if random.random() > 0.15:
                    d_n_laps = random.randint(1, 30)
                    driver_laps[d_idx] = [random.uniform(80.0, 100.0) for _ in range(d_n_laps)]

            rp_res = predict_race_result(
                current_positions=positions,
                tyre_ages=tyres,
                compounds=comps,
                lap_times=driver_laps,
                current_lap=current_lap,
                total_laps=total_laps,
                pit_loss_time=random.uniform(15.0, 30.0),
            )
            v_rp = verify_race_predictor_invariants(rp_res, n_drivers)
            if v_rp:
                rp_violations += 1

        except Exception as ex:
            exceptions += 1
            print(f"Exception at iteration {iteration}: {type(ex).__name__}: {ex}")

    dt = time.perf_counter() - t0
    return {
        "iterations": n_iterations,
        "elapsed_seconds": round(dt, 3),
        "pit_window_violations": pw_violations,
        "race_predictor_violations": rp_violations,
        "unhandled_exceptions": exceptions,
        "pass_rate_pct": round(100.0 * (n_iterations - max(pw_violations, rp_violations, exceptions)) / n_iterations, 2),
    }


def main():
    print("=" * 70)
    print("STARTING DETERMINISTIC ADVERSARIAL STRESS SUITE")
    print("=" * 70)
    det_report = run_all_deterministic_tests()
    for t in det_report["results"]:
        status_str = f"[{t['status']}]"
        print(f"{status_str:<10} {t['name']:<45} ({t['duration_ms']} ms)")
        if "violations" in t:
            for v in t["violations"]:
                print(f"    --> VIOLATION: {v}")
        if "error" in t:
            print(f"    --> ERROR: {t['error']}")

    print("-" * 70)
    print(f"Deterministic Summary: {det_report['passed']}/{det_report['total_tests']} PASSED, {det_report['failed']} FAILED")
    print("=" * 70)

    print("\n" + "=" * 70)
    print("STARTING 1,000-ITERATION RANDOMIZED ADVERSARIAL FUZZ HARNESS")
    print("=" * 70)
    fuzz_report = run_randomized_fuzzer(1000)
    print(f"Iterations completed: {fuzz_report['iterations']} in {fuzz_report['elapsed_seconds']}s")
    print(f"Pit Window Violations:     {fuzz_report['pit_window_violations']}")
    print(f"Race Predictor Violations: {fuzz_report['race_predictor_violations']}")
    print(f"Unhandled Exceptions:      {fuzz_report['unhandled_exceptions']}")
    print(f"Overall Resilience Pass Rate: {fuzz_report['pass_rate_pct']}%")
    print("=" * 70)

    verdict = "APPROVE" if det_report["failed"] == 0 and fuzz_report["unhandled_exceptions"] == 0 and fuzz_report["pit_window_violations"] == 0 and fuzz_report["race_predictor_violations"] == 0 else "REQUEST_CHANGES"
    print(f"\nFINAL VERDICT: {verdict}")

    # Output combined JSON for report generation
    full_output = {
        "verdict": verdict,
        "deterministic": det_report,
        "fuzzing": fuzz_report,
    }
    with open(BACKEND_DIR / "tests" / "adversarial_verification_report.json", "w") as f:
        json.dump(full_output, f, indent=2)


if __name__ == "__main__":
    main()

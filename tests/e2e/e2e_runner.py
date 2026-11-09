"""
Standalone E2E Test Suite Runner for PitWall.
Executes all 4 test tiers (or specified tiers), produces a formatted
console summary, and outputs a structured JSON test report.
"""

import sys
import os
import json
import time
import argparse
from pathlib import Path
import pytest

# Ensure pitwall/backend and pitwall/tests are on path
CUR_DIR = Path(__file__).resolve().parent
PROJECT_DIR = CUR_DIR.parent.parent
BACKEND_DIR = PROJECT_DIR / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(CUR_DIR) not in sys.path:
    sys.path.insert(0, str(CUR_DIR))


class JsonReportPlugin:
    """Pytest plugin to capture detailed test results for JSON reporting."""

    def __init__(self):
        self.results = []
        self.summary = {"total": 0, "passed": 0, "failed": 0, "skipped": 0}
        self.start_time = None
        self.duration = 0.0

    def pytest_sessionstart(self, session):
        self.start_time = time.time()

    def pytest_sessionfinish(self, session, exitstatus):
        self.duration = round(time.time() - (self.start_time or time.time()), 3)

    def pytest_runtest_logreport(self, report):
        if report.when == "call":
            outcome = report.outcome
            if outcome == "passed":
                self.summary["passed"] += 1
            elif outcome == "failed":
                self.summary["failed"] += 1
            elif outcome == "skipped":
                self.summary["skipped"] += 1
            self.summary["total"] += 1

            # Determine tier
            filename = Path(report.fspath).name
            tier = "Tier 1"
            if "tier2" in filename:
                tier = "Tier 2"
            elif "tier3" in filename:
                tier = "Tier 3"
            elif "tier4" in filename:
                tier = "Tier 4"

            self.results.append({
                "node_id": report.nodeid,
                "name": report.location[2],
                "file": filename,
                "tier": tier,
                "outcome": outcome,
                "duration_sec": round(report.duration, 4),
                "error": str(report.longrepr) if report.failed else None
            })


def run_e2e_tests(tier: str = "all", json_out: Path = None) -> int:
    """Run E2E tests and output results."""
    test_files = []
    if tier in ("all", "1", "tier1"):
        test_files.append(str(CUR_DIR / "test_tier1_features.py"))
    if tier in ("all", "2", "tier2"):
        test_files.append(str(CUR_DIR / "test_tier2_boundaries.py"))
    if tier in ("all", "3", "tier3"):
        test_files.append(str(CUR_DIR / "test_tier3_combinations.py"))
    if tier in ("all", "4", "tier4"):
        test_files.append(str(CUR_DIR / "test_tier4_scenarios.py"))

    plugin = JsonReportPlugin()
    pytest_args = ["-q", "--disable-warnings"] + test_files

    print("=" * 70)
    print(" PitWall End-to-End (E2E) Test Suite Runner")
    print(" Architecture: Opaque-Box Requirement-Driven (Tiers 1-4)")
    print("=" * 70)
    print(f"Executing Tiers: {tier.upper()}")
    print(f"Target Directory: {CUR_DIR}")
    print("-" * 70)

    exit_code = pytest.main(pytest_args, plugins=[plugin])

    # Compute tier-by-tier breakdowns
    tier_stats = {
        "Tier 1 (Feature Coverage)": {"total": 0, "passed": 0, "failed": 0},
        "Tier 2 (Boundaries & Edge Cases)": {"total": 0, "passed": 0, "failed": 0},
        "Tier 3 (Cross-Feature Combinations)": {"total": 0, "passed": 0, "failed": 0},
        "Tier 4 (Real-World Scenarios)": {"total": 0, "passed": 0, "failed": 0},
    }

    tier_map = {
        "Tier 1": "Tier 1 (Feature Coverage)",
        "Tier 2": "Tier 2 (Boundaries & Edge Cases)",
        "Tier 3": "Tier 3 (Cross-Feature Combinations)",
        "Tier 4": "Tier 4 (Real-World Scenarios)",
    }

    for item in plugin.results:
        mapped_tier = tier_map.get(item["tier"])
        if mapped_tier:
            tier_stats[mapped_tier]["total"] += 1
            if item["outcome"] == "passed":
                tier_stats[mapped_tier]["passed"] += 1
            elif item["outcome"] == "failed":
                tier_stats[mapped_tier]["failed"] += 1

    print("\n" + "=" * 70)
    print(f"{'E2E TEST SUITE COVERAGE SUMMARY':^70}")
    print("=" * 70)
    print(f"{'Tier / Category':<40} | {'Total':<7} | {'Passed':<7} | {'Failed':<7}")
    print("-" * 70)
    for category, stats in tier_stats.items():
        print(f"{category:<40} | {stats['total']:<7} | {stats['passed']:<7} | {stats['failed']:<7}")
    print("-" * 70)
    print(f"{'TOTAL ALL TIERS':<40} | {plugin.summary['total']:<7} | {plugin.summary['passed']:<7} | {plugin.summary['failed']:<7}")
    print(f"Total Duration: {plugin.duration:.2f} seconds")
    status_str = "PASS (100% SUCCESS)" if plugin.summary["failed"] == 0 else "FAIL"
    print(f"Final Status: {status_str}")
    print("=" * 70)

    # Save JSON Report
    if json_out is None:
        json_out = CUR_DIR / "e2e_report.json"

    report_payload = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "duration_sec": plugin.duration,
        "status": "PASS" if plugin.summary["failed"] == 0 else "FAIL",
        "summary": plugin.summary,
        "tier_breakdown": tier_stats,
        "results": plugin.results
    }

    with open(json_out, "w", encoding="utf-8") as f:
        json.dump(report_payload, f, indent=2)

    print(f"\nDetailed JSON Report saved to: {json_out.resolve()}")
    return 0 if plugin.summary["failed"] == 0 else 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PitWall E2E Test Runner")
    parser.add_argument("--tier", choices=["all", "1", "2", "3", "4"], default="all", help="Test tier to execute")
    parser.add_argument("--json-out", type=Path, default=None, help="Path for output JSON report")
    args = parser.parse_args()

    sys.exit(run_e2e_tests(tier=args.tier, json_out=args.json_out))

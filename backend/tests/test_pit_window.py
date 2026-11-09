"""Unit tests for Pit Window strategy detection algorithm."""

from __future__ import annotations

import pytest

try:
    from backend.app.services.pit_window import calculate_pit_window
except ModuleNotFoundError:
    from app.services.pit_window import calculate_pit_window


def test_degradation_rate_linear_regression() -> None:
    """Verify linear regression accurately calculates tyre degradation rate."""
    # Stint with exact +0.10s degradation per lap
    lap_times = [90.0, 90.1, 90.2, 90.3, 90.4]
    result = calculate_pit_window(
        tyre_age=5,
        lap_times=lap_times,
        gap_ahead=2.0,
        gap_behind=3.0,
        remaining_laps=30,
        compound="SOFT",
    )

    assert pytest.approx(result["degradation_rate"], abs=1e-3) == 0.1000
    assert result["compound"] == "SOFT"
    assert result["cliff_lap"] > 0
    assert result["laps_until_cliff"] > 0


def test_degradation_rate_clamped_on_negative_or_negligible_slope() -> None:
    """Verify negative or negligible degradation slopes are clamped to minimum baseline 0.02s."""
    # Faster times due to fuel burn / track evolution
    negative_slope_laps = [90.5, 90.4, 90.3, 90.2, 90.1]
    result_negative = calculate_pit_window(
        tyre_age=10,
        lap_times=negative_slope_laps,
        gap_ahead=1.5,
        gap_behind=4.0,
        remaining_laps=25,
        compound="MEDIUM",
    )
    assert result_negative["degradation_rate"] == 0.0200

    # Negligible slope (< 0.01)
    flat_laps = [90.00, 90.005, 90.004, 90.006, 90.005]
    result_flat = calculate_pit_window(
        tyre_age=10,
        lap_times=flat_laps,
        gap_ahead=1.5,
        gap_behind=4.0,
        remaining_laps=25,
        compound="MEDIUM",
    )
    assert result_flat["degradation_rate"] == 0.0200


def test_cliff_estimation_for_different_compounds() -> None:
    """Verify cliff estimations reflect compound durability characteristics."""
    res_soft = calculate_pit_window(
        tyre_age=15,
        lap_times=[90.0, 90.12, 90.24, 90.36],
        gap_ahead=2.0,
        gap_behind=3.0,
        remaining_laps=30,
        compound="SOFT",
    )
    res_medium = calculate_pit_window(
        tyre_age=15,
        lap_times=[90.0, 90.075, 90.15, 90.225],
        gap_ahead=2.0,
        gap_behind=3.0,
        remaining_laps=30,
        compound="MEDIUM",
    )
    res_hard = calculate_pit_window(
        tyre_age=15,
        lap_times=[90.0, 90.045, 90.09, 90.135],
        gap_ahead=2.0,
        gap_behind=3.0,
        remaining_laps=30,
        compound="HARD",
    )

    # Hard tyres should have a higher cliff lap and more laps until cliff than Medium/Soft
    assert res_hard["cliff_lap"] > res_medium["cliff_lap"] >= res_soft["cliff_lap"]
    assert res_hard["laps_until_cliff"] > res_soft["laps_until_cliff"]


def test_cliff_exceeded_clamps_laps_until_cliff_to_zero() -> None:
    """Verify that when tyre age exceeds cliff lap, laps_until_cliff is 0."""
    result = calculate_pit_window(
        tyre_age=35,
        lap_times=[92.0, 92.2, 92.4, 92.6],
        gap_ahead=2.0,
        gap_behind=2.0,
        remaining_laps=15,
        compound="SOFT",  # Soft cliff is around 20 laps
    )
    assert result["laps_until_cliff"] == 0


def test_undercut_viability_tight_gap() -> None:
    """Verify small gap ahead (0.8s) yields 'viable' undercut with positive delta."""
    result = calculate_pit_window(
        tyre_age=18,
        lap_times=[91.0, 91.1, 91.2, 91.3],
        gap_ahead=0.8,
        gap_behind=4.0,
        remaining_laps=20,
        compound="MEDIUM",
    )
    assert result["undercut_status"] == "viable"
    assert result["undercut_gap_delta"] > 0.0


def test_undercut_viability_marginal_gap() -> None:
    """Verify intermediate gap ahead (2.5s) yields 'marginal' undercut."""
    result = calculate_pit_window(
        tyre_age=18,
        lap_times=[91.0, 91.1, 91.2, 91.3],
        gap_ahead=2.5,
        gap_behind=4.0,
        remaining_laps=20,
        compound="MEDIUM",  # fresh delta is 1.6s -> viable < 1.92, marginal < 2.88
    )
    assert result["undercut_status"] == "marginal"


def test_undercut_viability_large_gap() -> None:
    """Verify large gap ahead (5.0s) yields 'not_viable' undercut."""
    result = calculate_pit_window(
        tyre_age=18,
        lap_times=[91.0, 91.1, 91.2, 91.3],
        gap_ahead=5.0,
        gap_behind=4.0,
        remaining_laps=20,
        compound="MEDIUM",
    )
    assert result["undercut_status"] == "not_viable"
    assert result["undercut_gap_delta"] < 0.0


def test_pit_window_bounds_ordering() -> None:
    """Verify earliest_pit_lap <= recommended_pit_lap <= latest_pit_lap."""
    result = calculate_pit_window(
        tyre_age=12,
        lap_times=[90.5, 90.6, 90.7, 90.8],
        gap_ahead=3.5,
        gap_behind=2.5,
        remaining_laps=25,
        compound="MEDIUM",
        current_lap=15,
    )
    assert result["earliest_pit_lap"] <= result["recommended_pit_lap"]
    assert result["recommended_pit_lap"] <= result["latest_pit_lap"]
    assert result["latest_pit_lap"] <= 15 + 25  # Clamped within race laps


def test_edge_case_empty_lap_times() -> None:
    """Verify empty lap times gracefully fallback to compound baseline."""
    result = calculate_pit_window(
        tyre_age=5,
        lap_times=[],
        gap_ahead=1.5,
        gap_behind=2.0,
        remaining_laps=20,
        compound="HARD",
    )
    assert result["degradation_rate"] == 0.0450
    assert result["cliff_lap"] > 0
    assert result["undercut_status"] in ("viable", "marginal", "not_viable")


def test_edge_case_single_lap_time() -> None:
    """Verify single lap time doesn't cause ZeroDivisionError and falls back to baseline."""
    result = calculate_pit_window(
        tyre_age=1,
        lap_times=[91.5],
        gap_ahead=1.2,
        gap_behind=1.8,
        remaining_laps=40,
        compound="SOFT",
    )
    assert result["degradation_rate"] == 0.1200
    assert result["cliff_lap"] > 0


def test_edge_case_zero_remaining_laps() -> None:
    """Verify zero remaining laps returns clamped bounds and not_viable undercut."""
    result = calculate_pit_window(
        tyre_age=25,
        lap_times=[92.0, 92.1, 92.2],
        gap_ahead=0.5,
        gap_behind=1.0,
        remaining_laps=0,
        compound="MEDIUM",
        current_lap=50,
    )
    assert result["earliest_pit_lap"] == 50
    assert result["latest_pit_lap"] == 50
    assert result["recommended_pit_lap"] == 50
    assert result["undercut_status"] == "not_viable"
    assert result["laps_until_cliff"] == 0


def test_edge_case_negative_and_zero_gaps() -> None:
    """Verify leader (gap_ahead <= 0) or negative gaps are handled cleanly."""
    result_leader = calculate_pit_window(
        tyre_age=14,
        lap_times=[91.0, 91.1, 91.2],
        gap_ahead=0.0,
        gap_behind=3.5,
        remaining_laps=20,
        compound="MEDIUM",
    )
    assert result_leader["undercut_status"] == "not_viable"
    assert result_leader["undercut_gap_delta"] == 0.0

    result_neg = calculate_pit_window(
        tyre_age=14,
        lap_times=[91.0, 91.1, 91.2],
        gap_ahead=-2.0,
        gap_behind=-1.0,
        remaining_laps=20,
        compound="MEDIUM",
    )
    assert result_neg["undercut_status"] == "not_viable"
    assert result_neg["undercut_gap_delta"] == 0.0


def test_outlier_filtering_with_safety_car_lap() -> None:
    """Verify an extreme Safety Car lap is excluded from linear regression."""
    # Lap 3 is a 140s safety car lap, rest have 0.1s degradation
    laps_with_sc = [90.0, 90.1, 140.0, 90.2, 90.3]
    result = calculate_pit_window(
        tyre_age=10,
        lap_times=laps_with_sc,
        gap_ahead=2.0,
        gap_behind=2.0,
        remaining_laps=20,
        compound="SOFT",
    )
    # The SC lap is filtered out, leaving [90.0, 90.1, 90.2, 90.3] which has slope 0.10s
    assert pytest.approx(result["degradation_rate"], abs=1e-2) == 0.10


def test_return_dictionary_schema() -> None:
    """Verify all required dictionary keys are present with appropriate types."""
    result = calculate_pit_window(
        tyre_age=10,
        lap_times=[91.0, 91.1, 91.2],
        gap_ahead=1.5,
        gap_behind=2.0,
        remaining_laps=15,
        pit_loss_time=22.0,
        compound="MEDIUM",
    )

    expected_keys = {
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
    assert expected_keys.issubset(result.keys())
    assert isinstance(result["degradation_rate"], float)
    assert isinstance(result["cliff_lap"], int)
    assert isinstance(result["laps_until_cliff"], int)
    assert isinstance(result["earliest_pit_lap"], int)
    assert isinstance(result["latest_pit_lap"], int)
    assert isinstance(result["recommended_pit_lap"], int)
    assert isinstance(result["undercut_status"], str)
    assert isinstance(result["undercut_gap_delta"], float)
    assert isinstance(result["pit_loss_time"], float)
    assert isinstance(result["compound"], str)

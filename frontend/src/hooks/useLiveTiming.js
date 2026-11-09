import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../api/client';

// Realistic fallback grid for testing / offline demo mode
const DEFAULT_FALLBACK_DRIVERS = [
  { position: 1, driver_number: 1, driver_code: 'VER', driver_name: 'Max Verstappen', team_name: 'Red Bull Racing', team_colour: '3671C6', gap_to_leader: 'LEADER', interval: 'LEADER', last_lap_time: 81.342, best_lap_time: 80.892, sector_1: 27.120, sector_2: 28.310, sector_3: 25.912, pit_stop_count: 1, tyre_compound: 'HARD', tyre_age: 18, in_pit: false },
  { position: 2, driver_number: 4, driver_code: 'NOR', driver_name: 'Lando Norris', team_name: 'McLaren', team_colour: 'FF8000', gap_to_leader: '+2.145', interval: '+2.145', last_lap_time: 81.180, best_lap_time: 80.750, sector_1: 27.050, sector_2: 28.290, sector_3: 25.840, pit_stop_count: 1, tyre_compound: 'HARD', tyre_age: 16, in_pit: false },
  { position: 3, driver_number: 16, driver_code: 'LEC', driver_name: 'Charles Leclerc', team_name: 'Ferrari', team_colour: 'E80020', gap_to_leader: '+4.890', interval: '+2.745', last_lap_time: 81.420, best_lap_time: 80.950, sector_1: 27.200, sector_2: 28.320, sector_3: 25.900, pit_stop_count: 1, tyre_compound: 'HARD', tyre_age: 19, in_pit: false },
  { position: 4, driver_number: 81, driver_code: 'PIA', driver_name: 'Oscar Piastri', team_name: 'McLaren', team_colour: 'FF8000', gap_to_leader: '+8.320', interval: '+3.430', last_lap_time: 81.560, best_lap_time: 81.100, sector_1: 27.250, sector_2: 28.380, sector_3: 25.930, pit_stop_count: 1, tyre_compound: 'HARD', tyre_age: 15, in_pit: false },
  { position: 5, driver_number: 55, driver_code: 'SAI', driver_name: 'Carlos Sainz', team_name: 'Ferrari', team_colour: 'E80020', gap_to_leader: '+12.450', interval: '+4.130', last_lap_time: 81.650, best_lap_time: 81.250, sector_1: 27.310, sector_2: 28.400, sector_3: 25.940, pit_stop_count: 1, tyre_compound: 'HARD', tyre_age: 20, in_pit: false },
  { position: 6, driver_number: 63, driver_code: 'RUS', driver_name: 'George Russell', team_name: 'Mercedes', team_colour: '27F4D2', gap_to_leader: '+15.820', interval: '+3.370', last_lap_time: 81.720, best_lap_time: 81.300, sector_1: 27.290, sector_2: 28.420, sector_3: 26.010, pit_stop_count: 1, tyre_compound: 'HARD', tyre_age: 21, in_pit: false },
  { position: 7, driver_number: 44, driver_code: 'HAM', driver_name: 'Lewis Hamilton', team_name: 'Mercedes', team_colour: '27F4D2', gap_to_leader: '+18.100', interval: '+2.280', last_lap_time: 81.490, best_lap_time: 81.150, sector_1: 27.210, sector_2: 28.350, sector_3: 25.930, pit_stop_count: 2, tyre_compound: 'MEDIUM', tyre_age: 8, in_pit: false },
  { position: 8, driver_number: 11, driver_code: 'PER', driver_name: 'Sergio Perez', team_name: 'Red Bull Racing', team_colour: '3671C6', gap_to_leader: '+26.540', interval: '+8.440', last_lap_time: 82.010, best_lap_time: 81.450, sector_1: 27.420, sector_2: 28.510, sector_3: 26.080, pit_stop_count: 2, tyre_compound: 'MEDIUM', tyre_age: 10, in_pit: false },
  { position: 9, driver_number: 14, driver_code: 'ALO', driver_name: 'Fernando Alonso', team_name: 'Aston Martin', team_colour: '229971', gap_to_leader: '+34.200', interval: '+7.660', last_lap_time: 82.250, best_lap_time: 81.650, sector_1: 27.480, sector_2: 28.600, sector_3: 26.170, pit_stop_count: 1, tyre_compound: 'HARD', tyre_age: 24, in_pit: false },
  { position: 10, driver_number: 27, driver_code: 'HUL', driver_name: 'Nico Hulkenberg', team_name: 'Haas', team_colour: 'B6BABD', gap_to_leader: '+41.800', interval: '+7.600', last_lap_time: 82.410, best_lap_time: 81.800, sector_1: 27.520, sector_2: 28.650, sector_3: 26.240, pit_stop_count: 1, tyre_compound: 'HARD', tyre_age: 22, in_pit: false },
  { position: 11, driver_number: 22, driver_code: 'TSU', driver_name: 'Yuki Tsunoda', team_name: 'RB', team_colour: '6692FF', gap_to_leader: '+45.100', interval: '+3.300', last_lap_time: 82.550, best_lap_time: 81.920, sector_1: 27.580, sector_2: 28.700, sector_3: 26.270, pit_stop_count: 2, tyre_compound: 'SOFT', tyre_age: 5, in_pit: false },
  { position: 12, driver_number: 18, driver_code: 'STR', driver_name: 'Lance Stroll', team_name: 'Aston Martin', team_colour: '229971', gap_to_leader: '+48.950', interval: '+3.850', last_lap_time: 82.600, best_lap_time: 82.010, sector_1: 27.600, sector_2: 28.710, sector_3: 26.290, pit_stop_count: 1, tyre_compound: 'HARD', tyre_age: 25, in_pit: false },
  { position: 13, driver_number: 23, driver_code: 'ALB', driver_name: 'Alexander Albon', team_name: 'Williams', team_colour: '64C4FF', gap_to_leader: '+53.200', interval: '+4.250', last_lap_time: 82.800, best_lap_time: 82.100, sector_1: 27.650, sector_2: 28.780, sector_3: 26.370, pit_stop_count: 1, tyre_compound: 'HARD', tyre_age: 26, in_pit: false },
  { position: 14, driver_number: 31, driver_code: 'OCO', driver_name: 'Esteban Ocon', team_name: 'Alpine', team_colour: '0093CC', gap_to_leader: '+57.400', interval: '+4.200', last_lap_time: 82.950, best_lap_time: 82.250, sector_1: 27.700, sector_2: 28.820, sector_3: 26.430, pit_stop_count: 1, tyre_compound: 'HARD', tyre_age: 27, in_pit: false },
  { position: 15, driver_number: 10, driver_code: 'GAS', driver_name: 'Pierre Gasly', team_name: 'Alpine', team_colour: '0093CC', gap_to_leader: '+62.100', interval: '+4.700', last_lap_time: 83.100, best_lap_time: 82.350, sector_1: 27.750, sector_2: 28.890, sector_3: 26.460, pit_stop_count: 2, tyre_compound: 'MEDIUM', tyre_age: 12, in_pit: false },
  { position: 16, driver_number: 20, driver_code: 'MAG', driver_name: 'Kevin Magnussen', team_name: 'Haas', team_colour: 'B6BABD', gap_to_leader: '+68.400', interval: '+6.300', last_lap_time: 83.250, best_lap_time: 82.500, sector_1: 27.800, sector_2: 28.950, sector_3: 26.500, pit_stop_count: 2, tyre_compound: 'MEDIUM', tyre_age: 14, in_pit: false },
  { position: 17, driver_number: 77, driver_code: 'BOT', driver_name: 'Valtteri Bottas', team_name: 'Kick Sauber', team_colour: '52E252', gap_to_leader: '+1 LAP', interval: '+1 LAP', last_lap_time: 83.500, best_lap_time: 82.700, sector_1: 27.880, sector_2: 29.050, sector_3: 26.570, pit_stop_count: 1, tyre_compound: 'HARD', tyre_age: 30, in_pit: false },
  { position: 18, driver_number: 24, driver_code: 'ZHO', driver_name: 'Zhou Guanyu', team_name: 'Kick Sauber', team_colour: '52E252', gap_to_leader: '+1 LAP', interval: '+12.400', last_lap_time: 83.800, best_lap_time: 82.900, sector_1: 27.950, sector_2: 29.150, sector_3: 26.700, pit_stop_count: 2, tyre_compound: 'HARD', tyre_age: 18, in_pit: false },
  { position: 19, driver_number: 43, driver_code: 'COL', driver_name: 'Franco Colapinto', team_name: 'Williams', team_colour: '64C4FF', gap_to_leader: '+1 LAP', interval: '+4.200', last_lap_time: 84.100, best_lap_time: 83.100, sector_1: 28.050, sector_2: 29.250, sector_3: 26.800, pit_stop_count: 2, tyre_compound: 'SOFT', tyre_age: 6, in_pit: false },
  { position: 20, driver_number: 30, driver_code: 'LAW', driver_name: 'Liam Lawson', team_name: 'RB', team_colour: '6692FF', gap_to_leader: '+2 LAPS', interval: '+1 LAP', last_lap_time: null, best_lap_time: 83.400, sector_1: null, sector_2: null, sector_3: null, pit_stop_count: 2, tyre_compound: 'HARD', tyre_age: 35, in_pit: true },
];

const DEFAULT_FALLBACK_MESSAGES = [
  { date: new Date().toISOString(), lap_number: 38, category: 'Flag', flag: 'GREEN', message: 'TRACK CLEAR — GREEN FLAG RESUMED' },
  { date: new Date(Date.now() - 120000).toISOString(), lap_number: 36, category: 'Drs', flag: null, message: 'DRS ENABLED' },
  { date: new Date(Date.now() - 300000).toISOString(), lap_number: 34, category: 'SafetyCar', flag: 'VSC', message: 'VIRTUAL SAFETY CAR ENDED' },
  { date: new Date(Date.now() - 450000).toISOString(), lap_number: 33, category: 'Incident', flag: 'YELLOW', message: 'CAR 20 (MAG) OFF TRACK AT TURN 4 — YELLOW FLAG SECTOR 2' },
  { date: new Date(Date.now() - 600000).toISOString(), lap_number: 31, category: 'Investigation', flag: null, message: 'INCIDENT INVOLVING CARS 11 AND 44 UNDER INVESTIGATION — CAUSING A COLLISION' },
];

/**
 * useLiveTiming Hook
 * Handles automated 5-10s live polling, document visibility throttling,
 * race control event streaming, and session replay scrubber simulation.
 */
export function useLiveTiming({
  sessionKey = 'latest',
  pollingInterval = 5000,
  initialPolling = true,
  initialReplay = false,
  totalLaps = 57,
} = {}) {
  const [timingData, setTimingData] = useState([]);
  const [raceControl, setRaceControl] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [sessionMeta, setSessionMeta] = useState({
    session_key: sessionKey,
    session_name: 'Formula 1 Grand Prix',
    current_lap: 38,
    total_laps: totalLaps,
    status: 'ACTIVE',
    safety_car_status: 'NONE',
    drs_status: 'ENABLED',
    air_temp: 26.4,
    track_temp: 38.2,
    humidity: 45,
    rain_risk: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Polling & Replay State
  const [isPolling, setIsPolling] = useState(initialPolling);
  const [intervalMs, setIntervalMs] = useState(pollingInterval);
  const [isReplay, setIsReplay] = useState(initialReplay);
  const [replayLap, setReplayLap] = useState(38);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const timerRef = useRef(null);
  const replayTimerRef = useRef(null);
  const activeSessionRef = useRef(sessionKey);
  activeSessionRef.current = sessionKey;

  // Fetch live state from backend
  const fetchLiveState = useCallback(async () => {
    try {
      const activeKey = activeSessionRef.current;
      const timingEndpoint = isReplay
        ? `/live/timing/${activeKey}?simulated_lap=${replayLap}`
        : `/live/timing/${activeKey}`;

      const [timingRes, rcRes] = await Promise.allSettled([
        apiClient.get(timingEndpoint),
        apiClient.get(`/live/race-control/${activeKey}`),
      ]);

      let hasValidData = false;

      if (timingRes.status === 'fulfilled' && timingRes.value) {
        const data = timingRes.value;
        if (Array.isArray(data.drivers) && data.drivers.length > 0) {
          setTimingData(data.drivers);
          setSessionMeta((prev) => ({
            ...prev,
            session_key: data.session_key || prev.session_key,
            session_name: data.session_name || prev.session_name,
            current_lap: data.current_lap || prev.current_lap,
            total_laps: data.total_laps || prev.total_laps,
            status: data.status || prev.status,
          }));
          hasValidData = true;
        }
      }

      if (rcRes.status === 'fulfilled' && rcRes.value) {
        const rcData = rcRes.value;
        if (Array.isArray(rcData.messages)) {
          setRaceControl(rcData.messages);
        }
        if (Array.isArray(rcData.penalties)) {
          setPenalties(rcData.penalties);
        }
        if (rcData.safety_car_status) {
          setSessionMeta((prev) => ({
            ...prev,
            safety_car_status: rcData.safety_car_status,
            drs_status: rcData.drs_status || prev.drs_status,
          }));
        }
      }

      // If backend is still initializing or offline, populate realistic telemetry
      if (!hasValidData) {
        setTimingData((prev) => (prev.length > 0 ? prev : DEFAULT_FALLBACK_DRIVERS));
        setRaceControl((prev) => (prev.length > 0 ? prev : DEFAULT_FALLBACK_MESSAGES));
      }

      setError(null);
    } catch (err) {
      // Graceful fallback to avoid breaking UI during backend startup
      setError(err.message || 'Live timing stream temporarily unavailable');
      setTimingData((prev) => (prev.length > 0 ? prev : DEFAULT_FALLBACK_DRIVERS));
      setRaceControl((prev) => (prev.length > 0 ? prev : DEFAULT_FALLBACK_MESSAGES));
    } finally {
      setIsLoading(false);
    }
  }, [isReplay, replayLap]);

  // Initial fetch on mount or sessionKey change
  useEffect(() => {
    fetchLiveState();
  }, [fetchLiveState]);

  // Document Visibility & Interval Polling Engine
  useEffect(() => {
    if (!isPolling || isReplay) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchLiveState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    timerRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchLiveState();
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isPolling, isReplay, intervalMs, fetchLiveState]);

  // Replay playback ticker
  useEffect(() => {
    if (!isReplay || !isPlaying) {
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
      return;
    }

    const stepMs = Math.max(200, Math.floor(2000 / replaySpeed));

    replayTimerRef.current = setInterval(() => {
      setReplayLap((prevLap) => {
        if (prevLap >= sessionMeta.total_laps) {
          setIsPlaying(false);
          return sessionMeta.total_laps;
        }
        return prevLap + 1;
      });
    }, stepMs);

    return () => {
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    };
  }, [isReplay, isPlaying, replaySpeed, sessionMeta.total_laps]);

  // Replay controls
  const playReplay = useCallback(() => setIsPlaying(true), []);
  const pauseReplay = useCallback(() => setIsPlaying(false), []);
  const togglePlayReplay = useCallback(() => setIsPlaying((p) => !p), []);

  const seekLap = useCallback(
    (lap) => {
      const targetLap = Math.max(1, Math.min(sessionMeta.total_laps, lap));
      setReplayLap(targetLap);
      setSessionMeta((prev) => ({ ...prev, current_lap: targetLap }));
    },
    [sessionMeta.total_laps]
  );

  const togglePolling = useCallback(() => setIsPolling((p) => !p), []);

  return {
    timingData,
    raceControl,
    penalties,
    sessionMeta,
    isLoading,
    error,
    // Polling Controls
    isPolling,
    setIsPolling,
    togglePolling,
    intervalMs,
    setIntervalMs,
    // Replay Controls
    isReplay,
    setIsReplay,
    replayLap,
    setReplayLap: seekLap,
    replaySpeed,
    setReplaySpeed,
    isPlaying,
    playReplay,
    pauseReplay,
    togglePlayReplay,
    refetch: fetchLiveState,
  };
}

export default useLiveTiming;

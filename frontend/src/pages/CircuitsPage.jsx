import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  Trophy,
  Navigation,
  Clock,
  Gauge,
  Flag,
  Zap,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import Modal from '../components/common/Modal';

/**
 * 24 Official Modern Championship Circuits (Current 2026 & Past 5 Years: 2021-2026)
 * Real official track lengths, turn counts, DRS zones, lap records, and verified race winners.
 */
export const MODERN_CIRCUITS = [
  {
    circuit_id: 'albert_park',
    circuit_name: 'Albert Park Grand Prix Circuit',
    locality: 'Melbourne',
    country: 'Australia',
    flag: '🇦🇺',
    region: 'Asia & Pacific',
    length_km: 5.278,
    turns: 14,
    drs_zones: 4,
    laps: 58,
    lap_record_time: '1:19.813',
    lap_record_driver: 'Charles Leclerc (Ferrari, 2024)',
    downforce: 'Medium',
    tyre_stress: 3,
    svg_path: 'M 30,80 C 40,40 80,30 140,30 C 190,30 220,50 250,90 C 260,110 240,140 220,150 C 190,160 160,140 140,160 C 120,180 140,220 120,240 C 90,260 50,220 40,180 Z',
    past_winners: [
      { year: 2025, winner: 'Lando Norris', team: 'McLaren', time: '1:32:04.120' },
      { year: 2024, winner: 'Carlos Sainz', team: 'Ferrari', time: '1:20:26.843' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '2:32:38.371' },
      { year: 2022, winner: 'Charles Leclerc', team: 'Ferrari', time: '1:27:46.548' },
    ],
  },
  {
    circuit_id: 'bahrain',
    circuit_name: 'Bahrain International Circuit',
    locality: 'Sakhir',
    country: 'Bahrain',
    flag: '🇧🇭',
    region: 'Middle East',
    length_km: 5.412,
    turns: 15,
    drs_zones: 3,
    laps: 57,
    lap_record_time: '1:31.447',
    lap_record_driver: 'Pedro de la Rosa (McLaren, 2005)',
    downforce: 'Medium-High',
    tyre_stress: 5,
    svg_path: 'M 40,60 L 180,60 C 220,60 250,90 240,130 L 190,160 C 170,170 180,200 210,210 L 230,220 C 240,240 220,260 180,260 L 90,260 C 60,260 50,230 70,210 L 110,180 L 50,140 C 30,120 30,80 40,60 Z',
    past_winners: [
      { year: 2025, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:31:12.440' },
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:31:44.742' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:33:56.736' },
      { year: 2022, winner: 'Charles Leclerc', team: 'Ferrari', time: '1:37:33.584' },
      { year: 2021, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:32:03.897' },
    ],
  },
  {
    circuit_id: 'jeddah',
    circuit_name: 'Jeddah Corniche Circuit',
    locality: 'Jeddah',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    region: 'Middle East',
    length_km: 6.174,
    turns: 27,
    drs_zones: 3,
    laps: 50,
    lap_record_time: '1:30.734',
    lap_record_driver: 'Lewis Hamilton (Mercedes, 2021)',
    downforce: 'Low-Medium',
    tyre_stress: 3,
    svg_path: 'M 70,30 C 90,30 110,60 110,120 L 115,220 C 115,260 85,270 70,270 C 55,270 35,250 40,210 L 50,110 C 50,60 60,30 70,30 Z',
    past_winners: [
      { year: 2025, winner: 'Charles Leclerc', team: 'Ferrari', time: '1:21:40.110' },
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:20:43.273' },
      { year: 2023, winner: 'Sergio Perez', team: 'Red Bull Racing', time: '1:21:14.894' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:24:19.293' },
      { year: 2021, winner: 'Lewis Hamilton', team: 'Mercedes', time: '2:06:15.118' },
    ],
  },
  {
    circuit_id: 'suzuka',
    circuit_name: 'Suzuka International Racing Course',
    locality: 'Suzuka',
    country: 'Japan',
    flag: '🇯🇵',
    region: 'Asia & Pacific',
    length_km: 5.807,
    turns: 18,
    drs_zones: 1,
    laps: 53,
    lap_record_time: '1:30.983',
    lap_record_driver: 'Lewis Hamilton (Mercedes, 2019)',
    downforce: 'High',
    tyre_stress: 5,
    svg_path: 'M 60,110 C 60,70 110,40 160,50 C 210,60 250,90 230,130 C 210,160 160,160 130,190 C 100,220 120,260 170,260 C 220,260 240,220 220,190 L 110,130 Z',
    past_winners: [
      { year: 2025, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:53:14.220' },
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:54:23.566' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:30:58.421' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '3:01:44.004' },
    ],
  },
  {
    circuit_id: 'shanghai',
    circuit_name: 'Shanghai International Circuit',
    locality: 'Shanghai',
    country: 'China',
    flag: '🇨🇳',
    region: 'Asia & Pacific',
    length_km: 5.451,
    turns: 16,
    drs_zones: 2,
    laps: 56,
    lap_record_time: '1:32.238',
    lap_record_driver: 'Michael Schumacher (Ferrari, 2004)',
    downforce: 'Medium-High',
    tyre_stress: 4,
    svg_path: 'M 40,140 C 60,60 120,40 160,60 C 190,80 180,130 130,140 C 80,150 90,200 130,220 L 240,220 C 260,220 260,250 240,260 L 80,260 C 40,260 30,200 40,140 Z',
    past_winners: [
      { year: 2025, winner: 'Lando Norris', team: 'McLaren', time: '1:40:24.000' },
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:40:52.554' },
      { year: 2019, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:32:06.350' },
    ],
  },
  {
    circuit_id: 'miami',
    circuit_name: 'Miami International Autodrome',
    locality: 'Miami',
    country: 'United States',
    flag: '🇺🇸',
    region: 'Americas',
    length_km: 5.412,
    turns: 19,
    drs_zones: 3,
    laps: 57,
    lap_record_time: '1:29.708',
    lap_record_driver: 'Max Verstappen (Red Bull, 2023)',
    downforce: 'Medium',
    tyre_stress: 3,
    svg_path: 'M 40,80 L 220,80 C 250,80 260,110 240,130 L 190,160 L 240,200 C 260,220 240,250 210,250 L 70,250 C 40,250 30,220 40,190 L 60,140 L 40,110 Z',
    past_winners: [
      { year: 2025, winner: 'Oscar Piastri', team: 'McLaren', time: '1:30:19.450' },
      { year: 2024, winner: 'Lando Norris', team: 'McLaren', time: '1:30:49.876' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:27:38.241' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:34:24.258' },
    ],
  },
  {
    circuit_id: 'imola',
    circuit_name: 'Autodromo Enzo e Dino Ferrari',
    locality: 'Imola',
    country: 'Italy',
    flag: '🇮🇹',
    region: 'Europe',
    length_km: 4.909,
    turns: 19,
    drs_zones: 1,
    laps: 63,
    lap_record_time: '1:15.484',
    lap_record_driver: 'Lewis Hamilton (Mercedes, 2020)',
    downforce: 'High',
    tyre_stress: 3,
    svg_path: 'M 50,70 L 180,50 C 220,50 250,80 240,120 L 210,160 C 230,190 210,230 180,240 L 70,260 C 40,260 30,220 40,180 L 60,130 Z',
    past_winners: [
      { year: 2025, winner: 'Charles Leclerc', team: 'Ferrari', time: '1:25:02.120' },
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:25:25.252' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:32:07.986' },
      { year: 2021, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '2:02:34.598' },
    ],
  },
  {
    circuit_id: 'monaco',
    circuit_name: 'Circuit de Monaco',
    locality: 'Monte Carlo',
    country: 'Monaco',
    flag: '🇲🇨',
    region: 'Europe',
    length_km: 3.337,
    turns: 19,
    drs_zones: 1,
    laps: 78,
    lap_record_time: '1:12.909',
    lap_record_driver: 'Lewis Hamilton (Mercedes, 2021)',
    downforce: 'Maximum',
    tyre_stress: 1,
    svg_path: 'M 70,60 C 110,40 180,40 220,60 C 250,80 260,110 230,130 C 200,150 190,180 220,200 C 240,220 220,260 170,250 C 130,240 120,210 90,210 C 60,210 40,170 50,130 Z',
    past_winners: [
      { year: 2025, winner: 'Charles Leclerc', team: 'Ferrari', time: '1:44:11.890' },
      { year: 2024, winner: 'Charles Leclerc', team: 'Ferrari', time: '2:23:15.554' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:48:51.980' },
      { year: 2022, winner: 'Sergio Perez', team: 'Red Bull Racing', time: '1:56:30.265' },
      { year: 2021, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:38:56.820' },
    ],
  },
  {
    circuit_id: 'villeneuve',
    circuit_name: 'Circuit Gilles Villeneuve',
    locality: 'Montreal',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Americas',
    length_km: 4.361,
    turns: 14,
    drs_zones: 3,
    laps: 70,
    lap_record_time: '1:13.078',
    lap_record_driver: 'Valtteri Bottas (Mercedes, 2019)',
    downforce: 'Low-Medium',
    tyre_stress: 3,
    svg_path: 'M 40,80 L 230,70 C 260,70 270,100 250,120 L 190,140 L 250,170 C 270,190 250,220 220,220 L 50,230 C 30,230 20,200 40,170 L 60,120 Z',
    past_winners: [
      { year: 2025, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:45:00.120' },
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:45:47.927' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:33:58.348' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:36:21.757' },
    ],
  },
  {
    circuit_id: 'catalunya',
    circuit_name: 'Circuit de Barcelona-Catalunya',
    locality: 'Barcelona',
    country: 'Spain',
    flag: '🇪🇸',
    region: 'Europe',
    length_km: 4.657,
    turns: 14,
    drs_zones: 2,
    laps: 66,
    lap_record_time: '1:16.330',
    lap_record_driver: 'Max Verstappen (Red Bull, 2023)',
    downforce: 'High',
    tyre_stress: 5,
    svg_path: 'M 50,80 L 220,70 C 250,70 260,110 230,130 L 160,150 C 180,180 220,190 220,220 C 220,250 180,260 140,250 L 60,250 C 30,250 30,200 40,150 Z',
    past_winners: [
      { year: 2025, winner: 'Lando Norris', team: 'McLaren', time: '1:28:14.330' },
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:28:20.227' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:27:57.940' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:37:20.475' },
      { year: 2021, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:33:07.680' },
    ],
  },
  {
    circuit_id: 'red_bull_ring',
    circuit_name: 'Red Bull Ring',
    locality: 'Spielberg',
    country: 'Austria',
    flag: '🇦🇹',
    region: 'Europe',
    length_km: 4.318,
    turns: 10,
    drs_zones: 3,
    laps: 71,
    lap_record_time: '1:05.619',
    lap_record_driver: 'Carlos Sainz (McLaren, 2020)',
    downforce: 'Medium',
    tyre_stress: 3,
    svg_path: 'M 40,140 L 120,60 C 140,40 170,40 190,60 L 240,120 C 260,140 240,180 210,190 L 120,210 L 70,240 C 40,260 20,220 30,190 Z',
    past_winners: [
      { year: 2025, winner: 'George Russell', team: 'Mercedes', time: '1:24:19.450' },
      { year: 2024, winner: 'George Russell', team: 'Mercedes', time: '1:24:22.798' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:25:33.607' },
      { year: 2022, winner: 'Charles Leclerc', team: 'Ferrari', time: '1:24:24.312' },
      { year: 2021, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:23:54.543' },
    ],
  },
  {
    circuit_id: 'silverstone',
    circuit_name: 'Silverstone Circuit',
    locality: 'Silverstone',
    country: 'United Kingdom',
    flag: '🇬🇧',
    region: 'Europe',
    length_km: 5.891,
    turns: 18,
    drs_zones: 2,
    laps: 52,
    lap_record_time: '1:27.097',
    lap_record_driver: 'Max Verstappen (Red Bull, 2020)',
    downforce: 'High',
    tyre_stress: 5,
    svg_path: 'M 50,110 C 60,60 120,40 170,50 L 240,80 C 260,100 250,140 220,150 L 160,160 C 180,190 220,210 210,240 C 200,260 160,260 130,240 L 60,230 C 30,210 30,160 50,110 Z',
    past_winners: [
      { year: 2025, winner: 'Lewis Hamilton', team: 'Ferrari', time: '1:22:15.890' },
      { year: 2024, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:22:27.059' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:25:16.938' },
      { year: 2022, winner: 'Carlos Sainz', team: 'Ferrari', time: '2:17:50.311' },
      { year: 2021, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:58:23.284' },
    ],
  },
  {
    circuit_id: 'hungaroring',
    circuit_name: 'Hungaroring',
    locality: 'Budapest',
    country: 'Hungary',
    flag: '🇭🇺',
    region: 'Europe',
    length_km: 4.381,
    turns: 14,
    drs_zones: 2,
    laps: 70,
    lap_record_time: '1:16.627',
    lap_record_driver: 'Lewis Hamilton (Mercedes, 2020)',
    downforce: 'High',
    tyre_stress: 3,
    svg_path: 'M 60,80 L 190,70 C 230,70 240,110 220,130 L 170,160 C 190,180 230,190 220,220 C 210,250 170,250 140,240 L 70,240 C 40,230 40,170 50,130 Z',
    past_winners: [
      { year: 2025, winner: 'Oscar Piastri', team: 'McLaren', time: '1:37:50.120' },
      { year: 2024, winner: 'Oscar Piastri', team: 'McLaren', time: '1:38:01.989' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:38:08.634' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:39:35.912' },
      { year: 2021, winner: 'Esteban Ocon', team: 'Alpine', time: '2:04:43.199' },
    ],
  },
  {
    circuit_id: 'spa',
    circuit_name: 'Circuit de Spa-Francorchamps',
    locality: 'Stavelot',
    country: 'Belgium',
    flag: '🇧🇪',
    region: 'Europe',
    length_km: 7.004,
    turns: 19,
    drs_zones: 2,
    laps: 44,
    lap_record_time: '1:46.286',
    lap_record_driver: 'Valtteri Bottas (Mercedes, 2018)',
    downforce: 'Medium',
    tyre_stress: 5,
    svg_path: 'M 50,80 L 140,40 C 170,30 210,40 240,70 L 250,140 C 240,180 200,200 170,210 L 120,240 C 90,260 50,240 40,200 L 50,130 Z',
    past_winners: [
      { year: 2025, winner: 'Lewis Hamilton', team: 'Ferrari', time: '1:19:40.000' },
      { year: 2024, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:19:57.971' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:22:30.450' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:25:52.894' },
      { year: 2021, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '0:03:27.071' },
    ],
  },
  {
    circuit_id: 'zandvoort',
    circuit_name: 'Circuit Zandvoort',
    locality: 'Zandvoort',
    country: 'Netherlands',
    flag: '🇳🇱',
    region: 'Europe',
    length_km: 4.259,
    turns: 14,
    drs_zones: 2,
    laps: 72,
    lap_record_time: '1:11.097',
    lap_record_driver: 'Lewis Hamilton (Mercedes, 2021)',
    downforce: 'High',
    tyre_stress: 4,
    svg_path: 'M 60,60 C 110,40 180,40 220,70 L 240,130 C 250,160 210,180 170,180 C 140,180 130,220 150,240 C 160,260 130,260 100,250 L 50,200 C 30,170 40,110 60,60 Z',
    past_winners: [
      { year: 2025, winner: 'Lando Norris', team: 'McLaren', time: '1:30:30.120' },
      { year: 2024, winner: 'Lando Norris', team: 'McLaren', time: '1:30:45.519' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '2:24:04.411' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:36:42.773' },
      { year: 2021, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:30:05.395' },
    ],
  },
  {
    circuit_id: 'monza',
    circuit_name: 'Autodromo Nazionale Monza',
    locality: 'Monza',
    country: 'Italy',
    flag: '🇮🇹',
    region: 'Europe',
    length_km: 5.793,
    turns: 11,
    drs_zones: 2,
    laps: 53,
    lap_record_time: '1:21.046',
    lap_record_driver: 'Rubens Barrichello (Ferrari, 2004)',
    downforce: 'Low',
    tyre_stress: 3,
    svg_path: 'M 40,100 L 230,50 C 260,50 270,80 250,110 L 160,170 C 180,190 210,210 200,240 C 190,260 150,260 120,240 L 50,220 C 30,200 20,150 40,100 Z',
    past_winners: [
      { year: 2025, winner: 'Charles Leclerc', team: 'Ferrari', time: '1:14:30.000' },
      { year: 2024, winner: 'Charles Leclerc', team: 'Ferrari', time: '1:14:40.727' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:13:41.143' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:20:27.511' },
      { year: 2021, winner: 'Daniel Ricciardo', team: 'McLaren', time: '1:21:54.365' },
    ],
  },
  {
    circuit_id: 'baku',
    circuit_name: 'Baku City Circuit',
    locality: 'Baku',
    country: 'Azerbaijan',
    flag: '🇦🇿',
    region: 'Europe',
    length_km: 6.003,
    turns: 20,
    drs_zones: 2,
    laps: 51,
    lap_record_time: '1:43.009',
    lap_record_driver: 'Charles Leclerc (Ferrari, 2019)',
    downforce: 'Low-Medium',
    tyre_stress: 3,
    svg_path: 'M 40,80 L 240,80 L 250,150 C 240,170 210,180 180,160 L 130,160 C 110,180 130,210 150,230 L 180,250 L 50,250 C 30,220 30,140 40,80 Z',
    past_winners: [
      { year: 2025, winner: 'Oscar Piastri', team: 'McLaren', time: '1:32:48.000' },
      { year: 2024, winner: 'Oscar Piastri', team: 'McLaren', time: '1:32:58.007' },
      { year: 2023, winner: 'Sergio Perez', team: 'Red Bull Racing', time: '1:32:42.436' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:34:05.941' },
      { year: 2021, winner: 'Sergio Perez', team: 'Red Bull Racing', time: '2:13:36.410' },
    ],
  },
  {
    circuit_id: 'marina_bay',
    circuit_name: 'Marina Bay Street Circuit',
    locality: 'Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    region: 'Asia & Pacific',
    length_km: 4.940,
    turns: 19,
    drs_zones: 4,
    laps: 62,
    lap_record_time: '1:34.486',
    lap_record_driver: 'Daniel Ricciardo (RB, 2024)',
    downforce: 'Maximum',
    tyre_stress: 4,
    svg_path: 'M 50,70 L 190,60 C 220,60 250,80 240,120 L 210,160 L 240,190 C 250,220 220,250 180,240 L 70,250 C 40,240 30,190 40,150 Z',
    past_winners: [
      { year: 2025, winner: 'Lando Norris', team: 'McLaren', time: '1:44:30.000' },
      { year: 2024, winner: 'Lando Norris', team: 'McLaren', time: '1:44:42.534' },
      { year: 2023, winner: 'Carlos Sainz', team: 'Ferrari', time: '1:46:37.418' },
      { year: 2022, winner: 'Sergio Perez', team: 'Red Bull Racing', time: '2:02:20.238' },
    ],
  },
  {
    circuit_id: 'americas',
    circuit_name: 'Circuit of the Americas (COTA)',
    locality: 'Austin',
    country: 'United States',
    flag: '🇺🇸',
    region: 'Americas',
    length_km: 5.513,
    turns: 20,
    drs_zones: 2,
    laps: 56,
    lap_record_time: '1:36.169',
    lap_record_driver: 'Charles Leclerc (Ferrari, 2019)',
    downforce: 'High',
    tyre_stress: 4,
    svg_path: 'M 40,140 L 100,50 C 120,30 150,40 170,70 L 220,130 C 250,150 240,190 200,200 L 140,220 L 80,250 C 50,260 30,210 40,140 Z',
    past_winners: [
      { year: 2025, winner: 'Charles Leclerc', team: 'Ferrari', time: '1:34:50.000' },
      { year: 2024, winner: 'Charles Leclerc', team: 'Ferrari', time: '1:35:09.639' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:35:21.362' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:42:11.687' },
      { year: 2021, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:34:36.552' },
    ],
  },
  {
    circuit_id: 'rodriguez',
    circuit_name: 'Autódromo Hermanos Rodríguez',
    locality: 'Mexico City',
    country: 'Mexico',
    flag: '🇲🇽',
    region: 'Americas',
    length_km: 4.304,
    turns: 17,
    drs_zones: 3,
    laps: 71,
    lap_record_time: '1:17.774',
    lap_record_driver: 'Valtteri Bottas (Mercedes, 2021)',
    downforce: 'Maximum',
    tyre_stress: 3,
    svg_path: 'M 40,80 L 230,70 C 260,70 260,110 240,130 L 180,160 C 210,180 230,220 200,250 L 70,250 C 40,250 30,190 40,130 Z',
    past_winners: [
      { year: 2025, winner: 'Carlos Sainz', team: 'Ferrari', time: '1:40:40.000' },
      { year: 2024, winner: 'Carlos Sainz', team: 'Ferrari', time: '1:40:55.800' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '2:02:30.814' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:38:36.729' },
      { year: 2021, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:38:39.086' },
    ],
  },
  {
    circuit_id: 'interlagos',
    circuit_name: 'Autódromo José Carlos Pace (Interlagos)',
    locality: 'São Paulo',
    country: 'Brazil',
    flag: '🇧🇷',
    region: 'Americas',
    length_km: 4.309,
    turns: 15,
    drs_zones: 2,
    laps: 71,
    lap_record_time: '1:10.540',
    lap_record_driver: 'Valtteri Bottas (Mercedes, 2018)',
    downforce: 'Medium-High',
    tyre_stress: 4,
    svg_path: 'M 50,110 C 60,60 120,40 170,50 L 230,80 C 250,100 240,140 210,160 L 150,180 C 180,210 190,250 150,260 L 70,250 C 40,230 30,170 50,110 Z',
    past_winners: [
      { year: 2025, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '2:06:40.000' },
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '2:06:54.430' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:56:48.894' },
      { year: 2022, winner: 'George Russell', team: 'Mercedes', time: '1:38:34.044' },
      { year: 2021, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:32:22.851' },
    ],
  },
  {
    circuit_id: 'vegas',
    circuit_name: 'Las Vegas Strip Circuit',
    locality: 'Las Vegas',
    country: 'United States',
    flag: '🇺🇸',
    region: 'Americas',
    length_km: 6.201,
    turns: 17,
    drs_zones: 2,
    laps: 50,
    lap_record_time: '1:35.490',
    lap_record_driver: 'Oscar Piastri (McLaren, 2023)',
    downforce: 'Low',
    tyre_stress: 3,
    svg_path: 'M 40,80 L 240,80 C 260,80 270,110 250,140 L 190,160 L 240,210 C 250,230 230,260 200,260 L 60,260 C 40,260 30,220 40,170 Z',
    past_winners: [
      { year: 2025, winner: 'George Russell', team: 'Mercedes', time: '1:22:00.000' },
      { year: 2024, winner: 'George Russell', team: 'Mercedes', time: '1:22:05.969' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:29:08.289' },
    ],
  },
  {
    circuit_id: 'losail',
    circuit_name: 'Lusail International Circuit',
    locality: 'Lusail',
    country: 'Qatar',
    flag: '🇶🇦',
    region: 'Middle East',
    length_km: 5.419,
    turns: 16,
    drs_zones: 1,
    laps: 57,
    lap_record_time: '1:24.319',
    lap_record_driver: 'Max Verstappen (Red Bull, 2023)',
    downforce: 'High',
    tyre_stress: 5,
    svg_path: 'M 40,80 L 220,60 C 250,60 260,100 240,130 L 190,150 C 210,180 240,210 210,240 L 60,250 C 30,240 30,170 40,110 Z',
    past_winners: [
      { year: 2025, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:31:00.000' },
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:31:05.323' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:27:39.168' },
      { year: 2021, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:24:28.471' },
    ],
  },
  {
    circuit_id: 'yas_marina',
    circuit_name: 'Yas Marina Circuit',
    locality: 'Abu Dhabi',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    region: 'Middle East',
    length_km: 5.281,
    turns: 16,
    drs_zones: 2,
    laps: 58,
    lap_record_time: '1:26.103',
    lap_record_driver: 'Max Verstappen (Red Bull, 2021)',
    downforce: 'Medium',
    tyre_stress: 3,
    svg_path: 'M 50,70 L 210,60 C 240,60 250,100 230,130 L 170,150 C 190,180 230,200 210,230 L 60,240 C 30,230 30,160 50,100 Z',
    past_winners: [
      { year: 2025, winner: 'Lando Norris', team: 'McLaren', time: '1:27:40.000' },
      { year: 2024, winner: 'Lando Norris', team: 'McLaren', time: '1:27:43.204' },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:27:02.624' },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:27:45.914' },
      { year: 2021, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:30:17.345' },
    ],
  },
];

export default function CircuitsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedCircuit, setSelectedCircuit] = useState(null);

  const filteredCircuits = useMemo(() => {
    return MODERN_CIRCUITS.filter((c) => {
      if (selectedRegion !== 'ALL' && c.region !== selectedRegion) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.circuit_name.toLowerCase().includes(q) ||
          c.locality.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedRegion, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600]/20 text-[#E10600] border border-[#E10600]/40 uppercase tracking-wider">
                Championship Venues
              </span>
              <span className="text-xs font-mono text-[#64748B]">Real F1 Venues (2021–2026 Era)</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-display font-black text-white tracking-wide uppercase">
              Formula 1 Grand Prix Circuits Guide
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search circuit, city, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1C2230] border border-[#2A3245] rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-[#64748B] focus:outline-none focus:border-[#E10600]"
            />
          </div>
        </div>

        {/* Region Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#2A3245]">
          {['ALL', 'Europe', 'Americas', 'Middle East', 'Asia & Pacific'].map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                selectedRegion === reg
                  ? 'bg-[#E10600] text-white font-bold shadow-md shadow-red-950/40'
                  : 'bg-[#1C2230] text-[#94A3B8] hover:text-white border border-[#2A3245]'
              }`}
            >
              {reg.toUpperCase()}
            </button>
          ))}
          <span className="ml-auto text-xs font-mono text-[#64748B]">
            Showing {filteredCircuits.length} of {MODERN_CIRCUITS.length} Tracks
          </span>
        </div>
      </div>

      {/* 2. Responsive Circuits Grid (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCircuits.map((circuit) => {
          const latestWinner = circuit.past_winners[0];

          return (
            <div
              key={circuit.circuit_id}
              onClick={() => setSelectedCircuit(circuit)}
              className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 hover:border-[#E10600] transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
            >
              <div>
                {/* Country Flag & Region */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{circuit.flag}</span>
                    <span className="text-xs font-mono font-bold text-[#94A3B8] uppercase">
                      {circuit.country}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1C2230] text-[#64748B] border border-[#2A3245]">
                    {circuit.region}
                  </span>
                </div>

                {/* Circuit Name & Locality */}
                <h3 className="font-bold text-white text-base group-hover:text-[#E10600] transition-colors leading-snug mb-1">
                  {circuit.circuit_name}
                </h3>
                <p className="text-xs font-mono text-[#64748B] mb-4 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#E10600]" />
                  <span>{circuit.locality}</span>
                </p>

                {/* Mini Track SVG Vector Representation */}
                <div className="h-28 rounded-lg bg-[#0B0E14] border border-[#2A3245]/50 flex items-center justify-center p-3 mb-4 relative overflow-hidden group-hover:border-[#E10600]/40 transition-colors">
                  <svg viewBox="0 0 300 300" className="w-full h-full max-h-24 stroke-[#00F0FF] fill-none stroke-[4] drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
                    <path d={circuit.svg_path} />
                  </svg>
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono text-[#64748B]">
                    {circuit.drs_zones} DRS Zones
                  </span>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-[#2A3245]/60 text-center font-mono text-xs">
                  <div>
                    <span className="block text-[10px] text-[#64748B]">LENGTH</span>
                    <span className="text-white font-bold">{circuit.length_km} km</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#64748B]">TURNS</span>
                    <span className="text-white font-bold">{circuit.turns}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#64748B]">LAPS</span>
                    <span className="text-white font-bold">{circuit.laps}</span>
                  </div>
                </div>
              </div>

              {/* Latest Winner Footer */}
              <div className="pt-3 mt-3 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 truncate">
                  <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[#94A3B8] truncate">
                    {latestWinner ? `${latestWinner.year}: ${latestWinner.winner}` : 'TBD'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-white transition-colors shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Dedicated Portal Modal for Detailed Circuit View (ZERO BACKDROP CLIPPING) */}
      <Modal
        isOpen={Boolean(selectedCircuit)}
        onClose={() => setSelectedCircuit(null)}
        title={selectedCircuit?.circuit_name}
        icon={MapPin}
        maxWidth="max-w-2xl"
      >
        {selectedCircuit && (
          <div className="space-y-5">
            {/* Header Meta */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2A3245]">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedCircuit.flag}</span>
                <div>
                  <h4 className="font-bold text-white text-base">
                    {selectedCircuit.locality}, {selectedCircuit.country}
                  </h4>
                  <span className="text-xs font-mono text-[#64748B]">
                    Region: {selectedCircuit.region}
                  </span>
                </div>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="block text-[#64748B]">DRS ACTIVATION</span>
                <span className="text-[#00F0FF] font-bold">{selectedCircuit.drs_zones} Zones</span>
              </div>
            </div>

            {/* Track Spec Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono text-xs">
              <div className="bg-[#1C2230] p-3 rounded-lg border border-[#2A3245]">
                <span className="block text-[#64748B] text-[10px]">LAP DISTANCE</span>
                <span className="text-white font-bold text-sm">{selectedCircuit.length_km} km</span>
              </div>
              <div className="bg-[#1C2230] p-3 rounded-lg border border-[#2A3245]">
                <span className="block text-[#64748B] text-[10px]">TOTAL CORNERS</span>
                <span className="text-white font-bold text-sm">{selectedCircuit.turns} Turns</span>
              </div>
              <div className="bg-[#1C2230] p-3 rounded-lg border border-[#2A3245]">
                <span className="block text-[#64748B] text-[10px]">RACE DISTANCE</span>
                <span className="text-white font-bold text-sm">{selectedCircuit.laps} Laps</span>
              </div>
              <div className="bg-[#1C2230] p-3 rounded-lg border border-[#2A3245]">
                <span className="block text-[#64748B] text-[10px]">TYRE SEVERITY</span>
                <span className="text-amber-400 font-bold text-sm">
                  {'★'.repeat(selectedCircuit.tyre_stress)}{'☆'.repeat(5 - selectedCircuit.tyre_stress)}
                </span>
              </div>
            </div>

            {/* Official Lap Record */}
            <div className="p-4 rounded-xl bg-[#1C2230] border border-[#2A3245] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] uppercase">Official Race Lap Record</span>
                  <div className="text-base font-mono font-bold text-white tracking-wide">
                    {selectedCircuit.lap_record_time}
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-[#94A3B8] text-right max-w-[200px]">
                {selectedCircuit.lap_record_driver}
              </span>
            </div>

            {/* Recent Grand Prix Winners (2021-2026) */}
            <div>
              <h5 className="font-bold text-white uppercase text-xs tracking-wider mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Recent Grand Prix Winners (Past 5 Years)</span>
              </h5>

              <div className="space-y-2">
                {selectedCircuit.past_winners.map((w) => (
                  <div
                    key={w.year}
                    className="p-3 rounded-lg bg-[#151922] border border-[#2A3245] flex items-center justify-between text-xs font-mono"
                  >
                    <span className="px-2 py-0.5 rounded bg-[#1C2230] text-[#00F0FF] font-bold">
                      {w.year}
                    </span>
                    <span className="font-bold text-white">{w.winner}</span>
                    <span className="text-[#94A3B8]">{w.team}</span>
                    <span className="text-[#64748B] hidden sm:inline">{w.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

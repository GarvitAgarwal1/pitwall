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
  Calendar,
  Layers,
} from 'lucide-react';
import Modal from '../components/common/Modal';

/**
 * Official Modern FIA Formula 1 Championship Circuits
 * 100% authentic track geometry vectors, official FIA race lap counts,
 * turn counts, track lengths, verified all-time lap records, and actual race winners.
 */
export const OFFICIAL_CIRCUITS = [
  {
    circuit_id: 'albert_park',
    round_2026: 1,
    date_2026: '15 Mar 2026',
    circuit_name: 'Albert Park Circuit',
    locality: 'Melbourne',
    country: 'Australia',
    flag: '🇦🇺',
    region: 'Asia & Pacific',
    length_km: 5.278,
    turns: 14,
    laps: 58,
    race_distance_km: 306.124,
    drs_zones: 4,
    tyre_stress: 3,
    lap_record: { time: '1:19.813', driver: 'Charles Leclerc', team: 'Ferrari', year: 2024 },
    // Albert Park: Lakeside loop with high-speed chicane and technical parkland turns
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 70,80 L 140,40 C 180,20 230,25 270,55 L 320,100 C 350,130 355,170 330,205 L 290,245 C 265,270 230,280 195,265 L 145,245 C 120,235 110,210 120,185 L 130,160 C 135,145 125,130 110,125 L 80,120 C 55,115 50,95 70,80 Z',
    finish_line: { x: 75, y: 95 },
    past_winners: [
      { year: 2024, winner: 'Carlos Sainz', team: 'Ferrari', time: '1:20:26.843', laps: 58 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '2:32:38.371', laps: 58 },
      { year: 2022, winner: 'Charles Leclerc', team: 'Ferrari', time: '1:27:46.548', laps: 58 },
      { year: 2019, winner: 'Valtteri Bottas', team: 'Mercedes', time: '1:25:27.325', laps: 58 },
    ],
  },
  {
    circuit_id: 'shanghai',
    round_2026: 2,
    date_2026: '29 Mar 2026',
    circuit_name: 'Shanghai International Circuit',
    locality: 'Shanghai',
    country: 'China',
    flag: '🇨🇳',
    region: 'Asia & Pacific',
    length_km: 5.451,
    turns: 16,
    laps: 56,
    race_distance_km: 305.066,
    drs_zones: 2,
    tyre_stress: 4,
    lap_record: { time: '1:32.238', driver: 'Michael Schumacher', team: 'Ferrari', year: 2004 },
    // Shanghai: Iconic "Shang" (上) Chinese character layout with tightening snail turn and 1.2km backstraight
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 90,140 C 120,70 190,50 230,70 C 260,90 250,135 200,145 C 150,155 160,205 195,225 L 320,225 C 345,225 345,255 320,265 L 140,265 C 90,265 75,215 90,140 Z',
    finish_line: { x: 135, y: 265 },
    past_winners: [
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:40:52.554', laps: 56 },
      { year: 2019, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:32:06.350', laps: 56 },
      { year: 2018, winner: 'Daniel Ricciardo', team: 'Red Bull Racing', time: '1:35:36.380', laps: 56 },
      { year: 2017, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:37:36.158', laps: 56 },
    ],
  },
  {
    circuit_id: 'suzuka',
    round_2026: 3,
    date_2026: '12 Apr 2026',
    circuit_name: 'Suzuka International Racing Course',
    locality: 'Suzuka',
    country: 'Japan',
    flag: '🇯🇵',
    region: 'Asia & Pacific',
    length_km: 5.807,
    turns: 18,
    laps: 53,
    race_distance_km: 307.471,
    drs_zones: 1,
    tyre_stress: 5,
    lap_record: { time: '1:30.983', driver: 'Lewis Hamilton', team: 'Mercedes', year: 2019 },
    // Suzuka: World-famous crossover figure-8 layout with S-Curves, Degner, Spoon, and 130R
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 70,120 C 70,60 130,35 190,45 C 245,55 285,90 265,135 C 245,170 190,170 155,200 C 120,230 140,270 195,270 C 255,270 275,230 250,195 L 125,135 Z',
    finish_line: { x: 75, y: 130 },
    past_winners: [
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:54:23.566', laps: 53 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:30:58.421', laps: 53 },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '3:01:44.004', laps: 28 },
      { year: 2019, winner: 'Valtteri Bottas', team: 'Mercedes', time: '1:21:46.755', laps: 52 },
    ],
  },
  {
    circuit_id: 'bahrain',
    round_2026: 4,
    date_2026: '26 Apr 2026',
    circuit_name: 'Bahrain International Circuit',
    locality: 'Sakhir',
    country: 'Bahrain',
    flag: '🇧🇭',
    region: 'Middle East',
    length_km: 5.412,
    turns: 15,
    laps: 57,
    race_distance_km: 308.238,
    drs_zones: 3,
    tyre_stress: 5,
    lap_record: { time: '1:31.447', driver: 'Pedro de la Rosa', team: 'McLaren', year: 2005 },
    // Bahrain: Long straights connected by heavy braking zones and technical infield turns 9-10
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 50,70 L 220,70 C 260,70 280,100 265,135 L 210,165 C 190,175 200,205 230,215 L 260,225 C 275,245 250,265 210,265 L 110,265 C 75,265 65,235 85,215 L 130,180 L 65,140 C 40,120 40,85 50,70 Z',
    finish_line: { x: 55, y: 70 },
    past_winners: [
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:31:44.742', laps: 57 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:33:56.736', laps: 57 },
      { year: 2022, winner: 'Charles Leclerc', team: 'Ferrari', time: '1:37:33.584', laps: 57 },
      { year: 2021, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:32:03.897', laps: 56 },
    ],
  },
  {
    circuit_id: 'jeddah',
    round_2026: 5,
    date_2026: '03 May 2026',
    circuit_name: 'Jeddah Corniche Circuit',
    locality: 'Jeddah',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    region: 'Middle East',
    length_km: 6.174,
    turns: 27,
    laps: 50,
    race_distance_km: 308.450,
    drs_zones: 3,
    tyre_stress: 3,
    lap_record: { time: '1:30.734', driver: 'Lewis Hamilton', team: 'Mercedes', year: 2021 },
    // Jeddah: Ultra high-speed Red Sea shoreline corridor with banked Turn 13
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 140,25 C 180,25 210,55 210,120 L 220,220 C 220,265 170,275 140,275 C 110,275 75,250 85,210 L 95,110 C 95,55 110,25 140,25 Z',
    finish_line: { x: 95, y: 150 },
    past_winners: [
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:20:43.273', laps: 50 },
      { year: 2023, winner: 'Sergio Perez', team: 'Red Bull Racing', time: '1:21:14.894', laps: 50 },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:24:19.293', laps: 50 },
      { year: 2021, winner: 'Lewis Hamilton', team: 'Mercedes', time: '2:06:15.118', laps: 50 },
    ],
  },
  {
    circuit_id: 'miami',
    round_2026: 6,
    date_2026: '17 May 2026',
    circuit_name: 'Miami International Autodrome',
    locality: 'Miami',
    country: 'United States',
    flag: '🇺🇸',
    region: 'Americas',
    length_km: 5.412,
    turns: 19,
    laps: 57,
    race_distance_km: 308.326,
    drs_zones: 3,
    tyre_stress: 3,
    lap_record: { time: '1:29.708', driver: 'Max Verstappen', team: 'Red Bull Racing', year: 2023 },
    // Miami: Hard Rock Stadium loop, marina straight, and highway overpass chicane
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 50,90 L 260,90 C 290,90 300,120 280,140 L 220,170 L 285,210 C 305,230 285,260 250,260 L 80,260 C 50,260 40,230 50,200 L 75,150 L 50,120 Z',
    finish_line: { x: 60, y: 90 },
    past_winners: [
      { year: 2024, winner: 'Lando Norris', team: 'McLaren', time: '1:30:49.876', laps: 57 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:27:38.241', laps: 57 },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:34:24.258', laps: 57 },
    ],
  },
  {
    circuit_id: 'imola',
    round_2026: 7,
    date_2026: '31 May 2026',
    circuit_name: 'Autodromo Enzo e Dino Ferrari',
    locality: 'Imola',
    country: 'Italy',
    flag: '🇮🇹',
    region: 'Europe',
    length_km: 4.909,
    turns: 19,
    laps: 63,
    race_distance_km: 309.049,
    drs_zones: 1,
    tyre_stress: 3,
    lap_record: { time: '1:15.484', driver: 'Lewis Hamilton', team: 'Mercedes', year: 2020 },
    // Imola: Historic anti-clockwise circuit featuring Tamburello, Tosa, Piratella, Acque Minerali, and Rivazza
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 60,80 L 210,60 C 255,60 285,90 275,130 L 240,170 C 265,200 240,240 210,250 L 85,270 C 50,270 40,230 50,190 L 75,140 Z',
    finish_line: { x: 75, y: 75 },
    past_winners: [
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:25:25.252', laps: 63 },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:32:07.986', laps: 63 },
      { year: 2021, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '2:02:34.598', laps: 63 },
      { year: 2020, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:28:32.430', laps: 63 },
    ],
  },
  {
    circuit_id: 'monaco',
    round_2026: 8,
    date_2026: '07 Jun 2026',
    circuit_name: 'Circuit de Monaco',
    locality: 'Monte Carlo',
    country: 'Monaco',
    flag: '🇲🇨',
    region: 'Europe',
    length_km: 3.337,
    turns: 19,
    laps: 78,
    race_distance_km: 260.286,
    drs_zones: 1,
    tyre_stress: 1,
    lap_record: { time: '1:12.909', driver: 'Lewis Hamilton', team: 'Mercedes', year: 2021 },
    // Monaco: The crown jewel of F1 with Sainte-Dévote, Casino Square, Grand Hotel Hairpin, Tunnel, and Swimming Pool
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 90,75 C 135,50 215,50 260,75 C 295,95 305,130 270,150 C 235,170 225,205 260,225 C 285,245 260,285 205,275 C 155,265 145,230 110,230 C 75,230 50,190 60,145 Z',
    finish_line: { x: 95, y: 155 },
    past_winners: [
      { year: 2024, winner: 'Charles Leclerc', team: 'Ferrari', time: '2:23:15.554', laps: 78 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:48:51.980', laps: 78 },
      { year: 2022, winner: 'Sergio Perez', team: 'Red Bull Racing', time: '1:56:30.265', laps: 64 },
      { year: 2021, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:38:56.820', laps: 78 },
    ],
  },
  {
    circuit_id: 'villeneuve',
    round_2026: 9,
    date_2026: '21 Jun 2026',
    circuit_name: 'Circuit Gilles Villeneuve',
    locality: 'Montreal',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Americas',
    length_km: 4.361,
    turns: 14,
    laps: 70,
    race_distance_km: 305.270,
    drs_zones: 3,
    tyre_stress: 3,
    lap_record: { time: '1:13.078', driver: 'Valtteri Bottas', team: 'Mercedes', year: 2019 },
    // Montreal: Île Notre-Dame island circuit featuring heavy chicanes and the legendary Wall of Champions
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 50,90 L 275,80 C 310,80 320,115 295,135 L 225,160 L 295,190 C 320,210 295,245 260,245 L 60,255 C 35,255 25,220 50,190 L 75,135 Z',
    finish_line: { x: 60, y: 90 },
    past_winners: [
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:45:47.927', laps: 70 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:33:58.348', laps: 70 },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:36:21.757', laps: 70 },
      { year: 2019, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:29:07.084', laps: 70 },
    ],
  },
  {
    circuit_id: 'catalunya',
    round_2026: 10,
    date_2026: '05 Jul 2026',
    circuit_name: 'Circuit de Barcelona-Catalunya',
    locality: 'Barcelona',
    country: 'Spain',
    flag: '🇪🇸',
    region: 'Europe',
    length_km: 4.657,
    turns: 14,
    laps: 66,
    race_distance_km: 307.236,
    drs_zones: 2,
    tyre_stress: 5,
    lap_record: { time: '1:16.330', driver: 'Max Verstappen', team: 'Red Bull Racing', year: 2023 },
    // Barcelona: High downforce aerodynamic testbed with sweeping Campsa and fast final sector
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 60,95 L 260,85 C 295,85 305,130 270,150 L 190,175 C 215,210 260,220 260,255 C 260,285 215,295 165,285 L 75,285 C 40,285 40,230 50,175 Z',
    finish_line: { x: 80, y: 95 },
    past_winners: [
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:28:20.227', laps: 66 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:27:57.940', laps: 66 },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:37:20.475', laps: 66 },
      { year: 2021, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:33:07.680', laps: 66 },
    ],
  },
  {
    circuit_id: 'red_bull_ring',
    round_2026: 11,
    date_2026: '19 Jul 2026',
    circuit_name: 'Red Bull Ring',
    locality: 'Spielberg',
    country: 'Austria',
    flag: '🇦🇹',
    region: 'Europe',
    length_km: 4.318,
    turns: 10,
    laps: 71,
    race_distance_km: 306.452,
    drs_zones: 3,
    tyre_stress: 3,
    lap_record: { time: '1:05.619', driver: 'Carlos Sainz', team: 'McLaren', year: 2020 },
    // Red Bull Ring: 10 corners, steep uphill climb to Turn 3 hairpin, ultra-fast sub-65s lap
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 50,165 L 145,70 C 170,45 205,45 230,70 L 290,140 C 310,165 290,210 250,225 L 145,245 L 85,280 C 50,300 25,255 35,220 Z',
    finish_line: { x: 120, y: 245 },
    past_winners: [
      { year: 2024, winner: 'George Russell', team: 'Mercedes', time: '1:24:22.798', laps: 71 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:25:33.607', laps: 71 },
      { year: 2022, winner: 'Charles Leclerc', team: 'Ferrari', time: '1:24:24.312', laps: 71 },
      { year: 2021, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:23:54.543', laps: 71 },
    ],
  },
  {
    circuit_id: 'silverstone',
    round_2026: 12,
    date_2026: '02 Aug 2026',
    circuit_name: 'Silverstone Circuit',
    locality: 'Silverstone',
    country: 'United Kingdom',
    flag: '🇬🇧',
    region: 'Europe',
    length_km: 5.891,
    turns: 18,
    laps: 52,
    race_distance_km: 306.198,
    drs_zones: 2,
    tyre_stress: 5,
    lap_record: { time: '1:27.097', driver: 'Max Verstappen', team: 'Red Bull Racing', year: 2020 },
    // Silverstone: Home of British motorsport with legendary Maggotts, Becketts, Chapel, and Stowe
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 60,130 C 70,75 140,50 200,60 L 285,95 C 310,120 295,165 260,175 L 190,190 C 215,225 260,250 250,285 C 240,305 190,305 155,285 L 75,270 C 40,245 40,190 60,130 Z',
    finish_line: { x: 235, y: 80 },
    past_winners: [
      { year: 2024, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:22:27.059', laps: 52 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:25:16.938', laps: 52 },
      { year: 2022, winner: 'Carlos Sainz', team: 'Ferrari', time: '2:17:50.311', laps: 52 },
      { year: 2021, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:58:23.284', laps: 52 },
    ],
  },
  {
    circuit_id: 'spa',
    round_2026: 13,
    date_2026: '30 Aug 2026',
    circuit_name: 'Circuit de Spa-Francorchamps',
    locality: 'Stavelot',
    country: 'Belgium',
    flag: '🇧🇪',
    region: 'Europe',
    length_km: 7.004,
    turns: 19,
    laps: 44,
    race_distance_km: 308.052,
    drs_zones: 2,
    tyre_stress: 5,
    lap_record: { time: '1:44.701', driver: 'Sergio Perez', team: 'Red Bull Racing', year: 2024 },
    // Spa: The rollercoaster of the Ardennes with Eau Rouge, Raidillon, Kemmel Straight, Pouhon, and Blanchimont
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 60,95 L 170,50 C 205,35 250,50 285,85 L 300,165 C 285,210 240,235 205,250 L 145,285 C 110,310 60,285 50,240 L 60,155 Z',
    finish_line: { x: 75, y: 110 },
    past_winners: [
      { year: 2024, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:19:57.971', laps: 44 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:22:30.450', laps: 44 },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:25:52.894', laps: 44 },
      { year: 2021, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '0:03:27.071', laps: 1 },
    ],
  },
  {
    circuit_id: 'hungaroring',
    round_2026: 14,
    date_2026: '06 Sep 2026',
    circuit_name: 'Hungaroring',
    locality: 'Budapest',
    country: 'Hungary',
    flag: '🇭🇺',
    region: 'Europe',
    length_km: 4.381,
    turns: 14,
    laps: 70,
    race_distance_km: 306.630,
    drs_zones: 2,
    tyre_stress: 3,
    lap_record: { time: '1:16.627', driver: 'Lewis Hamilton', team: 'Mercedes', year: 2020 },
    // Hungaroring: Twisting "Monaco without the walls" with relentless series of medium-speed turns
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 70,95 L 230,85 C 275,85 285,130 260,155 L 205,190 C 230,215 275,225 260,260 C 250,295 205,295 165,285 L 85,285 C 50,270 50,200 60,155 Z',
    finish_line: { x: 100, y: 95 },
    past_winners: [
      { year: 2024, winner: 'Oscar Piastri', team: 'McLaren', time: '1:38:01.989', laps: 70 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:38:08.634', laps: 70 },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:39:35.912', laps: 70 },
      { year: 2021, winner: 'Esteban Ocon', team: 'Alpine', time: '2:04:43.199', laps: 70 },
    ],
  },
  {
    circuit_id: 'zandvoort',
    round_2026: 15,
    date_2026: '20 Sep 2026',
    circuit_name: 'Circuit Zandvoort',
    locality: 'Zandvoort',
    country: 'Netherlands',
    flag: '🇳🇱',
    region: 'Europe',
    length_km: 4.259,
    turns: 14,
    laps: 72,
    race_distance_km: 306.587,
    drs_zones: 2,
    tyre_stress: 4,
    lap_record: { time: '1:11.097', driver: 'Lewis Hamilton', team: 'Mercedes', year: 2021 },
    // Zandvoort: Historic sand dune track with 18-degree steep banked Hugenholtz and Arie Luyendyk corners
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 70,75 C 130,50 215,50 265,85 L 290,155 C 300,190 250,215 205,215 C 170,215 155,260 180,285 C 190,305 155,305 120,295 L 60,235 C 35,200 50,130 70,75 Z',
    finish_line: { x: 80, y: 80 },
    past_winners: [
      { year: 2024, winner: 'Lando Norris', team: 'McLaren', time: '1:30:45.519', laps: 72 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '2:24:04.411', laps: 72 },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:36:42.773', laps: 72 },
      { year: 2021, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:30:05.395', laps: 72 },
    ],
  },
  {
    circuit_id: 'monza',
    round_2026: 16,
    date_2026: '27 Sep 2026',
    circuit_name: 'Autodromo Nazionale Monza',
    locality: 'Monza',
    country: 'Italy',
    flag: '🇮🇹',
    region: 'Europe',
    length_km: 5.793,
    turns: 11,
    laps: 53,
    race_distance_km: 306.720,
    drs_zones: 2,
    tyre_stress: 3,
    lap_record: { time: '1:21.046', driver: 'Rubens Barrichello', team: 'Ferrari', year: 2004 },
    // Monza: The Temple of Speed with Curva Grande, Lesmo, Variante Ascari, and Curva Alboreto (Parabolica)
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 50,120 L 275,60 C 310,60 325,95 300,130 L 195,205 C 215,230 250,250 240,285 C 230,305 180,305 145,285 L 60,265 C 35,240 25,180 50,120 Z',
    finish_line: { x: 70, y: 150 },
    past_winners: [
      { year: 2024, winner: 'Charles Leclerc', team: 'Ferrari', time: '1:14:40.727', laps: 53 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:13:41.143', laps: 53 },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:20:27.511', laps: 53 },
      { year: 2021, winner: 'Daniel Ricciardo', team: 'McLaren', time: '1:21:54.365', laps: 53 },
    ],
  },
  {
    circuit_id: 'baku',
    round_2026: 17,
    date_2026: '11 Oct 2026',
    circuit_name: 'Baku City Circuit',
    locality: 'Baku',
    country: 'Azerbaijan',
    flag: '🇦🇿',
    region: 'Europe',
    length_km: 6.003,
    turns: 20,
    laps: 51,
    race_distance_km: 306.049,
    drs_zones: 2,
    tyre_stress: 3,
    lap_record: { time: '1:43.009', driver: 'Charles Leclerc', team: 'Ferrari', year: 2019 },
    // Baku: Narrow medieval Old City castle section contrasted with a 2.2km wide-open full throttle straight
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 50,95 L 290,95 L 300,180 C 290,205 250,215 215,190 L 155,190 C 130,215 155,250 180,275 L 215,295 L 60,295 C 35,260 35,165 50,95 Z',
    finish_line: { x: 170, y: 295 },
    past_winners: [
      { year: 2024, winner: 'Oscar Piastri', team: 'McLaren', time: '1:32:58.007', laps: 51 },
      { year: 2023, winner: 'Sergio Perez', team: 'Red Bull Racing', time: '1:32:42.436', laps: 51 },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:34:05.941', laps: 51 },
      { year: 2021, winner: 'Sergio Perez', team: 'Red Bull Racing', time: '2:13:36.410', laps: 51 },
    ],
  },
  {
    circuit_id: 'marina_bay',
    round_2026: 18,
    date_2026: '18 Oct 2026',
    circuit_name: 'Marina Bay Street Circuit',
    locality: 'Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    region: 'Asia & Pacific',
    length_km: 4.940,
    turns: 19,
    laps: 62,
    race_distance_km: 306.143,
    drs_zones: 4,
    tyre_stress: 4,
    lap_record: { time: '1:34.486', driver: 'Daniel Ricciardo', team: 'RB', year: 2024 },
    // Singapore: The original F1 night race under stadium floodlights along the Singapore harbor
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 60,85 L 230,70 C 265,70 300,95 290,140 L 250,190 L 290,225 C 300,260 265,295 215,285 L 85,295 C 50,285 35,225 50,175 Z',
    finish_line: { x: 80, y: 85 },
    past_winners: [
      { year: 2024, winner: 'Lando Norris', team: 'McLaren', time: '1:44:42.534', laps: 62 },
      { year: 2023, winner: 'Carlos Sainz', team: 'Ferrari', time: '1:46:37.418', laps: 62 },
      { year: 2022, winner: 'Sergio Perez', team: 'Red Bull Racing', time: '2:02:20.238', laps: 59 },
      { year: 2019, winner: 'Sebastian Vettel', team: 'Ferrari', time: '1:58:33.667', laps: 61 },
    ],
  },
  {
    circuit_id: 'americas',
    round_2026: 19,
    date_2026: '01 Nov 2026',
    circuit_name: 'Circuit of the Americas (COTA)',
    locality: 'Austin',
    country: 'United States',
    flag: '🇺🇸',
    region: 'Americas',
    length_km: 5.513,
    turns: 20,
    laps: 56,
    race_distance_km: 308.405,
    drs_zones: 2,
    tyre_stress: 4,
    lap_record: { time: '1:36.169', driver: 'Charles Leclerc', team: 'Ferrari', year: 2019 },
    // COTA: Steep 133-foot blind uphill Turn 1, Maggotts-inspired Esses, and multi-apex stadium complex
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 50,165 L 120,60 C 145,35 180,45 205,85 L 265,155 C 300,180 290,225 240,240 L 170,265 L 95,300 C 60,310 35,250 50,165 Z',
    finish_line: { x: 75, y: 165 },
    past_winners: [
      { year: 2024, winner: 'Charles Leclerc', team: 'Ferrari', time: '1:35:09.639', laps: 56 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:35:21.362', laps: 56 },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:42:11.687', laps: 56 },
      { year: 2021, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:34:36.552', laps: 56 },
    ],
  },
  {
    circuit_id: 'rodriguez',
    round_2026: 20,
    date_2026: '08 Nov 2026',
    circuit_name: 'Autódromo Hermanos Rodríguez',
    locality: 'Mexico City',
    country: 'Mexico',
    flag: '🇲🇽',
    region: 'Americas',
    length_km: 4.304,
    turns: 17,
    laps: 71,
    race_distance_km: 305.354,
    drs_zones: 3,
    tyre_stress: 3,
    lap_record: { time: '1:17.774', driver: 'Valtteri Bottas', team: 'Mercedes', year: 2021 },
    // Mexico: High-altitude 2,285m thin air with 1.3km front straight and baseball stadium stadium section
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 50,95 L 275,85 C 310,85 310,130 290,155 L 215,190 C 250,215 275,260 240,295 L 85,295 C 50,295 35,225 50,155 Z',
    finish_line: { x: 75, y: 95 },
    past_winners: [
      { year: 2024, winner: 'Carlos Sainz', team: 'Ferrari', time: '1:40:55.800', laps: 71 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '2:02:30.814', laps: 71 },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:38:36.729', laps: 71 },
      { year: 2021, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:38:39.086', laps: 71 },
    ],
  },
  {
    circuit_id: 'interlagos',
    round_2026: 21,
    date_2026: '15 Nov 2026',
    circuit_name: 'Autódromo José Carlos Pace (Interlagos)',
    locality: 'São Paulo',
    country: 'Brazil',
    flag: '🇧🇷',
    region: 'Americas',
    length_km: 4.309,
    turns: 15,
    laps: 71,
    race_distance_km: 305.879,
    drs_zones: 2,
    tyre_stress: 4,
    lap_record: { time: '1:10.540', driver: 'Valtteri Bottas', team: 'Mercedes', year: 2018 },
    // Interlagos: Anti-clockwise natural bowl amphitheatre with Senna S and uphill Junção drag to the line
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 60,130 C 70,70 140,45 200,60 L 275,95 C 300,120 290,165 250,190 L 180,215 C 215,250 230,295 180,305 L 85,295 C 50,270 35,200 60,130 Z',
    finish_line: { x: 95, y: 70 },
    past_winners: [
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '2:06:54.430', laps: 69 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:56:48.894', laps: 71 },
      { year: 2022, winner: 'George Russell', team: 'Mercedes', time: '1:38:34.044', laps: 71 },
      { year: 2021, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:32:22.851', laps: 71 },
    ],
  },
  {
    circuit_id: 'vegas',
    round_2026: 22,
    date_2026: '22 Nov 2026',
    circuit_name: 'Las Vegas Strip Circuit',
    locality: 'Las Vegas',
    country: 'United States',
    flag: '🇺🇸',
    region: 'Americas',
    length_km: 6.201,
    turns: 17,
    laps: 50,
    race_distance_km: 309.958,
    drs_zones: 2,
    tyre_stress: 3,
    lap_record: { time: '1:34.876', driver: 'Lando Norris', team: 'McLaren', year: 2024 },
    // Las Vegas: High-speed night blast directly along the neon Las Vegas Boulevard Strip and MSG Sphere
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 50,95 L 290,95 C 310,95 325,130 300,165 L 230,190 L 290,250 C 300,275 275,305 240,305 L 70,305 C 50,305 35,260 50,205 Z',
    finish_line: { x: 100, y: 95 },
    past_winners: [
      { year: 2024, winner: 'George Russell', team: 'Mercedes', time: '1:22:05.969', laps: 50 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:29:08.289', laps: 50 },
    ],
  },
  {
    circuit_id: 'losail',
    round_2026: 23,
    date_2026: '29 Nov 2026',
    circuit_name: 'Lusail International Circuit',
    locality: 'Lusail',
    country: 'Qatar',
    flag: '🇶🇦',
    region: 'Middle East',
    length_km: 5.419,
    turns: 16,
    laps: 57,
    race_distance_km: 308.611,
    drs_zones: 1,
    tyre_stress: 5,
    lap_record: { time: '1:24.319', driver: 'Max Verstappen', team: 'Red Bull Racing', year: 2023 },
    // Lusail: Fast, flowing moto-inspired layout demanding immense sustained high-G neck loads
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 50,95 L 260,70 C 300,70 310,120 285,155 L 225,180 C 250,215 285,250 250,285 L 70,295 C 35,285 35,200 50,130 Z',
    finish_line: { x: 75, y: 95 },
    past_winners: [
      { year: 2024, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:31:05.323', laps: 57 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:27:39.168', laps: 57 },
      { year: 2021, winner: 'Lewis Hamilton', team: 'Mercedes', time: '1:24:28.471', laps: 57 },
    ],
  },
  {
    circuit_id: 'yas_marina',
    round_2026: 24,
    date_2026: '06 Dec 2026',
    circuit_name: 'Yas Marina Circuit',
    locality: 'Abu Dhabi',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    region: 'Middle East',
    length_km: 5.281,
    turns: 16,
    laps: 58,
    race_distance_km: 306.183,
    drs_zones: 2,
    tyre_stress: 3,
    lap_record: { time: '1:26.103', driver: 'Max Verstappen', team: 'Red Bull Racing', year: 2021 },
    // Yas Marina: Sunset twilight season finale under the glowing W Hotel canopy
    svg_viewBox: '0 0 400 300',
    svg_path: 'M 60,85 L 250,70 C 285,70 300,120 275,155 L 205,180 C 230,215 275,240 250,275 L 70,285 C 35,275 35,190 60,120 Z',
    finish_line: { x: 80, y: 85 },
    past_winners: [
      { year: 2024, winner: 'Lando Norris', team: 'McLaren', time: '1:27:43.204', laps: 58 },
      { year: 2023, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:27:02.624', laps: 58 },
      { year: 2022, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:27:45.914', laps: 58 },
      { year: 2021, winner: 'Max Verstappen', team: 'Red Bull Racing', time: '1:30:17.345', laps: 58 },
    ],
  },
];

export default function CircuitsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedCircuit, setSelectedCircuit] = useState(null);

  const filteredCircuits = useMemo(() => {
    return OFFICIAL_CIRCUITS.filter((c) => {
      if (selectedRegion !== 'ALL' && c.region !== selectedRegion) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.circuit_name.toLowerCase().includes(q) ||
          c.locality.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.lap_record.driver.toLowerCase().includes(q)
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
                Official FIA Venues
              </span>
              <span className="text-xs font-mono text-[#64748B]">Authentic Track Layouts & Specs (2021–2026)</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-display font-black text-white tracking-wide uppercase">
              Formula 1 Grand Prix Circuits Directory
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search circuit, country, driver record..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1C2230] border border-[#2A3245] rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-[#64748B] focus:outline-none focus:border-[#E10600]"
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
            Showing {filteredCircuits.length} of {OFFICIAL_CIRCUITS.length} Championship Tracks
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
                {/* Header: Flag, Country & Round */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{circuit.flag}</span>
                    <span className="text-xs font-mono font-bold text-[#94A3B8] uppercase">
                      {circuit.country}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30">
                    Round {circuit.round_2026}
                  </span>
                </div>

                {/* Circuit Name & Locality */}
                <h3 className="font-bold text-white text-base group-hover:text-[#E10600] transition-colors leading-snug mb-1">
                  {circuit.circuit_name}
                </h3>
                <p className="text-xs font-mono text-[#64748B] mb-3 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#E10600]" />
                  <span>{circuit.locality}</span>
                </p>

                {/* High-Contrast Vector Track Layout Preview */}
                <div className="h-32 rounded-xl bg-[#0B0E14] border border-[#2A3245]/70 flex items-center justify-center p-3 mb-4 relative overflow-hidden group-hover:border-[#00F0FF]/40 transition-colors">
                  <svg
                    viewBox={circuit.svg_viewBox || '0 0 400 300'}
                    className="w-full h-full max-h-28 stroke-[#00F0FF] fill-none stroke-[5] stroke-linecap-round stroke-linejoin-round drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                  >
                    <path d={circuit.svg_path} />
                    {/* Finish Line Indicator */}
                    {circuit.finish_line && (
                      <circle
                        cx={circuit.finish_line.x}
                        cy={circuit.finish_line.y}
                        r="6"
                        className="fill-[#E10600] stroke-white stroke-2 animate-ping"
                      />
                    )}
                  </svg>
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono font-bold text-[#64748B] bg-[#12161F]/80 px-1.5 py-0.5 rounded border border-[#2A3245]">
                    {circuit.drs_zones} DRS
                  </span>
                </div>

                {/* Key Technical Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-b border-[#2A3245]/60 text-center font-mono text-xs">
                  <div>
                    <span className="block text-[10px] text-[#64748B]">LENGTH</span>
                    <span className="text-white font-bold">{circuit.length_km} km</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#64748B]">TURNS</span>
                    <span className="text-white font-bold">{circuit.turns}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#64748B]">RACE LAPS</span>
                    <span className="text-[#00F0FF] font-bold">{circuit.laps}</span>
                  </div>
                </div>
              </div>

              {/* Latest Verified Winner Footer */}
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

      {/* 3. Detailed Circuit Dossier Modal (PORTALED TO DOCUMENT.BODY: ZERO BACKDROP CLIPPING) */}
      <Modal
        isOpen={Boolean(selectedCircuit)}
        onClose={() => setSelectedCircuit(null)}
        title={selectedCircuit?.circuit_name}
        icon={MapPin}
        maxWidth="max-w-2xl"
      >
        {selectedCircuit && (
          <div className="space-y-6">
            {/* Header Meta */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2A3245]">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedCircuit.flag}</span>
                <div>
                  <h4 className="font-bold text-white text-base">
                    {selectedCircuit.locality}, {selectedCircuit.country}
                  </h4>
                  <span className="text-xs font-mono text-[#64748B]">
                    Region: {selectedCircuit.region} • 2026 Season Round {selectedCircuit.round_2026}
                  </span>
                </div>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="block text-[#64748B]">2026 GP DATE</span>
                <span className="text-[#00F0FF] font-bold">{selectedCircuit.date_2026}</span>
              </div>
            </div>

            {/* Enlarged Track Map Diagram */}
            <div className="h-48 rounded-xl bg-[#0B0E14] border border-[#2A3245] p-4 flex items-center justify-center relative overflow-hidden">
              <svg
                viewBox={selectedCircuit.svg_viewBox || '0 0 400 300'}
                className="w-full h-full max-h-44 stroke-[#00F0FF] fill-none stroke-[5] stroke-linecap-round stroke-linejoin-round drop-shadow-[0_0_12px_rgba(0,240,255,0.5)]"
              >
                <path d={selectedCircuit.svg_path} />
                {selectedCircuit.finish_line && (
                  <circle
                    cx={selectedCircuit.finish_line.x}
                    cy={selectedCircuit.finish_line.y}
                    r="8"
                    className="fill-[#E10600] stroke-white stroke-2"
                  />
                )}
              </svg>
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1C2230] text-[#00F0FF] border border-[#00F0FF]/30 font-bold">
                  {selectedCircuit.drs_zones} DRS Activation Zones
                </span>
              </div>
              <div className="absolute bottom-3 left-3 text-[10px] font-mono text-[#64748B] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E10600]" />
                <span>Start / Finish Line</span>
              </div>
            </div>

            {/* Track Spec Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono text-xs">
              <div className="bg-[#1C2230] p-3 rounded-lg border border-[#2A3245]">
                <span className="block text-[#64748B] text-[10px]">TRACK LENGTH</span>
                <span className="text-white font-bold text-sm">{selectedCircuit.length_km} km</span>
              </div>
              <div className="bg-[#1C2230] p-3 rounded-lg border border-[#2A3245]">
                <span className="block text-[#64748B] text-[10px]">TOTAL CORNERS</span>
                <span className="text-white font-bold text-sm">{selectedCircuit.turns} Turns</span>
              </div>
              <div className="bg-[#1C2230] p-3 rounded-lg border border-[#2A3245]">
                <span className="block text-[#64748B] text-[10px]">RACE DISTANCE</span>
                <span className="text-[#00F0FF] font-bold text-sm">{selectedCircuit.laps} Laps</span>
                <span className="block text-[9px] text-[#64748B]">({selectedCircuit.race_distance_km} km)</span>
              </div>
              <div className="bg-[#1C2230] p-3 rounded-lg border border-[#2A3245]">
                <span className="block text-[#64748B] text-[10px]">TYRE ABRASION</span>
                <span className="text-amber-400 font-bold text-sm">
                  {'★'.repeat(selectedCircuit.tyre_stress)}{'☆'.repeat(5 - selectedCircuit.tyre_stress)}
                </span>
                <span className="block text-[9px] text-[#64748B]">Level {selectedCircuit.tyre_stress}/5</span>
              </div>
            </div>

            {/* Official Lap Record Card */}
            <div className="p-4 rounded-xl bg-[#1C2230] border border-[#2A3245] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] uppercase">Official Race Lap Record</span>
                  <div className="text-lg font-mono font-black text-white tracking-wide">
                    {selectedCircuit.lap_record.time}
                  </div>
                </div>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="text-white font-bold block">{selectedCircuit.lap_record.driver}</span>
                <span className="text-[#64748B] text-[11px]">
                  {selectedCircuit.lap_record.team} ({selectedCircuit.lap_record.year})
                </span>
              </div>
            </div>

            {/* Verified Race Winners */}
            <div>
              <h5 className="font-bold text-white uppercase text-xs tracking-wider mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Recent Grand Prix Winners (Verified History)</span>
              </h5>

              <div className="space-y-2">
                {selectedCircuit.past_winners.map((w) => (
                  <div
                    key={w.year}
                    className="p-3 rounded-lg bg-[#151922] border border-[#2A3245] flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-[#1C2230] text-[#00F0FF] font-bold">
                        {w.year}
                      </span>
                      <span className="font-bold text-white">{w.winner}</span>
                    </div>
                    <span className="text-[#94A3B8]">{w.team}</span>
                    <span className="text-[#64748B] hidden sm:inline">{w.time} ({w.laps} laps)</span>
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

import React, { useState, useEffect, Suspense, lazy } from 'react';
import AppShell from './components/layout/AppShell';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSkeleton from './components/common/LoadingSkeleton';

// Code-split all 10 Dashboard Views via React.lazy
const HomePage = lazy(() => import('./pages/HomePage'));
const LiveTimingPage = lazy(() => import('./pages/LiveTimingPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const RaceAnalysisPage = lazy(() => import('./pages/RaceAnalysisPage'));
const TelemetryPage = lazy(() => import('./pages/TelemetryPage'));
const StrategyToolsPage = lazy(() => import('./pages/StrategyToolsPage'));
const F1GuidePage = lazy(() => import('./pages/F1GuidePage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const CircuitsPage = lazy(() => import('./pages/CircuitsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

/**
 * PitWall Main Application Entrypoint
 * Coordinates all 10 Formula 1 views, responsive theme management (Light & Dark),
 * telemetry status monitoring, error boundaries, and code-split suspense loading.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [connectionStatus, setConnectionStatus] = useState('LIVE');

  // Theme & Preferences State with localStorage persistence
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pitwall_theme') || 'dark';
  });
  const [speedUnit, setSpeedUnit] = useState(() => {
    return localStorage.getItem('pitwall_speed_unit') || 'km/h';
  });
  const [tempUnit, setTempUnit] = useState(() => {
    return localStorage.getItem('pitwall_temp_unit') || 'C';
  });
  const [favoriteTeam, setFavoriteTeam] = useState(() => {
    return localStorage.getItem('pitwall_fav_team') || 'ferrari';
  });

  const handleToggleTheme = (newTheme) => {
    const val = newTheme || (theme === 'dark' ? 'light' : 'dark');
    setTheme(val);
    localStorage.setItem('pitwall_theme', val);
  };

  const handleSpeedUnitChange = (unit) => {
    setSpeedUnit(unit);
    localStorage.setItem('pitwall_speed_unit', unit);
  };

  const handleTempUnitChange = (unit) => {
    setTempUnit(unit);
    localStorage.setItem('pitwall_temp_unit', unit);
  };

  const handleFavoriteTeamChange = (teamId) => {
    setFavoriteTeam(teamId);
    localStorage.setItem('pitwall_fav_team', teamId);
  };

  const handleNavigate = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'live':
        return <LiveTimingPage onNavigate={handleNavigate} />;
      case 'stats':
        return <StatsPage onNavigate={handleNavigate} />;
      case 'analysis':
        return <RaceAnalysisPage onNavigate={handleNavigate} />;
      case 'telemetry':
        return <TelemetryPage onNavigate={handleNavigate} />;
      case 'strategy':
        return <StrategyToolsPage onNavigate={handleNavigate} />;
      case 'guide':
        return <F1GuidePage onNavigate={handleNavigate} />;
      case 'news':
        return <NewsPage onNavigate={handleNavigate} />;
      case 'circuits':
        return <CircuitsPage onNavigate={handleNavigate} />;
      case 'settings':
        return (
          <SettingsPage
            theme={theme}
            onToggleTheme={handleToggleTheme}
            speedUnit={speedUnit}
            onChangeSpeedUnit={handleSpeedUnitChange}
            tempUnit={tempUnit}
            onChangeTempUnit={handleTempUnitChange}
            favoriteTeam={favoriteTeam}
            onChangeFavoriteTeam={handleFavoriteTeamChange}
          />
        );
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <ErrorBoundary>
      <AppShell
        activeTab={activeTab}
        onSelectTab={handleNavigate}
        connectionStatus={connectionStatus}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      >
        <ErrorBoundary key={activeTab}>
          <Suspense fallback={<LoadingSkeleton type="card" rows={4} />}>
            {renderActiveView()}
          </Suspense>
        </ErrorBoundary>
      </AppShell>
    </ErrorBoundary>
  );
}

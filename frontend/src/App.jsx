import React, { useState, Suspense, lazy } from 'react';
import AppShell from './components/layout/AppShell';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSkeleton from './components/common/LoadingSkeleton';

// Code-split 9 Dashboard Views via React.lazy
const HomePage = lazy(() => import('./pages/HomePage'));
const LiveTimingPage = lazy(() => import('./pages/LiveTimingPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const RaceAnalysisPage = lazy(() => import('./pages/RaceAnalysisPage'));
const TelemetryPage = lazy(() => import('./pages/TelemetryPage'));
const StrategyToolsPage = lazy(() => import('./pages/StrategyToolsPage'));
const F1GuidePage = lazy(() => import('./pages/F1GuidePage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const CircuitsPage = lazy(() => import('./pages/CircuitsPage'));

/**
 * PitWall Main Application Entrypoint
 * Mounts and coordinates all 9 Formula 1 dashboard views with responsive navigation shell,
 * telemetry status monitoring, error boundaries, and code-split suspense loading.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [connectionStatus, setConnectionStatus] = useState('LIVE');

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

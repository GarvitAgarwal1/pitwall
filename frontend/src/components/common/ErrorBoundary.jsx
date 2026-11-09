import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ErrorBoundary
 * Catches JavaScript errors anywhere in their child component tree,
 * logs them, and displays an F1 dark racing telemetry error fallback.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Keep internal log
    if (process.env.NODE_ENV !== 'production') {
      console.error('PitWall ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[280px] w-full p-6 bg-[#151922] border border-[#2A3245] rounded-xl flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-4 animate-pulse">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <span className="inline-block px-3 py-1 mb-2 text-xs font-mono font-semibold tracking-wider uppercase bg-red-500/20 text-red-400 border border-red-500/40 rounded-full">
            Telemetry Fault / Critical Error
          </span>

          <h3 className="text-xl font-bold text-[#F8FAFC] tracking-wide mb-2">
            {this.props.title || 'Telemetry Stream Interrupted'}
          </h3>

          <p className="text-sm text-[#64748B] max-w-md mb-4 font-mono">
            {this.state.error?.message || 'An unexpected rendering error occurred in this view.'}
          </p>

          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E10600] hover:bg-[#FF1801] text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-red-900/30"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Re-establish Pit Link</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
export { ErrorBoundary };

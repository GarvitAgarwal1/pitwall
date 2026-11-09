import { useEffect, useRef } from 'react';

/**
 * Custom React hook for declarative interval execution.
 * Handles interval setup, dynamic delay adjustments, pause (delay = null),
 * and clean teardown on unmount.
 *
 * @param {Function} callback - Function to invoke on each interval tick
 * @param {number|null} delay - Delay in milliseconds, or null to pause
 * @param {boolean} [immediate=false] - Whether to invoke callback immediately on mount / delay change
 */
export function useInterval(callback, delay, immediate = false) {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null || delay === undefined || delay < 0) {
      return;
    }

    if (immediate) {
      savedCallback.current();
    }

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => clearInterval(id);
  }, [delay, immediate]);
}

export default useInterval;

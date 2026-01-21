import { useEffect, useRef, useCallback } from 'react';

/**
 * Executes a callback function repeatedly at a specified interval.
 *
 * @param callback - The function to execute at each interval
 * @param delay - The interval in milliseconds (null or undefined to disable the interval)
 * @returns An object with `clear` function to cancel the interval and `reset` function to restart it
 *
 * @example
 * ```tsx
 * const { clear } = useInterval(() => {
 *   console.log('This runs every 1 second');
 * }, 1000);
 *
 * // Cancel the interval
 * clear();
 * ```
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 * const { clear, reset } = useInterval(() => {
 *   setCount((prev) => prev + 1);
 * }, 1000);
 *
 * // Clear interval on unmount or when needed
 * useEffect(() => {
 *   return () => clear();
 * }, []);
 * ```
 */
export function useInterval(
  callback: () => void,
  delay: number | null | undefined
): { clear: () => void; reset: () => void } {
  const callbackRef = useRef(callback);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Clear function
  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  // Reset function
  const reset = useCallback(() => {
    clear();
    if (delay !== null && delay !== undefined && delay >= 0) {
      intervalRef.current = setInterval(() => {
        callbackRef.current();
      }, delay);
    }
  }, [delay, clear]);

  // Set up the interval
  useEffect(() => {
    if (delay !== null && delay !== undefined && delay >= 0) {
      intervalRef.current = setInterval(() => {
        callbackRef.current();
      }, delay);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [delay]);

  return { clear, reset };
}

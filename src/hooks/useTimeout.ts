import { useEffect, useRef, useCallback } from 'react';

/**
 * Executes a callback function after a specified delay.
 *
 * @param callback - The function to execute after the delay
 * @param delay - The delay in milliseconds (null or undefined to disable the timeout)
 * @returns An object with `clear` function to cancel the timeout and `reset` function to restart it
 *
 * @example
 * ```tsx
 * const { clear, reset } = useTimeout(() => {
 *   console.log('This runs after 1 second');
 * }, 1000);
 *
 * // Cancel the timeout
 * clear();
 *
 * // Restart the timeout
 * reset();
 * ```
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 * const { clear } = useTimeout(() => {
 *   setCount((prev) => prev + 1);
 * }, 5000);
 *
 * // Clear timeout on unmount or when needed
 * useEffect(() => {
 *   return () => clear();
 * }, []);
 * ```
 */
export function useTimeout(
  callback: () => void,
  delay: number | null | undefined
): { clear: () => void; reset: () => void } {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Clear function
  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  // Reset function
  const reset = useCallback(() => {
    clear();
    if (delay !== null && delay !== undefined && delay >= 0) {
      timeoutRef.current = setTimeout(() => {
        callbackRef.current();
      }, delay);
    }
  }, [delay, clear]);

  // Set up the timeout
  useEffect(() => {
    if (delay !== null && delay !== undefined && delay >= 0) {
      timeoutRef.current = setTimeout(() => {
        callbackRef.current();
      }, delay);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [delay]);

  return { clear, reset };
}

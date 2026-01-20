import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Throttles a value with a configurable delay.
 *
 * @param value - The value to throttle
 * @param delay - The delay in milliseconds (default: 500)
 * @returns The throttled value
 *
 * @example
 * ```tsx
 * const [scrollY, setScrollY] = useState(0);
 * const throttledScrollY = useThrottle(scrollY, 100);
 *
 * useEffect(() => {
 *   // This will run at most once every 100ms
 *   updateUI(throttledScrollY);
 * }, [throttledScrollY]);
 * ```
 */
export function useThrottle<T>(value: T, delay?: number): T;

/**
 * Throttles a function with a configurable delay.
 *
 * @param fn - The function to throttle
 * @param delay - The delay in milliseconds (default: 500)
 * @returns The throttled function
 *
 * @example
 * ```tsx
 * const handleScroll = useThrottle((event: Event) => {
 *   updateUI(event);
 * }, 100);
 *
 * // Call handleScroll multiple times, it will only execute at most once every 100ms
 * window.addEventListener('scroll', handleScroll);
 * ```
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay?: number
): T;

export function useThrottle<T>(
  valueOrFn: T | ((...args: unknown[]) => unknown),
  delay: number = 500
): T {
  const isFunction = typeof valueOrFn === 'function';
  const [throttledValue, setThrottledValue] = useState<T>(
    isFunction ? (valueOrFn as T) : valueOrFn
  );
  const lastRanRef = useRef<number>(0);
  const fnRef = useRef(valueOrFn);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isFirstRunRef = useRef<boolean>(true);
  const pendingValueRef = useRef<T>(valueOrFn as T);
  const fnLastRanRef = useRef<number>(-Infinity);
  const valueTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitialMountRef = useRef<boolean>(true);
  const lastScheduledRef = useRef<number>(0);
  const latestArgsRef = useRef<unknown[]>([]);

  useEffect(() => {
    fnRef.current = valueOrFn;
  }, [valueOrFn]);

  useEffect(() => {
    if (typeof valueOrFn === 'function') {
      return;
    }

    if (isInitialMountRef.current) {
      // Initial mount - value is already set via useState, just initialize timestamp
      isInitialMountRef.current = false;
      lastRanRef.current = Date.now();
      lastScheduledRef.current = Date.now();
      return;
    }

    pendingValueRef.current = valueOrFn;

    if (valueTimeoutRef.current) {
      clearTimeout(valueTimeoutRef.current);
      valueTimeoutRef.current = undefined;
    }

    const now = Date.now();
    // Use lastScheduledRef to track when the last update was scheduled
    const timeSinceLastScheduled = now - lastScheduledRef.current;

    if (timeSinceLastScheduled >= delay) {
      setThrottledValue(valueOrFn);
      lastRanRef.current = now;
      lastScheduledRef.current = now;
    } else {
      const remainingTime = delay - timeSinceLastScheduled;
      // Use pendingValueRef to ensure we always use the latest value
      valueTimeoutRef.current = setTimeout(() => {
        setThrottledValue(pendingValueRef.current);
        lastRanRef.current = Date.now();
        lastScheduledRef.current = Date.now();
        valueTimeoutRef.current = undefined;
      }, remainingTime);
    }

    return () => {
      if (valueTimeoutRef.current) {
        clearTimeout(valueTimeoutRef.current);
        valueTimeoutRef.current = undefined;
      }
    };
  }, [valueOrFn, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const throttledFn = useCallback(
    (...args: unknown[]) => {
      // Store the latest args
      latestArgsRef.current = args;

      const now = Date.now();
      const timeSinceLastRun = now - fnLastRanRef.current;

      if (isFirstRunRef.current || timeSinceLastRun >= delay) {
        isFirstRunRef.current = false;
        fnLastRanRef.current = now;
        const currentFn = fnRef.current as (...args: unknown[]) => unknown;
        if (typeof currentFn === 'function') {
          currentFn(...latestArgsRef.current);
        }
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = undefined;
        }

        timeoutRef.current = setTimeout(() => {
          fnLastRanRef.current = Date.now();
          const currentFn = fnRef.current as (...args: unknown[]) => unknown;
          if (typeof currentFn === 'function') {
            currentFn(...latestArgsRef.current);
          }
          timeoutRef.current = undefined;
        }, delay - timeSinceLastRun);
      }
    },
    [delay]
  );

  if (typeof valueOrFn === 'function') {
    return throttledFn as T;
  }

  return throttledValue;
}

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Debounces a value with a configurable delay.
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 500)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   // This will only run after user stops typing for 300ms
 *   performSearch(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>(value: T, delay?: number): T;

/**
 * Debounces a function with a configurable delay.
 *
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds (default: 500)
 * @returns The debounced function
 *
 * @example
 * ```tsx
 * const handleSearch = useDebounce((term: string) => {
 *   performSearch(term);
 * }, 300);
 *
 * // Call handleSearch multiple times, it will only execute after 300ms of inactivity
 * handleSearch('react');
 * handleSearch('react hooks');
 * ```
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay?: number
): T;

export function useDebounce<T>(
  valueOrFn: T | ((...args: unknown[]) => unknown),
  delay: number = 500
): T {
  const isFunction = typeof valueOrFn === 'function';
  const [debouncedValue, setDebouncedValue] = useState<T>(
    isFunction ? (valueOrFn as T) : valueOrFn
  );
  const fnRef = useRef(valueOrFn);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const valueTimeoutRef = useRef<NodeJS.Timeout>();
  const latestValueRef = useRef<T>(valueOrFn as T);
  const latestArgsRef = useRef<unknown[]>([]);

  useEffect(() => {
    fnRef.current = valueOrFn;
    if (typeof valueOrFn !== 'function') {
      latestValueRef.current = valueOrFn as T;
    }
  }, [valueOrFn]);

  useEffect(() => {
    if (typeof valueOrFn === 'function') {
      return;
    }

    if (valueTimeoutRef.current) {
      clearTimeout(valueTimeoutRef.current);
      valueTimeoutRef.current = undefined;
    }

    // Use ref to ensure we always use the absolute latest value
    latestValueRef.current = valueOrFn as T;
    valueTimeoutRef.current = setTimeout(() => {
      setDebouncedValue(latestValueRef.current);
      valueTimeoutRef.current = undefined;
    }, delay);

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

  const debouncedFn = useCallback(
    (...args: unknown[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }

      // Store the latest args in a ref to ensure we always use the most recent ones
      latestArgsRef.current = args;
      timeoutRef.current = setTimeout(() => {
        const currentFn = fnRef.current as (...args: unknown[]) => unknown;
        if (typeof currentFn === 'function') {
          currentFn(...latestArgsRef.current);
        }
        timeoutRef.current = undefined;
      }, delay);
    },
    [delay]
  );

  if (typeof valueOrFn === 'function') {
    return debouncedFn as T;
  }

  return debouncedValue;
}

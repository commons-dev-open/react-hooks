import { useState, useEffect, useRef } from 'react';

/**
 * Syncs state with localStorage.
 *
 * @param key - The localStorage key
 * @param initialValue - The initial value if key doesn't exist
 * @returns A tuple of [storedValue, setValue]
 *
 * @remarks
 * - Setting the value to `null` or `undefined` will remove the item from localStorage
 * - The hook listens to storage events from other tabs/windows and updates accordingly
 * - Only handles storage events from the same origin
 *
 * @example
 * ```tsx
 * const [name, setName] = useLocalStorage('name', 'John');
 *
 * return (
 *   <input
 *     value={name}
 *     onChange={(e) => setName(e.target.value)}
 *   />
 * );
 * ```
 *
 * @example
 * ```tsx
 * // Remove item by setting to null or undefined
 * const [data, setData] = useLocalStorage('data', {});
 * setData(null); // Removes 'data' from localStorage
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Use a ref to store the latest initialValue to avoid re-attaching event listeners
  // when initialValue changes reference (e.g., objects/arrays recreated on each render)
  const initialValueRef = useRef(initialValue);

  // Update ref when initialValue changes
  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (globalThis.window === undefined) {
      return initialValue;
    }

    try {
      const item = globalThis.window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        typeof value === 'function'
          ? (value as (val: T) => T)(storedValue)
          : value;
      setStoredValue(valueToStore);

      if (globalThis.window !== undefined) {
        // Remove item from localStorage if value is null or undefined
        if (valueToStore === null || valueToStore === undefined) {
          globalThis.window.localStorage.removeItem(key);
        } else {
          globalThis.window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    if (globalThis.window === undefined) {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      // Only handle events for this specific key
      if (e.key !== key) {
        return;
      }

      // Verify the event is from localStorage (not sessionStorage)
      // This check must come before handling null values to prevent
      // incorrect storage type events from triggering state updates
      if (e.storageArea !== globalThis.window.localStorage) {
        return;
      }

      // If newValue is null, the item was removed
      if (e.newValue === null) {
        setStoredValue(initialValueRef.current);
        return;
      }

      try {
        setStoredValue(JSON.parse(e.newValue));
      } catch (error) {
        console.error(`Error parsing localStorage value for key "${key}":`, error);
      }
    };

    globalThis.window.addEventListener('storage', handleStorageChange);
    return () => globalThis.window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}


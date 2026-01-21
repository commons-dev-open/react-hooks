import { useState, useEffect, useRef } from 'react';

/**
 * Syncs state with sessionStorage.
 *
 * @param key - The sessionStorage key
 * @param initialValue - The initial value if key doesn't exist
 * @returns A tuple of [storedValue, setValue]
 *
 * @remarks
 * - Setting the value to `null` or `undefined` will remove the item from sessionStorage
 * - The hook listens to storage events from other tabs/windows and updates accordingly
 * - Only handles storage events from the same origin and sessionStorage (not localStorage)
 *
 * @example
 * ```tsx
 * const [name, setName] = useSessionStorage('name', 'John');
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
 * const [data, setData] = useSessionStorage('data', {});
 * setData(null); // Removes 'data' from sessionStorage
 * ```
 */
export function useSessionStorage<T>(
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
      const item = globalThis.window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        typeof value === 'function' ? (value as (val: T) => T)(storedValue) : value;
      setStoredValue(valueToStore);

      if (globalThis.window !== undefined) {
        // Remove item from sessionStorage if value is null or undefined
        if (valueToStore === null || valueToStore === undefined) {
          globalThis.window.sessionStorage.removeItem(key);
        } else {
          globalThis.window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
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

      // Verify the event is from sessionStorage (not localStorage)
      // This check must come before handling null values to prevent
      // incorrect storage type events from triggering state updates
      if (e.storageArea !== globalThis.window.sessionStorage) {
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
        console.error(`Error parsing sessionStorage value for key "${key}":`, error);
      }
    };

    globalThis.window.addEventListener('storage', handleStorageChange);
    return () => globalThis.window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

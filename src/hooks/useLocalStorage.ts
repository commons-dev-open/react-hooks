import { useState, useEffect } from 'react';

/**
 * Syncs state with localStorage.
 *
 * @param key - The localStorage key
 * @param initialValue - The initial value if key doesn't exist
 * @returns A tuple of [storedValue, setValue]
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
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
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
        if(valueToStore) //Set in localStorage key
          globalThis.window.localStorage.setItem(key, JSON.stringify(valueToStore));
        else //Remove from localStorage key
          globalThis.window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    globalThis.window.addEventListener('storage', handleStorageChange);
    return () => globalThis.window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}


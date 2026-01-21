import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../src/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  const key = 'test-key';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(key, 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should read existing value from localStorage', () => {
    localStorage.setItem(key, JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage(key, 'initial'));
    expect(result.current[0]).toBe('stored');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage(key, 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem(key)).toBe(JSON.stringify('updated'));
  });

  it('should handle function updater', () => {
    const { result } = renderHook(() => useLocalStorage(key, 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it('should handle complex objects', () => {
    const initialValue = { name: 'John', age: 30 };
    const { result } = renderHook(() => useLocalStorage(key, initialValue));

    act(() => {
      result.current[1]({ name: 'Jane', age: 25 });
    });

    expect(result.current[0]).toEqual({ name: 'Jane', age: 25 });
    expect(JSON.parse(localStorage.getItem(key) || '')).toEqual({
      name: 'Jane',
      age: 25,
    });
  });

  it('should remove item from localStorage when value is null', () => {
    const { result } = renderHook(() => useLocalStorage(key, 'initial'));

    // First set a value
    act(() => {
      result.current[1]('stored-value');
    });
    expect(localStorage.getItem(key)).toBe(JSON.stringify('stored-value'));

    // Then set to null - should remove from localStorage
    act(() => {
      result.current[1](null as unknown as string);
    });

    expect(result.current[0]).toBe(null);
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('should remove item from localStorage when value is undefined', () => {
    const { result } = renderHook(() => useLocalStorage(key, 'initial'));

    // First set a value
    act(() => {
      result.current[1]('stored-value');
    });
    expect(localStorage.getItem(key)).toBe(JSON.stringify('stored-value'));

    // Then set to undefined - should remove from localStorage
    act(() => {
      result.current[1](undefined as unknown as string);
    });

    expect(result.current[0]).toBe(undefined);
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('should store false value in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage(key, true));

    // First set a value
    act(() => {
      result.current[1](true);
    });
    expect(localStorage.getItem(key)).toBe(JSON.stringify(true));

    // Then set to false - should store false (not remove)
    act(() => {
      result.current[1](false);
    });

    expect(result.current[0]).toBe(false);
    expect(localStorage.getItem(key)).toBe(JSON.stringify(false));
  });

  it('should store 0 value in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage(key, 10));

    // First set a value
    act(() => {
      result.current[1](5);
    });
    expect(localStorage.getItem(key)).toBe(JSON.stringify(5));

    // Then set to 0 - should store 0 (not remove)
    act(() => {
      result.current[1](0);
    });

    expect(result.current[0]).toBe(0);
    expect(localStorage.getItem(key)).toBe(JSON.stringify(0));
  });

  it('should store empty string value in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage(key, 'initial'));

    // First set a value
    act(() => {
      result.current[1]('stored-value');
    });
    expect(localStorage.getItem(key)).toBe(JSON.stringify('stored-value'));

    // Then set to empty string - should store empty string (not remove)
    act(() => {
      result.current[1]('');
    });

    expect(result.current[0]).toBe('');
    expect(localStorage.getItem(key)).toBe(JSON.stringify(''));
  });

  it('should handle storage events', () => {
    const { result } = renderHook(() => useLocalStorage(key, 'initial'));

    act(() => {
      globalThis.window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: JSON.stringify('from-storage-event'),
          storageArea: localStorage,
        })
      );
    });

    expect(result.current[0]).toBe('from-storage-event');
  });

  it('should handle storage events when item is removed', () => {
    const { result } = renderHook(() => useLocalStorage(key, 'initial'));

    act(() => {
      result.current[1]('original');
    });

    // Simulate removal from another tab/window
    act(() => {
      globalThis.window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: null,
          storageArea: localStorage,
        })
      );
    });

    expect(result.current[0]).toBe('initial');
  });

  it('should ignore removal events from sessionStorage', () => {
    const { result } = renderHook(() => useLocalStorage(key, 'initial'));

    act(() => {
      result.current[1]('original');
    });

    // Simulate removal from sessionStorage (wrong storage type)
    act(() => {
      globalThis.window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: null,
          storageArea: sessionStorage, // Wrong storage type
        })
      );
    });

    // Should not change - still 'original' because event was ignored
    expect(result.current[0]).toBe('original');
  });
});


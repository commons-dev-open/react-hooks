import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessionStorage } from '../../src/hooks/useSessionStorage';

describe('useSessionStorage', () => {
  const key = 'test-key';

  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should return initial value when sessionStorage is empty', () => {
    const { result } = renderHook(() => useSessionStorage(key, 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should read existing value from sessionStorage', () => {
    sessionStorage.setItem(key, JSON.stringify('stored'));
    const { result } = renderHook(() => useSessionStorage(key, 'initial'));
    expect(result.current[0]).toBe('stored');
  });

  it('should update sessionStorage when value changes', () => {
    const { result } = renderHook(() => useSessionStorage(key, 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(sessionStorage.getItem(key)).toBe(JSON.stringify('updated'));
  });

  it('should handle function updater', () => {
    const { result } = renderHook(() => useSessionStorage(key, 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it('should handle complex objects', () => {
    const initialValue = { name: 'John', age: 30 };
    const { result } = renderHook(() => useSessionStorage(key, initialValue));

    act(() => {
      result.current[1]({ name: 'Jane', age: 25 });
    });

    expect(result.current[0]).toEqual({ name: 'Jane', age: 25 });
    expect(JSON.parse(sessionStorage.getItem(key) || '')).toEqual({
      name: 'Jane',
      age: 25,
    });
  });

  it('should handle storage events', () => {
    const { result } = renderHook(() => useSessionStorage(key, 'initial'));

    act(() => {
      globalThis.window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: JSON.stringify('from-storage-event'),
          storageArea: sessionStorage,
        })
      );
    });

    expect(result.current[0]).toBe('from-storage-event');
  });

  it('should ignore storage events from localStorage', () => {
    const { result } = renderHook(() => useSessionStorage(key, 'initial'));

    act(() => {
      result.current[1]('original');
    });

    act(() => {
      globalThis.window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: JSON.stringify('from-localStorage'),
          storageArea: localStorage,
        })
      );
    });

    expect(result.current[0]).toBe('original');
  });

  it('should remove item from sessionStorage when value is null', () => {
    const { result } = renderHook(() => useSessionStorage(key, 'initial'));

    // First set a value
    act(() => {
      result.current[1]('stored-value');
    });
    expect(sessionStorage.getItem(key)).toBe(JSON.stringify('stored-value'));

    // Then set to null - should remove from sessionStorage
    act(() => {
      result.current[1](null as unknown as string);
    });

    expect(result.current[0]).toBe(null);
    expect(sessionStorage.getItem(key)).toBeNull();
  });

  it('should remove item from sessionStorage when value is undefined', () => {
    const { result } = renderHook(() => useSessionStorage(key, 'initial'));

    // First set a value
    act(() => {
      result.current[1]('stored-value');
    });
    expect(sessionStorage.getItem(key)).toBe(JSON.stringify('stored-value'));

    // Then set to undefined - should remove from sessionStorage
    act(() => {
      result.current[1](undefined as unknown as string);
    });

    expect(result.current[0]).toBe(undefined);
    expect(sessionStorage.getItem(key)).toBeNull();
  });

  it('should handle storage events when item is removed', () => {
    const { result } = renderHook(() => useSessionStorage(key, 'initial'));

    act(() => {
      result.current[1]('original');
    });

    // Simulate removal from another tab/window
    act(() => {
      globalThis.window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: null,
          storageArea: sessionStorage,
        })
      );
    });

    expect(result.current[0]).toBe('initial');
  });

  it('should ignore removal events from localStorage', () => {
    const { result } = renderHook(() => useSessionStorage(key, 'initial'));

    act(() => {
      result.current[1]('original');
    });

    // Simulate removal from localStorage (wrong storage type)
    act(() => {
      globalThis.window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: null,
          storageArea: localStorage, // Wrong storage type
        })
      );
    });

    // Should not change - still 'original' because event was ignored
    expect(result.current[0]).toBe('original');
  });
});

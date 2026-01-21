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
      result.current[1](null as any);
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
      result.current[1](undefined as any);
    });

    expect(result.current[0]).toBe(undefined);
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('should remove item from localStorage when value is false', () => {
    const { result } = renderHook(() => useLocalStorage(key, true));

    // First set a value
    act(() => {
      result.current[1](true);
    });
    expect(localStorage.getItem(key)).toBe(JSON.stringify(true));

    // Then set to false - should remove from localStorage
    act(() => {
      result.current[1](false);
    });

    expect(result.current[0]).toBe(false);
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('should remove item from localStorage when value is 0', () => {
    const { result } = renderHook(() => useLocalStorage(key, 10));

    // First set a value
    act(() => {
      result.current[1](5);
    });
    expect(localStorage.getItem(key)).toBe(JSON.stringify(5));

    // Then set to 0 - should remove from localStorage
    act(() => {
      result.current[1](0);
    });

    expect(result.current[0]).toBe(0);
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('should remove item from localStorage when value is empty string', () => {
    const { result } = renderHook(() => useLocalStorage(key, 'initial'));

    // First set a value
    act(() => {
      result.current[1]('stored-value');
    });
    expect(localStorage.getItem(key)).toBe(JSON.stringify('stored-value'));

    // Then set to empty string - should remove from localStorage
    act(() => {
      result.current[1]('');
    });

    expect(result.current[0]).toBe('');
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('should handle storage events', () => {
    const { result } = renderHook(() => useLocalStorage(key, 'initial'));

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: JSON.stringify('from-storage-event'),
        })
      );
    });

    expect(result.current[0]).toBe('from-storage-event');
  });
});


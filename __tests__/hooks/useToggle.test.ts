import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToggle } from '../../src/hooks/useToggle';

describe('useToggle', () => {
  it('should return false as initial value when no initial value is provided', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });

  it('should return the provided initial value', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });

  it('should toggle the value from false to true', () => {
    const { result } = renderHook(() => useToggle(false));

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](); // toggle
    });

    expect(result.current[0]).toBe(true);
  });

  it('should toggle the value from true to false', () => {
    const { result } = renderHook(() => useToggle(true));

    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1](); // toggle
    });

    expect(result.current[0]).toBe(false);
  });

  it('should toggle multiple times correctly', () => {
    const { result } = renderHook(() => useToggle(false));

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](); // toggle to true
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1](); // toggle to false
    });
    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](); // toggle to true
    });
    expect(result.current[0]).toBe(true);
  });

  it('should set value directly using setValue', () => {
    const { result } = renderHook(() => useToggle(false));

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[2](true); // setValue
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[2](false); // setValue
    });
    expect(result.current[0]).toBe(false);
  });

  it('should maintain toggle function reference across renders', () => {
    const { result, rerender } = renderHook(() => useToggle(false));

    const firstToggle = result.current[1];

    rerender();

    expect(result.current[1]).toBe(firstToggle);
  });

  it('should maintain setValue function reference across renders', () => {
    const { result, rerender } = renderHook(() => useToggle(false));

    const firstSetValue = result.current[2];

    rerender();

    expect(result.current[2]).toBe(firstSetValue);
  });

  it('should handle rapid toggles', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current[1]();
      }
    });

    // After 10 toggles, should be back to false (even number)
    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1]();
    });

    // After 11 toggles, should be true (odd number)
    expect(result.current[0]).toBe(true);
  });

  it('should work correctly when setValue is called with the same value', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      result.current[2](false); // set to false when already false
    });
    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](); // toggle to true
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[2](true); // set to true when already true
    });
    expect(result.current[0]).toBe(true);
  });

  it('should handle initial value change on rerender', () => {
    const { result, rerender } = renderHook(
      ({ initialValue }) => useToggle(initialValue),
      {
        initialProps: { initialValue: false },
      }
    );

    expect(result.current[0]).toBe(false);

    rerender({ initialValue: true });
    // Note: The hook doesn't update when initialValue changes,
    // only on first render. This is expected behavior.
    expect(result.current[0]).toBe(false);
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimeout } from '../../src/hooks/useTimeout';

describe('useTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 1, 0, 0, 0, 0));
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should execute callback after delay', () => {
    const callback = vi.fn();
    const delay = 1000;

    renderHook(() => useTimeout(callback, delay));

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not execute callback if delay is null', () => {
    const callback = vi.fn();

    renderHook(() => useTimeout(callback, null));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not execute callback if delay is undefined', () => {
    const callback = vi.fn();

    renderHook(() => useTimeout(callback, undefined));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not execute callback if delay is negative', () => {
    const callback = vi.fn();

    renderHook(() => useTimeout(callback, -100));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should clear timeout when clear is called', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useTimeout(callback, delay));

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      result.current.clear();
    });

    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should reset timeout when reset is called', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useTimeout(callback, delay));

    // Advance time but not enough to trigger callback
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();

    // Reset the timeout
    act(() => {
      result.current.reset();
    });

    // Advance time but still not enough
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();

    // Now advance the full delay
    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should update callback when callback changes', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const delay = 1000;

    const { rerender } = renderHook(
      ({ callback }) => useTimeout(callback, delay),
      { initialProps: { callback: callback1 } }
    );

    act(() => {
      rerender({ callback: callback2 });
    });

    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('should update delay when delay changes', () => {
    const callback = vi.fn();
    const initialDelay = 1000;
    const newDelay = 500;

    const { rerender } = renderHook(
      ({ delay }) => useTimeout(callback, delay),
      { initialProps: { delay: initialDelay } }
    );

    // Advance time but not enough for initial delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();

    // Change delay
    act(() => {
      rerender({ delay: newDelay });
    });

    // Advance remaining time for new delay
    act(() => {
      vi.advanceTimersByTime(newDelay);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should clear timeout on unmount', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { unmount } = renderHook(() => useTimeout(callback, delay));

    act(() => {
      unmount();
    });

    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle multiple resets', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useTimeout(callback, delay));

    // Reset multiple times
    act(() => {
      result.current.reset();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      result.current.reset();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      result.current.reset();
    });

    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle clear being called multiple times', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useTimeout(callback, delay));

    act(() => {
      result.current.clear();
      result.current.clear();
      result.current.clear();
    });

    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should work with zero delay', () => {
    const callback = vi.fn();

    renderHook(() => useTimeout(callback, 0));

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should use latest callback reference', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const delay = 1000;

    const { rerender } = renderHook(
      ({ callback }) => useTimeout(callback, delay),
      { initialProps: { callback: callback1 } }
    );

    // Change callback after some time but before timeout
    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      rerender({ callback: callback2 });
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});

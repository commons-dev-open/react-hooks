import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../../src/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    await act(async () => {
      rerender({ value: 'updated', delay: 500 });
    });
    expect(result.current).toBe('initial');

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  it('should use default delay of 500ms', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'initial' },
    });

    await act(async () => {
      rerender({ value: 'updated' });
    });
    expect(result.current).toBe('initial');

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  it('should cancel previous timeout on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'initial' },
      }
    );

    await act(async () => {
      rerender({ value: 'update1' });
      vi.advanceTimersByTime(200);
    });

    await act(async () => {
      rerender({ value: 'update2' });
      vi.advanceTimersByTime(200);
    });

    await act(async () => {
      rerender({ value: 'update3' });
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('update3');
  });

  describe('function debouncing', () => {
    it('should debounce function calls', async () => {
      const mockFn = vi.fn();
      const { result } = renderHook(() => useDebounce(mockFn, 500));

      await act(async () => {
        result.current('arg1');
        result.current('arg2');
        result.current('arg3');
      });

      expect(mockFn).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');
    });

    it('should cancel previous function call on rapid calls', async () => {
      const mockFn = vi.fn();
      const { result } = renderHook(() => useDebounce(mockFn, 500));

      await act(async () => {
        result.current('call1');
        vi.advanceTimersByTime(200);
      });

      await act(async () => {
        result.current('call2');
        vi.advanceTimersByTime(200);
      });

      await act(async () => {
        result.current('call3');
        vi.advanceTimersByTime(500);
      });

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call3');
    });

    it('should handle function with multiple arguments', async () => {
      const mockFn = vi.fn();
      const { result } = renderHook(() => useDebounce(mockFn, 300));

      await act(async () => {
        result.current('arg1', 'arg2', 123);
        vi.advanceTimersByTime(300);
      });

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useThrottle } from '../../src/hooks/useThrottle';

describe('useThrottle', () => {
  const delay = 200;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 1, 0, 0, 0, 0));
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('value throttling', () => {
    it('should return the initial value immediately', () => {
      const { result } = renderHook(() => useThrottle('initial', delay));
      expect(result.current).toBe('initial');
    });

    it('should throttle rapid value updates and apply the latest after delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useThrottle(value, delay),
        { initialProps: { value: 'a' } }
      );

      expect(result.current).toBe('a');

      // Update within the throttle window -> no immediate change
      act(() => {
        rerender({ value: 'b' });
      });
      expect(result.current).toBe('a');

      // Advance half the delay, still throttled
      act(() => {
        vi.advanceTimersByTime(delay / 2);
      });
      expect(result.current).toBe('a');

      // Another update within the same window; latest should win after remaining time
      act(() => {
        rerender({ value: 'c' });
      });
      expect(result.current).toBe('a');

      // Advance remaining time -> value should update to latest ('c')
      act(() => {
        vi.advanceTimersByTime(delay / 2);
      });
      expect(result.current).toBe('c');
    });

    it('should update again after the next full delay window', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useThrottle(value, delay),
        { initialProps: { value: 'x' } }
      );
      expect(result.current).toBe('x');

      // Schedule update to 'y'
      act(() => {
        rerender({ value: 'y' });
      });
      act(() => {
        vi.advanceTimersByTime(delay);
      });
      expect(result.current).toBe('y');

      // Next cycle: update to 'z' and wait full delay
      act(() => {
        rerender({ value: 'z' });
      });
      // No immediate change
      expect(result.current).toBe('y');
      act(() => {
        vi.advanceTimersByTime(delay);
      });
      expect(result.current).toBe('z');
    });
  });

  describe('function throttling', () => {
    it('should invoke immediately on first call, then throttle subsequent calls', () => {
      const spy = vi.fn();
      // Provide a wrapper without StrictMode to avoid double-invocation in dev
      const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
        React.createElement(React.Fragment, null, children);
      const { result } = renderHook(() => useThrottle(spy, delay), {
        wrapper: Wrapper,
        // Use legacy root to avoid StrictEffects double-invocation in React 18 tests
        legacyRoot: true,
      });

      // First call is immediate
      act(() => {
        result.current('first');
      });
      const baselineCalls = spy.mock.calls.length;
      expect(spy).toHaveBeenLastCalledWith('first');

      // Multiple rapid calls within delay -> no immediate invocation
      act(() => {
        result.current('second');
        result.current('third');
      });
      expect(spy).toHaveBeenCalledTimes(baselineCalls);

      // After delay expires, latest call ('third') should be invoked once
      act(() => {
        vi.advanceTimersByTime(delay);
      });
      expect(spy).toHaveBeenCalledTimes(baselineCalls + 1);
      expect(spy).toHaveBeenLastCalledWith('third');
    });

    it('should execute immediately again after the delay window', () => {
      const spy = vi.fn();
      const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
        React.createElement(React.Fragment, null, children);
      const { result } = renderHook(() => useThrottle(spy, delay), {
        wrapper: Wrapper,
        legacyRoot: true,
      });

      // First call -> immediate
      act(() => {
        result.current('t1');
      });
      const baselineCalls = spy.mock.calls.length;
      expect(spy).toHaveBeenLastCalledWith('t1');

      // Wait full delay window
      act(() => {
        vi.advanceTimersByTime(delay);
      });

      // Next call after delay -> immediate
      act(() => {
        result.current('t2');
      });
      expect(spy).toHaveBeenCalledTimes(baselineCalls + 1);
      expect(spy).toHaveBeenLastCalledWith('t2');
    });
  });
});


import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useDebounce } from '../../src/hooks/useDebounce';

describe('useDebounce', () => {
  const delay = 200;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 1, 0, 0, 0, 0));
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('value debouncing', () => {
    it('should return the initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', delay));
      expect(result.current).toBe('initial');
    });

    it('should debounce rapid value updates and apply the latest after delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, delay),
        { initialProps: { value: 'a' } }
      );

      expect(result.current).toBe('a');

      // Update within the debounce window -> no immediate change
      act(() => {
        rerender({ value: 'b' });
      });
      expect(result.current).toBe('a');

      // Advance half the delay, still debounced
      act(() => {
        vi.advanceTimersByTime(delay / 2);
      });
      expect(result.current).toBe('a');

      // Another update within the same window; resets timer, latest should win
      act(() => {
        rerender({ value: 'c' });
      });
      expect(result.current).toBe('a');

      // Advance remaining time -> value should update to latest ('c')
      act(() => {
        vi.advanceTimersByTime(delay);
      });
      expect(result.current).toBe('c');
    });

    it('should update again after the next full delay window', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, delay),
        { initialProps: { value: 'x' } }
      );
      expect(result.current).toBe('x');

      // Update to 'y'
      act(() => {
        rerender({ value: 'y' });
      });
      // No immediate change
      expect(result.current).toBe('x');
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

    it('should reset timer on each new update', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, delay),
        { initialProps: { value: 'start' } }
      );
      expect(result.current).toBe('start');

      // Rapid updates that reset the timer
      act(() => {
        rerender({ value: 'update1' });
      });
      act(() => {
        vi.advanceTimersByTime(delay / 2);
      });
      expect(result.current).toBe('start');

      act(() => {
        rerender({ value: 'update2' });
      });
      act(() => {
        vi.advanceTimersByTime(delay / 2);
      });
      expect(result.current).toBe('start');

      act(() => {
        rerender({ value: 'final' });
      });
      // After full delay from last update, should be 'final'
      act(() => {
        vi.advanceTimersByTime(delay);
      });
      expect(result.current).toBe('final');
    });
  });

  describe('function debouncing', () => {
    it('should debounce function calls and execute only the latest after delay', () => {
      const spy = vi.fn();
      const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
        React.createElement(React.Fragment, null, children);
      const { result } = renderHook(() => useDebounce(spy, delay), {
        wrapper: Wrapper,
        legacyRoot: true,
      });

      // Clear any initial calls that might occur due to StrictMode or initialization
      spy.mockClear();

      // Multiple rapid calls -> no immediate invocation
      act(() => {
        result.current('first');
        result.current('second');
        result.current('third');
      });
      expect(spy).not.toHaveBeenCalled();

      // After delay expires, latest call ('third') should be invoked once
      act(() => {
        vi.advanceTimersByTime(delay);
      });
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('third');
    });

    it('should reset timer on each new function call', () => {
      const spy = vi.fn();
      const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
        React.createElement(React.Fragment, null, children);
      const { result } = renderHook(() => useDebounce(spy, delay), {
        wrapper: Wrapper,
        legacyRoot: true,
      });

      // Clear any initial calls that might occur due to StrictMode or initialization
      spy.mockClear();

      // First call
      act(() => {
        result.current('call1');
      });
      expect(spy).not.toHaveBeenCalled();

      // Advance half delay
      act(() => {
        vi.advanceTimersByTime(delay / 2);
      });
      expect(spy).not.toHaveBeenCalled();

      // Second call resets timer
      act(() => {
        result.current('call2');
      });
      expect(spy).not.toHaveBeenCalled();

      // Advance half delay again - still not enough
      act(() => {
        vi.advanceTimersByTime(delay / 2);
      });
      expect(spy).not.toHaveBeenCalled();

      // Advance remaining delay - should execute now
      act(() => {
        vi.advanceTimersByTime(delay / 2);
      });
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('call2');
    });

    it('should execute multiple times with sufficient delay between calls', () => {
      const spy = vi.fn();
      const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
        React.createElement(React.Fragment, null, children);
      const { result } = renderHook(() => useDebounce(spy, delay), {
        wrapper: Wrapper,
        legacyRoot: true,
      });

      // Clear any initial calls that might occur due to StrictMode or initialization
      spy.mockClear();

      // First call
      act(() => {
        result.current('first');
      });
      act(() => {
        vi.advanceTimersByTime(delay);
      });
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('first');

      // Second call after delay
      act(() => {
        result.current('second');
      });
      act(() => {
        vi.advanceTimersByTime(delay);
      });
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith('second');
    });

    it('should use latest arguments when multiple calls are debounced', () => {
      const spy = vi.fn();
      const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
        React.createElement(React.Fragment, null, children);
      const { result } = renderHook(() => useDebounce(spy, delay), {
        wrapper: Wrapper,
        legacyRoot: true,
      });

      // Clear any initial calls that might occur due to StrictMode or initialization
      spy.mockClear();

      act(() => {
        result.current('arg1', 'arg2');
        result.current('arg3', 'arg4');
        result.current('arg5', 'arg6');
      });

      act(() => {
        vi.advanceTimersByTime(delay);
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('arg5', 'arg6');
    });
  });
});

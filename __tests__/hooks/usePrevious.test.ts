import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useState } from 'react';
import { usePrevious } from '../../src/hooks/usePrevious';

describe('usePrevious', () => {
  it('should return undefined on first render', () => {
    const { result } = renderHook(() => usePrevious(0));
    expect(result.current).toBeUndefined();
  });

  it('should return previous value after update', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 0 },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: 1 });
    expect(result.current).toBe(0);

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    rerender({ value: 3 });
    expect(result.current).toBe(2);
  });

  it('should handle string values', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'first' },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: 'second' });
    expect(result.current).toBe('first');

    rerender({ value: 'third' });
    expect(result.current).toBe('second');
  });

  it('should handle object values', () => {
    const obj1 = { name: 'John', age: 30 };
    const obj2 = { name: 'Jane', age: 25 };
    const obj3 = { name: 'Bob', age: 40 };

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: obj1 },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: obj2 });
    expect(result.current).toBe(obj1);

    rerender({ value: obj3 });
    expect(result.current).toBe(obj2);
  });

  it('should handle array values', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];
    const arr3 = [7, 8, 9];

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: arr1 },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: arr2 });
    expect(result.current).toBe(arr1);

    rerender({ value: arr3 });
    expect(result.current).toBe(arr2);
  });

  it('should handle null values', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: null },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: 'not null' });
    expect(result.current).toBeNull();

    rerender({ value: null });
    expect(result.current).toBe('not null');
  });

  it('should handle undefined values', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: undefined },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: 'defined' });
    expect(result.current).toBeUndefined();

    rerender({ value: undefined });
    expect(result.current).toBe('defined');
  });

  it('should handle boolean values', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: true },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: false });
    expect(result.current).toBe(true);

    rerender({ value: true });
    expect(result.current).toBe(false);
  });

  it('should work with useState', () => {
    const { result } = renderHook(() => {
      const [count, setCount] = useState(0);
      const prevCount = usePrevious(count);

      return { count, setCount, prevCount };
    });

    expect(result.current.count).toBe(0);
    expect(result.current.prevCount).toBeUndefined();

    act(() => {
      result.current.setCount(1);
    });

    expect(result.current.count).toBe(1);
    expect(result.current.prevCount).toBe(0);

    act(() => {
      result.current.setCount(2);
    });

    expect(result.current.count).toBe(2);
    expect(result.current.prevCount).toBe(1);
  });

  it('should handle rapid updates', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 0 },
    });

    for (let i = 1; i <= 10; i++) {
      rerender({ value: i });
      expect(result.current).toBe(i - 1);
    }
  });

  it('should preserve reference equality for objects', () => {
    const obj = { id: 1 };
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: obj },
    });

    rerender({ value: obj });
    expect(result.current).toBe(obj);
  });
});

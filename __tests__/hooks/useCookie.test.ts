import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCookie } from '../../src/hooks/useCookie';

describe('useCookie', () => {
  const key = 'test-key';

  beforeEach(() => {
    // Clear cookies before each test
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    });
  });

  afterEach(() => {
    // Clear cookies after each test
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    });
  });

  it('should return initial value when cookie is empty', () => {
    const { result } = renderHook(() => useCookie(key, 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should read existing value from cookie', () => {
    document.cookie = `${key}=${encodeURIComponent(JSON.stringify('stored'))}`;
    const { result } = renderHook(() => useCookie(key, 'initial'));
    expect(result.current[0]).toBe('stored');
  });

  it('should update cookie when value changes', () => {
    const { result } = renderHook(() => useCookie(key, 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(document.cookie).toContain(key);
  });

  it('should handle function updater', () => {
    const { result } = renderHook(() => useCookie(key, 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it('should handle complex objects', () => {
    const initialValue = { name: 'John', age: 30 };
    const { result } = renderHook(() => useCookie(key, initialValue));

    act(() => {
      result.current[1]({ name: 'Jane', age: 25 });
    });

    expect(result.current[0]).toEqual({ name: 'Jane', age: 25 });
  });

  it('should remove cookie when removeValue is called', () => {
    const { result } = renderHook(() => useCookie(key, 'initial'));

    act(() => {
      result.current[1]('value');
    });

    expect(result.current[0]).toBe('value');

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe('initial');
  });

  it('should handle cookie options', () => {
    const options = {
      expires: 7, // 7 days
      path: '/',
      secure: true,
      sameSite: 'strict' as const,
    };

    const { result } = renderHook(() => useCookie(key, 'initial', options));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    const cookieString = document.cookie;
    expect(cookieString).toContain(key);
  });

  it('should handle date expires option', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const { result } = renderHook(() =>
      useCookie(key, 'initial', { expires: futureDate })
    );

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(document.cookie).toContain(key);
  });

  it('should handle multiple cookies', () => {
    const key1 = 'key1';
    const key2 = 'key2';

    const { result: result1 } = renderHook(() => useCookie(key1, 'value1'));
    const { result: result2 } = renderHook(() => useCookie(key2, 'value2'));

    act(() => {
      result1.current[1]('updated1');
      result2.current[1]('updated2');
    });

    expect(result1.current[0]).toBe('updated1');
    expect(result2.current[0]).toBe('updated2');
  });
});

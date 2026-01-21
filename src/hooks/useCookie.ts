import { useState, useCallback } from 'react';

interface CookieOptions {
  expires?: Date | number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Syncs state with cookies.
 *
 * @param key - The cookie key
 * @param initialValue - The initial value if key doesn't exist
 * @param options - Cookie options (expires, path, domain, secure, sameSite)
 * @returns A tuple of [storedValue, setValue, removeValue]
 *
 * @remarks
 * - Values are automatically JSON stringified/parsed
 * - For security, consider using `secure: true` and `sameSite: 'strict'` options for sensitive data
 * - Cookie values are URL-encoded to handle special characters safely
 * - Always validate and sanitize cookie values before use to prevent XSS attacks
 *
 * @example
 * ```tsx
 * const [theme, setTheme, removeTheme] = useCookie('theme', 'light', {
 *   expires: 7, // days
 *   path: '/',
 * });
 *
 * return (
 *   <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
 *     Current theme: {theme}
 *   </button>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // Secure cookie example
 * const [token, setToken] = useCookie('auth-token', '', {
 *   expires: 1, // 1 day
 *   secure: true,
 *   sameSite: 'strict',
 *   path: '/',
 * });
 * ```
 */
export function useCookie<T>(
  key: string,
  initialValue: T,
  options?: CookieOptions
): [T, (value: T | ((val: T) => T), cookieOptions?: CookieOptions) => void, () => void] {
  const getCookieValue = useCallback((): T => {
    if (globalThis.document === undefined) {
      return initialValue;
    }

    try {
      const cookies = globalThis.document.cookie.split(';');
      const cookie = cookies.find((c) => c.trim().startsWith(`${key}=`));

      if (!cookie) {
        return initialValue;
      }

      const value = cookie.split('=')[1];
      return JSON.parse(decodeURIComponent(value));
    } catch (error) {
      console.error(`Error reading cookie key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(getCookieValue);

  const setCookie = useCallback(
    (
      value: T | ((val: T) => T),
      cookieOptions?: CookieOptions
    ): void => {
      try {
        const valueToStore =
          typeof value === 'function' ? (value as (val: T) => T)(storedValue) : value;
        setStoredValue(valueToStore);

        if (globalThis.document === undefined) {
          return;
        }

        const opts = cookieOptions || options || {};
        let cookieString = `${key}=${encodeURIComponent(JSON.stringify(valueToStore))}`;

        if (opts.expires) {
          let expiresDate: Date;
          if (typeof opts.expires === 'number') {
            expiresDate = new Date();
            expiresDate.setTime(
              expiresDate.getTime() + opts.expires * 24 * 60 * 60 * 1000
            );
          } else {
            expiresDate = opts.expires;
          }
          cookieString += `; expires=${expiresDate.toUTCString()}`;
        }

        if (opts.path) {
          cookieString += `; path=${opts.path}`;
        }

        if (opts.domain) {
          cookieString += `; domain=${opts.domain}`;
        }

        if (opts.secure) {
          cookieString += '; secure';
        }

        if (opts.sameSite) {
          cookieString += `; samesite=${opts.sameSite}`;
        }

        globalThis.document.cookie = cookieString;
      } catch (error) {
        console.error(`Error setting cookie key "${key}":`, error);
      }
    },
    [key, options, storedValue]
  );

  const removeCookie = useCallback((): void => {
    try {
      setStoredValue(initialValue);

      if (globalThis.document === undefined) {
        return;
      }

      const opts = options || {};
      let cookieString = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`;

      if (opts.path) {
        cookieString += `; path=${opts.path}`;
      }

      if (opts.domain) {
        cookieString += `; domain=${opts.domain}`;
      }

      globalThis.document.cookie = cookieString;
    } catch (error) {
      console.error(`Error removing cookie key "${key}":`, error);
    }
  }, [key, options, initialValue]);

  return [storedValue, setCookie, removeCookie];
}

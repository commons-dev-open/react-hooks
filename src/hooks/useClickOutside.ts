import { useEffect, useRef } from 'react';

interface UseClickOutsideOptions {
  /**
   * The event type to listen for
   * @default 'mousedown'
   */
  eventType?: 'mousedown' | 'click';
  /**
   * Whether the hook is enabled
   * @default true
   */
  enabled?: boolean;
}

/**
 * Detects clicks outside a referenced element.
 *
 * @param callback - Function to call when a click outside occurs
 * @param options - Configuration options
 * @returns A ref object to attach to the element
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const ref = useClickOutside(() => {
 *     console.log('Clicked outside!');
 *   });
 *
 *   return <div ref={ref}>Click outside me</div>;
 * };
 * ```
 *
 * @example
 * ```tsx
 * // With options
 * const ref = useClickOutside(
 *   () => setIsOpen(false),
 *   { eventType: 'click', enabled: isOpen }
 * );
 * ```
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void,
  options?: UseClickOutsideOptions
): React.RefObject<T> {
  const ref = useRef<T>(null);
  const callbackRef = useRef(callback);
  const { eventType = 'mousedown', enabled = true } = options || {};

  // Keep callback ref up to date without re-attaching event listeners
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // SSR safety check
    if (typeof document === 'undefined') {
      return;
    }

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;

      // Check if the click is outside the element referenced by 'ref'
      if (ref.current && target && !ref.current.contains(target)) {
        callbackRef.current();
      }
    }

    // Attach the event listener
    document.addEventListener(eventType, handleClickOutside);

    // Also listen for touch events on mobile devices
    if (eventType === 'mousedown') {
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      // Cleanup the event listeners on component unmount or when dependencies change
      document.removeEventListener(eventType, handleClickOutside);
      if (eventType === 'mousedown') {
        document.removeEventListener('touchstart', handleClickOutside);
      }
    };
  }, [eventType, enabled]);

  return ref;
}

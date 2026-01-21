import { useState, useCallback } from 'react';

/**
 * Manages a boolean state with a toggle function.
 *
 * @param initialValue - The initial boolean value (defaults to false)
 * @returns A tuple of [value, toggle, setValue] where:
 *   - value: The current boolean state
 *   - toggle: Function to toggle the boolean value
 *   - setValue: Function to set the value directly
 *
 * @example
 * ```tsx
 * const [isOpen, toggle, setIsOpen] = useToggle(false);
 *
 * return (
 *   <div>
 *     <button onClick={toggle}>Toggle</button>
 *     {isOpen && <div>Content</div>}
 *   </div>
 * );
 * ```
 *
 * @example
 * ```tsx
 * const [isEnabled, toggle] = useToggle();
 *
 * return (
 *   <button onClick={toggle} disabled={!isEnabled}>
 *     {isEnabled ? 'Enabled' : 'Disabled'}
 *   </button>
 * );
 * ```
 */
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const setToggleValue = useCallback((newValue: boolean) => {
    setValue(newValue);
  }, []);

  return [value, toggle, setToggleValue];
}

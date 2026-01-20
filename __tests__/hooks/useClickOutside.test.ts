import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useClickOutside } from '../../src/hooks/useClickOutside';

describe('useClickOutside', () => {
  let container: HTMLDivElement;
  let element: HTMLDivElement;
  let outsideElement: HTMLDivElement;

  beforeEach(() => {
    // Create a container element
    container = document.createElement('div');
    document.body.appendChild(container);

    // Create the element that will have the ref
    element = document.createElement('div');
    element.id = 'test-element';
    container.appendChild(element);

    // Create an element outside
    outsideElement = document.createElement('div');
    outsideElement.id = 'outside-element';
    container.appendChild(outsideElement);
  });

  afterEach(() => {
    // Cleanup
    document.body.removeChild(container);
  });

  it('should call callback when clicking outside the element', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside(callback));

    // Attach ref to element
    act(() => {
      if (result.current.current === null) {
        (result.current as React.MutableRefObject<HTMLDivElement>).current = element;
      }
    });

    // Simulate click outside
    act(() => {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });
      outsideElement.dispatchEvent(event);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not call callback when clicking inside the element', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside(callback));

    // Attach ref to element
    act(() => {
      if (result.current.current === null) {
        (result.current as React.MutableRefObject<HTMLDivElement>).current = element;
      }
    });

    // Simulate click inside
    act(() => {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(event);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle touch events on mobile devices', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside(callback));

    // Attach ref to element
    act(() => {
      if (result.current.current === null) {
        (result.current as React.MutableRefObject<HTMLDivElement>).current = element;
      }
    });

    // Simulate touch outside
    act(() => {
      const event = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
      });
      outsideElement.dispatchEvent(event);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not call callback when touching inside the element', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside(callback));

    // Attach ref to element
    act(() => {
      if (result.current.current === null) {
        (result.current as React.MutableRefObject<HTMLDivElement>).current = element;
      }
    });

    // Simulate touch inside
    act(() => {
      const event = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(event);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should use click event type when specified', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useClickOutside(callback, { eventType: 'click' })
    );

    // Attach ref to element
    act(() => {
      if (result.current.current === null) {
        (result.current as React.MutableRefObject<HTMLDivElement>).current = element;
      }
    });

    // Simulate click outside with 'click' event
    act(() => {
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      outsideElement.dispatchEvent(event);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not listen to touch events when eventType is click', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useClickOutside(callback, { eventType: 'click' })
    );

    // Attach ref to element
    act(() => {
      if (result.current.current === null) {
        (result.current as React.MutableRefObject<HTMLDivElement>).current = element;
      }
    });

    // Simulate touch outside - should not trigger callback
    act(() => {
      const event = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
      });
      outsideElement.dispatchEvent(event);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not call callback when disabled', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ enabled }) => useClickOutside(callback, { enabled }),
      {
        initialProps: { enabled: false },
      }
    );

    // Attach ref to element
    act(() => {
      if (result.current.current === null) {
        (result.current as React.MutableRefObject<HTMLDivElement>).current = element;
      }
    });

    // Simulate click outside while disabled
    act(() => {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });
      outsideElement.dispatchEvent(event);
    });

    expect(callback).not.toHaveBeenCalled();

    // Enable the hook
    rerender({ enabled: true });

    // Simulate click outside while enabled
    act(() => {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });
      outsideElement.dispatchEvent(event);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should update callback without re-attaching event listeners', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const { result, rerender } = renderHook(
      ({ callback }) => useClickOutside(callback),
      {
        initialProps: { callback: callback1 },
      }
    );

    // Attach ref to element
    act(() => {
      if (result.current.current === null) {
        (result.current as React.MutableRefObject<HTMLDivElement>).current = element;
      }
    });

    // Update callback
    rerender({ callback: callback2 });

    // Simulate click outside
    act(() => {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });
      outsideElement.dispatchEvent(event);
    });

    // Should call the new callback, not the old one
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('should handle nested elements correctly', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside(callback));

    // Create a nested element
    const nestedElement = document.createElement('div');
    nestedElement.id = 'nested-element';
    element.appendChild(nestedElement);

    // Attach ref to parent element
    act(() => {
      if (result.current.current === null) {
        (result.current as React.MutableRefObject<HTMLDivElement>).current = element;
      }
    });

    // Click on nested element - should not trigger callback
    act(() => {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });
      nestedElement.dispatchEvent(event);
    });

    expect(callback).not.toHaveBeenCalled();

    // Click outside - should trigger callback
    act(() => {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });
      outsideElement.dispatchEvent(event);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle null ref gracefully', () => {
    const callback = vi.fn();
    renderHook(() => useClickOutside(callback));

    // Simulate click when ref is null
    act(() => {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });
      outsideElement.dispatchEvent(event);
    });

    // Should not throw error, but callback should not be called
    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle event target being null', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside(callback));

    // Attach ref to element
    act(() => {
      if (result.current.current === null) {
        (result.current as React.MutableRefObject<HTMLDivElement>).current = element;
      }
    });

    // Create event with null target
    act(() => {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, 'target', {
        value: null,
        writable: false,
      });
      document.dispatchEvent(event);
    });

    // Should not throw error
    expect(callback).not.toHaveBeenCalled();
  });

  it('should cleanup event listeners on unmount', () => {
    const callback = vi.fn();
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { result, unmount } = renderHook(() => useClickOutside(callback));

    // Attach ref to element
    act(() => {
      if (result.current.current === null) {
        (result.current as React.MutableRefObject<HTMLDivElement>).current = element;
      }
    });

    // Verify event listeners were added
    expect(addEventListenerSpy).toHaveBeenCalled();

    // Unmount
    unmount();

    // Verify event listeners were removed
    expect(removeEventListenerSpy).toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should work with different HTML element types', () => {
    const callback = vi.fn();
    const button = document.createElement('button');
    button.id = 'test-button';
    container.appendChild(button);

    const { result } = renderHook(() => useClickOutside<HTMLButtonElement>(callback));

    // Attach ref to button
    act(() => {
      if (result.current.current === null) {
        (result.current as React.MutableRefObject<HTMLButtonElement>).current = button;
      }
    });

    // Click outside button
    act(() => {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });
      outsideElement.dispatchEvent(event);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});

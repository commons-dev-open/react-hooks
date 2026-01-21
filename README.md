# @commons-dev/react-hooks

A collection of useful React hooks built with TypeScript. This package provides tree-shakeable hooks that can be imported individually to keep your bundle size minimal.

## Installation

```bash
npm install @commons-dev/react-hooks
```

```bash
yarn add @commons-dev/react-hooks
```

```bash
pnpm add @commons-dev/react-hooks
```

## Features

- 🎯 **Tree-shakeable** - Import only what you need
- 📦 **TypeScript** - Full TypeScript support
- 🚀 **Lightweight** - Minimal dependencies
- ✅ **Well-tested** - Comprehensive test coverage
- 📖 **Well-documented** - Clear API documentation

## Hooks

### useDebounce

Debounces a value or function, delaying updates until after a specified period of inactivity. This is useful for reducing the frequency of expensive operations like API calls or DOM updates.

**How it works:** When debouncing a value, the hook waits for the value to stop changing for the specified delay before updating. When debouncing a function, the function will only execute after the delay period has passed since the last call.

**Debouncing a value:**

```tsx
import { useDebounce } from '@commons-dev/react-hooks';
import { useState, useEffect } from 'react';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    // This will only run after user stops typing for 300ms
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

**Debouncing a function:**

```tsx
import { useDebounce } from '@commons-dev/react-hooks';

function SearchComponent() {
  const handleSearch = useDebounce((term: string) => {
    performSearch(term);
  }, 300);

  return (
    <input
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

**API:**

```typescript
// Debounce a value
function useDebounce<T>(value: T, delay?: number): T;

// Debounce a function
function useDebounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay?: number
): T;
```

**Parameters:**

- `value` - The value to debounce, OR
- `fn` - The function to debounce
- `delay` - The delay in milliseconds (default: `500`)

**Returns:**

- The debounced value or debounced function

**Use cases:**

- Search input fields (wait for user to finish typing)
- Window resize handlers
- Form validation (validate after user stops typing)
- API calls triggered by user input

---

### useThrottle

Throttles a value or function, limiting how often it can update or execute. Unlike debouncing, throttling ensures the function/value updates at regular intervals, not just after inactivity.

**How it works:** When throttling a value, the hook updates the value at most once per delay period. When throttling a function, the function will execute at most once per delay period, even if called multiple times.

**Throttling a value:**

```tsx
import { useThrottle } from '@commons-dev/react-hooks';
import { useState, useEffect } from 'react';

function ScrollComponent() {
  const [scrollY, setScrollY] = useState(0);
  const throttledScrollY = useThrottle(scrollY, 100);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // This will run at most once every 100ms
    updateUI(throttledScrollY);
  }, [throttledScrollY]);

  return <div>Scroll position: {throttledScrollY}</div>;
}
```

**Throttling a function:**

```tsx
import { useThrottle } from '@commons-dev/react-hooks';
import { useEffect } from 'react';

function ScrollComponent() {
  const handleScroll = useThrottle((event: Event) => {
    updateUI(event);
  }, 100);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return <div>Scroll component</div>;
}
```

**API:**

```typescript
// Throttle a value
function useThrottle<T>(value: T, delay?: number): T;

// Throttle a function
function useThrottle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay?: number
): T;
```

**Parameters:**

- `value` - The value to throttle, OR
- `fn` - The function to throttle
- `delay` - The delay in milliseconds (default: `500`)

**Returns:**

- The throttled value or throttled function

**Use cases:**

- Scroll event handlers
- Mouse move events
- Window resize handlers
- Real-time data updates (e.g., stock prices, live feeds)

**Difference from debounce:**

- **Debounce**: Waits for inactivity before executing (good for search inputs)
- **Throttle**: Executes at regular intervals (good for scroll/resize events)

---

### useLocalStorage

Synchronizes component state with `localStorage`, persisting data across browser sessions. The hook automatically handles serialization/deserialization and listens for storage events from other tabs/windows.

**How it works:** The hook reads from `localStorage` on mount and writes to it whenever the state changes. It also listens for `storage` events to keep the state in sync across multiple tabs/windows. The hook is SSR-safe and will gracefully handle cases where `localStorage` is unavailable.

**Basic usage:**

```tsx
import { useLocalStorage } from '@commons-dev/react-hooks';

function PreferencesComponent() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      <p>Current theme: {theme}</p>
    </div>
  );
}
```

**With complex objects:**

```tsx
import { useLocalStorage } from '@commons-dev/react-hooks';

interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

function SettingsComponent() {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    'userPreferences',
    {
      theme: 'light',
      language: 'en',
      notifications: true,
    }
  );

  const updateTheme = (newTheme: 'light' | 'dark') => {
    setPreferences({ ...preferences, theme: newTheme });
  };

  // Or use functional update
  const toggleNotifications = () => {
    setPreferences((prev) => ({
      ...prev,
      notifications: !prev.notifications,
    }));
  };

  return (
    <div>
      <button onClick={() => updateTheme('dark')}>Dark Mode</button>
      <button onClick={toggleNotifications}>
        {preferences.notifications ? 'Disable' : 'Enable'} Notifications
      </button>
    </div>
  );
}
```

**API:**

```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void];
```

**Parameters:**

- `key` - The `localStorage` key to store the value under
- `initialValue` - The initial value to use if the key doesn't exist in `localStorage`

**Returns:**

- A tuple `[storedValue, setValue]` similar to `useState`
  - `storedValue` - The current value from `localStorage` (or `initialValue` if not found)
  - `setValue` - A function to update the value. Accepts either a new value or a function that receives the previous value and returns the new value

**Features:**

- ✅ Automatic JSON serialization/deserialization
- ✅ SSR-safe (handles server-side rendering gracefully)
- ✅ Cross-tab synchronization (listens to `storage` events)
- ✅ Error handling (logs errors if `localStorage` operations fail)
- ✅ Supports functional updates (like `useState`)

**Notes:**

- Values are stored as JSON, so they must be JSON-serializable
- The hook will use `initialValue` if `localStorage` is unavailable (e.g., in SSR or private browsing mode)
- Changes made in other tabs/windows will automatically update the state

---

### useSessionStorage

Synchronizes component state with `sessionStorage`, persisting data for the current browser session. Unlike `localStorage`, data stored in `sessionStorage` is cleared when the browser tab is closed.

**How it works:** The hook reads from `sessionStorage` on mount and writes to it whenever the state changes. It also listens for `storage` events to keep the state in sync across multiple tabs/windows (only for the same session). The hook is SSR-safe and will gracefully handle cases where `sessionStorage` is unavailable.

**Basic usage:**

```tsx
import { useSessionStorage } from '@commons-dev/react-hooks';

function SessionComponent() {
  const [sessionId, setSessionId] = useSessionStorage('sessionId', '');

  useEffect(() => {
    if (!sessionId) {
      setSessionId(generateSessionId());
    }
  }, [sessionId, setSessionId]);

  return <div>Session ID: {sessionId}</div>;
}
```

**With complex objects:**

```tsx
import { useSessionStorage } from '@commons-dev/react-hooks';

interface FormData {
  name: string;
  email: string;
  message: string;
}

function ContactForm() {
  const [formData, setFormData] = useSessionStorage<FormData>(
    'contactForm',
    {
      name: '',
      email: '',
      message: '',
    }
  );

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form>
      <input
        value={formData.name}
        onChange={(e) => updateField('name', e.target.value)}
        placeholder="Name"
      />
      <input
        value={formData.email}
        onChange={(e) => updateField('email', e.target.value)}
        placeholder="Email"
      />
      <textarea
        value={formData.message}
        onChange={(e) => updateField('message', e.target.value)}
        placeholder="Message"
      />
    </form>
  );
}
```

**API:**

```typescript
function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void];
```

**Parameters:**

- `key` - The `sessionStorage` key to store the value under
- `initialValue` - The initial value to use if the key doesn't exist in `sessionStorage`

**Returns:**

- A tuple `[storedValue, setValue]` similar to `useState`
  - `storedValue` - The current value from `sessionStorage` (or `initialValue` if not found)
  - `setValue` - A function to update the value. Accepts either a new value or a function that receives the previous value and returns the new value

**Features:**

- ✅ Automatic JSON serialization/deserialization
- ✅ SSR-safe (handles server-side rendering gracefully)
- ✅ Cross-tab synchronization (listens to `storage` events from sessionStorage)
- ✅ Error handling (logs errors if `sessionStorage` operations fail)
- ✅ Supports functional updates (like `useState`)

**Notes:**

- Values are stored as JSON, so they must be JSON-serializable
- The hook will use `initialValue` if `sessionStorage` is unavailable (e.g., in SSR or private browsing mode)
- Data is cleared when the browser tab is closed (unlike `localStorage`)
- Changes made in other tabs/windows will automatically update the state (for the same session)

**Difference from useLocalStorage:**

- **useLocalStorage**: Data persists across browser sessions (until explicitly cleared)
- **useSessionStorage**: Data is cleared when the browser tab is closed

---

### useCookie

Synchronizes component state with browser cookies, allowing you to store and retrieve data that persists across browser sessions and can be sent to the server.

**How it works:** The hook reads from cookies on mount and writes to them whenever the state changes. Cookies are automatically serialized/deserialized as JSON. The hook supports all standard cookie options including expiration, path, domain, secure, and sameSite.

**Basic usage:**

```tsx
import { useCookie } from '@commons-dev/react-hooks';

function ThemeComponent() {
  const [theme, setTheme, removeTheme] = useCookie('theme', 'light');

  return (
    <div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      <button onClick={removeTheme}>Reset Theme</button>
      <p>Current theme: {theme}</p>
    </div>
  );
}
```

**With cookie options:**

```tsx
import { useCookie } from '@commons-dev/react-hooks';

function PreferencesComponent() {
  const [preferences, setPreferences] = useCookie(
    'userPreferences',
    { language: 'en', timezone: 'UTC' },
    {
      expires: 30, // 30 days
      path: '/',
      secure: true,
      sameSite: 'strict',
    }
  );

  const updateLanguage = (lang: string) => {
    setPreferences({ ...preferences, language: lang });
  };

  return (
    <div>
      <select
        value={preferences.language}
        onChange={(e) => updateLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
      </select>
    </div>
  );
}
```

**With per-call options:**

```tsx
import { useCookie } from '@commons-dev/react-hooks';

function AuthComponent() {
  const [token, setToken] = useCookie('authToken', '');

  const handleLogin = (newToken: string) => {
    // Set cookie with specific options for this call
    setToken(newToken, {
      expires: 7, // 7 days
      path: '/',
      secure: true,
      sameSite: 'strict',
    });
  };

  return <button onClick={() => handleLogin('abc123')}>Login</button>;
}
```

**API:**

```typescript
function useCookie<T>(
  key: string,
  initialValue: T,
  options?: CookieOptions
): [T, (value: T | ((val: T) => T), cookieOptions?: CookieOptions) => void, () => void];
```

**Parameters:**

- `key` - The cookie key to store the value under
- `initialValue` - The initial value to use if the cookie doesn't exist
- `options` - Optional cookie options (applied to all cookie operations unless overridden)
  - `expires` - Expiration date (Date object) or number of days (number)
  - `path` - Cookie path (default: current path)
  - `domain` - Cookie domain
  - `secure` - Whether the cookie should only be sent over HTTPS
  - `sameSite` - SameSite attribute: 'strict', 'lax', or 'none'

**Returns:**

- A tuple `[storedValue, setValue, removeValue]`
  - `storedValue` - The current value from the cookie (or `initialValue` if not found)
  - `setValue` - A function to update the cookie. Accepts either a new value or a function that receives the previous value and returns the new value. Can optionally accept cookie options for this specific call
  - `removeValue` - A function to remove the cookie and reset to `initialValue`

**Features:**

- ✅ Automatic JSON serialization/deserialization
- ✅ SSR-safe (handles server-side rendering gracefully)
- ✅ Supports all standard cookie options
- ✅ Per-call cookie options (override default options)
- ✅ Easy cookie removal
- ✅ Error handling (logs errors if cookie operations fail)
- ✅ Supports functional updates (like `useState`)

**Notes:**

- Values are stored as JSON, so they must be JSON-serializable
- The hook will use `initialValue` if cookies are unavailable (e.g., in SSR)
- Cookie size is limited (typically 4KB per cookie)
- Cookies are sent to the server with every HTTP request (consider security implications)
- Domain restrictions in test environments may prevent setting cookies with custom domains

**Use cases:**

- User preferences that need to persist across sessions
- Authentication tokens
- Theme/language preferences
- Analytics tracking
- Feature flags

---

### useClickOutside

Detects clicks outside a referenced element, commonly used for closing modals, dropdowns, or popovers when users click outside of them.

**How it works:** The hook attaches event listeners to the document (or a specified container) and checks if click events occur outside the referenced element. When a click outside is detected, the provided callback is executed. The hook supports both mouse and touch events for mobile compatibility and can be conditionally enabled or disabled.

**Basic usage:**

```tsx
import { useClickOutside } from '@commons-dev/react-hooks';
import { useState } from 'react';

function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickOutside(() => {
    setIsOpen(false);
  });

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle Dropdown</button>
      {isOpen && (
        <div ref={ref} className="dropdown-menu">
          <div>Menu Item 1</div>
          <div>Menu Item 2</div>
        </div>
      )}
    </div>
  );
}
```

**With options:**

```tsx
import { useClickOutside } from '@commons-dev/react-hooks';
import { useState } from 'react';

function Modal() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickOutside(
    () => {
      setIsOpen(false);
    },
    {
      eventType: 'click', // Use 'click' instead of 'mousedown'
      enabled: isOpen, // Only listen when modal is open
    }
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div ref={ref} className="modal-content">
        <h2>Modal Title</h2>
        <p>Modal content goes here</p>
      </div>
    </div>
  );
}
```

**With TypeScript generics:**

```tsx
import { useClickOutside } from '@commons-dev/react-hooks';
import { useRef } from 'react';

function ButtonMenu() {
  const buttonRef = useClickOutside<HTMLButtonElement>(() => {
    console.log('Clicked outside button');
  });

  return (
    <button ref={buttonRef} onClick={() => console.log('Button clicked')}>
      Click me or outside me
    </button>
  );
}
```

**API:**

```typescript
function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void,
  options?: UseClickOutsideOptions
): React.RefObject<T>;
```

**Parameters:**

- `callback` - Function to call when a click outside the referenced element is detected
- `options` - Optional configuration object
  - `eventType` - The event type to listen for: `'mousedown'` (default) or `'click'`
  - `enabled` - Whether the hook is enabled (default: `true`)

**Returns:**

- A ref object (`React.RefObject<T>`) that should be attached to the element you want to detect clicks outside of

**Features:**

- ✅ Mobile support (automatically listens to touch events when using `mousedown`)
- ✅ SSR-safe (handles server-side rendering gracefully)
- ✅ Configurable event type (`mousedown` or `click`)
- ✅ Conditional enabling/disabling without unmounting
- ✅ Optimized callback handling (doesn't re-attach event listeners when callback changes)
- ✅ TypeScript generics for element type inference

**Notes:**

- The hook uses `mousedown` by default for better UX (fires before `click`)
- When `eventType` is `'mousedown'`, the hook also listens to `touchstart` events for mobile support
- When `eventType` is `'click'`, only click events are listened to (no touch events)
- The callback is stored in a ref, so it can be updated without re-attaching event listeners
- The hook safely handles cases where the ref is `null` or the event target is `null`
- Nested elements inside the referenced element are considered "inside" and won't trigger the callback

**Use cases:**

- Closing modals when clicking outside
- Closing dropdown menus
- Closing popovers or tooltips
- Dismissing notifications
- Closing context menus
- Any UI element that should close when user clicks outside

---

### usePrevious

Stores the previous value of a variable or prop, useful for comparing current and previous values or detecting changes.

**How it works:** The hook uses a ref to store the previous value and updates it in a `useEffect` after each render. On the first render, it returns `undefined` since there is no previous value yet. On subsequent renders, it returns the value from the previous render.

**Basic usage:**

```tsx
import { usePrevious } from '@commons-dev/react-hooks';
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {prevCount ?? 'N/A'}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

**Detecting changes:**

```tsx
import { usePrevious } from '@commons-dev/react-hooks';
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const prevUserId = usePrevious(userId);

  useEffect(() => {
    if (prevUserId !== undefined && prevUserId !== userId) {
      console.log(`User changed from ${prevUserId} to ${userId}`);
      // Fetch new user data
    }
  }, [userId, prevUserId]);

  return <div>User ID: {userId}</div>;
}
```

**With props:**

```tsx
import { usePrevious } from '@commons-dev/react-hooks';
import { useEffect } from 'react';

function PriceDisplay({ price }) {
  const prevPrice = usePrevious(price);
  const isIncreasing = prevPrice !== undefined && price > prevPrice;

  return (
    <div>
      <p>Price: ${price}</p>
      {prevPrice !== undefined && (
        <p className={isIncreasing ? 'green' : 'red'}>
          {isIncreasing ? '↑' : '↓'} ${Math.abs(price - prevPrice)}
        </p>
      )}
    </div>
  );
}
```

**API:**

```typescript
function usePrevious<T>(value: T): T | undefined;
```

**Parameters:**

- `value` - The current value to track

**Returns:**

- The previous value (or `undefined` on the first render)

**Features:**

- ✅ Works with any value type (primitives, objects, arrays, etc.)
- ✅ Preserves reference equality for objects
- ✅ SSR-safe (handles server-side rendering gracefully)
- ✅ TypeScript generics for type safety

**Notes:**

- Returns `undefined` on the first render since there is no previous value
- The hook updates the ref after the render completes (in `useEffect`)
- For objects, the hook stores the reference, so if the same object is passed multiple times, it will return the same reference
- Useful for detecting changes, comparing values, or implementing undo/redo functionality

**Use cases:**

- Comparing current and previous values
- Detecting prop changes
- Tracking state transitions
- Implementing change indicators (e.g., price changes, score changes)
- Debugging state updates
- Calculating deltas or differences
- Conditional logic based on previous values

## Tree-Shaking

This package is fully tree-shakeable. You can import hooks individually to minimize bundle size:

```tsx
// Import from main entry (tree-shakeable by modern bundlers)
import { useDebounce } from '@commons-dev/react-hooks';

// Or import directly (guaranteed tree-shaking)
import { useDebounce } from '@commons-dev/react-hooks/useDebounce';
```

## Requirements

- React 16.8.0 or higher
- React DOM 16.8.0 or higher

## Contributing

Contributions are welcome! Please follow these strict guidelines when adding a new hook to ensure consistency, quality, and tree-shakability.

### Prerequisites

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/hook-name`)
3. Ensure you have the latest dependencies installed (`npm install`)

### Step-by-Step Hook Addition Process

When adding a new hook, you **must** follow these steps in order:

#### Step 1: Create the Hook Implementation

Create a new file in `src/hooks/` following the naming convention: `useHookName.ts` (camelCase).

**Requirements:**

- ✅ Use named export: `export function useHookName(...)`
- ✅ Include comprehensive JSDoc comments with `@param`, `@returns`, and `@example`
- ✅ No side effects at module level (pure module for tree-shaking)
- ✅ Use TypeScript generics when appropriate
- ✅ Follow existing code style (single quotes, semicolons, etc.)
- ✅ Follow the same pattern as existing hooks (e.g., `useDebounce`, `useThrottle`, `useLocalStorage`)

**Template:**

````typescript
import {} from /* React hooks needed */ 'react';

/**
 * Brief description of what the hook does.
 *
 * @param param1 - Description of param1
 * @param param2 - Description of param2 (optional)
 * @returns Description of return value
 *
 * @example
 * ```tsx
 * const result = useHookName(value);
 * ```
 */
export function useHookName<T>(param1: T, param2?: number): ReturnType {
  // Implementation
}
````

#### Step 2: Export the Hook

Add the export to `src/hooks/index.ts`:

```typescript
export { useHookName } from './useHookName';
```

#### Step 3: Add Build Entry Point for Tree-Shaking

Update `vite.config.ts` to include the new hook in the build entry points:

```typescript
entry: {
  index: resolve(__dirname, 'src/index.ts'),
  useHookName: resolve(__dirname, 'src/hooks/useHookName.ts'), // Add this line
},
```

#### Step 4: Add Package Exports for Tree-Shaking

Update `package.json` to add subpath exports for tree-shaking. Place this entry **before** the `"./package.json"` entry in the exports object:

```json
"./useHookName": {
  "import": {
    "types": "./dist/useHookName.d.ts",
    "default": "./dist/useHookName.esm.js"
  },
  "require": {
    "types": "./dist/useHookName.d.ts",
    "default": "./dist/useHookName.cjs.js"
  }
},
```

**Tree-Shaking Requirements:**

- ✅ Each hook must be a pure module (no side effects)
- ✅ No module-level code execution
- ✅ Only export the hook function itself
- ✅ Dependencies should be imported, not bundled

#### Step 5: Create Comprehensive Test Cases

Create a test file in `__tests__/hooks/useHookName.test.ts`:

**Requirements:**

- ✅ Test initial state
- ✅ Test behavior changes
- ✅ Test edge cases (null, undefined, empty values, etc.)
- ✅ Test cleanup functions (useEffect return values)
- ✅ Use `renderHook` from `@testing-library/react`
- ✅ Use `act()` when testing state updates
- ✅ Use fake timers if the hook uses setTimeout/setInterval
- ✅ Aim for high test coverage

**Template:**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHookName } from '../../src/hooks/useHookName';

describe('useHookName', () => {
  beforeEach(() => {
    // Setup if needed (e.g., vi.useFakeTimers())
  });

  afterEach(() => {
    // Cleanup if needed (e.g., vi.restoreAllMocks())
  });

  it('should return initial value', () => {
    const { result } = renderHook(() => useHookName(initialValue));
    expect(result.current).toBe(expectedValue);
  });

  // Add more test cases covering edge cases and behavior
});
```

#### Step 6: Update Documentation

Add comprehensive documentation to `README.md` in the "Hooks" section. Follow the same pattern as existing hooks:

**Requirements:**

- ✅ Brief description of what the hook does
- ✅ "How it works" explanation
- ✅ At least one practical code example
- ✅ TypeScript API signature
- ✅ Parameters documentation
- ✅ Returns documentation
- ✅ Use cases list
- ✅ Any additional notes or features

**Template:**

````markdown
### useHookName

Brief description of what the hook does.

**How it works:** Explanation of the hook's behavior.

**Basic usage:**

```tsx
import { useHookName } from '@commons-dev/react-hooks';

function ExampleComponent() {
  const result = useHookName(value);

  return <div>{result}</div>;
}
```

**API:**

```typescript
function useHookName<T>(param1: T, param2?: number): ReturnType;
```

**Parameters:**

- `param1` - Description
- `param2` - Description (optional)

**Returns:**

- Description of return value

**Use cases:**

- Use case 1
- Use case 2
````

#### Step 7: Verify Everything Works

Before submitting your Pull Request, **you must** run and pass all of these commands:

```bash
npm run lint        # Check for linting errors (must pass)
npm test            # Run tests (must pass with good coverage)
npm run build       # Verify build succeeds (must pass)
```

**Verification Checklist:**

- ✅ All linting errors resolved
- ✅ All tests pass
- ✅ Build succeeds without errors
- ✅ Tree-shaking works (verify imports work correctly)
- ✅ Documentation is complete and follows the pattern
- ✅ Code follows the existing style guidelines

### Code Style Guidelines

- **Imports**: Use named imports from 'react', group imports logically
- **Exports**: Always use named exports, never default exports
- **Types**: Use TypeScript generics for reusable hooks
- **Comments**: Include JSDoc comments for all exported functions
- **Formatting**: Follow Prettier configuration (single quotes, semicolons, 80 char width)
- **Naming**: Use camelCase for hook names, descriptive variable names

### Pull Request Process

1. Ensure all 7 steps above are completed
2. Commit your changes with a descriptive message (`git commit -m 'Add useHookName hook'`)
3. Push to your feature branch (`git push origin feature/hook-name`)
4. Open a Pull Request with:
   - Clear description of the hook
   - Reference to any related issues
   - Confirmation that all steps were followed
   - Screenshots or examples if applicable

### Review Criteria

Your Pull Request will be reviewed based on:

- ✅ Implementation follows the same pattern as existing hooks
- ✅ Comprehensive test coverage
- ✅ Complete and clear documentation
- ✅ Tree-shaking compatibility verified
- ✅ Code quality and style consistency
- ✅ All verification steps passed

**Note:** Pull Requests that don't follow all 7 steps will be requested for changes before merging.

## License

MIT

## Repository

[https://github.com/commons-dev-open/react-hooks](https://github.com/commons-dev-open/react-hooks)

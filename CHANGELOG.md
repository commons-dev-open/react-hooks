## [Unreleased] 21-January-2026

### Added
- `useToggle` hook to manage boolean state with a convenient toggle function
- Added test file for `useDebounce` hook

### Changed
- Enhance README.md: Add detailed documentation sections for hooks including useDebounce, useThrottle, useLocalStorage, useSessionStorage, useCookie, useClickOutside, and usePrevious, with collapsible details for better readability.
- Improve SSR compatibility: Replace `typeof window/document === 'undefined'` checks with `globalThis.window/document === undefined` in `useClickOutside`, `useCookie`, and `useSessionStorage` hooks for better server-side rendering support.
- Enhance `useLocalStorage` and `useSessionStorage` hooks: Add `useRef` to store initialValue reference, preventing unnecessary re-attaching of storage event listeners when initialValue changes reference (e.g., objects/arrays recreated on each render).
- Add comprehensive documentation: Include `@remarks` sections and additional examples for `useLocalStorage`, `useSessionStorage`, and `useCookie` hooks, documenting null/undefined handling, storage event synchronization, and security best practices.
- Code cleanup: Refactor `useDebounce` and `useThrottle` hooks by inlining function type checks for improved readability.
- Enhance test coverage: Update test cases for `useLocalStorage` and `useSessionStorage` hooks to cover new functionality and edge cases.

## [1.0.4] 21-January-2026

### Added
- `useClickOutside` hook to detect a click outside an element
- `usePrevious` hook to store and track the previous value of a variable or prop

### Changed
- Refactor useLocalStorage hook to use globalThis for window access, ensuring compatibility in non-browser environments.
- Used best practices for reliability
- Clear the localStorage if the value is null, 0 and empty string
- Updated the test cases to handle the above


## [1.0.3] 20-January-2026

### Added
- Add server dependencies for inline processing in Vitest config

## [1.0.2] 20-January-2026

### Added
- `__test__/setup.ts` file added

## [1.0.1] 20-January-2026

### Changed
- Remove tests for useDebounce hook

## [1.0.0] 20-January-2026

### Added
- Initial release of @commons-dev/react-hooks
- `useDebounce` hook for debouncing values and functions
- `useThrottle` hook for throttling function calls
- `useLocalStorage` hook for managing localStorage state
- `useSessionStorage` hook for managing sessionStorage state
- `useCookie` hook for managing cookies
- Tree-shakeable exports for individual hook imports
- Full TypeScript support
- Comprehensive test coverage

## [Unreleased] 20-January-2026

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

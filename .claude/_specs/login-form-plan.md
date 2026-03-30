# Implementation Plan — Login Form Firebase Authentication

## Context

The login form (`AuthForm` in `mode="login"`) currently just `console.log`s credentials on submit. This wires it to Firebase Auth so it actually signs users in, shows a success message on correct credentials, and shows an inline error on failure. Signup mode is untouched. No redirect is included per the spec.

## Files to modify

| File                                      | Change                                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| `components/AuthForm/AuthForm.tsx`        | Add `signInWithEmailAndPassword` for login mode, `success` state, success message display |
| `components/AuthForm/AuthForm.module.css` | Add `.success` style                                                                      |
| `tests/components/AuthForm.test.tsx`      | Update login submission tests to mock Firebase, add new login-specific assertions         |

## Implementation steps

### 1. AuthForm (`components/AuthForm/AuthForm.tsx`)

- Add `success` state (`string | null`, default `null`) alongside existing `error` and `loading` states
- Extend `errorMessages` map with login-specific codes:
  - `auth/invalid-credential` → "Invalid email or password."
  - `auth/user-not-found` → "Invalid email or password."
  - `auth/too-many-requests` → "Too many attempts. Please try again later."
- In `handleSubmit`, for `mode === "login"`:
  - Remove the `console.log`
  - Set `loading` true, clear `error` and `success`
  - Call `signInWithEmailAndPassword(auth, email, password)`
  - On success: set `success` to `"You're logged in!"`
  - On catch: map error code via `getErrorMessage`, set `error`
  - Set `loading` false in `finally`
- Display `success` message above the submit button (similar placement to `error`) using `styles.success`
- Disable submit button when `loading` is true (already done for signup, same pattern)

### 2. AuthForm.module.css

- Add `.success` class — small green text using `var(--color-success)`

### 3. Tests (`tests/components/AuthForm.test.tsx`)

- Add `signInWithEmailAndPassword` to the `firebase/auth` mock (alongside existing `createUserWithEmailAndPassword`)
- Add `mockSignIn` vi.fn() at module level
- Update "Form submission — login mode" describe block:
  - Remove the `console.log` assertion (login no longer calls it)
  - Add: calls `signInWithEmailAndPassword` with email and password
  - Add: shows success message on successful login
  - Add: shows error message when Firebase throws (e.g. `auth/invalid-credential`)
  - Add: disables button while login is in flight
- Signup mode tests: unchanged

## Key reuse

- `getErrorMessage` helper already in `AuthForm.tsx` — extend its `errorMessages` map
- `loading` / `error` state pattern already implemented for signup — same pattern for login
- `.error` CSS class already in `AuthForm.module.css` — mirror it with `.success`
- `auth` export from `@/lib/firebase` — already mocked in tests

## Verification

1. `npx vitest run` — all tests pass
2. `npm run build` — compiles without errors
3. Manual: sign in at `http://localhost:3000/login` with valid credentials → success message appears; wrong password → error message appears

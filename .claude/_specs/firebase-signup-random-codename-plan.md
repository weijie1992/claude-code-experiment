# Implementation Plan — Firebase Signup with Random Codename

## Context

The signup form (`AuthForm` in signup mode) currently just `console.log`s credentials. This wires it to Firebase Auth so it actually creates accounts, generates a random heist-themed codename as the user's `displayName`, and stores a user profile document in Firestore. Login mode is not touched in this spec.

## Files to create

| File                         | Purpose                                                 |
| ---------------------------- | ------------------------------------------------------- |
| `lib/codename.ts`            | Three themed word lists + `generateCodename()` function |
| `tests/lib/codename.test.ts` | Tests for the codename generator                        |

## Files to modify

| File                                      | Change                                                       |
| ----------------------------------------- | ------------------------------------------------------------ |
| `components/AuthForm/AuthForm.tsx`        | Add Firebase signup flow, loading/error state, error display |
| `components/AuthForm/AuthForm.module.css` | Add `.error` style for inline error message                  |
| `tests/components/AuthForm.test.tsx`      | Update signup tests to mock Firebase, keep login tests as-is |

## Implementation steps

### 1. Codename generator (`lib/codename.ts`)

- Three word lists (~10–15 words each), heist/spy themed to match the app (e.g. adjectives like Silent/Swift, nouns like Phantom/Fox, verbs like Steals/Vanishes)
- `generateCodename()` picks one word randomly from each list, returns them joined in PascalCase (e.g. `SwiftPhantomSteals`)
- Each word is already capitalised in the lists, so no casing logic needed

### 2. AuthForm (`components/AuthForm/AuthForm.tsx`)

- Add `loading` state (boolean, default false) and `error` state (string | null, default null)
- In `handleSubmit`, when `mode === 'signup'`:
  1. Set loading true, clear error
  2. Call `createUserWithEmailAndPassword(auth, email, password)` from `firebase/auth`
  3. Call `updateProfile(user, { displayName: codename })` with a generated codename
  4. Call `setDoc(doc(db, 'users', user.uid), { id: user.uid, codename })` — no email field
  5. On catch: map Firebase error codes to friendly messages, set error state
  6. Set loading false in finally
- When `mode === 'login'`: leave the existing `console.log` unchanged
- Disable submit button when `loading` is true
- Display `error` string above the submit button when non-null

### 3. Error message styling (`AuthForm.module.css`)

- Add `.error` class — small red text using `var(--color-error)`, placed above the submit button

### 4. Firebase error mapping

- Keep it simple — a small map inside `handleSubmit` or a local helper:
  - `auth/email-already-in-use` → "This email is already registered"
  - `auth/weak-password` → "Password must be at least 6 characters"
  - Default → "Something went wrong. Please try again."

### 5. Tests

- **`tests/lib/codename.test.ts`**: generateCodename returns non-empty string, is PascalCase (starts with uppercase, no spaces/dashes), contains 3 segments
- **`tests/components/AuthForm.test.tsx`** updates:
  - Mock `firebase/auth` (`createUserWithEmailAndPassword`, `updateProfile`) and `firebase/firestore` (`setDoc`, `doc`)
  - Mock `@/lib/firebase` to stub `auth` and `db`
  - Mock `@/lib/codename` to return a fixed codename
  - Signup mode: calls `createUserWithEmailAndPassword` with email/password, calls `updateProfile` with codename, writes correct fields to Firestore (no email), disables button during submission
  - Signup mode error: shows error message when Firebase throws
  - Login mode tests: unchanged (still assert `console.log`)

## Verification

1. `npm run lint` — no errors
2. `npx vitest run` — all tests pass
3. `npm run build` — compiles without errors

# Implementation Plan — Navbar Logout Button

## Context

The app has a fully working auth state (`AuthProvider` + `useUser` hook) and a `NavbarUser` component that renders an `Avatar` when a user is signed in. However, there is no way to sign out. This adds a logout button with an icon and text label to `NavbarUser`, visible only when a user is logged in, that calls Firebase's `signOut` — after which `onAuthStateChanged` automatically clears the user state and the button disappears.

## Files to modify

| File                                          | Change                                                          |
| --------------------------------------------- | --------------------------------------------------------------- |
| `components/NavbarUser/NavbarUser.tsx`        | Add `signOut` call, `LogOut` icon, loading state, logout button |
| `components/NavbarUser/NavbarUser.module.css` | Add `.logoutBtn` style                                          |
| `tests/components/NavbarUser.test.tsx`        | Mock `signOut`, add 4 new tests                                 |

## Implementation steps

### 1. NavbarUser (`components/NavbarUser/NavbarUser.tsx`)

- Import `signOut` from `firebase/auth` and `auth` from `@/lib/firebase`
- Import `LogOut` from `lucide-react`
- Import `styles` from the CSS module (already present)
- Add `signingOut` boolean state (default `false`)
- Wrap `Avatar` and the new logout button in a `<div className={styles.userItem}>` container (`.userItem` already exists in the CSS with `flex items-center`)
- Logout button: renders `<LogOut size={16} />` icon + `"Log out"` text, uses `styles.logoutBtn`, disabled when `signingOut`
- `handleLogout` async function: set `signingOut` true, call `await signOut(auth)`, catch silently, set `signingOut` false in `finally`

### 2. NavbarUser.module.css

- Add `.logoutBtn` — small, subdued button using `var(--color-body)` text colour, no background, hover uses `var(--color-heading)`, flex row with gap for icon + text alignment, cursor pointer

### 3. Tests (`tests/components/NavbarUser.test.tsx`)

- Add `vi.mock('firebase/auth', () => ({ signOut: mockSignOut }))` and `vi.mock('@/lib/firebase', () => ({ auth: {} }))`
- New tests:
  - "renders logout button when user is logged in"
  - "does not render logout button when user is null"
  - "does not render logout button while loading"
  - "clicking logout button calls signOut"
- Existing 4 tests remain unchanged

## Key reuse

- `useUser()` from `@/components/AuthProvider` — already used in NavbarUser, provides `user` and `loading`
- `auth` from `@/lib/firebase` — already used in `AuthForm`, same pattern
- `lucide-react` — already in use (`Clock8` in Navbar), `LogOut` icon available from same package
- `.userItem` CSS class — already defined in `NavbarUser.module.css` with flex alignment

## Verification

1. `npx vitest run` — all tests pass
2. `npm run build` — compiles without errors
3. Manual: sign in → logout button appears in navbar → click → button disappears, user is signed out

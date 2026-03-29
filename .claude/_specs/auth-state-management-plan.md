# Implementation Plan — Auth State Management Hook

## Context

The app needs a global way to know if a user is logged in. Currently no auth state exists anywhere — components have no access to the current user. This adds a real-time Firebase `onAuthStateChanged` listener exposed via a `useUser` hook, so any component can read the auth state. No login/logout UI — just the listener and read access.

## Files to create

| File                                          | Purpose                                                      |
| --------------------------------------------- | ------------------------------------------------------------ |
| `components/AuthProvider/AuthProvider.tsx`    | `'use client'` context provider + `useUser` hook             |
| `components/AuthProvider/index.ts`            | Barrel export (default + named `useUser`)                    |
| `components/NavbarUser/NavbarUser.tsx`        | `'use client'` sub-component — renders Avatar when logged in |
| `components/NavbarUser/NavbarUser.module.css` | Minimal alignment styles                                     |
| `components/NavbarUser/index.ts`              | Barrel export                                                |
| `tests/components/AuthProvider.test.tsx`      | Tests for provider + hook                                    |
| `tests/components/NavbarUser.test.tsx`        | Tests for NavbarUser rendering                               |

## Files to modify

| File                               | Change                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `app/layout.tsx`                   | Wrap body contents (`{children}` + `<ThemeToggle />`) in `<AuthProvider>` |
| `components/Navbar/Navbar.tsx`     | Add `<NavbarUser />` as a new `<li>` in the `<ul>`                        |
| `tests/components/Navbar.test.tsx` | Mock `NavbarUser` to keep existing tests passing                          |

## Implementation steps

### 1. AuthProvider (`components/AuthProvider/AuthProvider.tsx`)

- `'use client'` directive
- Create `AuthContext` with type `{ user: User | null, loading: boolean }`
- `AuthProvider` component: `useState` for user + loading, `useEffect` registers `onAuthStateChanged(auth, ...)` from `@/lib/firebase`, cleanup returns unsubscribe
- `useUser` hook: calls `useContext(AuthContext)`, throws if outside provider
- No semicolons

### 2. NavbarUser (`components/NavbarUser/NavbarUser.tsx`)

- `'use client'` directive
- Calls `useUser()`, renders `<Avatar name={...} />` when user exists (fallback: `displayName → email → "User"`)
- Renders nothing when loading or no user
- Keeps Navbar as a Server Component — only this sub-component is client

### 3. Root layout (`app/layout.tsx`)

- Import `AuthProvider`, wrap `{children}` and `<ThemeToggle />` inside it
- Layout stays a Server Component (standard Next.js pattern)

### 4. Navbar (`components/Navbar/Navbar.tsx`)

- Import `NavbarUser`, add `<li><NavbarUser /></li>` in the `<ul>` after "Create Heist"
- Stays a Server Component

### 5. Tests

- **AuthProvider tests**: Mock `firebase/auth` (`onAuthStateChanged`) and `@/lib/firebase` (`auth`). Test: returns null when no user, returns user when signed in, unsubscribes on unmount, throws outside provider.
- **NavbarUser tests**: Mock `useUser` and `Avatar`. Test: renders avatar with displayName, falls back to email, renders nothing when null, renders nothing while loading.
- **Navbar test update**: Mock `NavbarUser` to a stub so existing tests pass.

## Verification

1. `npm run lint` — no errors
2. `npx vitest run` — all tests pass
3. `npm run build` — compiles without errors

# Implementation Plan — Route Protection

## Context

Auth state is already available globally via `useUser()` from `AuthProvider`, which returns `{ user: User | null, loading: boolean }`. Currently both group layouts are plain Server Components that render children unconditionally. This plan adds client-side guard logic to each layout and a shared `<LoadingScreen />` component shown while Firebase resolves the initial auth state.

## Files to create

| File                                                | Purpose                                                   |
| --------------------------------------------------- | --------------------------------------------------------- |
| `components/LoadingScreen/LoadingScreen.tsx`        | Simple centered spinner shown while auth state is loading |
| `components/LoadingScreen/LoadingScreen.module.css` | Styles using theme tokens for the spinner                 |
| `components/LoadingScreen/index.ts`                 | Barrel export                                             |
| `tests/components/LoadingScreen.test.tsx`           | Renders a visible loading indicator                       |
| `tests/layouts/PublicLayout.test.tsx`               | Guard logic tests for the `(public)` layout               |
| `tests/layouts/DashboardLayout.test.tsx`            | Guard logic tests for the `(dashboard)` layout            |

## Files to modify

| File                         | Change                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| `app/(public)/layout.tsx`    | Convert to `'use client'`; add `useUser` guard — redirect to `/heists` if user is present |
| `app/(dashboard)/layout.tsx` | Convert to `'use client'`; add `useUser` guard — redirect to `/login` if user is absent   |

## Implementation steps

### 1. LoadingScreen component (`components/LoadingScreen/LoadingScreen.tsx`)

- No `'use client'` needed — purely presentational, no hooks
- Render a single `<div>` with a CSS-animated spinner element, centred fullscreen
- Use `var(--color-primary)` for the spinner colour and `var(--color-dark)` for the background via CSS Modules
- Keep markup minimal — one wrapper div + one spinner div
- Export as default; `index.ts` re-exports the default

### 2. LoadingScreen styles (`components/LoadingScreen/LoadingScreen.module.css`)

- `@reference "../../app/globals.css"` at top
- `.screen` — fullscreen flex container, centres content, background `var(--color-dark)`
- `.spinner` — small circle, `border` with transparent sides and `var(--color-primary)` on one side, `animation: spin 0.7s linear infinite`
- Define `@keyframes spin` inside the file

### 3. `(public)` layout (`app/(public)/layout.tsx`)

- Add `"use client"` directive
- Call `useUser()` to get `{ user, loading }`
- If `loading` is true, return `<LoadingScreen />`
- If `user` is not null, call `router.replace("/heists")` and return `<LoadingScreen />` (render nothing while redirect happens)
- Otherwise render `<main className="public">{children}</main>` as before

### 4. `(dashboard)` layout (`app/(dashboard)/layout.tsx`)

- Add `"use client"` directive
- Call `useUser()` to get `{ user, loading }`
- If `loading` is true, return `<LoadingScreen />`
- If `user` is null, call `router.replace("/login")` and return `<LoadingScreen />` (render nothing while redirect happens)
- Otherwise render `<><Navbar /><main>{children}</main></>` as before

### 5. Tests

- **LoadingScreen**: Renders a container in the document; snapshot optional.
- **PublicLayout tests**: Mock `useUser` and `next/navigation`. Test:
  - Renders children when `{ user: null, loading: false }`
  - Renders `<LoadingScreen />` when `loading: true`
  - Calls `router.replace("/heists")` when a user is present
- **DashboardLayout tests**: Mock `useUser`, `next/navigation`, and `Navbar`. Test:
  - Renders children when `{ user: mockUser, loading: false }`
  - Renders `<LoadingScreen />` when `loading: true`
  - Calls `router.replace("/login")` when `{ user: null, loading: false }`

## Verification

1. `npx vitest run` — all tests pass
2. `npm run lint` — no errors
3. `npm run build` — compiles without errors
4. Manual smoke test: visit `/login` while authenticated → redirected to `/heists`; visit `/heists` while unauthenticated → redirected to `/login`

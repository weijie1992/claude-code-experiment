# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run lint      # Run ESLint
npm test          # Run all tests (Vitest, watch mode)
npx vitest run    # Run all tests once (CI-style, no watch)
npx vitest tests/components/Navbar.test.tsx  # Run a single test file
```

## Architecture

**Pocket Heist** is a Next.js 16 app using the App Router with two route groups:

- `app/(public)/` — Unauthenticated pages (splash, login, signup, preview). Uses a layout with a `.public` CSS scope and no navbar.
- `app/(dashboard)/` — Authenticated pages (heists list, create, detail). Layout wraps all pages with the shared `<Navbar />` and a `<main>` block.

The splash page (`(public)/page.tsx`) is intended as a routing gate — it should redirect to `/heists` if the user is logged in, or `/login` if not. Authentication logic is not yet implemented.

The root `app/layout.tsx` sets global metadata and imports `globals.css`. It has no UI chrome of its own.

## Styling

Tailwind CSS 4 is used throughout. Global theme tokens (colours, font) are defined with `@theme` in `app/globals.css`:

| Token | Value | Usage |
|---|---|---|
| `primary` | `#C27AFF` | purple accent |
| `secondary` | `#FB64B6` | pink accent |
| `dark` | `#030712` | page background |
| `body` | `#99A1AF` | default text |
| `heading` | `white` | h1–h4 |
| `success` / `error` | `#05DF72` / `#FF6467` | status colours |

Global layout utility classes also live in `globals.css`: `center-content` (full-height flex centering), `page-content` (constrained width block), `form-title`. Component-scoped styles use CSS Modules (e.g. `Navbar.module.css`).

## Components

Components live in `components/` using a barrel-export pattern — each component has its own folder with a `Navbar.tsx`, `Navbar.module.css`, and `index.ts` that re-exports the default. Import via the `@/` alias: `import Navbar from "@/components/Navbar"`.

## Testing

Tests live in `tests/` mirroring source structure. Vitest is configured with jsdom, global APIs, and `vite-tsconfig-paths` so the `@/*` alias works in test files. Import matchers from `@testing-library/jest-dom` are set up in `vitest.setup.ts`. Tests use React Testing Library — query by role/label rather than class names or test IDs.

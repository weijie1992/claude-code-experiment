# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run lint      # Run ESLint
npm test          # Run all tests (Vitest, watch mode)
npx vitest run    # Run all tests once (CI-style, no watch)
npx vitest tests/components/AuthForm.test.tsx  # Run a single test file
```

## Architecture

**Pocket Heist** is a Next.js 16 app using the App Router with two route groups:

- `app/(public)/` — Unauthenticated pages (splash, login, signup, preview). Uses a layout with a `.public` CSS scope and no navbar.
- `app/(dashboard)/` — Authenticated pages (heists list, create, detail). Layout wraps all pages with the shared `<Navbar />` and a `<main>` block.

The splash page (`(public)/page.tsx`) is intended as a routing gate — it should redirect to `/heists` if the user is logged in, or `/login` if not. Authentication logic is not yet implemented.

The root `app/layout.tsx` sets global metadata, imports `globals.css`, injects `<ThemeScript />` in the head (prevents flash of wrong theme), and renders `<ThemeToggle />` at the end of the body.

## Styling

Tailwind CSS 4 is used throughout. Global theme tokens (colours, font) are defined with `@theme` in `app/globals.css`:

| Token               | Value                 | Usage           |
| ------------------- | --------------------- | --------------- |
| `primary`           | `#C27AFF`             | purple accent   |
| `secondary`         | `#FB64B6`             | pink accent     |
| `dark`              | `#030712`             | page background |
| `light`             | `#0A101D`             | card background |
| `lighter`           | `#101828`             | input/borders   |
| `body`              | `#99A1AF`             | default text    |
| `heading`           | `white`               | h1–h4           |
| `success` / `error` | `#05DF72` / `#FF6467` | status colours  |

Light mode overrides live under `[data-theme='light']` in `globals.css`.

Global layout utility classes also live in `globals.css`: `center-content` (full-height flex centering), `page-content` (constrained width block), `form-title`, `btn` (purple pill button). Component-scoped styles use CSS Modules (e.g. `AuthForm.module.css`). CSS Modules reference theme tokens via `@reference "../../app/globals.css"` — the relative path depends on the component's depth.

## Components

Components live in `components/` using a barrel-export pattern — each component has its own folder with a `ComponentName.tsx`, `ComponentName.module.css`, and `index.ts` that re-exports the default. Import via the `@/` alias: `import AuthForm from "@/components/AuthForm"`.

## Testing

Tests live in `tests/` mirroring source structure. Vitest is configured with jsdom, global APIs, and `vite-tsconfig-paths` so the `@/*` alias works in test files. Import matchers from `@testing-library/jest-dom` are set up in `vitest.setup.ts`. Tests use React Testing Library — query by role/label rather than class names or test IDs.

## Additional Coding Preferences

- Do NOT use semicolons for Javascript or TypeScript code.
- Do Not apply tailwind classes directly in component templates unless essential or just 1 at most. If an element needs more than a single tailwind class, combine them into a custom class using the `@apply` directive.
- use minimal project dependencies where possible
- Use the `git switch -c` command to switch to new branches, not `git checkout`.

## Checking Documentation

- **important**: When implementing any lib/framework-specific features, ALWAYS check the appropriate lib/framework documentation using the Context7 MCP server before writing any code.

# Implementation Plan — Authentication Forms

## New Files

| File                                      | Purpose                                                                                                         |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `components/AuthForm/AuthForm.tsx`        | Shared client component, driven by a single `mode: 'login' \| 'signup'` prop                                    |
| `components/AuthForm/AuthForm.module.css` | Migrates styles from `login.module.css` + adds `.passwordWrapper` / `.passwordToggle` for the Eye/EyeOff button |
| `components/AuthForm/index.ts`            | Barrel export                                                                                                   |
| `tests/components/AuthForm.test.tsx`      | 13 test cases                                                                                                   |

## Modified Files

| File                                  | Change                                               |
| ------------------------------------- | ---------------------------------------------------- |
| `app/(public)/login/page.tsx`         | Replace inline form with `<AuthForm mode="login" />` |
| `app/(public)/signup/page.tsx`        | Replace stub with `<AuthForm mode="signup" />`       |
| `app/(public)/login/login.module.css` | **Delete** — styles move into the component          |

## Component API

```ts
interface AuthFormProps {
  mode: "login" | "signup";
}
```

The `mode` prop controls the submit button label, footer link text/href, and password `autoComplete`. The heading (`h1`) stays in each page file.

| Concern                    | `'login'`                        | `'signup'`                        |
| -------------------------- | -------------------------------- | --------------------------------- |
| Submit button label        | "Log in"                         | "Sign up"                         |
| `autoComplete` on password | `"current-password"`             | `"new-password"`                  |
| Footer link text           | "Don't have an account? Sign up" | "Already have an account? Log in" |
| Footer link `href`         | `/signup`                        | `/login`                          |

## Key Behaviours

- `'use client'` — needs `useState` for `email`, `password`, `showPassword`
- Password toggle is `<button type="button">` (prevents accidental form submission) rendering `Eye`/`EyeOff` from `lucide-react`
- `handleSubmit` guards both fields non-empty before `console.log({ email, password })`
- Heading (`h1`) stays in each page file — not part of the component

## CSS Notes

- `AuthForm.module.css` starts with `@reference "../../../app/globals.css"`
- Migrates all rules from `login.module.css` (`.card`, `.form`, `.field`, `.label`, `.input`, `.submit`, `.footer`)
- Adds `.passwordWrapper` — `position: relative` so the toggle sits inside the right edge of the input
- Adds `.passwordToggle` — `position: absolute; right: 0.625rem` with no background/border

## Test Cases (13 total)

### Rendering — login mode

1. Renders the email input
2. Renders the password input
3. Renders a submit button labelled "Log in"
4. Renders a link to `/signup`

### Rendering — signup mode

5. Renders a submit button labelled "Sign up"
6. Renders a link to `/login`

### Password visibility toggle

7. Password input starts as `type="password"`
8. Clicking the toggle changes input to `type="text"`
9. Clicking again restores `type="password"`

### Form submission — validation

10. Submitting with both fields empty does not call `console.log`
11. Submitting with only email filled does not call `console.log`
12. Submitting with only password filled does not call `console.log`

### Form submission — success

13. Filling both fields and submitting calls `console.log` with `{ email, password }`

## Order of Implementation

1. `components/AuthForm/AuthForm.module.css`
2. `components/AuthForm/AuthForm.tsx`
3. `components/AuthForm/index.ts`
4. `tests/components/AuthForm.test.tsx` — run and confirm all pass
5. Update `app/(public)/login/page.tsx`
6. Delete `app/(public)/login/login.module.css`
7. Update `app/(public)/signup/page.tsx`
8. Run full test suite (`npx vitest run`) + `npm run lint`

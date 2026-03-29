# Spec for Authentication Forms

branch: claude/feature/authentication-forms

## Summary

- Add functional login and signup forms to `/login` and `/signup` pages
- Both forms share the same fields: email and password
- Password field has a show/hide toggle icon
- Forms log submitted values to the console (no backend integration yet)
- Users can easily navigate between the two forms via a link

## Functional Requirements

- The `/login` page renders a form with an email field, a password field, and a "Log in" submit button
- The `/signup` page renders a form with an email field, a password field, and a "Sign up" submit button
- The password field includes a toggle icon to show or hide the password value
- On form submission, validate that both fields are non-empty before logging
- On successful submission, log `{ email, password }` to the browser console
- Each page includes a link to the other form ("Don't have an account? Sign up" / "Already have an account? Log in")
- Both forms use the existing `.btn` class and CSS module pattern consistent with the rest of the codebase

## Figma Design Reference (only if referenced)

N/A

## Possible Edge Cases

- User submits with one or both fields empty — show an inline error or rely on native browser validation
- User rapidly toggles the password visibility while typing — value should be preserved
- User navigates between login and signup — form state should reset on page load

## Acceptance Criteria

- [ ] `/login` page renders email, password, and submit button
- [ ] `/signup` page renders email, password, and submit button
- [ ] Password field toggles between `type="password"` and `type="text"` when the icon is clicked
- [ ] Submitting either form logs `{ email, password }` to the console
- [ ] Submitting an empty form does not log anything
- [ ] Each form has a working link to the other form

## Open Questions

- Should the show/hide toggle use a Lucide icon (e.g. `Eye` / `EyeOff`) consistent with existing icon usage?
- Should the forms share a single reusable `AuthForm` component, or remain separate per page?

## Testing Guidelines

Create a test file(s) in the `./tests` folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Renders the email and password fields
- Renders the correct submit button label ("Log in" vs "Sign up")
- Clicking the password toggle changes the input type between `password` and `text`
- Submitting the form with both fields filled calls `console.log` with the correct values
- Submitting with empty fields does not call `console.log`
- The link to the other form is present and points to the correct href

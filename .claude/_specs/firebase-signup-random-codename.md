# Spec for Firebase Signup with Random Codename

branch: claude/feature/firebase-signup-random-codename
figma_component (if used): N/A

## Summary

- Wire the existing signup form (`AuthForm` in `app/(public)/signup/`) to Firebase Authentication using the Firebase Web SDK via `lib/firebase.ts`.
- Upon successful signup, generate a random display name (codename) in PascalCase by picking one word from each of three distinct word lists and joining them together.
- Set the new user's Firebase `displayName` to this generated codename using `updateProfile`.
- Create a document in the Firestore `users` collection containing the user's `id` and `codename` — no email stored.
- All Firebase operations use the Web SDK only (`firebase/auth` and `firebase/firestore`).

## Functional Requirements

- The `AuthForm` component currently `console.log`s credentials on submit. For `mode="signup"`, replace this with a call to Firebase's `createUserWithEmailAndPassword`.
- After a successful account creation, call `updateProfile` on the new user to set their `displayName` to the generated codename.
- After setting the profile, write a document to Firestore in the `users` collection using the user's `uid` as the document ID. The document must contain:
  - `codename` — the generated PascalCase display name
  - `id` — the user's Firebase `uid`
  - Do NOT include the user's email in this document.
- Codename generation must:
  - Use three separate word lists (e.g. adjectives, nouns, verbs — or any three thematically distinct sets).
  - Pick one word randomly from each list.
  - Combine them in PascalCase (e.g. `SwiftSilentPhantom`).
  - The word lists should be defined in a dedicated utility file, not inline in the component.
- The `AuthForm` component should handle loading state during the async signup operation (disable the submit button while in progress).
- On error (e.g. email already in use, weak password), display a user-readable error message within the form.
- On success, the form should not navigate the user anywhere — navigation/redirect logic is out of scope for this spec.
- The `login` mode of `AuthForm` is not affected by this change.

## Figma Design Reference (only if referenced)

N/A

## Possible Edge Cases

- Email already registered — Firebase returns `auth/email-already-in-use`; show a friendly message.
- Weak password — Firebase returns `auth/weak-password`; show a friendly message.
- Codename collision in Firestore — two users could theoretically get the same codename, but since it is not used as a unique key (the `uid` is), this is acceptable for now.
- Network failure mid-flow (after account creation but before `updateProfile` or Firestore write) — the user account exists but may lack a codename. This partial state should be noted as a known edge case but does not need to be resolved in this spec.
- The word lists should contain enough words in each category to produce a reasonably large number of combinations (aim for at least 10 words per list).

## Acceptance Criteria

- Submitting the signup form with a valid email and password creates a Firebase Auth user.
- The new user's `displayName` is set to a PascalCase codename generated from three word lists.
- A document exists in Firestore at `users/{uid}` containing `codename` and `id`, with no `email` field.
- The submit button is disabled while the signup request is in flight.
- An inline error message appears when signup fails (e.g. duplicate email, weak password).
- The `login` mode of `AuthForm` is unaffected.
- All existing `AuthForm` tests continue to pass.

## Open Questions

- Should the three word lists have a theme (e.g. heist/spy themed) or be generic?
- Should there be a minimum password length enforced client-side before hitting Firebase, or rely on Firebase's own validation?

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- The codename generator returns a non-empty PascalCase string.
- The codename generator always picks from all three word lists (each word list contributes one segment).
- `AuthForm` in `signup` mode calls `createUserWithEmailAndPassword` with the submitted email and password.
- `AuthForm` in `signup` mode calls `updateProfile` with a generated codename after successful account creation.
- `AuthForm` in `signup` mode writes the correct fields to Firestore (no email field).
- `AuthForm` in `signup` mode shows an error message when Firebase returns an error.
- `AuthForm` in `signup` mode disables the submit button while the request is in flight.
- `AuthForm` in `login` mode is unaffected (does not call `createUserWithEmailAndPassword`).

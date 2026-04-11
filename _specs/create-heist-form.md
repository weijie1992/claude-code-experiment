# Create Heist Form

## Overview

Add a "Create Heist" form to the heists dashboard page that allows authenticated users to define a new heist mission, assign it to a colleague, and save it as a document in the Firestore `heists` collection.

## Goals

- Allow authenticated users to create a new heist with a title, description, and an assigned agent (colleague).
- Fetch available users (codenames + IDs) from the Firestore `users` collection to populate the assignee selector.
- On successful submission, write a new document to the `heists` Firestore collection and redirect to `/heists`.
- Keep `createdAt` and `deadline` out of the user-facing form — set them programmatically on submission.

## User Stories

- As a logged-in user, I want to fill in a form to create a new heist so I can assign a covert mission to a colleague.
- As a logged-in user, I want to select an assignee from a list of users (shown by codename) so I don't need to know their internal user ID.
- As a logged-in user, I want to be redirected to `/heists` after creating a heist so I can see it in my active missions list.

## Functional Requirements

### Form Fields (matching `CreateHeistInput`)

| Field                | Input Type        | Notes                                                      |
| -------------------- | ----------------- | ---------------------------------------------------------- |
| `title`              | Text input        | Required                                                   |
| `description`        | Textarea          | Required                                                   |
| `assignedTo`         | Select / Dropdown | User ID of the assignee; populated from `users` collection |
| `assignedToCodename` | (derived)         | Populated automatically from the selected user entry       |

### Programmatic Fields (not shown in form)

| Field               | Value                                 |
| ------------------- | ------------------------------------- |
| `createdBy`         | Current authenticated user's UID      |
| `createdByCodename` | Current authenticated user's codename |
| `createdAt`         | Firestore `serverTimestamp()`         |
| `deadline`          | 48 hours from the time of submission  |
| `finalStatus`       | `null`                                |

### User Fetching

- On page load (or when the form is opened), fetch all documents from the `users` Firestore collection.
- Each user document must expose at least: `uid` (or document ID) and `codename`.
- Populate the assignee dropdown with codenames; store the corresponding `uid` as the value.

### Submission Behaviour

1. Validate that all required fields are filled.
2. Build a `CreateHeistInput` object — include programmatic fields.
3. Call `addDoc` on the `heists` collection with the converter.
4. On success, redirect the user to `/heists`.
5. On failure, display an inline error message without losing form state.

### Loading & Error States

- Show a loading indicator while users are being fetched.
- Disable the submit button while submission is in progress.
- Display a field-level or form-level error if submission fails.

## Out of Scope

- Editing or deleting heists.
- Uploading attachments or images.
- Custom deadline input (deadline is always 48 hours from creation).
- Notifications or emails on heist creation.

## Acceptance Criteria

- [ ] The form renders inside `app/(dashboard)/heists/page.tsx` (or as a component imported there).
- [ ] The assignee dropdown is populated with codenames fetched from the `users` Firestore collection.
- [ ] Submitting the form creates a new document in the `heists` collection using `CreateHeistInput`.
- [ ] `createdAt` is set to `serverTimestamp()` and `deadline` is set to 48 hours from now.
- [ ] After successful creation, the user is redirected to `/heists`.
- [ ] Form shows an error state if Firestore write fails.
- [ ] Submit button is disabled during submission.

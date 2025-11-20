## Auth Feature

- **Purpose:** Localizes authentication flows (login, refresh), JWT storage, and session hydration.
- **Structure:**
  - `slices/` contains Redux auth state and helpers.
  - `hooks/` exposes selectors/hooks such as `useAuth`.
  - `components/` will hold login forms, guard wrappers.
  - `api/` can include helpers to call internal route handlers or share Zod schemas.

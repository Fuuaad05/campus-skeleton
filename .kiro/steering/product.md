# Product: Campus Skeleton

Campus Skeleton is a small foundation for campus micro-apps. You describe an app in one config object (fields, status workflow, actions, theme, sample data) and the skeleton renders a complete app: search, filters, sort, cards, detail view, create and edit form, validation, local persistence, backup and restore.

## The claim we must prove
One skeleton, two genuinely different apps, with no app-specific code outside `app.config.tsx` and `main.tsx`.
- **Lost & Found** (`apps/lost-and-found`): reports with a Lost or Found kind, a claim workflow, dark theme.
- **Study Séance** (`apps/study-seance`): study sessions with seats, joining and leaving, a derived Open/Full/Past status, a custom progress meter, light theme.

## Principles
- Lean and clear: the skeleton should stay small enough to read in one sitting.
- Flexible through config, not through forks. If an app needs something new, add a generic extension point to the skeleton and use it from config.
- No backend. Data lives in localStorage so anyone can run it and deploy it as a static site.
- Spooky but readable. Names and copy are playful, the UI stays plain and usable.

## Out of scope
Real authentication, servers, real-time sync, payments.

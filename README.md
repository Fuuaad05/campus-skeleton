# Campus Skeleton

**One lean skeleton. Describe your app in a config file and get a complete one.**

Campus Skeleton is a small foundation for campus micro-apps. You list your fields, statuses, actions and theme in one file. The skeleton gives you search, filters, sorting, cards, a detail view, a validated form, local persistence and backup and restore.

Built for **Kiroween 2026**, Skeleton Crew category, with [Kiro](https://kiro.dev).

## Two apps, one foundation
| | [Lost & Found](apps/lost-and-found) | [Study Séance](apps/study-seance) |
| --- | --- | --- |
| Purpose | Report and claim lost items | Organise study groups |
| Look | Manila luggage tags and rubber stamps | Cream admit-one tickets in a dark room |
| Status | Stored: Open, Claimed, Returned | Derived from time and seats: Open, Full, Past |
| Actions | Claim, mark returned, reopen | Join, leave |
| Hero art | Hanging tag showing the newest open report | Ticket for the next session with a free seat |
| Extras | Kind and category pills | Seats meter, auto-join for the creator |
| App code | config, hero art, one skin.css | config, hero art, one skin.css |

Both apps share every line of UI from [`packages/skeleton`](packages/skeleton).

## What a whole app looks like
```tsx
export const config: AppConfig = {
  id: "my-app",
  name: "My App",
  tagline: "What it is for",
  emoji: "🎃",
  theme: { mode: "dark", accent: "#ff8a3d" },
  itemName: { singular: "Post", plural: "Posts" },
  titleField: "title",
  fields: [
    { key: "title", label: "Title", type: "text", required: true, searchable: true },
    { key: "body", label: "Details", type: "longtext" },
  ],
};
```
Field types: `text`, `longtext`, `number`, `select`, `datetime`, `people`.
Optional extension points: `hero`, `status`, `actions`, `beforeCreate`, `renderExtra`, `pills`, `summaryField`, `seed`. Each app adds a `skin.css` to change how it looks.

## Make a third app in a minute
```bash
npm install
npm run new-app -- my-app
npm run dev -w apps/my-app
```
Then edit `apps/my-app/src/app.config.tsx`.

## Run the two apps
```bash
npm install
npm run dev:lost      # Lost & Found
npm run dev:study     # Study Séance
npm run build         # type-check and build every app
```
Tip: open an app with `?me=Some%20Name` to pick a display name without the prompt. Use two browser profiles with different names to try claiming and joining.

## Deploy to Vercel
Import this repo once for each app and set **Root Directory** to `apps/lost-and-found` or `apps/study-seance`. The defaults for Vite work. No environment variables are needed.

## Repo layout
```
packages/skeleton/   the skeleton (library, used from source)
packages/skeleton/template/   starting point for new apps
apps/lost-and-found/          app 1
apps/study-seance/            app 2
scripts/new-app.mjs           app generator
.kiro/                        steering, spec and hooks used while building with Kiro
```

## How Kiro was used
See [`.kiro/`](.kiro): steering docs for product and tech rules, a spec for the skeleton, and hooks that typecheck on save and build after each task.

## Data and privacy
No accounts and no server. Items and your display name stay in your browser's localStorage. Identity is local only, so this is a demo of the foundation, not a secure multi-user system.

## License
[MIT](LICENSE)

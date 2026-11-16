# Tech and conventions

## Layout (npm workspaces)
- `packages/skeleton`: the library. Consumed from source (`main` points at `src/index.ts`), so there is no build step for it.
- `apps/<name>`: one folder per app. Each has its own `package.json`, `index.html`, `vite.config.ts`, `src/main.tsx` and `src/app.config.tsx`. Each deploys separately (Vercel root directory = the app folder).
- `packages/skeleton/template`: the starting point copied by `npm run new-app -- <name>`.

## Rules
- React 19, TypeScript strict, Vite, plain CSS. No UI framework.
- App-specific behaviour belongs in `app.config.tsx`. Do not import an app from the skeleton and do not special-case an app id inside the skeleton.
- New skeleton features must be generic, optional, and demonstrated by at least one app config.
- Anything read from localStorage or an imported file is untrusted. Parse it through `parseItems`.
- Run `npm run build` at the repo root before finishing a task. It type-checks and builds every app.
- Never add `.kiro` to `.gitignore`.
- Skeleton CSS classes use the `cs-` prefix. Theme comes from CSS variables set by `config.theme`.

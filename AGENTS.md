# AGENTS.md

- Read this file before changing code.
- Use pnpm only.
- The frontend will use Next.js.
- The backend will use NestJS.
- Business logic must remain in NestJS.
- Preserve Persian RTL support when frontend work starts.
- Do not expose secrets.
- Do not add major dependencies without explaining the reason.
- Do not implement product features unless explicitly requested.
- Complete only the current requested phase.
- Run relevant verification commands before finishing.
- Biome is the only formatter and linter.
- Do not add ESLint or Prettier.
- Run `pnpm check`, `pnpm typecheck:web`, and `pnpm build:web` before finishing frontend tasks.
- NestJS controllers must remain thin.
- Business logic belongs in NestJS services.

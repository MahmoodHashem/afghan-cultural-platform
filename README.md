# Afghan Cultural Information Crowdsourcing Platform

Afghan Cultural Information Crowdsourcing Platform is planned as a collaborative platform for collecting, reviewing, and organizing cultural information with care for Afghan languages, context, and community contribution workflows.

## Planned Architecture

- Next.js frontend
- NestJS backend
- PostgreSQL with Prisma
- pnpm workspace

## Current Status

Workspace foundation and the Next.js frontend setup are complete. Biome is selected as the repository formatter and linter.
The NestJS backend foundation is also complete.

Run the frontend with:

```sh
pnpm dev:web
```

The frontend will be available at `http://localhost:3000`.

Run the backend with:

```sh
pnpm dev:api
```

The temporary backend route will be available at `http://localhost:3000` when the frontend is not running.

Backend configuration, database setup, and product feature setup are still pending and will happen in later steps.

# Afghan Cultural Information Crowdsourcing Platform

Afghan Cultural Information Crowdsourcing Platform is planned as a collaborative platform for collecting, reviewing, and organizing cultural information with care for Afghan languages, context, and community contribution workflows.

## Planned Architecture

- Next.js frontend
- NestJS backend
- PostgreSQL with Prisma
- pnpm workspace

## Current Status

Workspace foundation and the Next.js frontend setup are complete. Biome is selected as the repository formatter and linter.
The NestJS backend foundation, global API configuration, and PostgreSQL/Prisma foundation are also complete.

Run the frontend with:

```sh
pnpm dev:web
```

The frontend will be available at `http://localhost:3000`.

Run the backend with:

```sh
pnpm dev:api
```

The API base URL is `http://localhost:4000/api/v1`.
The health endpoint is `http://localhost:4000/api/v1/health`.
Swagger documentation is available at `http://localhost:4000/api/docs`.

Required backend environment variables:

- `NODE_ENV`: `development`, `test`, or `production`
- `PORT`: defaults to `4000`
- `FRONTEND_URL`: frontend origin allowed by CORS
- `DATABASE_URL`: PostgreSQL connection URL for Prisma

Database setup notes are in `docs/database-setup.md`. Product database models, migrations, and feature setup are still pending and will happen in later steps.

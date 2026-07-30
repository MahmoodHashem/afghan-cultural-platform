# Database Setup

The API is configured for PostgreSQL through Prisma. This step only prepares the foundation; no product models or migrations exist yet.

## Local PostgreSQL

Install PostgreSQL locally with your preferred package manager, or use an existing local PostgreSQL service.

Create the development database:

```sh
createdb afghan_culture
```

If your local PostgreSQL user or password is different, update `DATABASE_URL` in `apps/api/.env`.

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/afghan_culture?schema=public
```

## Prisma Commands

Generate the Prisma Client:

```sh
pnpm prisma:generate
```

Validate the schema:

```sh
pnpm prisma:validate
```

Format the Prisma schema:

```sh
pnpm prisma:format
```

Start Prisma Studio:

```sh
pnpm prisma:studio
```

Migrations will be created and committed later when product models are added. Do not run migrations for the current empty schema foundation.

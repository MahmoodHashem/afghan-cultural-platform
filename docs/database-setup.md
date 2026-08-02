# Database Setup

The API is configured for PostgreSQL through Prisma. Schema migrations are kept under `apps/api/prisma/migrations` and should be applied without resetting existing development data unless a reset is explicitly requested.

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

## Content Library Geography Metadata

Normalized content-library Markdown front matter must use the approved simplified geography shape:

```yaml
geographicScope: PROVINCE
province: herat
district:
```

```yaml
geographicScope: NATIONAL
province:
district:
```

```yaml
geographicScope: NONE
province:
district:
```

Rules:

- `PROVINCE` requires a province and may include an optional district.
- `NATIONAL` and `NONE` must leave both `province` and `district` empty.
- Province names appearing in tags are not structured province relations.
- `MULTI_PROVINCE` is not part of v1; add a future many-to-many `EntryProvince` relation only if approved filtering requirements justify it.

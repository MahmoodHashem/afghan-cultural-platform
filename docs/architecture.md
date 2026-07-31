
# Project Architecture

## Afghan Cultural Information Crowdsourcing Platform

**Version:** 1.0
**Architecture style:** Modular monolith
**Repository type:** pnpm workspace monorepo
**Frontend:** Next.js
**Backend:** NestJS REST API
**Database:** PostgreSQL with Prisma

---

## 1. Architecture Overview

The project contains two separate applications inside one repository:

```text
User Browser
     │
     ▼
Next.js Frontend
     │
     │ REST API
     ▼
NestJS Backend
     │
     ├── PostgreSQL through Prisma
     ├── Cloudinary for images
     ├── YouTube embeds
     └── SMTP for password reset
```

The frontend is responsible for presentation and user interaction.

The backend is responsible for authentication, authorization, validation, business rules, database access, moderation, reports, corrections, and audit records.

Important product logic must not be implemented in Next.js API routes.

---

## 2. Repository Structure

```text
afghan-cultural-platform/
├── apps/
│   ├── web/                     # Next.js frontend
│   └── api/                     # NestJS backend
│
├── packages/
│   └── contracts/               # Shared safe types and enums
│
├── docs/
│   ├── product-requirements.md
│   ├── technology-stack.md
│   ├── architecture.md
│   ├── database-design.md
│   └── database-setup.md
│
├── biome.json
├── pnpm-workspace.yaml
├── package.json
├── pnpm-lock.yaml
├── AGENTS.md
└── README.md
```

Biome is configured at the repository root and is the only formatter and linter for both applications.

---

## 3. Frontend Architecture

The frontend uses a feature-based structure.

```text
apps/web/src/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── (moderator)/
│   ├── (admin)/
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
│
├── features/
│   ├── auth/
│   ├── entries/
│   ├── bookmarks/
│   ├── ratings/
│   ├── reviews/
│   ├── corrections/
│   ├── reports/
│   ├── moderation/
│   └── admin/
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── common/
│
├── lib/
│   ├── api/
│   ├── validation/
│   ├── persian/
│   ├── auth/
│   └── utils/
│
├── providers/
├── hooks/
├── stores/
└── types/
```

### Frontend responsibilities

- Public cultural-content pages
- Persian RTL interface
- User, moderator, and administrator dashboards
- Forms and frontend validation
- Tiptap rich-text editing
- Search and filter interfaces
- Image previews
- YouTube embeds
- Communication with the NestJS REST API

### Frontend rules

- `app/` defines routes, layouts, and page composition.
- `features/` contains feature-specific components and logic.
- `components/ui/` contains shadcn/ui components only.
- `components/layout/` contains headers, footers, and sidebars.
- `components/common/` contains reusable product components.
- Feature-specific API calls belong inside the related feature.
- Pages should compose feature components instead of containing large logic.
- Use Server Components by default for public reading pages.
- Use Client Components only where interaction is required.
- Do not access PostgreSQL or Prisma from Next.js.

---

## 4. Frontend State Responsibilities

| State type                  | Technology           |
| --------------------------- | -------------------- |
| Public server-rendered data | Next.js server fetch |
| Interactive API data        | TanStack Query       |
| Form state                  | React Hook Form      |
| Form validation             | Zod                  |
| Shared interface state      | Zustand              |
| Rich-text content           | Tiptap               |

TanStack Query owns server data such as entries, reports, corrections, users, and moderation queues.

Zustand should only store temporary shared client state such as sidebar visibility or multi-step form progress.

API data must not be duplicated in Zustand.

---

## 5. Feature Folder Structure

A frontend feature may use the following structure:

```text
features/entries/
├── api/
├── components/
├── hooks/
├── schemas/
├── types/
└── utils/
```

Subfolders should only be created when they contain real files. Every feature does not need all of these folders from the beginning.

---

## 6. Backend Architecture

The backend is a modular NestJS monolith.

```text
apps/api/src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── entries/
│   ├── bookmarks/
│   ├── moderation/
│   ├── corrections/
│   ├── reports/
│   ├── ratings/
│   ├── reviews/
│   ├── taxonomy/
│   ├── media/
│   ├── audit/
│   └── admin/
│
├── database/
│   ├── prisma.module.ts
│   └── prisma.service.ts
│
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── filters/
│   ├── interceptors/
│   ├── middleware/
│   ├── pipes/
│   ├── exceptions/
│   ├── enums/
│   └── utils/
│
├── config/
├── generated/
│   └── prisma/
├── health/
├── app.module.ts
└── main.ts
```

The backend exposes a versioned API:

```text
/api/v1
```

---

## 7. Backend Module Structure

A normal feature module may contain:

```text
modules/entries/
├── dto/
│   ├── create-entry.dto.ts
│   ├── update-entry.dto.ts
│   └── entry-query.dto.ts
├── policies/
├── mappers/
├── entries.controller.ts
├── entries.service.ts
└── entries.module.ts
```

Only create `policies`, `mappers`, or other abstractions when they contain useful logic.

### Responsibilities

#### Controller

- Receives HTTP requests
- Reads route, body, and query data
- Calls the service
- Returns the response

#### Service

- Applies business rules
- Checks ownership and workflow status
- Uses Prisma
- Runs transactions
- Creates audit records

#### DTO

- Defines accepted request data
- Performs backend validation
- Rejects unsupported values

#### Policy

- Handles complex ownership or permission rules when needed

#### Mapper

- Converts database records into safe API responses when needed

Controllers must remain thin and must not access Prisma directly.

### Authorization

Authentication is global by default in the NestJS API. Routes require a valid JWT access token unless they are explicitly marked with `@Public()`.

Use the shared authorization decorators and guards:

- `@Public()` marks routes such as health, Swagger support routes, registration, login, OAuth start/callback, refresh, logout, forgot-password, reset-password, verify-email, and resend-verification as publicly accessible when appropriate.
- `@Roles(...roles)` controls role access for moderator and administrator routes.
- `@RequireVerifiedEmail()` protects contribution-related actions that require a verified email address.
- Suspended users are blocked centrally during JWT authentication and must not be checked manually in every controller.

Frontend route hiding or button hiding is not authorization. Backend guards and services must enforce access rules.

---

## 8. Backend Dependency Direction

```text
Controller
    ↓
Service
    ↓
PrismaService or external infrastructure
```

Rules:

- Controllers must not contain business logic.
- Controllers must not query Prisma.
- Services own business rules and transactions.
- Modules should use exported services to communicate with other modules.
- Circular module dependencies should be avoided.
- `common/` must contain generic cross-cutting code only.
- Business-specific helpers belong inside their feature module.
- A repository layer is not required initially.
- Prisma queries may remain inside services until a repository abstraction provides real value.

---

## 9. Backend Modules

### Auth

Owns:

- Registration
- Login
- Logout
- Access-token refresh
- Password reset
- Password hashing
- Refresh sessions

### Users

Owns:

- User profiles
- Roles
- Account status
- Suspension

### Entries

Owns:

- Cultural Entry drafts
- Entry editing
- Submission
- Entry statuses
- Slugs
- Sources
- Tags assigned to entries
- Content versions
- Public entry retrieval

### Bookmarks

Owns:

- Saving published entries
- Removing bookmarks
- User bookmark lists

### Moderation

Owns:

- Pending-submission queue
- Approval
- Requested changes
- Rejection
- Hiding, restoring, and archiving content

### Corrections

Owns:

- Correction submission
- Correction review
- Accepted correction versioning

### Reports

Owns:

- Report submission
- Investigation
- Resolution
- Content moderation actions

### Ratings

Owns:

- Helpfulness ratings
- Rating updates
- Average and count recalculation

### Reviews

Owns:

- Public reviews
- Review editing
- Soft deletion
- Moderator hiding

### Taxonomy

> **Taxonomy** manages the application's shared classification data—such as provinces, districts, categories, content types, and tags—to ensure consistent organization, filtering, and validation of cultural content across the platform.

Owns:

```text
taxonomy/
├── provinces/
├── districts/
├── categories/
├── content-types/
├── tags/
└── taxonomy.module.ts
```

Taxonomy records remain grouped in one module to avoid creating many small top-level modules.

### Media

Owns:

- Image validation
- Cloudinary integration
- Image removal
- YouTube URL validation
- YouTube ID extraction

### Audit

Owns:

- Audit-log creation
- Administrator audit-log queries

### Admin

Coordinates administrator operations but must not duplicate logic owned by users, entries, moderation, or taxonomy modules.

---

## 10. Main Module Dependencies

```text
Auth ───────────────► Users

Entries ────────────► Users
Entries ────────────► Taxonomy
Entries ────────────► Media
Entries ────────────► Audit

Bookmarks ──────────► Entries
Bookmarks ──────────► Users

Moderation ─────────► Entries
Moderation ─────────► Audit

Corrections ────────► Entries
Corrections ────────► Audit

Reports ────────────► Entries
Reports ────────────► Audit

Ratings ────────────► Entries

Reviews ────────────► Entries

Admin ──────────────► Users
Admin ──────────────► Entries
Admin ──────────────► Taxonomy
Admin ──────────────► Moderation
```

The database module must not depend on any business module.

The audit module must not call feature modules.

---

## 11. Database Structure

Prisma files remain inside the API application:

```text
apps/api/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
└── src/
    └── generated/
        └── prisma/
```

Prisma Client is generated into:

```text
apps/api/src/generated/prisma
```

Database access is available through:

```text
apps/api/src/database/prisma.service.ts
```

Prisma-generated types must not be imported into the frontend.

---

## 12. Shared Contracts Package

```text
packages/contracts/src/
├── api/
│   ├── api-response.ts
│   └── pagination.ts
├── enums/
└── index.ts
```

The shared package may contain:

- Safe API response types
- Pagination types
- Stable enums required by both applications

It must not contain:

- Prisma-generated types
- NestJS DTO classes
- NestJS services
- React components
- Database entities
- Environment variables
- Secrets

The package should remain small and should only contain values genuinely shared by both applications.

---

## 13. Naming Conventions

### Files and folders

Use kebab-case:

```text
create-entry.dto.ts
entries.service.ts
public-reviews/
persian-normalizer.ts
```

### Classes and types

Use PascalCase:

```text
CreateEntryDto
EntriesService
EntryStatus
```

### Variables and functions

Use camelCase:

```text
entryId
submitEntry
normalizedSearchText
```

### Constants

Use UPPER_SNAKE_CASE:

```text
MAX_IMAGES_PER_ENTRY
```

### Prisma

- Models: PascalCase
- Fields: camelCase
- Enums: PascalCase
- Enum values: UPPER_SNAKE_CASE
- Database tables: plural snake_case
- Database columns: snake_case

---

## 14. Coding Rules

### Backend

- Controllers must not access Prisma directly.
- Business logic belongs in services.
- Protected actions require role, ownership, and status checks.
- Multi-record workflow operations must use transactions.
- Audit records should be created in the same transaction as important actions.
- Password hashes and token hashes must never be returned.
- Avoid `any` unless clearly justified.
- Do not create unnecessary abstractions.

### Frontend

- Use shadcn/ui consistently.
- Preserve Persian RTL behavior.
- Use React Hook Form and Zod for forms.
- Use TanStack Query for server state.
- Use Zustand only for shared temporary client state.
- Keep feature-specific logic inside feature folders.
- Do not duplicate backend authorization as security.
- Do not implement business APIs in Next.js.

---

## 15. Architecture Boundaries

The following technologies are intentionally excluded from version one:

- Microservices
- GraphQL
- Redis
- Elasticsearch
- WebSockets
- Kafka or RabbitMQ
- CQRS
- Event sourcing
- Redux
- MongoDB
- Direct video uploads
- Multilingual architecture
- Notification services

Adding one of these technologies requires a documented architecture decision.

---

## 16. Implementation Order

```text
1. Database schema
2. Prisma migration
3. Authentication
4. Users and role protection
5. Taxonomy
6. Cultural Entry drafts
7. Media handling
8. Submission workflow
9. Moderation
10. Public content pages
11. Search and filtering
12. Bookmarks
13. Ratings and reviews
14. Corrections and reports
15. Administration and audit logs
16. Testing and deployment
```

This structure is the agreed project architecture and should be followed unless a future architectural decision explicitly replaces part of it.saasdf

Update the approved database design and Prisma schema to support email/password, Google, and Facebook authentication.

Before starting:

- Read `AGENTS.md`.
- Read `docs/database-design.md`.
- Inspect the current `prisma/schema.prisma`.
- Use pnpm only.
- Do not implement authentication services, endpoints, guards, or frontend changes yet.

1. Update the database design document

In `docs/database-design.md`:

- Make `User.passwordHash` optional because OAuth-only users may not have a password.
- Add enum:

  AuthProvider

  - GOOGLE
  - FACEBOOK
- Add entity:

  OAuthAccount

Purpose:
Stores a social-login account linked to a platform user.

Fields:

- id: UUID, required, default uuid()
- userId: UUID, required
- provider: AuthProvider, required
- providerAccountId: String, required
- providerEmail: String, optional
- createdAt: DateTime, required, default now()
- updatedAt: DateTime, required

Constraints:

- unique `(provider, providerAccountId)`
- optionally unique `(userId, provider)` so one user cannot link multiple accounts from the same provider

Indexes:

- userId
- provider
- providerEmail

Relations:

- User has many OAuthAccount records
- OAuthAccount belongs to User

Deletion behavior:

- Cascade-delete OAuthAccount records if a user is physically removed in the future
- Suspending a user must not delete linked OAuth accounts

Business rules:

- Only verified provider emails may be used for automatic account linking
- A provider account cannot belong to more than one user
- Provider tokens are not stored as application sessions
- The backend will issue its own access and refresh tokens after successful OAuth login

Update:

- entity count
- relationship list
- Mermaid ER diagram
- Phase B implementation checklist

2. Update Prisma schema

Modify `apps/api/prisma/schema.prisma`:

- Change `User.passwordHash` from `String` to `String?`
- Add `AuthProvider`
- Add `OAuthAccount`
- Add the User relation field for OAuth accounts
- Map table and columns to snake_case
- Add:
  - `@@unique([provider, providerAccountId])`
  - `@@unique([userId, provider])`
  - relevant indexes
- Use approved referential actions

Do not change unrelated models.

3. Migration

Create a new migration with a clear name such as:

add_oauth_accounts

Apply it to the local database if available.

Do not reset the database.

4. Verification

Run:

pnpm prisma:format
pnpm prisma:validate
pnpm prisma:generate
pnpm check:write
pnpm check
pnpm typecheck:api
pnpm test:api
pnpm build:api

Verify:

- `passwordHash` is nullable
- OAuthAccount relation is valid
- both unique constraints exist
- Prisma client generates successfully
- no auth code or frontend code was added

Finish by reporting:

- files changed
- migration created
- enum and model added
- validation/build results
- confirmation that authentication implementation has not started

Stop after this schema update.

Update the approved database design and Prisma schema to support email/password, Google, and Facebook authentication.

Before starting:

- Read `AGENTS.md`.
- Read `docs/database-design.md`.
- Inspect the current `prisma/schema.prisma`.
- Use pnpm only.
- Do not implement authentication services, endpoints, guards, or frontend changes yet.

1. Update the database design document

In `docs/database-design.md`:

- Make `User.passwordHash` optional because OAuth-only users may not have a password.
- Add enum:

  AuthProvider

  - GOOGLE
  - FACEBOOK
- Add entity:

  OAuthAccount

Purpose:
Stores a social-login account linked to a platform user.

Fields:

- id: UUID, required, default uuid()
- userId: UUID, required
- provider: AuthProvider, required
- providerAccountId: String, required
- providerEmail: String, optional
- createdAt: DateTime, required, default now()
- updatedAt: DateTime, required

Constraints:

- unique `(provider, providerAccountId)`
- optionally unique `(userId, provider)` so one user cannot link multiple accounts from the same provider

Indexes:

- userId
- provider
- providerEmail

Relations:

- User has many OAuthAccount records
- OAuthAccount belongs to User

Deletion behavior:

- Cascade-delete OAuthAccount records if a user is physically removed in the future
- Suspending a user must not delete linked OAuth accounts

Business rules:

- Only verified provider emails may be used for automatic account linking
- A provider account cannot belong to more than one user
- Provider tokens are not stored as application sessions
- The backend will issue its own access and refresh tokens after successful OAuth login

Update:

- entity count
- relationship list
- Mermaid ER diagram
- Phase B implementation checklist

2. Update Prisma schema

Modify `apps/api/prisma/schema.prisma`:

- Change `User.passwordHash` from `String` to `String?`
- Add `AuthProvider`
- Add `OAuthAccount`
- Add the User relation field for OAuth accounts
- Map table and columns to snake_case
- Add:
  - `@@unique([provider, providerAccountId])`
  - `@@unique([userId, provider])`
  - relevant indexes
- Use approved referential actions

Do not change unrelated models.

3. Migration

Create a new migration with a clear name such as:

add_oauth_accounts

Apply it to the local database if available.

Do not reset the database.

4. Verification

Run:

pnpm prisma:format
pnpm prisma:validate
pnpm prisma:generate
pnpm check:write
pnpm check
pnpm typecheck:api
pnpm test:api
pnpm build:api

Verify:

- `passwordHash` is nullable
- OAuthAccount relation is valid
- both unique constraints exist
- Prisma client generates successfully
- no auth code or frontend code was added

Finish by reporting:

- files changed
- migration created
- enum and model added
- validation/build results
- confirmation that authentication implementation has not started

Stop after this schema update.

Update the approved database design and Prisma schema to support email/password, Google, and Facebook authentication.

Before starting:

- Read `AGENTS.md`.
- Read `docs/database-design.md`.
- Inspect the current `prisma/schema.prisma`.
- Use pnpm only.
- Do not implement authentication services, endpoints, guards, or frontend changes yet.

1. Update the database design document

In `docs/database-design.md`:

- Make `User.passwordHash` optional because OAuth-only users may not have a password.
- Add enum:

  AuthProvider

  - GOOGLE
  - FACEBOOK
- Add entity:

  OAuthAccount

Purpose:
Stores a social-login account linked to a platform user.

Fields:

- id: UUID, required, default uuid()
- userId: UUID, required
- provider: AuthProvider, required
- providerAccountId: String, required
- providerEmail: String, optional
- createdAt: DateTime, required, default now()
- updatedAt: DateTime, required

Constraints:

- unique `(provider, providerAccountId)`
- optionally unique `(userId, provider)` so one user cannot link multiple accounts from the same provider

Indexes:

- userId
- provider
- providerEmail

Relations:

- User has many OAuthAccount records
- OAuthAccount belongs to User

Deletion behavior:

- Cascade-delete OAuthAccount records if a user is physically removed in the future
- Suspending a user must not delete linked OAuth accounts

Business rules:

- Only verified provider emails may be used for automatic account linking
- A provider account cannot belong to more than one user
- Provider tokens are not stored as application sessions
- The backend will issue its own access and refresh tokens after successful OAuth login

Update:

- entity count
- relationship list
- Mermaid ER diagram
- Phase B implementation checklist

2. Update Prisma schema

Modify `apps/api/prisma/schema.prisma`:

- Change `User.passwordHash` from `String` to `String?`
- Add `AuthProvider`
- Add `OAuthAccount`
- Add the User relation field for OAuth accounts
- Map table and columns to snake_case
- Add:
  - `@@unique([provider, providerAccountId])`
  - `@@unique([userId, provider])`
  - relevant indexes
- Use approved referential actions

Do not change unrelated models.

3. Migration

Create a new migration with a clear name such as:

add_oauth_accounts

Apply it to the local database if available.

Do not reset the database.

4. Verification

Run:

pnpm prisma:format
pnpm prisma:validate
pnpm prisma:generate
pnpm check:write
pnpm check
pnpm typecheck:api
pnpm test:api
pnpm build:api

Verify:

- `passwordHash` is nullable
- OAuthAccount relation is valid
- both unique constraints exist
- Prisma client generates successfully
- no auth code or frontend code was added

Finish by reporting:

- files changed
- migration created
- enum and model added
- validation/build results
- confirmation that authentication implementation has not started

Stop after this schema update.

Update the approved database design and Prisma schema to support email/password, Google, and Facebook authentication.

Before starting:

- Read `AGENTS.md`.
- Read `docs/database-design.md`.
- Inspect the current `prisma/schema.prisma`.
- Use pnpm only.
- Do not implement authentication services, endpoints, guards, or frontend changes yet.

1. Update the database design document

In `docs/database-design.md`:

- Make `User.passwordHash` optional because OAuth-only users may not have a password.
- Add enum:

  AuthProvider

  - GOOGLE
  - FACEBOOK
- Add entity:

  OAuthAccount

Purpose:
Stores a social-login account linked to a platform user.

Fields:

- id: UUID, required, default uuid()
- userId: UUID, required
- provider: AuthProvider, required
- providerAccountId: String, required
- providerEmail: String, optional
- createdAt: DateTime, required, default now()
- updatedAt: DateTime, required

Constraints:

- unique `(provider, providerAccountId)`
- optionally unique `(userId, provider)` so one user cannot link multiple accounts from the same provider

Indexes:

- userId
- provider
- providerEmail

Relations:

- User has many OAuthAccount records
- OAuthAccount belongs to User

Deletion behavior:

- Cascade-delete OAuthAccount records if a user is physically removed in the future
- Suspending a user must not delete linked OAuth accounts

Business rules:

- Only verified provider emails may be used for automatic account linking
- A provider account cannot belong to more than one user
- Provider tokens are not stored as application sessions
- The backend will issue its own access and refresh tokens after successful OAuth login

Update:

- entity count
- relationship list
- Mermaid ER diagram
- Phase B implementation checklist

2. Update Prisma schema

Modify `apps/api/prisma/schema.prisma`:

- Change `User.passwordHash` from `String` to `String?`
- Add `AuthProvider`
- Add `OAuthAccount`
- Add the User relation field for OAuth accounts
- Map table and columns to snake_case
- Add:
  - `@@unique([provider, providerAccountId])`
  - `@@unique([userId, provider])`
  - relevant indexes
- Use approved referential actions

Do not change unrelated models.

3. Migration

Create a new migration with a clear name such as:

add_oauth_accounts

Apply it to the local database if available.

Do not reset the database.

4. Verification

Run:

pnpm prisma:format
pnpm prisma:validate
pnpm prisma:generate
pnpm check:write
pnpm check
pnpm typecheck:api
pnpm test:api
pnpm build:api

Verify:

- `passwordHash` is nullable
- OAuthAccount relation is valid
- both unique constraints exist
- Prisma client generates successfully
- no auth code or frontend code was added

Finish by reporting:

- files changed
- migration created
- enum and model added
- validation/build results
- confirmation that authentication implementation has not started

Stop after this schema update.dfssdfa

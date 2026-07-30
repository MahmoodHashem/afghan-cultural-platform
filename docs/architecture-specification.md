

## Afghan Cultural Information Crowdsourcing Platform

**Version:** 1.0
**Architecture:** Modular monolith  
**Frontend:** Next.js  
**Backend:** NestJS REST API  
**Database:** PostgreSQL with Prisma

---

# 1. Purpose

This document defines how the project will be organized during development. It covers:

- Application boundaries
    
- Repository structure
    
- Backend modules
    
- API conventions
    
- Authentication and authorization
    
- Content workflow
    
- Database conventions
    
- Validation and error handling
    
- Image and YouTube handling
    
- Testing and coding standards
    

Technology descriptions already covered in the [[Technology Stack and Architecture Specification]] document are not repeated here.

---

# 2. High-Level Architecture

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
     ├── SMTP for password reset
     └── YouTube embeds
```

## Next.js responsibilities

- Public pages
    
- Persian RTL interface
    
- User, moderator, and admin dashboards
    
- Forms and Tiptap editor
    
- Client-side validation
    
- Calling the NestJS API
    

## NestJS responsibilities

- Authentication and authorization
    
- Business rules
    
- Database access
    
- Content workflow
    
- Moderation
    
- Corrections and reports
    
- Image and YouTube validation
    
- Audit records
    

All important permissions and workflow rules must be enforced by NestJS.

---

# 3. Main Architecture Decisions

|ID|Decision|
|---|---|
|ADR-01|Use a modular monolith|
|ADR-02|Keep Next.js and NestJS as separate applications|
|ADR-03|Use REST instead of GraphQL|
|ADR-04|Use PostgreSQL with Prisma|
|ADR-05|Use `USER`, `MODERATOR`, and `ADMIN` roles|
|ADR-06|Store Tiptap content as JSON|
|ADR-07|Store images in Cloudinary|
|ADR-08|Accept YouTube links only|
|ADR-09|Use access and refresh tokens|
|ADR-10|Use PostgreSQL search with Persian text normalization|
|ADR-11|Exclude notifications and unnecessary infrastructure|
|ADR-12|Preserve submitted and published content versions|

---

# 4. Repository Structure

```text
afghan-cultural-platform/
├── apps/
│   ├── web/                 # Next.js
│   └── api/                 # NestJS
├── packages/
│   └── contracts/           # Shared safe enums and API types
├── docs/
│   ├── product-requirements.md
│   ├── technology-stack.md
│   ├── architecture.md
│   └── database-design.md
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

The shared package may contain role names, content statuses, report statuses, and pagination types. It must not contain Prisma models, backend services, React components, or secrets.

---

# 5. Frontend Structure

```text
apps/web/src/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── (user)/
│   ├── (moderator)/
│   └── (admin)/
├── components/
│   ├── ui/
│   ├── layout/
│   └── common/
├── features/
│   ├── auth/
│   ├── entries/
│   ├── moderation/
│   ├── corrections/
│   ├── reports/
│   └── admin/
├── lib/
│   ├── api/
│   ├── validation/
│   ├── auth/
│   └── persian/
├── hooks/
├── stores/
└── types/
```

## Frontend state rules

|State type|Tool|
|---|---|
|Public page data|Next.js server fetch|
|Interactive API data|TanStack Query|
|Form state|React Hook Form|
|Form validation|Zod|
|Temporary shared UI state|Zustand|
|Rich-text editing|Tiptap|

API data should not be duplicated inside Zustand.

---

# 6. Backend Structure

```text
apps/api/src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── entries/
│   ├── moderation/
│   ├── corrections/
│   ├── reports/
│   ├── ratings/
│   ├── public-reviews/
│   ├── taxonomy/
│   ├── media/
│   ├── audit/
│   └── admin/
├── database/
├── common/
├── config/
├── app.module.ts
└── main.ts
```

A normal feature module may contain:

```text
entries/
├── dto/
├── entries.controller.ts
├── entries.service.ts
├── entries.module.ts
├── entries.policy.ts
└── entries.mapper.ts
```

## Module responsibilities

**Controller**

- Receives requests
    
- Calls services
    
- Returns responses
    

**Service**

- Applies business rules
    
- Uses Prisma
    
- Runs transactions
    
- Creates audit records
    

**DTO**

- Defines and validates request data
    

**Policy**

- Handles ownership and action permissions when needed
    

Controllers must remain thin and must not query Prisma directly.

---

# 7. Main Backend Modules

## Auth

- Registration
    
- Login and logout
    
- Access-token refresh
    
- Password reset
    
- Password hashing
    

## Users

- Profiles
    
- Roles
    
- Suspensions
    

## Entries

- Draft creation
    
- Editing
    
- Submission
    
- Public content retrieval
    
- Slugs
    
- Content versions
    

## Moderation

- Pending submissions
    
- Approval
    
- Requested changes
    
- Rejection
    

## Corrections

- Correction submission
    
- Acceptance or rejection
    
- Creating updated content versions
    

## Reports

- Report submission
    
- Investigation
    
- Resolution
    
- Content hiding or restoration
    

## Taxonomy

- Provinces
    
- Districts
    
- Categories
    
- Content types
    
- Tags
    

## Media

- Image validation and upload
    
- Cloudinary integration
    
- YouTube URL parsing
    

## Audit

- Important moderation and administrative actions
    

---

# 8. Database Conventions

PostgreSQL is the only application database, and Prisma is the normal database-access layer.

## Naming rules

| Item            | Convention          |
| --------------- | ------------------- |
| Prisma model    | Singular PascalCase |
| Prisma field    | camelCase           |
| Database table  | plural snake_case   |
| Database column | snake_case          |
| Enum value      | UPPER_SNAKE_CASE    |

All main records will use UUID identifiers. Public Cultural Entries will also have readable slugs.

Main entities include:

```text
User
CulturalEntry
ContentVersion
ModerationReview
Province
District
Category
ContentType
Tag
Image
YouTubeVideo
Source
Rating
PublicReview
CorrectionSuggestion
Report
RefreshSession
PasswordResetToken
AuditLog
```

All timestamps must be stored in UTC.

---

# 9. Cultural Entry Status Workflow

The first version will use:

```text
DRAFT
PENDING_REVIEW
CHANGES_REQUESTED
PUBLISHED
REJECTED
HIDDEN
ARCHIVED
```

## Allowed transitions

```text
DRAFT
  └── PENDING_REVIEW
         ├── PUBLISHED
         ├── CHANGES_REQUESTED
         │      └── PENDING_REVIEW
         └── REJECTED

PUBLISHED
  ├── HIDDEN
  │      ├── PUBLISHED
  │      └── ARCHIVED
  └── ARCHIVED
```

## Main rules

- Only the author can edit their draft.
    
- Submitted content cannot be freely edited.
    
- A moderator cannot approve their own content.
    
- Requested changes and rejection require a reason.
    
- Approval immediately publishes the content.
    
- Published content cannot be silently overwritten.
    
- Hidden and archived content do not appear publicly.
    

---

# 10. Content Versioning

A `ContentVersion` will be created when:

- Content is submitted for the first time
    
- Content is resubmitted after requested changes
    
- A correction is accepted
    
- An approved administrator update is made
    

Saving a normal draft will not create a new permanent version every time.

Each version stores:

```text
entryId
versionNumber
snapshot
plainTextContent
versionReason
createdById
createdAt
```

Possible version reasons:

```text
INITIAL_SUBMISSION
RESUBMISSION
ACCEPTED_CORRECTION
ADMIN_UPDATE
```

---

# 11. REST API Conventions

Base path:

```text
/api/v1
```

Examples:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh

GET  /api/v1/entries
GET  /api/v1/entries/:slug

POST  /api/v1/entries
PATCH /api/v1/me/entries/:id
POST  /api/v1/me/entries/:id/submit

GET  /api/v1/moderation/submissions
POST /api/v1/moderation/submissions/:id/approve
POST /api/v1/moderation/submissions/:id/request-changes
POST /api/v1/moderation/submissions/:id/reject
```

## Success response

```json
{
  "data": {
    "id": "uuid",
    "status": "PUBLISHED"
  }
}
```

## Paginated response

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 43,
    "totalPages": 4
  }
}
```

## Error response

```json
{
  "error": {
    "code": "ENTRY_INVALID_STATUS",
    "message": "The requested action is not allowed.",
    "fieldErrors": []
  },
  "requestId": "uuid",
  "timestamp": "2026-07-29T12:00:00.000Z"
}
```

The frontend will translate stable error codes into Persian messages.

---

# 12. Authentication and Authorization

## Tokens

```text
Access token: 15 minutes
Refresh token: 7 days
```

The access token will be kept in frontend memory and sent in the authorization header.

The refresh token will be:

- Stored in an HTTP-only cookie
    
- Rotated during refresh
    
- Stored as a hash in PostgreSQL
    
- Revoked after logout or account suspension
    

## Authorization checks

NestJS will use:

- Authentication guards
    
- Role guards
    
- Ownership checks
    
- Workflow-status checks
    

Frontend route protection improves the user experience but does not replace backend authorization.

---

# 13. Validation and Error Handling

Validation occurs at three levels:

| Level    | Technology                             |
| -------- | -------------------------------------- |
| Frontend | Zod                                    |
| Backend  | `class-validator` and `ValidationPipe` |
| Database | Prisma and PostgreSQL constraints      |

Recommended backend configuration:

```ts
new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});
```

The backend will also use:

- A global exception filter
    
- Request IDs
    
- Structured error logging
    
- Controlled production error messages
    

Stack traces and sensitive information must never be returned to users.

---

# 14. Image and YouTube Architecture

## Images

Initial limits:

```text
Maximum images per entry: 6
Maximum size per image: 5 MB
Allowed formats: JPEG, PNG, WebP
```

Flow:

```text
Next.js preview
   ↓
NestJS file validation
   ↓
Cloudinary upload
   ↓
Image metadata saved in PostgreSQL
```

## YouTube

Version one supports one optional YouTube video per entry.

The backend will:

- Validate the YouTube URL
    
- Extract the video ID
    
- Store the ID, title, and description
    

Arbitrary iframe code will not be accepted.

---

# 15. Persian Search

Search will initially use PostgreSQL.

Before saving or searching text, the backend will normalize:

- `ي` to `ی`
    
- `ك` to `ک`
    
- Extra spaces
    
- Common half-space variations
    
- Optional diacritics
    
- Persian and Arabic number variations when necessary
    

Search will cover normalized titles, summaries, body text, tags, categories, provinces, and locations.

External search systems such as Elasticsearch are not required for version one.

---

# 16. Transactions and Audit Records

Transactions must be used for operations such as:

- Publishing an approved submission
    
- Accepting a correction
    
- Resolving a report that changes content status
    
- Creating a version and updating the main entry
    

Important actions must create an audit record inside the same transaction.

Audit actions include:

```text
ENTRY_SUBMITTED
ENTRY_APPROVED
ENTRY_REJECTED
ENTRY_CHANGES_REQUESTED
ENTRY_HIDDEN
ENTRY_RESTORED
CORRECTION_ACCEPTED
REPORT_RESOLVED
USER_ROLE_CHANGED
USER_SUSPENDED
```

---

# 17. Testing Strategy

## Unit tests

- Persian normalization
    
- YouTube ID extraction
    
- Slug generation
    
- Status-transition rules
    
- Ownership checks
    
- Self-approval prevention
    

## Backend integration tests

- Registration and login
    
- Token refresh
    
- Entry creation and submission
    
- Approval and requested changes
    
- Corrections
    
- Reports
    



---

# 18. Coding Rules

## Backend

- Controllers must not access Prisma directly.
    
- Business logic belongs in services.
    
- Protected changes require role or ownership checks.
    
- Multi-record operations use transactions.
    
- Sensitive database fields must never be returned.
    
- Avoid creating a repository layer until it provides real value.
    

## Frontend

- Use Server Components for public reading pages when suitable.
    
- Use Client Components only for interactive features.
    
- Use React Hook Form for complex forms.
    
- Use TanStack Query for interactive API data.
    
- Use Zustand only for temporary shared client state.
    
- Keep the application root configured with `lang="fa"` and `dir="rtl"`.
    

---

# 19. Implementation Order

```text
1. pnpm workspace
2. Next.js and NestJS setup
3. PostgreSQL and Prisma
4. Global validation and errors
5. Swagger
6. Authentication and roles
7. Provinces, categories, and content types
8. Cultural Entry drafts
9. Images, YouTube, and Tiptap content
10. Submission and moderation
11. Public pages and search
12. Ratings and reviews
13. Corrections and reports
14. Administration and audit logs
15. Testing and deployment
```


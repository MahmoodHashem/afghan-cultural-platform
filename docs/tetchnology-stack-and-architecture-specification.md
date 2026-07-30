
## Afghan Cultural Information Crowdsourcing Platform

**Document version:** 1.0  
**Application type:** Persian-language web platform  
**Architecture:** Next.js frontend with an independent NestJS REST API  

---

# 1. Technology Objectives

The selected technologies should:

- Support a Persian and right-to-left interface.
    
- Be manageable for a single developer.
    
- Use TypeScript across the frontend and backend.
    
- Support public cultural pages, contribution forms, moderation dashboards, images, ratings, corrections, and reports.
    
- Provide clear separation between presentation, business logic, and data storage.
    
- Avoid unnecessary infrastructure such as microservices, Redis, queues, WebSockets, and Elasticsearch.
    
- Remain suitable for future expansion without making the first version too difficult.
    

---

# 2. Final Technology Stack

| Area                    | Selected technology                          |
| ----------------------- | -------------------------------------------- |
| Programming language    | TypeScript                                   |
| Frontend framework      | Next.js with App Router                      |
| Styling                 | Tailwind CSS                                 |
| UI component system     | shadcn/ui                                    |
| Icons                   | Heroicons                                    |
| Forms                   | React Hook Form                              |
| Frontend validation     | Zod                                          |
| Server-state management | TanStack Query                               |
| Client-state management | Zustand, only where necessary                |
| Rich-text editor        | Tiptap                                       |
| Charts                  | shadcn Chart with Recharts                   |
| Backend framework       | NestJS                                       |
| API architecture        | REST API                                     |
| Database                | PostgreSQL                                   |
| ORM                     | Prisma                                       |
| Backend validation      | class-validator and class-transformer        |
| Authentication          | Passport, JWT access token and refresh token |
| Password hashing        | Argon2id                                     |
| Authorization           | NestJS Guards with roles                     |
| API documentation       | Swagger/OpenAPI                              |
| Image processing        | Multer through NestJS                        |
| Image storage           | Cloudinary                                   |
| Video support           | YouTube links only                           |
| Transactional email     | Nodemailer with SMTP                         |
| Rate limiting           | @nestjs/throttler                            |
| Security headers        | Helmet                                       |
| Backend logging         | NestJS Logger                                |
| Backend testing         | Jest and Supertest                           |
| Package manager         | pnpm                                         |
| Repository structure    | pnpm workspace                               |
| Source control          | Git and GitHub                               |

---

# 3. Overall System Architecture

The application will contain two separate programs:

```text
User browser
      │
      ▼
Next.js frontend
      │
      │ REST API requests
      ▼
NestJS backend
      │
      ├──────────────► PostgreSQL
      │
      ├──────────────► Cloudinary
      │
      ├──────────────► SMTP email provider
      │
      └──────────────► YouTube embedded content
```

The responsibilities are separated as follows:

## Next.js frontend

Next.js will manage:

- Public website pages
    
- Persian interface
    
- Right-to-left layout
    
- User dashboard
    
- Moderator dashboard
    
- Administrator dashboard
    
- Contribution forms
    
- Search and filter interfaces
    
- Authentication interface
    
- Tiptap editor
    
- Image previews
    
- Embedded YouTube videos
    
- Communication with the NestJS API
    

## NestJS backend

NestJS will manage:

- Authentication
    
- Authorization
    
- User roles
    
- Business rules
    
- Database access
    
- Content submission workflow
    
- Content approval and rejection
    
- Correction suggestions
    
- Reports
    
- Ratings
    
- Public reviews
    
- Image validation and upload
    
- YouTube link validation
    
- Audit logs
    
- Password-reset emails
    
- API documentation
    

## PostgreSQL

PostgreSQL will store:

- Users
    
- Cultural Entries
    
- Content versions
    
- Provinces
    
- Categories
    
- Content types
    
- Tags
    
- Sources
    
- Images and their metadata
    
- YouTube video identifiers
    
- Ratings
    
- Public reviews
    
- Correction suggestions
    
- Reports
    
- Moderation decisions
    
- Refresh-token records
    
- Audit logs
    

PostgreSQL is suitable because the system has many connected entities and workflows. Its relational model, tables, constraints, indexes, and transaction support fit relationships such as entries, contributors, moderators, reports, ratings, and content versions. ([PostgreSQL](https://www.postgresql.org/docs/current/index.html?utm_source=chatgpt.com "PostgreSQL 18.4 Documentation"))

---

# 4. Frontend Technologies

## 4.1 Next.js

The frontend will use **Next.js App Router with TypeScript**.

Next.js App Router supports layouts, pages, file-system routing, Server Components, and Client Components. Next.js also has built-in TypeScript support. ([Next.js](https://nextjs.org/docs?utm_source=chatgpt.com "Next.js Docs | Next.js"))

### Next.js responsibilities

Next.js will be used for:

- Public cultural-information pages
    
- Content-detail pages
    
- Province and category pages
    
- Search pages
    
- Authentication pages
    
- User dashboard
    
- Moderator dashboard
    
- Administrator dashboard
    
- Search-engine metadata
    
- Responsive layouts
    
- Server-rendered public content
    

### Suggested route structure ( May change during development )

```text
/
├── /search
├── /provinces
│   └── /[slug]
├── /categories
│   └── /[slug]
├── /entries
│   └── /[slug]
├── /login
├── /register
├── /forgot-password
├── /reset-password
├── /dashboard
│   ├── /entries
│   ├── /drafts
│   ├── /corrections
│   ├── /reports
│   └── /reviews
├── /moderator
│   ├── /submissions
│   ├── /corrections
│   └── /reports
└── /admin
    ├── /users
    ├── /categories
    ├── /provinces
    ├── /content-types
    └── /audit-logs
```

Public content pages should normally use Server Components. Interactive forms, dashboards, the rich-text editor, dialogs, and ratings will use Client Components.

---

## 4.2 Tailwind CSS

Tailwind CSS will be the main styling technology. It integrates directly with Next.js through PostCSS and generates CSS based on the classes used in project files. ([Tailwind CSS](https://tailwindcss.com/docs/guides/nextjs?utm_source=chatgpt.com "Install Tailwind CSS with Next.js"))

It will be used for:

- Responsive layouts
    
- Spacing
    
- Typography
    
- Right-to-left styling
    
- Colors
    
- Forms
    
- Dashboard layouts
    
- Content cards
    
- Public article presentation
    

The project should use the current stable Tailwind release available when development begins.

---

## 4.3 shadcn/ui

The UI component system will be **shadcn/ui**

shadcn/ui provides component source code that becomes part of the project and can therefore be customized. It now has first-class RTL support, including adaptation for Persian interfaces. ([Shadcn UI](https://ui.shadcn.com/docs/changelog/2026-01-rtl?utm_source=chatgpt.com "January 2026 - RTL Support - Shadcn UI"))

It will provide components such as:

- Button
    
- Input
    
- Textarea
    
- Select
    
- Checkbox
    
- Form
    
- Dialog
    
- Alert Dialog
    
- Sheet
    
- Dropdown Menu
    
- Tabs
    
- Table
    
- Card
    
- Badge
    
- Tooltip
    
- Sidebar
    
- Pagination
    
- Skeleton
    
- Toast or Sonner
    
- Calendar, when required
    



---

## 4.4 Persian and RTL support

The root HTML layout will use:

```html
<html lang="fa" dir="rtl">
```

The interface must support:

- Right-to-left layout
    
- Persian form labels
    
- Persian validation messages
    
- Correct text alignment
    
- Persian and Arabic character normalization
    
- Responsive tables and forms
    
- Correct placement of icons in RTL layouts
    

Dates will be stored in UTC in the backend. The frontend can display Persian calendar dates using the browser’s internationalization API:

```ts
new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(date);
```


---

# 5. Forms and Frontend Validation

## 5.1 React Hook Form

React Hook Form will manage frontend forms, field states, submission states, errors, and validation integration. Its `useForm` API supports validation rules, default values, and submission handling. ([React Hook Form](https://react-hook-form.com/docs/useform?utm_source=chatgpt.com "useForm"))

It will be used for:

- Registration
    
- Login
    
- Password reset
    
- Profile editing
    
- Cultural Entry creation
    
- Image information
    
- Source information
    
- YouTube links
    
- Ratings
    
- Public reviews
    
- Correction suggestions
    
- Reports
    
- Category management
    
- Province management
    

## 5.2 Zod

Zod will define frontend validation schemas. It is a TypeScript-first schema-validation library that supports simple values, objects, arrays, nested data, and static type inference. ([Zod](https://zod.dev/?utm_source=chatgpt.com "Zod: Intro"))

The selected form combination is:

```text
React Hook Form
        +
Zod
        +
@hookform/resolvers
```

Example:

```ts
import { z } from "zod";

export const culturalEntrySchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "عنوان باید حداقل ۵ حرف باشد")
    .max(200, "عنوان نباید بیشتر از ۲۰۰ حرف باشد"),

  summary: z
    .string()
    .trim()
    .min(20, "خلاصه باید حداقل ۲۰ حرف باشد")
    .max(500, "خلاصه نباید بیشتر از ۵۰۰ حرف باشد"),

  provinceId: z.string().min(1, "ولایت را انتخاب کنید"),

  categoryId: z.string().min(1, "دسته‌بندی را انتخاب کنید"),
});
```

Frontend validation is for usability. NestJS must validate the same request again because frontend validation can be bypassed.

---

# 6. State Management

The application has three different types of state. Each type must use the correct tool.

## 6.1 Server state: TanStack Query

TanStack Query will manage data received from the NestJS API in interactive Client Components. It handles caching, request deduplication, background updates, mutations, pagination, and invalidation. ([TanStack](https://tanstack.com/query/latest/docs/framework/react/overview?utm_source=chatgpt.com "Overview | TanStack Query React Docs"))

Use TanStack Query for:

- User submissions
    
- Pending moderation items
    
- Reports
    
- Corrections
    
- Ratings
    
- Public reviews
    
- User lists
    
- Categories
    
- Provinces
    
- Dashboard statistics
    

Example:

```ts
const submissionsQuery = useQuery({
  queryKey: ["my-submissions", status],
  queryFn: () => api.getMySubmissions(status),
});
```

## 6.2 Client state: Zustand

Zustand will be included only when state must be shared between several client components. Zustand provides a small hook-based store and supports optional persistence. ([Zustand Documentation](https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data?utm_source=chatgpt.com "Persisting store data - Zustand"))

Possible uses:

- Authenticated user information
    
- Short-lived access token
    
- Multi-step contribution-form progress
    
- Dashboard sidebar state
    
- Temporary image previews
    
- Search-filter drawer state
    

Zustand **must not store API collections** such as Cultural Entries, reports, or users. Those belong to TanStack Query.

## 6.3 Form state: React Hook Form

Input values, field errors, touched fields, and submission state belong to React Hook Form, not Zustand.

The responsibility division is:

|State|Technology|
|---|---|
|API data|TanStack Query|
|Form fields|React Hook Form|
|Shared interface state|Zustand|
|Public server-rendered content|Next.js server fetching|

---

# 7. Rich-Text Editing

## 7.1 Tiptap

Tiptap will be used for writing cultural articles, stories, traditions, and place descriptions.

Tiptap has an official Next.js integration, customizable extensions, support for Tailwind styling, text-direction commands, and server-side static rendering of structured editor content. ([Tiptap](https://tiptap.dev/docs/editor/getting-started/install/nextjs?utm_source=chatgpt.com "Next.js | Tiptap Editor Docs"))

### Version-one editor features

The editor will support:

- Paragraphs
    
- Heading level 2
    
- Heading level 3
    
- Bold
    
- Italic
    
- Underline
    
- Bullet lists
    
- Ordered lists
    
- Blockquotes
    
- Links
    
- Text alignment
    
- RTL direction
    
- Undo
    
- Redo
    
- Character count
    
- Placeholder text
    

It will not initially support:

- Arbitrary HTML
    
- Custom iframes
    
- Embedded JavaScript
    
- Collaborative editing
    
- AI writing
    
- Tables
    
- Images inside the article body
    
- YouTube videos inside the article body
    

Images and YouTube links will remain separate structured fields.

## 7.2 Rich-text storage

The editor content will be stored as **Tiptap JSON** in a PostgreSQL `JSONB` field.

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "attrs": {
        "textDirection": "rtl"
      },
      "content": [
        {
          "type": "text",
          "text": "این یک نمونه محتوای فرهنگی است."
        }
      ]
    }
  ]
}
```

The Cultural Entry will also store a plain-text version extracted from the Tiptap document. The plain text will be used for:

- Search
    
- Preview snippets
    
- Word count
    
- Content comparison
    

Published pages will render the approved Tiptap JSON using Tiptap’s static renderer. This avoids loading the complete editor on public reading pages. ([Tiptap](https://tiptap.dev/docs/editor/api/utilities/static-renderer?utm_source=chatgpt.com "Static Renderer | Tiptap Editor Docs"))

---

# 8. Backend Framework

## 8.1 NestJS

The backend will use NestJS with TypeScript.

NestJS organizes applications using modules, controllers, providers, dependency injection, guards, pipes, filters, and interceptors. Controllers handle incoming requests, while providers such as services contain reusable business logic. ([NestJS Documentation](https://docs.nestjs.com/controllers?utm_source=chatgpt.com "Controllers | NestJS - A progressive Node.js framework"))

The backend will expose a versioned REST API:

```text
/api/v1
```

Example endpoints:

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh

GET    /api/v1/entries
GET    /api/v1/entries/:slug
POST   /api/v1/entries
PATCH  /api/v1/entries/:id
POST   /api/v1/entries/:id/submit

GET    /api/v1/moderation/submissions
POST   /api/v1/moderation/:id/approve
POST   /api/v1/moderation/:id/request-changes
POST   /api/v1/moderation/:id/reject

POST   /api/v1/entries/:id/corrections
POST   /api/v1/entries/:id/reports
POST   /api/v1/entries/:id/ratings
POST   /api/v1/entries/:id/reviews
```

GraphQL will not be used because REST is simpler to learn, test, document, and integrate for this project.

---

# 9. Backend Module Structure (May change during development )

```text
src/
├── auth/
├── users/
├── cultural-entries/
├── content-versions/
├── content-types/
├── provinces/
├── districts/
├── categories/
├── tags/
├── sources/
├── images/
├── youtube-videos/
├── moderation/
├── corrections/
├── reports/
├── ratings/
├── public-reviews/
├── audit-logs/
├── admin/
├── mail/
├── prisma/
├── config/
└── common/
    ├── decorators/
    ├── guards/
    ├── filters/
    ├── interceptors/
    ├── pipes/
    ├── enums/
    └── utilities/
```

A normal module should contain:

```text
cultural-entries/
├── dto/
│   ├── create-cultural-entry.dto.ts
│   ├── update-cultural-entry.dto.ts
│   └── search-cultural-entries.dto.ts
├── cultural-entries.controller.ts
├── cultural-entries.service.ts
├── cultural-entries.module.ts
└── cultural-entries.types.ts
```

A separate repository layer is not required initially. Prisma queries can remain inside services until there is a clear need for repository abstraction.

---

# 10. Backend Validation

NestJS will use:

```text
class-validator
class-transformer
ValidationPipe
```

NestJS’s `ValidationPipe` validates incoming request data through DTO classes and declarative validation decorators. ([NestJS Documentation](https://docs.nestjs.com/techniques/validation?utm_source=chatgpt.com "Validation | NestJS - A progressive Node.js framework"))

Global configuration:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

Example DTO:

```ts
export class CreateCulturalEntryDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(20)
  @MaxLength(500)
  summary: string;

  @IsUUID()
  provinceId: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsUrl()
  youtubeUrl?: string;
}
```

Zod will not replace backend validation. The final structure will be:

```text
Next.js validation: Zod
NestJS validation: class-validator
Database rules: PostgreSQL and Prisma constraints
```

---

# 11. Database and ORM

## 11.1 PostgreSQL

PostgreSQL will be the main database because the platform contains structured relationships and business rules.

Important relationships include:

- User to Cultural Entries
    
- Cultural Entry to versions
    
- Cultural Entry to sources
    
- Cultural Entry to images
    
- Cultural Entry to ratings
    
- Cultural Entry to reports
    
- Moderator to moderation decisions
    
- User to correction suggestions
    

## 11.2 Prisma ORM

Prisma will connect NestJS to PostgreSQL.

Prisma provides a TypeScript-oriented schema, generated database client, migrations, and support for PostgreSQL. It also has an official NestJS guide. ([Prisma](https://www.prisma.io/docs/guides/frameworks/nestjs?utm_source=chatgpt.com "How to use Prisma ORM and Prisma Postgres with NestJS"))

Prisma will manage:

- Database models
    
- Relations
    
- Enums
    
- Queries
    
- Migrations
    
- Seed data
    
- Unique constraints
    
- Database transactions
    

Example:

```prisma
model CulturalEntry {
  id               String            @id @default(cuid())
  title            String
  slug             String            @unique
  summary          String
  contentJson      Json
  plainTextContent String
  status           EntryStatus       @default(DRAFT)

  authorId         String
  provinceId       String
  categoryId       String
  contentTypeId    String

  author            User              @relation(fields: [authorId], references: [id])
  province          Province          @relation(fields: [provinceId], references: [id])
  category          Category          @relation(fields: [categoryId], references: [id])
  versions          ContentVersion[]
  images            Image[]
  sources           Source[]
  ratings           Rating[]
  publicReviews     PublicReview[]
  reports           Report[]

  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  publishedAt       DateTime?
}
```

Use the current generally available Prisma release when the project is initialized, not a beta or preview release. Prisma’s current documentation distinguishes the generally available release from its preview next-generation release. ([Prisma](https://www.prisma.io/docs?utm_source=chatgpt.com "Get started with Prisma | Prisma Documentation"))

---

# 12. Persian Search

The first version will not use Elasticsearch.

Search will be implemented with NestJS and PostgreSQL.

Before saving and searching text, the backend will normalize Persian text by:

- Converting `ي` to `ی`
    
- Converting `ك` to `ک`
    
- Removing optional diacritics
    
- Normalizing spaces
    
- Normalizing half-spaces where appropriate
    
- Converting Persian and Arabic number forms when needed
    

The database may store:

```text
title
summary
plainTextContent
normalizedSearchText
```

The first version can use PostgreSQL `ILIKE` searches over normalized text. Indexes will be added to fields used for filtering:

- Status
    
- Province
    
- Category
    
- Content type
    
- Publication date
    

If the amount of content grows significantly, PostgreSQL trigram indexes can later improve fuzzy matching. Elasticsearch is unnecessary for the first version.

---

# 13. Authentication and Authorization

## 13.1 Authentication technologies

The backend will use:

- `@nestjs/passport`
    
- `passport-jwt`
    
- `@nestjs/jwt`
    
- Argon2id
    
- Access tokens
    
- Refresh tokens
    
- NestJS Guards
    

NestJS separates authentication from authorization and supports route protection through guards. ([NestJS Documentation](https://docs.nestjs.com/security/authentication?utm_source=chatgpt.com "Authentication | NestJS - A progressive Node.js framework"))

Argon2id will be used to hash passwords. The Argon2 specification describes Argon2 as a memory-hard password-hashing function and identifies Argon2id as its primary hybrid variant. ([IETF Datatracker](https://datatracker.ietf.org/doc/rfc9106/?utm_source=chatgpt.com "RFC 9106 - Argon2 Memory-Hard Function for Password Hashing and Proof-of-Work Applications"))

## 13.2 Token design

Recommended starting configuration:

```text
Access token lifetime: 15 minutes
Refresh token lifetime: 7 days
```

The access token will:

- Be returned after login or refresh.
    
- Be stored only in application memory.
    
- Be attached to API requests as a Bearer token.
    
- Not be stored in localStorage.
    

The refresh token will:

- Be stored in a secure HTTP-only cookie.
    
- Be unavailable to normal browser JavaScript.
    
- Be replaced when refreshed.
    
- Have its hash stored in the database.
    
- Be revocable after logout or account suspension.
    

Zustand may store the current user and short-lived access token in memory. On page reload, the frontend will call the refresh endpoint.

## 13.3 Roles

```ts
enum UserRole {
  USER = "USER",
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN",
}
```

The backend will always make the final authorization decision.

A hidden button in the frontend is only a user-interface restriction. It is not security.

Important authorization rules:

- Users cannot approve content.
    
- Moderators cannot approve their own content.
    
- Suspended users cannot perform protected actions.
    
- Only administrators can manage roles.
    
- Only moderators and administrators can handle reports and corrections.
    

---

# 14. API Documentation

NestJS Swagger will generate OpenAPI documentation from the backend’s controllers and decorators. NestJS provides the `@nestjs/swagger` module specifically for generating an OpenAPI specification. ([NestJS Documentation](https://docs.nestjs.com/openapi/introduction?utm_source=chatgpt.com "OpenAPI (Swagger) | NestJS - A progressive Node.js ..."))

Development documentation route:

```text
http://localhost:4000/api/docs
```

Swagger will be used to:

- View endpoints
    
- Test requests
    
- Inspect request DTOs
    
- Inspect response formats
    
- Test authentication
    
- Document the backend
    
- Provide screenshots and API details for the monograph
    

---

# 15. API Communication

The frontend will use the native `fetch` API through one reusable API-client wrapper.

Axios is not necessary.

Example structure:

```text
src/lib/api/
├── api-client.ts
├── auth-api.ts
├── entries-api.ts
├── moderation-api.ts
├── reports-api.ts
└── admin-api.ts
```

The API client will handle:

- Base URL
    
- Bearer access token
    
- JSON parsing
    
- Standard error parsing
    
- Automatic refresh attempt
    
- Multipart requests
    
- Request cancellation
    

TanStack Query will call these API functions from Client Components. Next.js public Server Components can use server-side `fetch` directly.

---

# 16. Image Uploads

## 16.1 Upload technology

NestJS will use Multer through its built-in file-upload support. NestJS provides interceptors and decorators for handling uploaded files. ([NestJS Documentation](https://docs.nestjs.com/techniques/file-upload?utm_source=chatgpt.com "File upload | NestJS - A progressive Node.js framework"))

Cloudinary will store and deliver uploaded images. Its Node.js SDK supports server-side media uploads, and its API returns asset metadata that can be saved in the database. ([Cloudinary](https://cloudinary.com/documentation/node_image_and_video_upload?utm_source=chatgpt.com "Node.js image and video upload | Documentation"))

Upload flow:

```text
User selects image
        ↓
Next.js displays local preview
        ↓
Image sent to NestJS as multipart/form-data
        ↓
NestJS validates image type and size
        ↓
NestJS uploads image to Cloudinary
        ↓
Cloudinary returns secure URL and public ID
        ↓
NestJS stores image metadata in PostgreSQL
```

Stored information:

```ts
{
  secureUrl: string;
  publicId: string;
  caption: string;
  altText: string;
  photographer?: string;
  permissionConfirmed: boolean;
  width?: number;
  height?: number;
  displayOrder: number;
}
```

Cloudinary credentials must exist only in the NestJS environment variables.

---

# 17. YouTube Videos

No video files will be uploaded.

The contribution form will accept YouTube links only.

The backend will:

1. Validate the URL.
    
2. Confirm that it uses a supported YouTube domain.
    
3. Extract the video identifier.
    
4. Store the identifier, title, and description.
    
5. Reject invalid URLs.
    

Example:

```ts
{
  videoId: "abcdefghijk",
  title: "معرفی یک رسم محلی",
  description: "توضیح کوتاه درباره ویدیو"
}
```

The frontend will display the video through a lazy-loaded YouTube embed.

No YouTube API key is required for the basic embed workflow.

---

# 18. Password-Reset Email

Although notifications are excluded, password reset still requires a transactional email.

NestJS will use **Nodemailer with SMTP**.

Nodemailer supports SMTP through a transporter configured with host, port, encryption, and authentication settings. ([Nodemailer](https://nodemailer.com/smtp?utm_source=chatgpt.com "SMTP transport | Nodemailer"))

The email module will initially send only:

- Password-reset emails
    
- Optional email-verification emails later
    

It will not send:

- Moderation notifications
    
- Report notifications
    
- Correction notifications
    
- General platform announcements
    

The email provider will be configurable through environment variables, so it can be changed without modifying application code.

---

# 19. Security Technologies

The backend security stack will include:

```text
Argon2id
JWT
Passport
Helmet
CORS configuration
NestJS Throttler
ValidationPipe
File validation
Role Guards
Audit logs
```

Rate limiting will use `@nestjs/throttler`. NestJS recommends rate limiting as a way to reduce brute-force and repeated-request abuse. ([NestJS Documentation](https://docs.nestjs.com/security/rate-limiting?utm_source=chatgpt.com "Rate Limiting | NestJS - A progressive Node.js framework"))

Stronger limits will be applied to:

- Login
    
- Registration
    
- Password reset
    
- Refresh token
    
- Reports
    
- Public reviews
    
- Correction suggestions
    
- Image uploads
    

The project will also:

- Reject unknown request fields.
    
- Validate uploaded file type and size.
    
- Prevent arbitrary HTML in Tiptap.
    
- Validate links.
    
- Use parameterized Prisma queries.
    
- Restrict CORS to approved frontend origins.
    
- Keep secrets outside source code.
    
- Record important moderation and administrative actions.
    
- Sanitize public content before rendering where necessary.
    

---

# 20. Configuration and Environment Variables

NestJS will use `@nestjs/config`.

Environment variables are appropriate for settings that differ between development, testing, and production, such as database credentials and external service keys. ([NestJS Documentation](https://docs.nestjs.com/techniques/configuration?source=post_page---------------------------&utm_source=chatgpt.com "Configuration | NestJS - A progressive Node.js framework"))

Example backend variables:

```text
NODE_ENV=
PORT=
FRONTEND_URL=

DATABASE_URL=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

Example frontend variables:

```text
NEXT_PUBLIC_API_URL=
```

Secrets such as JWT secrets, database passwords, Cloudinary secrets, and SMTP credentials must never use the `NEXT_PUBLIC_` prefix.

---

# 21. Logging and Audit Records

## Application logging

NestJS’s built-in Logger will be used for:

- Application startup
    
- Request errors
    
- Database failures
    
- Upload failures
    
- Authentication failures
    
- Unexpected exceptions
    

NestJS can produce JSON-formatted console logs when structured production logging is required. ([NestJS Documentation](https://docs.nestjs.com/techniques/logger?utm_source=chatgpt.com "Logger | NestJS - A progressive Node.js framework"))

## Business audit logs

A separate PostgreSQL `AuditLog` table will record important product activities:

- Role changes
    
- User suspension
    
- Content approval
    
- Content rejection
    
- Changes requested
    
- Report resolution
    
- Correction acceptance
    
- Content hiding
    
- Content restoration
    
- Administrator overrides
    

Application logs and audit logs serve different purposes and should remain separate.

---

# 22. Testing Technologies

## Backend tests

NestJS will use:

- Jest for unit tests
    
- Supertest for API integration tests
    

NestJS includes integration with Jest and Supertest in its testing tools. ([NestJS Documentation](https://docs.nestjs.com/fundamentals/testing?utm_source=chatgpt.com "Testing | NestJS - A progressive Node.js framework"))

Important backend tests:

- Registration
    
- Login
    
- Token refresh
    
- Role restrictions
    
- Content creation
    
- Content submission
    
- Moderator approval
    
- Self-approval prevention
    
- Correction acceptance
    
- Report resolution
    
- Persian search normalization
    

## End-to-end tests

Playwright will test complete workflows in real browsers. It supports browser automation, assertions, isolation, retries, tracing, Chromium, Firefox, and WebKit. ([Playwright](https://playwright.dev/docs/intro?utm_source=chatgpt.com "Installation"))

Critical Playwright workflows:

1. User registers and logs in.
    
2. User creates a Cultural Entry.
    
3. User uploads an image.
    
4. User adds a YouTube link.
    
5. User submits content.
    
6. Moderator requests changes.
    
7. User edits and resubmits.
    
8. Moderator approves content.
    
9. Visitor finds the published content.
    
10. User submits a correction or report.
    

The first version does not require a large number of frontend unit tests. Critical frontend behavior will be covered through Playwright.

---

# 23. Repository and Package Management

The project will use one Git repository and a pnpm workspace. pnpm workspaces allow multiple applications and packages to exist in one repository through a `pnpm-workspace.yaml` file. ([pnpm](https://pnpm.io/workspaces?utm_source=chatgpt.com "Workspace"))

```text
afghan-cultural-platform/
├── apps/
│   ├── web/                    # Next.js
│   └── api/                    # NestJS
├── packages/
│   └── contracts/              # Shared enums and safe API types
├── pnpm-workspace.yaml
├── package.json
├── pnpm-lock.yaml
├── .gitignore
└── README.md
```

The shared package may contain:

- Role names
    
- Cultural Entry statuses
    
- Correction statuses
    
- Report statuses
    
- Common API response types
    

It should not contain:

- Prisma database models
    
- NestJS services
    
- Frontend components
    
- Backend DTO decorators
    
- Secrets
    

Nx and Turborepo will not be used initially. A basic pnpm workspace is enough for two applications.

---

# 24. Code Quality Tools

The project will use:

- TypeScript strict mode
    
- ESLint
    
- Prettier
    
- Prettier Tailwind plugin
    
- Git
    
- GitHub
    
- pnpm lockfile
    

Required checks before committing:

```text
lint
typecheck
test
build
```

GitHub Actions may later run these checks automatically, but automated deployment is not necessary at the beginning.

---

# 25. Version Policy

Exact version numbers should be selected when the project is initialized.

The project will follow these rules:

1. Use current stable releases.
    
2. Avoid beta, canary, alpha, and release-candidate packages.
    
3. Commit `pnpm-lock.yaml`.
    
4. Do not upgrade major versions during the monograph without a clear reason.
    
5. Install security and patch updates carefully.
    
6. Test the project after dependency updates.
    
7. Record major dependency versions in the monograph.
    

This approach prevents the technical document from becoming outdated every time a framework releases a minor version.

---

# 26. Deployment Position

Deployment providers are not selected in this document.

The architecture supports separate deployment:

```text
Next.js frontend          → frontend hosting platform
NestJS REST API           → Node.js hosting platform
PostgreSQL                → managed PostgreSQL provider
Images                    → Cloudinary
Email                     → SMTP provider
```

Provider selection should happen after local implementation works because cost, regional access, available payment methods, storage limits, and deployment requirements may affect the final choice.

The entire system must first run locally:

```text
Next.js:  http://localhost:3000
NestJS:   http://localhost:4000
Swagger:  http://localhost:4000/api/docs
Database: local PostgreSQL
```

---

# 27. Technologies Excluded from Version One

The following will not be used:

|Excluded technology|Reason|
|---|---|
|Ant Design|shadcn/ui is selected|
|Plate UI|Tiptap is selected|
|Redux|Zustand and TanStack Query are sufficient|
|Axios|Native fetch is sufficient|
|GraphQL|REST is simpler for this project|
|MongoDB|PostgreSQL better fits the relationships|
|Redis|No current requirement|
|Elasticsearch|PostgreSQL search is sufficient|
|WebSockets|No real-time feature|
|RabbitMQ or Kafka|No background-event requirement|
|Microservices|A modular monolith is simpler|
|Docker orchestration|Unnecessary for the MVP|
|Direct video upload|YouTube links only|
|Notification libraries|Notifications are excluded|
|Internationalization library|Version one is Persian-only|
|AI libraries|AI features are excluded|
|Collaborative editor|Not needed|
|Mobile framework|Web application only|

---

# 28. Final Approved Stack

```text
Frontend
├── Next.js App Router
├── TypeScript
├── Tailwind CSS
├── shadcn/ui
├── Heroicons
├── React Hook Form
├── Zod
├── TanStack Query
├── Zustand
├── Tiptap
└── Recharts through shadcn Chart

Backend
├── NestJS
├── TypeScript
├── REST API
├── Prisma
├── PostgreSQL
├── class-validator
├── class-transformer
├── Passport
├── JWT
├── Argon2id
├── Swagger
├── Multer
├── Cloudinary
├── Nodemailer
├── Helmet
├── NestJS Throttler
└── NestJS Logger

Testing
├── Jest
├── Supertest
└── Playwright

Project tooling
├── pnpm workspace
├── Biome (formating and linting )
├── Git
└── GitHub
```

This stack keeps the system modern while remaining realistic for one developer. It also keeps the most difficult business rules—authentication, moderation, corrections, reports, versions, and access control—inside one modular NestJS backend rather than spreading them across different technologies.
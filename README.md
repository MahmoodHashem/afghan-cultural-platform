# Afghan Cultural Knowledge Platform

**Miras Afghanistan (میراث افغانستان)** is a Persian, right-to-left crowdsourcing platform for documenting, organizing, reviewing, and discovering Afghanistan's cultural knowledge.

[Open the live application](https://mirasaf.vercel.app) | [Read the final monograph](docs/Final_Monogograph.pdf)

## About The Thesis

This project is the software artifact developed for the 2026 undergraduate thesis:

> **Investigating and Analyzing the Challenges of Accessing Afghan Cultural Information and Proposing a Solution through the Design and Implementation of a Crowdsourced Platform**

The thesis was prepared by **Shah Mahmood Hashemi** at the Software Engineering Department of Herat University's Computer Science Faculty, under the supervision of **Towfiq Amiri**.

The study examines why Afghan cultural information can be difficult to access: sources are often fragmented, documentation is limited, information lacks consistent thematic and geographic organization, and communities have few structured ways to improve existing knowledge. Using Design Science Research Methodology, the project translates those challenges into a working web platform.

The resulting system combines structured Cultural Entries, province and topic-based discovery, supporting sources, community contributions, moderation, revision history, and administrative oversight. It demonstrates a practical technical approach to improving how cultural information can be collected and maintained. As explained in the monograph, it is evaluated as a software artifact and does not claim measured long-term cultural or social impact from a large-scale deployment.

## What The Platform Supports

- Public discovery through search, topics, content types, provinces, districts, and tags
- Rich Cultural Entries with structured text, images, references, internal links, and related video
- Persian RTL interfaces optimized for desktop and app-like mobile use
- Password authentication, email verification, Google/Facebook OAuth, and secure refresh sessions
- Contributor drafts, preview, submission, requested changes, resubmission, and published revisions
- Likes, bookmarks, threaded comments and replies, correction suggestions, and content reports
- Moderator queues for submissions, revisions, corrections, reports, and moderation history
- Admin management for users, moderator roles, entries, taxonomies, provinces, districts, reports, and global audit history
- SEO metadata, sitemap generation, structured data, and on-demand public-entry cache revalidation

## Application Flow

The walkthrough below follows the representative interfaces and workflows presented in Chapter Four of the monograph.

### 1. Access And Roles

Visitors can browse public information without an account. Registered and email-verified users can contribute and interact. Moderator and Admin capabilities are protected by backend role guards.

<table>
  <tr>
    <td><img src="docs/screenshots/register.png" alt="Registration page"><br><sub>Account registration</sub></td>
    <td><img src="docs/screenshots/login.jpg" alt="Login page"><br><sub>Account login</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/user-access.jpg" alt="User access experience"><br><sub>Contributor access</sub></td>
    <td><img src="docs/screenshots/moderator-access.jpg" alt="Moderator access experience"><br><sub>Moderator access</sub></td>
  </tr>
  <tr>
    <td colspan="2"><img src="docs/screenshots/admin-accesses.jpg" alt="Administrator access experience"><br><sub>Administrator access</sub></td>
  </tr>
</table>

### 2. Home And Cultural Discovery

The Home page introduces recently published content and discovery paths. Explore supports server-backed search and filtering, while province and topic pages provide geographic and thematic navigation.

<table>
  <tr>
    <td><img src="docs/screenshots/homepagescreenshot2.png" alt="Platform homepage"><br><sub>Homepage and featured cultural content</sub></td>
    <td><img src="docs/screenshots/explore.png" alt="Explore page"><br><sub>Explore published entries</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/search-explore.jpg" alt="Explore search"><br><sub>Server-backed cultural search</sub></td>
    <td><img src="docs/screenshots/filter-explore.jpg" alt="Explore filters"><br><sub>Structured discovery filters</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/provinces.png" alt="Province discovery page"><br><sub>Browse by province</sub></td>
    <td><img src="docs/screenshots/provinces2.jpg" alt="Province listing"><br><sub>Province directory</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/province-detail.png" alt="Province detail page"><br><sub>Province information, districts, and entries</sub></td>
    <td><img src="docs/screenshots/categories.jpg" alt="Category discovery page"><br><sub>Browse by cultural topic</sub></td>
  </tr>
  <tr>
    <td colspan="2"><img src="docs/screenshots/cateogories-detail.jpg" alt="Category detail page"><br><sub>Topic details and related entries</sub></td>
  </tr>
</table>

### 3. Reading A Cultural Entry

A published entry presents its title, summary, author, location, classification, rich-text content, images, sources, related video, tags, and related entries in a focused reading layout.

<table>
  <tr>
    <td><img src="docs/screenshots/entry-detail-3.jpg" alt="Published Cultural Entry"><br><sub>Focused Cultural Entry reading experience</sub></td>
    <td><img src="docs/screenshots/entry-detail-4.jpg" alt="Cultural Entry content"><br><sub>Rich cultural content and media</sub></td>
  </tr>
  <tr>
    <td colspan="2"><img src="docs/screenshots/entry_metadata.jpg" alt="Cultural Entry metadata"><br><sub>Classification, location, tags, and supporting metadata</sub></td>
  </tr>
</table>

### 4. Contributor Workflow

```text
Create draft -> Add content and classification -> Add media and sources
             -> Preview -> Submit for review
```

The writing experience uses Tiptap and separates the main editorial canvas from secondary metadata. Contributors can save a draft, attach supporting material, preview the result, and submit it without publishing directly.

<table>
  <tr>
    <td><img src="docs/screenshots/create_entry.jpg" alt="Create Cultural Entry editor"><br><sub>Distraction-free Cultural Entry editor</sub></td>
    <td><img src="docs/screenshots/sources_media_create.jpg" alt="Entry sources and media editor"><br><sub>Sources, images, and related media</sub></td>
  </tr>
</table>

### 5. Moderation Lifecycle

```text
Submitted -> Moderator review -> Approved -> Published
                              -> Changes requested -> Edit -> Resubmit
                              -> Rejected
```

Moderators inspect the submitted version and its supporting context before approving it, requesting changes, or rejecting it. Approved content becomes public only after server confirmation. Published entries can later be revised while the last approved version remains publicly available.

<table>
  <tr>
    <td><img src="docs/screenshots/queue-review.jpg" alt="Moderation queue"><br><sub>Submitted-entry review queue</sub></td>
    <td><img src="docs/screenshots/review-detail.jpg" alt="Moderation review detail"><br><sub>Complete submitted-entry inspection</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/actions-review.jpg" alt="Moderation actions"><br><sub>Approve, request changes, or reject</sub></td>
    <td><img src="docs/screenshots/reuqest-change.jpg" alt="Request changes feedback"><br><sub>Moderator feedback for requested changes</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/request-change-resubmission.jpg" alt="Entry resubmission"><br><sub>Contributor revision and resubmission</sub></td>
    <td><img src="docs/screenshots/moderator-review.jpg" alt="Moderator review experience"><br><sub>Content-focused moderation decision</sub></td>
  </tr>
</table>

### 6. Community Participation

Readers can like and bookmark entries, join threaded discussions, suggest corrections, and report problematic entries or comments. Protected interactions provide a continuous login and verification experience without discarding typed comment drafts.

<table>
  <tr>
    <td><img src="docs/screenshots/like-actions.jpg" alt="Entry engagement actions"><br><sub>Like, bookmark, comment, and share</sub></td>
    <td><img src="docs/screenshots/comments.jpg" alt="Threaded comments"><br><sub>Comments, replies, and comment likes</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/correction.jpg" alt="Correction suggestion"><br><sub>Community correction suggestions</sub></td>
    <td><img src="docs/screenshots/report-post.jpg" alt="Content reporting"><br><sub>Report problematic content</sub></td>
  </tr>
</table>

### 7. User Profile And Contributions

The Profile area keeps a user's entries, comments, and bookmarks together. Contribution rows communicate draft, moderation, requested-change, rejection, publication, and revision states with the appropriate continuation action.

<table>
  <tr>
    <td><img src="docs/screenshots/profile.jpg" alt="Desktop user profile"><br><sub>Profile identity and owned content</sub></td>
    <td><img src="docs/screenshots/profile.png" alt="Mobile user profile"><br><sub>App-like mobile Profile experience</sub></td>
  </tr>
  <tr>
    <td colspan="2"><img src="docs/screenshots/contribution-stats.jpg" alt="Contribution statistics"><br><sub>Real contribution, comment, and bookmark counts</sub></td>
  </tr>
</table>

### 8. Moderator Workspace

The Moderator workspace contains focused queues for new submissions, published revisions, correction suggestions, and reports, together with the relevant moderation history.

![Moderator queues and workspace](docs/screenshots/moderator-workspace.jpg)

<sub>Moderator queues, reports, corrections, and review history</sub>

### 9. Administrator Dashboard

Admins manage platform-wide users, moderator roles, Cultural Entries, topics, content types, tags, provinces, districts, reports, and immutable audit records through a dedicated operational dashboard.

<table>
  <tr>
    <td><img src="docs/screenshots/admin-dashboard.jpg" alt="Admin dashboard overview"><br><sub>Administrative overview</sub></td>
    <td><img src="docs/screenshots/users-roles.jpg" alt="Admin user and role management"><br><sub>User and role management</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/category-admin.jpg" alt="Admin category management"><br><sub>Topic management</sub></td>
    <td><img src="docs/screenshots/content-type-admin-taxanomy.jpg" alt="Admin content type management"><br><sub>Content-type management</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/tags-taxanomy.jpg" alt="Admin tag management"><br><sub>Tag management</sub></td>
    <td><img src="docs/screenshots/provinces-taxanomy.jpg" alt="Admin province management"><br><sub>Province and district management</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/reports-admin.jpg" alt="Admin reports queue"><br><sub>Platform reports</sub></td>
    <td><img src="docs/screenshots/activity-history-admin.jpg" alt="Admin audit history"><br><sub>Global activity and audit history</sub></td>
  </tr>
</table>

## Research Scope

This repository represents the implemented system described in the monograph. Cultural information included for development or demonstration should not be interpreted as a complete scholarly archive. Community contributions, references, moderation, and transparent revision history are central to improving the collection over time.

## Architecture

The repository is a pnpm monorepo with independently deployable frontend and backend applications:

```text
Browser
  -> Next.js App Router frontend
  -> Versioned NestJS REST API (/api/v1)
  -> Prisma ORM
  -> PostgreSQL
```

Business rules, authorization, workflow transitions, and persistence remain in NestJS. The Next.js application owns presentation and interaction, using Server Components for public reading and discovery where practical and focused Client Components for forms and mutations.

### Main Technologies

| Area | Technologies |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, Motion |
| Forms and data | React Hook Form, Zod, TanStack Query, TanStack Table |
| Rich content | Tiptap structured JSON editor |
| Backend | NestJS 11, Passport, JWT, class-validator, Swagger/OpenAPI |
| Database | PostgreSQL, Prisma ORM and migrations |
| External services | Cloudinary, SMTP, YouTube Data API, Google/Facebook OAuth |
| Quality | Biome, Jest, Node test runner |

### Repository Structure

```text
apps/
  api/       NestJS API, Prisma schema, migrations, and seed data
  web/       Next.js public site and authenticated workspaces
packages/    Shared workspace packages
docs/        Architecture notes, database documentation, and monograph
```

## Run Locally

### Prerequisites

- Node.js 20.9 or newer
- pnpm 11.5.2
- PostgreSQL
- Credentials for the integrations declared in the API environment example

### 1. Clone And Install

```sh
git clone https://github.com/MahmoodHashem/afghan-cultural-platform.git
cd afghan-cultural-platform
pnpm install
```

### 2. Create The Local Database

Create an empty PostgreSQL database. With the standard local PostgreSQL tools:

```sh
createdb afghan_culture
```

### 3. Configure Environment Variables

```sh
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

For local development, keep these origins aligned:

```env
# apps/api/.env
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/afghan_culture?schema=public
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/afghan_culture?schema=public
GOOGLE_CALLBACK_URL=http://localhost:4000/api/v1/auth/google/callback
FACEBOOK_CALLBACK_URL=http://localhost:4000/api/v1/auth/facebook/callback
EMAIL_VERIFICATION_URL=http://localhost:3000/verify-email
PASSWORD_RESET_URL=http://localhost:3000/reset-password

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SITE_INDEXING_ENABLED=false
```

Complete every required value in `apps/api/.env`, including:

- unique JWT access and refresh secrets of at least 32 characters;
- one shared `CACHE_REVALIDATION_SECRET` in both API and Web environments;
- SMTP credentials for verification and password-reset email;
- Google and Facebook OAuth credentials;
- Cloudinary credentials for image uploads;
- a YouTube Data API key for video metadata.

Never commit populated environment files or credentials.

### 4. Prepare The Database

Apply the existing migrations, generate the Prisma Client, and seed the core taxonomy:

```sh
pnpm prisma:migrate:deploy
pnpm prisma:generate
pnpm prisma:seed
pnpm prisma:seed:districts
pnpm prisma:seed:province-descriptions
```

Optional demonstration accounts and entries can be added with:

```sh
pnpm prisma:seed:demo
```

### 5. Start The Applications

Open two terminals from the repository root.

```sh
# Terminal 1: API
pnpm dev:api
```

```sh
# Terminal 2: Web
pnpm dev:web
```

Local services:

- Web application: `http://localhost:3000`
- REST API: `http://localhost:4000/api/v1`
- Health check: `http://localhost:4000/api/v1/health`
- Swagger UI in development: `http://localhost:4000/api/docs`

## Verification Commands

```sh
pnpm check
pnpm typecheck:api
pnpm typecheck:web
pnpm test:api
pnpm test:web
pnpm build:api
pnpm build:web
```

Additional database guidance is available in [docs/database-setup.md](docs/database-setup.md).

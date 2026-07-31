# Frontend Instructions for Coding Agents

These instructions are mandatory for all Next.js frontend work.

## Read before editing

Before changing frontend code:

1. Read root `AGENTS.md`.
2. Read `docs/architecture.md`.
3. Read `docs/web/rules/frontend-engineering-standards.md`.
4. Read `docs/web/rules/frontend-auth-integration.md` for auth work.
5. Read `docs/web/rules/frontend-task-checklist.md`.
6. Inspect the installed Next.js version and relevant bundled docs.
7. Inspect existing feature patterns and package scripts.

Do not begin implementation before this review.

## Approved stack

Use the existing stack only:

- Next.js App Router
- TypeScript strict mode
- React Server Components by default
- Tailwind CSS and shadcn/ui
- Estedad font
- Persian-only RTL UI
- TanStack Query for interactive server state
- React Hook Form and Zod for forms
- Zustand only for small client-only UI state
- Tiptap for rich text
- Biome as the only formatter/linter

Use pnpm only. Do not add ESLint, Prettier, another router, another form library, or another state library.

## Server Components first

- Pages and layouts stay Server Components unless a genuine client requirement exists.
- Add `"use client"` only at the smallest practical interactive boundary.
- Do not make a full route or layout client-side because one child needs hooks.
- Public, indexable pages must render meaningful HTML on the server.
- Never import server-only code or secrets into Client Components.
- Props crossing the server/client boundary must be serializable.

Client Components are appropriate for event handlers, browser APIs, React state/effects, React Hook Form, TanStack Query hooks, Zustand, Tiptap, and interactive shadcn/Radix components.

## Data ownership

- Public SEO data: Server Components with explicit caching.
- Authenticated interactive server data: TanStack Query.
- Form state: React Hook Form.
- Shareable filters/sort/pagination: URL parameters.
- Small local UI state: React state.
- Cross-tree client-only UI state: Zustand only when necessary.
- Do not copy server state into Zustand.
- Do not scatter raw API requests across components.

All browser API calls use the shared typed API client and feature API modules.

## Optimistic updates

Use optimistic updates only when the result is predictable, low-risk, reversible, and safely rollbackable.

Every optimistic mutation must:

- cancel conflicting queries where needed;
- snapshot previous cache state;
- apply the optimistic state;
- prevent duplicate action;
- roll back on failure;
- show a clear Persian error;
- reconcile or invalidate after settlement.

Do not optimistically confirm authentication, password actions, uploads, entry submission, moderation decisions, security changes, complex workflows, or irreversible deletion.

## Authentication security

- Access token: memory only.
- Refresh token: backend HTTP-only cookie only.
- Never store tokens in localStorage, sessionStorage, IndexedDB, persisted Zustand, or persisted query cache.
- Credentialed requests use `credentials: "include"`.
- Use one single-flight refresh process.
- Retry a request at most once after refresh.
- Never put tokens, passwords, OAuth codes, or provider credentials in URLs or logs.
- Frontend authorization is presentation only; NestJS is authoritative.

## SEO and performance

- Every public indexable page needs unique Persian metadata, canonical URL, Open Graph data, semantic headings, and server-rendered content.
- Only published content is indexable.
- Auth, account, draft, moderator, and admin pages are `noindex`.
- Treat client JavaScript as a limited resource.
- Use `next/image` and `next/link`.
- Keep provider boundaries small.
- Avoid request waterfalls.
- Use Suspense/loading UI where it improves streaming.
- Lazy-load Tiptap and other heavy client modules.
- Do not add a dependency without checking existing capabilities and bundle cost.
- Prevent layout shift and test production builds.

## Accessibility and RTL

- Preserve `<html lang="fa" dir="rtl">`.
- Use semantic HTML before ARIA.
- Every control must be keyboard accessible and visibly focusable.
- Every field needs a label and associated errors.
- Use accessible shadcn/Radix primitives for dialogs, menus, popovers, and selects.
- Do not communicate meaning through color alone.
- Respect reduced motion.
- Test icon direction, ordering, mixed LTR values, truncation, and keyboard flow in RTL.

## Forms and errors

- Use React Hook Form and Zod for meaningful forms.
- Backend validation is authoritative.
- Map backend `fieldErrors` to inputs.
- Preserve values after recoverable errors.
- Prevent duplicate submissions.
- Focus the first invalid field when practical.
- Use controlled Persian messages, not raw backend text.
- Every data interface must deliberately handle loading, success, empty, and error states.

## Code quality and documentation

- No unexplained `any`; use `unknown` and narrow it.
- Use type-only imports.
- Do not duplicate API/domain types.
- Pages compose routes; business rules do not live in presentational components.
- Do not create generic `utils` dumping grounds.
- Avoid deep imports into another feature’s private files.
- Avoid premature generic abstractions.
- Use TSDoc-style comments for exported or non-obvious APIs, not obvious implementation steps.
- Keep Biome suppressions local, justified, and rare.

## Testing

Test behavior, not private implementation details. Add relevant unit/integration tests and Playwright coverage for critical journeys. Loading, empty, failure, unauthorized, accessibility, and RTL states are part of expected behavior.

## Required workflow

Before coding, identify:

- server/client boundaries;
- data ownership and cache policy;
- optimistic-update safety;
- SEO, accessibility, security, and testing requirements;
- affected files.

During coding:

- follow existing feature structure;
- make the smallest coherent change;
- avoid unrelated refactors;
- preserve backend contracts;
- keep the UI Persian and RTL.

Before finishing, run relevant existing scripts, normally:

```text
pnpm check:write
pnpm check
pnpm typecheck:web
pnpm test:web
pnpm build:web
```

If a named script does not exist, inspect `package.json`, run the equivalent, and report the difference.

## Completion report

Report files changed, boundary decisions, API/cache behavior, optimistic rollback when used, SEO/accessibility changes, tests, command results, and remaining risks. Never claim success when checks failed.

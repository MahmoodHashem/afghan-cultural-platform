# Frontend Task Checklist

Use this checklist for every frontend task. Include a concise completed version in the final report.

## A. Preflight

- [ ] Read root `AGENTS.md` and `AGENTS.frontend.md`.
- [ ] Read `docs/architecture.md` and frontend standards.
- [ ] Read the relevant feature document; auth tasks include `frontend-auth-integration.md`.
- [ ] Inspect installed Next.js version and relevant bundled docs.
- [ ] Inspect repository patterns and package scripts.
- [ ] Confirm backend endpoints, responses, and stable error codes.
- [ ] List expected files and avoid unrelated refactors.

## B. Rendering boundary

- [ ] Page/layout remains a Server Component where possible.
- [ ] Every `"use client"` has a genuine reason.
- [ ] Client boundaries are small.
- [ ] No server-only code/secret enters the client bundle.
- [ ] Boundary props are serializable.
- [ ] Public content renders meaningful server HTML.

## C. Data ownership

- [ ] Server, TanStack Query, form, URL, local state, and Zustand ownership is explicit.
- [ ] Server state is not copied into Zustand.
- [ ] API access uses shared client/feature modules.
- [ ] Query keys and cache behavior are intentional.
- [ ] Independent requests are parallelized.
- [ ] Abort signals are supported where useful.
- [ ] No accidental server/client double-fetch exists.

## D. Mutation behavior

- [ ] Optimistic safety was evaluated.
- [ ] High-risk operations wait for server confirmation.
- [ ] Optimistic mutations snapshot prior state.
- [ ] Conflicting queries are cancelled when needed.
- [ ] Duplicate submission is prevented.
- [ ] Rollback is implemented/tested.
- [ ] Final server truth is reconciled.
- [ ] Failure preserves input and shows Persian feedback.

## E. UX states

- [ ] Loading state.
- [ ] Success state.
- [ ] Empty state where applicable.
- [ ] Error state.
- [ ] Safe retry behavior.
- [ ] Stable skeleton/layout.
- [ ] Accessible status announcement.
- [ ] No unnecessary full-page blocking.

## F. Forms

- [ ] React Hook Form + Zod used when appropriate.
- [ ] Backend validation remains authoritative.
- [ ] Backend `fieldErrors` map to fields.
- [ ] Form-level errors are clear.
- [ ] Values survive recoverable failure.
- [ ] First invalid field receives focus/scroll when practical.
- [ ] Correct autocomplete attributes.
- [ ] Duplicate submission prevented.
- [ ] Password controls accessible.

## G. SEO

For public routes:

- [ ] Unique title and description.
- [ ] Canonical URL.
- [ ] Open Graph metadata/image.
- [ ] Correct robots directive.
- [ ] Published-only indexing.
- [ ] Correct headings.
- [ ] Trusted structured data when appropriate.
- [ ] Sitemap impact considered.
- [ ] Duplicate filter URLs controlled.

For private routes:

- [ ] `noindex` set.

## H. Performance

- [ ] Client JavaScript minimized.
- [ ] No unnecessary root provider/client boundary.
- [ ] `next/image` used with dimensions and `sizes`.
- [ ] LCP image behavior intentional.
- [ ] Heavy client modules lazy-loaded when useful.
- [ ] Request waterfalls checked.
- [ ] Layout shift checked.
- [ ] Dependency bundle impact considered.
- [ ] `next/link` used internally.
- [ ] Prefetching not disabled without reason.

## I. Accessibility and RTL

- [ ] Persian language and RTL preserved.
- [ ] Semantic HTML.
- [ ] Keyboard access and visible focus.
- [ ] Labels/errors associated.
- [ ] Color is not the only cue.
- [ ] Reduced motion respected.
- [ ] Accessible dialog/menu/select primitives.
- [ ] Mixed LTR values render correctly.
- [ ] Icon direction/order checked in RTL.
- [ ] Mobile layout checked.

## J. Security/privacy

- [ ] No secret in `NEXT_PUBLIC_*`.
- [ ] No token/password in browser storage.
- [ ] No sensitive value in URL/log/analytics.
- [ ] Shared credentialed API client used.
- [ ] Frontend authorization is not treated as security.
- [ ] No arbitrary user HTML.
- [ ] External media sources constrained.
- [ ] Error reporting excludes sensitive payloads.

## K. Code quality/documentation

- [ ] Strict TypeScript passes.
- [ ] No unexplained `any`.
- [ ] Type-only imports used.
- [ ] No duplicated domain/API types.
- [ ] Components/hooks have clear responsibility.
- [ ] No generic utility dumping ground.
- [ ] TSDoc covers exported/non-obvious behavior.
- [ ] Obvious code is not over-commented.
- [ ] Biome suppressions are local/justified.
- [ ] Architecture docs updated when decisions change.

## L. Tests and verification

- [ ] Validation/pure-logic tests added where needed.
- [ ] Important hooks/components tested.
- [ ] Optimistic rollback tested when used.
- [ ] Loading/empty/failure/unauthorized states tested.
- [ ] Critical Playwright journey added where appropriate.
- [ ] Keyboard/RTL/accessibility checked.
- [ ] Production build run.

Run relevant existing scripts, normally:

```text
pnpm check:write
pnpm check
pnpm typecheck:web
pnpm test:web
pnpm build:web
```

Record actual results:

```text
Biome:
Typecheck:
Tests:
Build:
```

## M. Completion report

- [ ] Files changed.
- [ ] Rendering-boundary decisions.
- [ ] Data/cache behavior.
- [ ] Mutation/rollback behavior.
- [ ] SEO changes.
- [ ] Accessibility/RTL changes.
- [ ] Tests and command results.
- [ ] Remaining risks/deferred work.
- [ ] Honest disclosure of failures.

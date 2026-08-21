# Frontend Engineering Standards

**Project:** Afghan Cultural Platform
**Frontend:** Next.js App Router, TypeScript, Persian RTL
**Status:** Mandatory
**Audience:** Human developers and coding agents

---

## 1. Purpose and language

This document defines the approved frontend architecture and quality standard. Its goal is to keep the product fast, accessible, secure, searchable, maintainable, and consistent while multiple developers or coding agents work on it.

The words **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are normative:

- **MUST / MUST NOT**: mandatory.
- **SHOULD / SHOULD NOT**: expected unless a documented reason exists.
- **MAY**: optional.

Version-sensitive Next.js behavior MUST be checked against the installed package and its bundled documentation. Do not silently use patterns from another major version.

---

## 2. Product and stack context

The frontend is:

- Persian-only and right-to-left;
- built with Next.js App Router and strict TypeScript;
- styled with Tailwind CSS and shadcn/ui;
- rendered with the Estedad font;
- connected to a NestJS REST API;
- using TanStack Query for interactive server state;
- using React Hook Form and Zod for forms;
- using Zustand only for limited client-only UI state;
- using Tiptap for rich-text editing;
- formatted and linted only by Biome.

Public cultural content is a primary SEO surface and must favor server rendering. Authenticated areas may use small Client Component islands when browser-held access tokens or interactive behavior require them.

---

## 3. Architecture

### 3.1 Server Components first

Pages and layouts are Server Components by default.

Use a Client Component only for:

- event handlers;
- React client state/effects;
- browser APIs;
- React Hook Form;
- TanStack Query hooks;
- Zustand;
- Tiptap;
- interactive shadcn/Radix behavior;
- a dependency that genuinely requires the client.

Place `"use client"` at the smallest practical boundary.

Bad:

```tsx
"use client";

export default function PublicEntryPage() {
  // Entire SEO page is client-side for one button.
}
```

Better:

```tsx
export default async function PublicEntryPage() {
  const entry = await getPublishedEntry();

  return (
    <article>
      <EntryContent entry={entry} />
      <BookmarkButton entryId={entry.id} />
    </article>
  );
}
```

Only `BookmarkButton` should be a Client Component.

A Server Component may render Client Components. Static text, headings, metadata, content structure, and public content should stay on the server. Props crossing the boundary must be serializable. Never pass secrets, database clients, functions, or server-only objects into client code.

### 3.2 Feature ownership

Organize business code by feature rather than only by technical file type.

Recommended shape:

```text
src/
  app/
  features/
    auth/
      api/
      components/
      hooks/
      schemas/
      types/
      utils/
    entries/
    bookmarks/
    moderation/
  components/
    ui/
    shared/
  lib/
    api/
    auth/
    config/
    seo/
  providers/
  styles/
```

Rules:

- `app/` composes routes, layouts, metadata, and route-level states.
- A feature owns its API functions, schemas, hooks, and feature-specific components.
- `components/ui/` contains design-system primitives.
- `components/shared/` contains genuinely cross-feature presentation.
- `lib/` contains stable infrastructure, not domain dumping grounds.
- A feature must not deep-import another feature’s private files.
- Cross-feature contracts should be exported through deliberate public entry points.

### 3.3 Shared utilities and duplication

Before adding a formatter, normalizer, route helper, API response parser, user-display helper, or other small utility, search the frontend for an existing equivalent.

MUST:

- reuse shared utilities from `src/lib/` for cross-feature infrastructure concerns such as dates, numbers, Persian text normalization, safe URL/query handling, API response parsing, and authenticated-user display helpers;
- keep feature-specific helpers inside the owning feature, for example `src/features/entries/utils/`;
- move repeated logic to a shared utility only after it is used by more than one feature or is clearly infrastructure;
- keep utilities focused and named by purpose.

MUST NOT:

- duplicate helpers such as `formatDate`, `formatNumber`, Persian search normalization, `createInitials`, URL query setters, or API error parsing in multiple components;
- create generic dumping-ground files that mix unrelated responsibilities;
- move business rules into shared frontend utilities when the NestJS backend is authoritative.

### 3.4 No hidden architecture changes

Do not introduce a new state library, form library, API library, CSS system, token-storage pattern, rendering model, or routing architecture without explicit approval.

---

## 4. State ownership

Choose the smallest correct owner.

| State                                   | Approved owner                                      |
| --------------------------------------- | --------------------------------------------------- |
| Public server-rendered content          | Server Component with explicit Next.js cache policy |
| Authenticated interactive API data      | TanStack Query                                      |
| Form values and validation              | React Hook Form + Zod                               |
| Shareable search/filter/sort/pagination | URL segments or search parameters                   |
| Small local interaction                 | React local state                                   |
| Cross-tree client-only UI state         | Zustand only when necessary                         |
| Access token                            | In-memory auth coordinator/store only               |
| Refresh token                           | HTTP-only cookie controlled by backend              |
| Business truth                          | NestJS API and PostgreSQL                           |

MUST NOT:

- copy fetched records into Zustand merely to avoid TanStack Query;
- mirror URL state in another store without a clear need;
- persist credentials in browser storage;
- create multiple sources of truth for one form or query;
- use global state for a concern owned by one component.

---

## 5. API access and contracts

### 5.1 Shared browser API client

All browser requests must use one shared typed API client. Visual components must not scatter raw `fetch` calls.

The client owns:

- API base URL;
- JSON headers;
- `credentials: "include"`;
- in-memory access-token attachment;
- standard response parsing;
- standard error normalization;
- request cancellation;
- one controlled refresh-and-retry attempt;
- safe diagnostics without credentials.

Server-side public data functions may use server `fetch`, but they must live in server-only modules and explicitly declare caching behavior.

### 5.2 Feature API modules

Each feature exposes typed functions such as:

```ts
getCurrentUser();
loginWithEmail(input);
requestPasswordReset(input);
getPublishedEntry(slug);
toggleBookmark(entryId);
```

Components consume these functions or hooks, not raw URLs and response envelopes.

### 5.3 Types and errors

- Prefer generated or shared contracts where available.
- Do not duplicate enums already defined by the contract layer.
- Parse untrusted data at boundaries when runtime validation is useful.
- Stable backend error codes are programmatic values; Persian messages are presentation values.
- Never rely on a backend English message as the only user-facing text.
- Preserve the backend `requestId` for support and diagnostics.

Suggested normalized error:

```ts
type ApiError = {
  code: string;
  message: string;
  fieldErrors: Array<{
    field: string;
    message: string;
  }>;
  requestId?: string;
};
```

### 5.4 Cancellation

TanStack Query functions should consume the supplied `AbortSignal` and pass it to the API client. Abandoned searches and navigations should not continue unnecessary work.

---

## 6. Fetching, caching, and revalidation

Every read must have an intentional policy.

### 6.1 Public content

Published cultural entries, stable category pages, province pages, and stable taxonomy data are candidates for server caching and revalidation.

Search results, account data, drafts, moderation queues, and user-specific data must not enter a shared public cache.

Declare one of:

- static/prerendered;
- time-based revalidation;
- tag/path invalidation;
- request-time dynamic rendering;
- explicitly uncached.

### 6.2 Version-sensitive caching

Before using cache directives, cache tags, Cache Components, or revalidation APIs:

1. inspect the installed Next.js version;
2. read its bundled docs;
3. confirm project configuration;
4. use the approved pattern already present in the repository.

Do not combine caching APIs copied from different Next.js major versions.

### 6.3 Avoid waterfalls

Start independent work together:

```ts
const entryPromise = getEntry(slug);
const relatedPromise = getRelatedEntries(slug);

const [entry, related] = await Promise.all([
  entryPromise,
  relatedPromise,
]);
```

Do not create component-level query waterfalls when data can be prefetched, fetched in parallel, or represented by a better endpoint.

### 6.4 TanStack Query rules

Query keys must be stable, serializable, and feature-owned.

```ts
entryKeys.detail(slug);
bookmarkKeys.list(filters);
authKeys.currentUser();
```

Each query should deliberately choose:

- stale time;
- retry behavior;
- refetch triggers;
- placeholder/initial data;
- enabled conditions;
- garbage collection only when non-default behavior matters.

Do not use infinite stale time to hide invalidation problems.

### 6.5 Avoid double-fetching

Do not independently fetch the same initial resource in both a Server Component and Client Component. When server prefetch and client ownership are both needed, use the project’s approved TanStack hydration pattern.

---

## 7. Optimistic updates

### 7.1 Decision rule

Optimistic behavior is preferred only when it improves responsiveness without pretending a risky operation succeeded.

Good candidates:

- add/remove bookmark;
- create/update a rating;
- simple preference actions;
- edit/delete the user’s simple review when rollback is reliable;
- simple profile preference changes.

Wait for confirmed server success for:

- login, registration, OAuth, verification, password actions;
- image upload;
- cultural-entry submission;
- moderation approval/rejection;
- accepted corrections;
- account suspension or role changes;
- destructive/irreversible operations;
- complex multi-record workflows;
- operations where the server returns important canonical data.

### 7.2 Required lifecycle

An optimistic mutation must:

1. cancel conflicting queries where necessary;
2. snapshot previous cache state;
3. apply the optimistic state;
4. represent temporary items safely;
5. prevent duplicate action;
6. roll back on failure;
7. show a clear Persian error;
8. reconcile from the response or invalidate after settlement.

Example shape:

```ts
useMutation({
  mutationFn: updateRating,
  onMutate: async (input) => {
    await queryClient.cancelQueries({
      queryKey: ratingKeys.entry(input.entryId),
    });

    const previous = queryClient.getQueryData(
      ratingKeys.entry(input.entryId),
    );

    queryClient.setQueryData(
      ratingKeys.entry(input.entryId),
      createOptimisticRating(previous, input),
    );

    return { previous };
  },
  onError: (_error, input, context) => {
    queryClient.setQueryData(
      ratingKeys.entry(input.entryId),
      context?.previous,
    );
  },
  onSettled: (_data, _error, input) => {
    queryClient.invalidateQueries({
      queryKey: ratingKeys.entry(input.entryId),
    });
  },
});
```

### 7.3 UX during mutation

- Show immediate visual feedback.
- Avoid blocking unrelated page interactions.
- Disable only the action that must not duplicate.
- Announce meaningful status changes accessibly.
- Preserve user input on recoverable failure.
- Use confirmation for destructive operations where accidental activation is plausible.
- A toast must not be the only location of a critical error.

React `useOptimistic` may be used for isolated component-local presentation that does not compete with TanStack Query cache.

---

## 8. Routing and URL design

- Use `next/link` for internal navigation.
- Use route segments and search parameters for shareable state.
- Public search, filters, sorting, and pagination should survive reload and be linkable.
- Do not use local state as the only representation of a public search page.
- Use stable Latin slugs for published entries.
- Treat published slugs as immutable according to the backend rule.
- Use `notFound()` for missing public resources.
- Use server redirects when route-level behavior belongs on the server.
- Never redirect to an unvalidated external `next` URL.
- Do not disable prefetching globally. Change it only for measured reasons such as very large link lists.

---

## 9. SEO

SEO is a primary product requirement for public cultural content.

### 9.1 Metadata

Every indexable page must provide:

- unique Persian title;
- useful Persian description;
- canonical URL;
- Open Graph title, description, URL, and image;
- appropriate robots directive;
- meaningful server-rendered content;
- correct heading hierarchy.

Use static `metadata` for static pages and `generateMetadata` for resource-driven pages.

### 9.2 Indexing rules

Index:

- published cultural entries;
- useful public category/province/content-type pages;
- curated public landing pages.

Use `noindex` for:

- login, registration, verification, reset, and callback pages;
- account/settings pages;
- drafts;
- moderation/admin routes;
- hidden, rejected, deleted, or unpublished content;
- duplicate or low-value filter combinations.

Only published records may appear in the sitemap.

### 9.3 Canonicalization

- One canonical URL per public resource.
- Normalize pagination and filter URLs.
- Avoid duplicate URLs for the same content.
- Never index OAuth, token, or temporary status query parameters.
- Redirect legacy URLs deliberately.

### 9.4 Structured data

Use trusted JSON-LD only when it matches visible published content. Potential types include `Article`, `CreativeWork`, `Place`, `BreadcrumbList`, `Organization`, and `WebSite`.

Structured data must:

- match page content;
- use absolute URLs;
- be serialized safely;
- avoid unsupported claims;
- never include untrusted arbitrary HTML.

### 9.5 Site metadata files

Maintain:

- `robots.ts`;
- `sitemap.ts` or segmented sitemaps when scale requires;
- favicon/app icons;
- Open Graph image conventions;
- a web manifest when approved.

---

## 10. Performance

### 10.1 Priorities

Optimize in this order:

1. meaningful server-rendered content;
2. small client bundles;
3. no avoidable request waterfalls;
4. optimized images and fonts;
5. stable layout;
6. responsive interaction;
7. intentional caching;
8. progressive loading.

### 10.2 Core Web Vitals targets

At the 75th percentile of real-user visits, target:

- LCP: 2.5 seconds or less;
- INP: 200 milliseconds or less;
- CLS: 0.1 or less.

### 10.3 Client JavaScript

- Server-render everything that does not require client execution.
- Keep providers as low as practical.
- Do not turn the root layout into a broad client boundary.
- Lazy-load Tiptap, rich galleries, maps, and other heavy modules.
- Avoid large utility packages for functions already available.
- Prefer direct imports that support tree shaking.
- Review bundle impact before adding a dependency.
- Use bundle analysis when a route or dependency materially increases client JavaScript.

### 10.4 Images

Use `next/image` unless a documented technical exception exists.

Requirements:

- explicit dimensions or stable responsive container;
- correct `sizes`;
- meaningful `alt`;
- narrow remote host configuration;
- priority only for likely LCP imagery;
- lazy loading for galleries and below-the-fold media;
- no layout shift;
- Cloudinary transformations sized for actual display needs.

Decorative images use `alt=""`. Informative cultural images require useful descriptions.

### 10.5 Fonts

- Preserve Estedad.
- Use the approved `next/font` or local font integration.
- Avoid unnecessary weights and subsets.
- Prevent font layout shift.
- Do not add another body font casually.

### 10.6 Navigation and streaming

- Use `loading.tsx` or Suspense where immediate feedback helps.
- Skeletons should resemble the final layout.
- Shared layouts should remain interactive.
- Avoid full-page spinners when content can stream sooner.
- Preserve meaningful server HTML on first load.

### 10.7 Measurement

Before production release:

- run a production build;
- test production-like data;
- inspect Lighthouse appropriately;
- inspect field Core Web Vitals when available;
- review bundles;
- test throttled mobile behavior;
- inspect image payload and layout shift.

Lab scores do not replace field data.

---

## 11. Accessibility and RTL

### 11.1 Root language/direction

```tsx
<html lang="fa" dir="rtl">
```

Use logical CSS properties and RTL-aware layout rather than scattering left/right assumptions.

### 11.2 Semantic structure

- One clear primary heading per page.
- Heading levels follow structure.
- Use semantic landmarks and elements.
- Buttons perform actions; links navigate.
- Do not create clickable `div` elements.

### 11.3 Keyboard and focus

- Every action is keyboard reachable.
- Focus indicators remain visible.
- Dialogs trap and restore focus correctly.
- Menus/selects use accessible primitives.
- Route and validation changes do not strand focus.
- Logical focus order matches the RTL visual flow.

### 11.4 Forms

- Every field has an associated label.
- Required state is visual and programmatic.
- Errors are associated with fields.
- Invalid fields expose invalid state.
- Long forms provide useful error navigation.
- Password show/hide controls have accessible labels.
- Loading buttons preserve understandable names.

### 11.5 Status and motion

- Announce important asynchronous changes.
- Do not use color alone for meaning.
- Respect `prefers-reduced-motion`.
- Avoid unnecessary animation in auth/moderation/content reading.
- Critical toasts must remain understandable and not disappear too quickly.

### 11.6 Persian details

- Use consistent Persian labels/messages.
- Emails, URLs, IDs, and codes may need `dir="ltr"` or `dir="auto"`.
- Test numbers, punctuation, truncation, breadcrumbs, icons, and adornments.
- Do not reverse logos or universally directional media.

---

## 12. Forms and validation

Use React Hook Form and Zod for meaningful forms.

- Zod improves immediate UX and typed values.
- NestJS validation remains authoritative.
- Client schemas must align with API contracts.
- Client validation is not a security boundary.

A form must:

- prevent duplicate submission;
- show a clear pending state;
- preserve values after recoverable errors;
- map backend field errors;
- show a useful form-level error;
- focus/scroll to the first invalid field when practical;
- avoid disabling unrelated navigation;
- protect long unsaved drafts where feasible.

Cultural-entry forms should support explicit save-draft behavior, preserve editor content after recoverable failure, handle upload state independently, and never optimistically claim submission/publication.

---

## 13. Loading, empty, error, and success states

Every meaningful data interface must intentionally design all four states.

### Loading

- Prefer shape-matching skeletons.
- Do not block the whole app for a local request.
- Avoid flashing empty content before loading resolves.
- Keep dimensions stable.

### Empty

- Explain why no data exists.
- Offer the next valid action.
- Distinguish “no data” from “filters found nothing.”

### Error

- Preserve user work.
- Offer retry only when safe.
- Use Persian copy.
- Preserve the request ID where helpful.
- Distinguish authorization, verification, network, validation, and server failures.

### Success

- Reconcile with server truth.
- Avoid unnecessary interruption.
- Redirect only when it improves the workflow.
- Announce important success accessibly.

Use route `loading.tsx`, `error.tsx`, and `not-found.tsx` plus feature-level boundaries when appropriate.

---

## 14. Authentication summary

The full architecture is in `docs/frontend-auth-integration.md`.

Non-negotiable rules:

- access token in memory only;
- refresh token in backend HTTP-only cookie;
- no token persistence in browser storage;
- one shared auth coordinator;
- one shared API client;
- single-flight refresh;
- at most one retry after refresh;
- refresh failure clears auth state;
- no OAuth tokens in URLs;
- NestJS remains authoritative;
- all auth pages are `noindex`.

---

## 15. Security

### 15.1 Environment variables

Only intentionally public configuration may use `NEXT_PUBLIC_*`. Never expose backend secrets, SMTP credentials, OAuth secrets, JWT secrets, Cloudinary signing secrets, or database URLs.

Validate public environment variables centrally rather than reading them randomly across components.

### 15.2 Sensitive data

Never store tokens/passwords in:

- localStorage;
- sessionStorage;
- IndexedDB;
- persisted Zustand;
- persisted TanStack Query;
- URLs;
- logs;
- analytics;
- error-monitoring payloads.

### 15.3 User content

- Do not render arbitrary user HTML.
- Render approved Tiptap JSON through a controlled schema/renderer.
- Sanitize any supported HTML boundary.
- Avoid `dangerouslySetInnerHTML`.
- Serialize trusted JSON-LD safely.
- Validate media URLs and rich-text structures.

### 15.4 Cross-site behavior

Same-site deployments may use `SameSite=Lax` refresh cookies. A cross-site deployment using `SameSite=None` must use HTTPS and an approved explicit CSRF defense.

OAuth state validation belongs to the backend. The frontend callback must not bypass provider validation.

### 15.5 Authorization

Frontend guards improve UX only. The API remains authoritative.

- Never assume visible controls prove permission.
- Handle backend `401` and `403` by stable error code.
- Do not duplicate complex backend authorization policies.

### 15.6 CSP

Before production, introduce a deliberate Content Security Policy for the frontend origin, NestJS API, Cloudinary, YouTube embeds, and approved analytics. Do not use broad wildcards merely to make an integration work.

---

## 16. TypeScript, Biome, and clean code

### 16.1 TypeScript

- Strict mode required.
- `any` requires a narrow documented exception.
- Use `unknown` for untrusted values and narrow them.
- Use discriminated unions for meaningful states.
- Use type-only imports.
- Avoid non-null assertions unless the invariant is proven.
- Export stable types deliberately.
- Infer local types where obvious.

### 16.2 Biome

Biome is the only formatter/linter. Enable stable recommended rules and the Next.js domain where supported.

Desired enforcement includes:

- unused imports/variables;
- explicit `any`;
- hook correctness;
- type-only imports;
- raw `<img>` in Next.js;
- suspicious patterns;
- accessibility issues;
- duplicate JSX props;
- invalid React patterns.

Do not enable every nursery rule globally. Add experimental rules individually after review.

A suppression must be local, justified, and must not hide an architectural problem.

### 16.3 Responsibilities

- Pages compose routes and server data.
- Presentational components render UI from props.
- Hooks own reusable client behavior.
- Feature API modules own requests.
- Schemas own validation.
- Business rules should be pure functions or feature services when possible.

Avoid giant files, but do not split code into meaningless micro-files. Cohesion matters more than arbitrary line counts.

### 16.4 Naming

Use purpose-driven names:

- `LoginForm`, not `FormComponent`;
- `useCurrentUser`, not `useData`;
- `createAuthApiClient`, not `helper`;
- `mapAuthErrorToMessage`, not `formatError`.

Booleans should read naturally: `isPending`, `hasVerifiedEmail`, `canModerate`.

---

## 17. TSDoc and TypeDoc

Use TSDoc-style comments for TypeScript APIs.

Document:

- exported reusable hooks;
- shared components with non-obvious behavior;
- API client behavior;
- security-sensitive utilities;
- optimistic rollback logic;
- cache/invalidation decisions;
- Persian normalization;
- transformations with important invariants;
- public feature contracts.

Do not comment obvious lines or repeat TypeScript types.

Good:

```ts
/**
 * Executes one refresh request for all callers waiting on an expired
 * access token, then retries each original request at most once.
 *
 * The function never persists either token in browser storage.
 */
export async function refreshAccessTokenOnce(): Promise<string> {
  // ...
}
```

Useful tags include `@param`, `@returns`, `@throws`, `@example`, `@remarks`, and `@deprecated` when they add real information.

TypeDoc may generate docs for public contracts, API infrastructure, reusable hooks, utilities, and design-system extensions. It should not be forced over every route and private component. Generated API docs do not replace architecture documents.

---

## 18. Testing

Use:

- unit tests for schemas, pure functions, normalization, and error mapping;
- hook/component tests for important interaction;
- integration tests for API coordination and optimistic rollback;



Test behavior rather than private implementation details.

Required state coverage, when relevant:

- loading;
- empty;
- success;
- server/network failure;
- validation failure;
- unverified email;
- insufficient role;
- suspended account;
- expired session;
- optimistic rollback;
- keyboard and RTL behavior.

Critical auth journeys include registration, login, verification, OAuth, refresh after reload, logout, logout-all, forgot/reset password, OAuth-only password setup, session expiration, and suspended/unauthorized behavior.

Critical E2E tests should run against a production-like frontend build and controlled backend/test database when feasible. OAuth providers may be mocked at the boundary unless a dedicated provider test environment exists.

---

## 19. Dependency policy

Before adding a package:

1. confirm the platform, React, Next.js, browser, or existing dependencies do not already solve the need;
2. check maintenance and installed-version compatibility;
3. assess client bundle impact;
4. assess security and licensing;
5. add it at the narrowest workspace scope;
6. document why it is needed.

Do not add a package for a trivial utility.

---

## 20. Observability

- Preserve backend request IDs.
- Never log tokens, passwords, reset links, OAuth codes, or sensitive profile data.
- Production client logging must be intentional.
- Track Core Web Vitals when analytics is approved.
- Track important workflow failures by stable error code without sensitive payloads.
- User-facing errors remain Persian; diagnostics remain structured.

---

## 21. Definition of done

A frontend task is complete only when:

- the server/client boundary is correct;
- data ownership is clear;
- cache/invalidation is intentional;
- optimistic behavior is safe and rollback-tested when used;
- loading, empty, error, and success states exist;
- Persian/RTL behavior is correct;
- keyboard and assistive-technology behavior is considered;
- public pages include required metadata;
- no secrets or credentials are exposed;
- strict typing and Biome pass;
- relevant tests exist;
- production build succeeds;
- documentation is updated when architecture changes;
- the completion report is honest.

---

## 22. Prohibited patterns

Do not:

- make the whole app a Client Component;
- store tokens in browser storage;
- use raw `<img>` without a documented exception;
- fetch API data directly inside arbitrary visual components;
- put server state in persisted Zustand;
- use optimistic success for high-risk workflows;
- omit rollback;
- rely on frontend role checks for security;
- use raw backend English messages as final Persian UI;
- index private or unpublished pages;
- use broad CSP wildcards without review;
- render arbitrary user HTML;
- introduce ESLint or Prettier;
- suppress Biome broadly;
- add dependencies casually;
- duplicate API contracts;
- create avoidable request waterfalls;
- claim completion with failing checks.

---

## 23. Official references

For version-specific behavior, prefer the installed Next.js documentation. General official references:

- Next.js Server/Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js Fetching Data: https://nextjs.org/docs/app/getting-started/fetching-data
- Next.js Caching: https://nextjs.org/docs/app/getting-started/caching
- Next.js Linking/Navigation: https://nextjs.org/docs/app/getting-started/linking-and-navigating
- Next.js Metadata/OG: https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- Next.js Images: https://nextjs.org/docs/app/getting-started/images
- Next.js Production Checklist: https://nextjs.org/docs/app/guides/production-checklist
- Next.js Accessibility: https://nextjs.org/docs/architecture/accessibility
- Next.js JSON-LD: https://nextjs.org/docs/app/guides/json-ld
- Next.js AI Coding Agents: https://nextjs.org/docs/app/guides/ai-agents
- TanStack Query Optimistic Updates: https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
- TanStack Query Request Waterfalls: https://tanstack.com/query/latest/docs/framework/react/guides/request-waterfalls
- TanStack Query Cancellation: https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation
- Biome Next.js domain: https://biomejs.dev/linter/domains/
- Biome `noImgElement`: https://biomejs.dev/linter/rules/no-img-element/
- TypeDoc: https://typedoc.org/
- TypeDoc comments: https://typedoc.org/documents/Doc_Comments.html
- Core Web Vitals: https://web.dev/articles/vitals

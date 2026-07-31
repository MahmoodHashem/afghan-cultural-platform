# Frontend Authentication Integration

**Status:** Approved architecture for Next.js authentication pages and NestJS integration

---

## 1. Goals

The frontend authentication system must:

- integrate email registration/login, email verification, Google OAuth, Facebook OAuth, refresh/logout sessions, password reset/setup, and authorization-aware UI;
- keep access tokens out of persistent browser storage;
- rely on the backend HTTP-only refresh cookie;
- recover authenticated state after reload through one controlled refresh request;
- prevent refresh storms when concurrent requests fail;
- provide accessible Persian RTL pages;
- keep NestJS as the security authority.

---

## 2. Token architecture

### Access token

The access token:

- is returned in JSON by NestJS;
- lives in memory only;
- is attached to protected API calls as a Bearer token.

It MUST NOT be stored in localStorage, sessionStorage, IndexedDB, persisted Zustand, persisted TanStack Query, frontend-created cookies, or URL parameters.

A full reload clears it from memory. The app restores auth state by calling the refresh endpoint, which uses the backend cookie.

### Refresh token

The refresh token:

- is generated and rotated by NestJS;
- exists only in a secure HTTP-only cookie;
- is never readable by frontend JavaScript;
- is never returned in JSON;
- is never placed in a URL.

Cookie-dependent requests use:

```ts
credentials: "include"
```

---

## 3. Suggested structure

```text
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
      forgot-password/page.tsx
      reset-password/page.tsx
      verify-email/page.tsx
      setup-password/page.tsx
      layout.tsx
    auth/callback/page.tsx
  features/auth/
    api/auth-api.ts
    components/
    hooks/
    schemas/
    types/
    utils/auth-error-messages.ts
  lib/
    api/api-client.ts
    api/api-error.ts
    auth/auth-store.ts
    auth/auth-coordinator.ts
  providers/
    auth-provider.tsx
    query-provider.tsx
```

Use the existing repository structure when it differs. Do not move files merely to match this example unless the task includes that refactor.

---

## 4. Server/client boundaries

Auth route pages and layouts should remain Server Components for metadata, `noindex`, page shell, headings, guidance, static links, and safe URL parsing.

Each interactive form is a small Client Component.

```tsx
import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "ورود",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main>
      <h1>ورود به حساب</h1>
      <LoginForm />
    </main>
  );
}
```

Do not turn the full auth layout into a Client Component because forms are interactive.

---

## 5. Auth state

Use one non-persisted auth coordinator/store.

```ts
type AuthStatus =
  | "initializing"
  | "authenticated"
  | "unauthenticated";

type AuthState = {
  status: AuthStatus;
  accessToken: string | null;
  user: SafeUser | null;
};
```

Rules:

- no storage persistence middleware;
- `initializing` means bootstrap is unresolved;
- `authenticated` requires a safe user and usable access token;
- `unauthenticated` means no usable session;
- do not retain stale role/verification data after refresh failure;
- arbitrary components must not directly mutate token state.

Controlled actions may include:

```ts
setAuthenticated(session);
setUnauthenticated();
updateUser(user);
getAccessToken();
```

---

## 6. Bootstrap after reload

On first client mount:

1. status is `initializing`;
2. call `POST /api/v1/auth/refresh` with credentials included;
3. on success, store access token and safe user in memory and set `authenticated`;
4. on missing/expired/revoked session, clear memory and set `unauthenticated`;
5. on temporary network/server failure, avoid infinite retries and show a controlled recoverable state where auth is required.

One provider/coordinator owns bootstrap. Do not call refresh from every component.

Public pages should not be unnecessarily blocked by auth bootstrap. Auth-dependent controls may render a stable placeholder until status resolves.

---

## 7. Shared API client

The browser API client must:

- use the configured API base URL;
- include credentials;
- attach the in-memory access token;
- support `AbortSignal`;
- normalize backend errors;
- preserve `requestId`;
- coordinate refresh;
- retry an eligible request at most once;
- never log credentials.

Flow:

```text
send request
  ↓
success → return data
  ↓
401 caused by expired/invalid access token
  ↓
join or start one refresh request
  ↓
refresh succeeds → update memory token → retry original once
  ↓
refresh fails → clear auth state → reject
```

Do not refresh on every `403`. A `403` may mean insufficient role, verification required, or suspension.

---

## 8. Single-flight refresh

Concurrent requests that encounter an expired access token must share one refresh promise.

```ts
let refreshPromise: Promise<string> | null = null;

/**
 * Returns a new access token while ensuring concurrent callers share one
 * backend refresh request.
 */
export async function refreshAccessTokenOnce(): Promise<string> {
  // One active promise shared by all callers.
}
```

Requirements:

- only one refresh network request at a time;
- waiting requests reuse the result;
- clear the shared promise after settlement;
- retry each original request at most once;
- the refresh endpoint must not recursively trigger refresh logic;
- logout clears auth state even when refresh is in progress;
- failed refresh transitions to unauthenticated.

Use an internal flag such as `skipAuthRefresh` or `hasRetried` to prevent loops.

---

## 9. Auth API methods

Feature-owned methods should include:

```ts
register(input);
login(input);
refresh();
logout();
logoutAll();
verifyEmail(token);
resendVerification();
forgotPassword(input);
resetPassword(input);
setupPassword(input);
getCurrentUser();
```

Verify exact endpoint names against NestJS controllers before coding.

OAuth begins through browser navigation rather than TanStack Query:

```ts
window.location.assign(`${apiBaseUrl}/api/v1/auth/google`);
```

Use the same pattern for Facebook.

---

## 10. Email login and registration

### Login

On success:

- backend sets/updates the refresh cookie;
- response returns access token and safe user;
- frontend stores both in memory;
- update/invalidate current-user data;
- redirect to a validated internal destination or default authenticated page.

Do not use optimistic success.

### Registration

On success:

- backend sets the refresh cookie;
- frontend stores returned access token/user;
- user becomes authenticated;
- show a non-blocking verification reminder when unverified;
- do not force logout merely because email is unverified;
- protected actions requiring verification must explain the requirement and offer resend.

### Safe return destination

A `next`/return path must be validated as an internal path. Never redirect to an arbitrary absolute URL.

---

## 11. Email verification

A verification page may receive the approved raw email-verification token in its URL. Treat it as sensitive:

- do not log it;
- do not send it to analytics;
- do not include it in unrelated requests;
- call the backend once;
- replace or redirect away from the token URL after processing;
- show clear success, expired, used, and invalid states;
- update in-memory user/query cache after success.

Resend verification must prevent duplicate clicks, use controlled feedback, and respect backend throttling.

All auth pages are `noindex`.

---

## 12. Forgot/reset/setup password

### Forgot password

- Use React Hook Form and Zod.
- Show the same neutral success state whether an account exists or not.
- Do not infer account existence from timing or wording.
- Wait for the backend neutral response; do not use optimistic success.

### Reset password

The reset page reads the approved token from the URL but never logs or persists it and sends it only to the reset endpoint.

After success:

- backend has revoked refresh sessions;
- frontend clears auth memory and private cache;
- assume the user is logged out;
- replace/redirect away from the token URL;
- redirect to login with a controlled success state;
- do not automatically log in unless the backend contract changes.

### Setup password

For an authenticated OAuth-only account:

- route requires authenticated state;
- submit only the new password;
- backend may revoke all sessions and clear the cookie;
- frontend clears memory/private cache and returns to login after success;
- handle `AUTH_PASSWORD_ALREADY_CONFIGURED` as a controlled state.

---

## 13. Google and Facebook OAuth

### Start

Use a normal browser redirect to the NestJS OAuth start endpoint. Preserve a safe internal return path only through an approved backend state mechanism.

Do not:

- fetch provider login pages with TanStack Query;
- expose provider secrets in Next.js;
- construct provider authorization URLs independently;
- put access/refresh/provider tokens in frontend query parameters.

### Preferred callback flow

1. Provider redirects to NestJS callback.
2. NestJS validates OAuth state/provider response.
3. NestJS creates the refresh session.
4. NestJS sets the HTTP-only refresh cookie.
5. NestJS redirects to a fixed frontend callback route.
6. Frontend callback calls `/auth/refresh`.
7. Frontend stores the returned access token/user in memory.
8. Frontend redirects to the validated internal destination.

The frontend callback URL may contain a short stable success/error code, but no access token, refresh token, provider token, password, OAuth code, or sensitive profile data.

### Account-linking errors

Map stable backend codes, including provider email-linking restrictions, to clear Persian instructions. Never weaken safe backend linking rules in the frontend.

---

## 14. Logout

### Current session

1. Call backend logout with credentials included.
2. Clear in-memory token/user regardless of idempotent success.
3. remove/reset private TanStack Query data.
4. Redirect to an appropriate public page.

The UI may immediately show signed-out state while the idempotent request completes, but failure must not restore a possibly invalid credential state.

### Logout all devices

- Requires authenticated access token.
- Wait for server confirmation before claiming all sessions are revoked.
- Clear memory/private cache.
- Return to login and show a controlled success message.

---

## 15. Protected routes

Because access tokens live only in memory, authenticated dashboard data often needs a client auth boundary.

Rules:

- keep route page/layout shells as Server Components where practical;
- use a small client auth gate;
- `initializing` renders a stable skeleton;
- `unauthenticated` redirects to login with a validated internal return path;
- `authenticated` renders children;
- role/verification checks improve UX only;
- NestJS protects every sensitive operation.

Do not use Next.js middleware as the sole authorization layer. Middleware may assist routing only when its cookie visibility and data source are explicitly designed.

---

## 16. Authorization-aware UI

Use safe user fields such as role, status, and email verification state.

Examples:

- hide moderator navigation from normal users;
- show a verification banner before contribution actions;
- show a controlled insufficient-role state;
- on account suspension, clear session state and show the approved status page.

Do not duplicate complex backend policy. Always handle backend errors even when frontend checks passed.

---

## 17. Query cache on auth changes

On login:

- set current user;
- invalidate identity-dependent data;
- ensure another user’s private cache is not retained.

On logout or refresh failure:

- remove private query data;
- preserve safe public published-content cache;
- remove current-user data;
- stop authenticated polling;
- clear optimistic private state.

Use query-key factories to make clearing reliable. Never persist private query cache across sessions without a separately approved secure design.

---

## 18. Auth page UX

All auth pages must:

- be Persian and RTL;
- share a consistent auth layout;
- use concise headings/guidance;
- have accessible labels;
- provide accessible password visibility controls;
- use correct autocomplete attributes;
- map backend field errors;
- preserve input after recoverable failure;
- prevent duplicate submission;
- use stable loading states;
- work with keyboard only;
- be responsive;
- use `noindex`.

Recommended autocomplete:

- email: `email`;
- existing password: `current-password`;
- register/reset/setup password: `new-password`;
- display name: `name`.

OAuth controls must clearly identify Google and Facebook and behave as buttons/links appropriately.

---

## 19. Error handling

Map stable backend codes to Persian messages.

Categories include:

- invalid credentials;
- verification required;
- insufficient role;
- suspended account;
- missing/expired/revoked session;
- invalid/expired/used reset token;
- password already configured;
- OAuth cancellation/linking restriction;
- throttling;
- validation;
- network/server failure.

Rules:

- preserve `requestId`;
- never expose stack traces or credentials;
- do not treat every `401` as wrong login credentials;
- do not refresh after controlled logout;
- retry only when safe.

---

## 20. Testing

### Unit/integration

Test:

- auth state transitions;
- absence of persistent token storage;
- single-flight refresh;
- one retry maximum;
- refresh failure clears auth;
- field-error mapping;
- safe internal redirects;
- private cache clearing;
- OAuth error mapping;
- sensitive token handling without logging.

### Playwright

Cover:

- registration;
- login;
- refresh after reload;
- logout/logout-all;
- verification/resend;
- forgot/reset password;
- OAuth-only setup password;
- Google/Facebook callback behavior with controlled mocks;
- unverified restricted action;
- insufficient role;
- suspended account;
- session expiration.

Inspect browser storage in tests to confirm tokens are absent.

---

## 21. Implementation sequence

1. Shared API error type and typed API client.
2. In-memory auth store/coordinator.
3. Single-flight refresh.
4. Auth provider/bootstrap.
5. Auth query keys/cache-clearing helpers.
6. Shared auth layout/design.
7. Login and registration.
8. Verification and resend.
9. Forgot/reset password.
10. OAuth callback.
11. Google/Facebook controls.
12. Setup password.
13. Logout/logout-all.
14. Protected route/auth gate.
15. Authorization-aware UI.
16. Full tests and production build.

Do not implement everything in one uncontrolled change. Each step should preserve a working build.

---

## 22. Definition of done

Auth integration is complete when:

- no token is stored persistently;
- refresh cookie is sent with credentials;
- bootstrap works after reload;
- concurrent `401`s share one refresh;
- requests retry no more than once;
- auth pages are accessible, Persian, RTL, responsive, and `noindex`;
- OAuth URLs contain no credentials;
- logout clears private state;
- stable backend errors have controlled handling;
- Playwright covers critical journeys;
- Biome, typecheck, tests, and production build pass.

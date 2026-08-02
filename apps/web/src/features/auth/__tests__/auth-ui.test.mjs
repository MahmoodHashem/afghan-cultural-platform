import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const webRoot = process.cwd();

function read(relativePath) {
  return readFileSync(resolve(webRoot, relativePath), "utf8");
}

const loginPage = read("src/app/(auth)/login/page.tsx");
const registerPage = read("src/app/(auth)/register/page.tsx");
const loginForm = read("src/features/auth/components/login-form.tsx");
const registerForm = read("src/features/auth/components/register-form.tsx");
const passwordField = read("src/features/auth/components/password-field.tsx");
const authAssets = read("src/features/auth/constants/auth-assets.ts");
const authSchemas = read("src/features/auth/schemas/auth-schemas.ts");
const authApi = read("src/features/auth/api/auth-api.ts");
const authMutations = read("src/features/auth/hooks/use-auth-mutations.ts");
const oauthButtons = read("src/features/auth/components/oauth-buttons.tsx");
const oauthCallbackPage = read("src/app/auth/callback/page.tsx");
const oauthCallbackCompletion = read("src/features/auth/components/oauth-callback-completion.tsx");
const authErrorMessages = read("src/features/auth/utils/auth-error-messages.ts");
const apiClient = read("src/lib/api/api-client.ts");
const authCoordinator = read("src/lib/auth/auth-coordinator.ts");
const authProvider = read("src/providers/auth-provider.tsx");
const appProviders = read("src/providers/app-providers.tsx");
const authStore = read("src/stores/auth-store.ts");
const routeGates = read("src/features/auth/components/route-gates.tsx");
const authNavigation = read("src/features/auth/components/auth-navigation.tsx");
const logoutAllButton = read("src/features/auth/components/logout-all-button.tsx");
const verifiedEmailBanner = read("src/features/auth/components/verified-email-banner.tsx");
const authQuery = read("src/lib/auth/auth-query.ts");
const homePage = read("src/app/page.tsx");
const homeHero = read("src/features/home/components/home-hero.tsx");

test("login page renders required fields and links", () => {
  assert.match(loginPage, /title=" خوش آمدید"/);
  assert.match(loginPage, /LOGIN_BACKGROUND_SRC/);
  assert.match(loginForm, /ایمیل/);
  assert.match(loginForm, /رمز عبور/);
  assert.match(loginForm, /\/forgot-password/);
  assert.match(loginForm, /ورود با گوگل/);
  assert.match(loginForm, /ورود با فیسبوک/);
  assert.match(loginForm, /\/register/);
});

test("register page renders required fields and links", () => {
  assert.match(registerPage, /title="ایجاد حساب کاربری"/);
  assert.match(registerPage, /REGISTER_BACKGROUND_SRC/);
  assert.match(registerForm, /نام و نام خانوادگی/);
  assert.match(registerForm, /ایمیل/);
  assert.match(registerForm, /تکرار رمز عبور/);
  assert.match(registerForm, /\/terms/);
  assert.match(registerForm, /\/privacy/);
  assert.match(registerForm, /ثبت‌نام با گوگل/);
  assert.match(registerForm, /ثبت‌نام با فیسبوک/);
  assert.match(registerForm, /\/login/);
});

test("auth schemas cover invalid email validation", () => {
  assert.match(authSchemas, /\.email\("ایمیل معتبر وارد کنید\."\)/);
  assert.match(authSchemas, /loginSchema/);
  assert.match(authSchemas, /registerSchema/);
});

test("register schema covers password confirmation mismatch", () => {
  assert.match(authSchemas, /values\.password === values\.confirmPassword/);
  assert.match(authSchemas, /رمز عبور و تکرار آن یکسان نیستند/);
});

test("register schema requires the terms checkbox", () => {
  assert.match(authSchemas, /acceptedTerms: z\.boolean\(\)\.refine\(\(value\) => value/);
  assert.match(authSchemas, /پذیرش شرایط استفاده و سیاست حریم خصوصی الزامی است/);
});

test("password visibility controls are accessible", () => {
  assert.match(passwordField, /aria-label=\{toggleLabel\}/);
  assert.match(passwordField, /نمایش رمز عبور/);
  assert.match(passwordField, /پنهان کردن رمز عبور/);
  assert.match(passwordField, /type=\{isVisible \? "text" : "password"\}/);
});

test("form controls include keyboard-accessible controls and associated errors", () => {
  assert.match(loginForm, /<form/);
  assert.match(registerForm, /<form/);
  assert.match(loginForm, /htmlFor="login-email"/);
  assert.match(registerForm, /htmlFor="accepted-terms"/);
  assert.match(loginForm, /aria-describedby/);
  assert.match(registerForm, /aria-describedby/);
  assert.match(passwordField, /type="button"/);
});

test("login and register use the same approved login logo asset", () => {
  assert.match(authAssets, /AUTH_LOGO_SRC = "\/images\/large-logo\.png"/);
  assert.doesNotMatch(authAssets, /AUTH_LOGO_SRC = "\/images\/small-logo\.png"/);
});

test("OAuth buttons are connected through click handlers", () => {
  assert.match(oauthButtons, /onGoogleClick/);
  assert.match(oauthButtons, /onFacebookClick/);
  assert.match(loginForm, /createOAuthStartUrl\(provider, nextPath\)/);
  assert.match(registerForm, /createOAuthStartUrl\(provider, nextPath\)/);
});

test("OAuth start URLs use backend auth endpoints without frontend token handling", () => {
  assert.match(authApi, /\/auth\/\$\{provider\}/);
  assert.match(authApi, /url\.searchParams\.set\("next", nextPath\)/);
  assert.doesNotMatch(authApi, /localStorage|sessionStorage|IndexedDB|document\.cookie/);
});

test("OAuth callback refreshes the backend cookie session into memory", () => {
  assert.match(oauthCallbackPage, /OAuthCallbackCompletion/);
  assert.match(oauthCallbackCompletion, /useRefreshAuthSession/);
  assert.match(oauthCallbackCompletion, /router\.replace\(nextPath\)/);
  assert.match(authMutations, /refreshAuthSession/);
  assert.match(authApi, /"\/auth\/refresh"/);
});

test("OAuth errors use controlled Persian messages", () => {
  assert.match(authErrorMessages, /AUTH_FACEBOOK_EMAIL_LINKING_NOT_ALLOWED/);
  assert.match(authErrorMessages, /AUTH_GOOGLE_AUTH_FAILED/);
  assert.match(authErrorMessages, /AUTH_FACEBOOK_AUTH_FAILED/);
  assert.match(authErrorMessages, /AUTH_REFRESH_TOKEN_EXPIRED/);
  assert.match(authErrorMessages, /AUTH_REFRESH_TOKEN_REVOKED/);
  assert.match(authErrorMessages, /AUTH_EMAIL_VERIFICATION_REQUIRED/);
  assert.match(authErrorMessages, /AUTH_INSUFFICIENT_ROLE/);
  assert.match(oauthCallbackCompletion, /getAuthErrorMessageByCode/);
});

test("auth bootstrap restores the refresh-cookie session globally", () => {
  assert.match(authStore, /status: "initializing"/);
  assert.match(authProvider, /bootstrapAuthSession/);
  assert.match(appProviders, /<AuthProvider>\{children\}<\/AuthProvider>/);
  assert.match(authCoordinator, /credentials: "include"/);
  assert.match(authCoordinator, /setAuthenticated\(session\)/);
  assert.match(authCoordinator, /setUnauthenticated\(\)/);
});

test("single-flight refresh coordinates concurrent expired requests", () => {
  assert.match(authCoordinator, /let refreshPromise: Promise<AuthSession> \| null = null/);
  assert.match(authCoordinator, /if \(!refreshPromise\)/);
  assert.match(apiClient, /refreshAccessTokenOnce\(\)/);
  assert.match(apiClient, /skipAuthRefresh: true/);
  assert.match(apiClient, /!path\.startsWith\("\/auth\/refresh"\)/);
});

test("API client retries authenticated 401 responses only once", () => {
  assert.match(apiClient, /shouldRefreshAccessToken/);
  assert.match(apiClient, /error\.status === 401/);
  assert.match(apiClient, /skipAuthRefresh: true/);
  assert.match(apiClient, /clearAuthSession\(\)/);
});

test("protected route gates preserve safe next paths and enforce auth states", () => {
  assert.match(routeGates, /function RequireAuth/);
  assert.match(routeGates, /status === "initializing"/);
  assert.match(routeGates, /\/login\?next=/);
  assert.match(routeGates, /getSafeRedirectPath\(pathname\)/);
});

test("verified-email and role gates are opt-in frontend UX gates", () => {
  assert.match(routeGates, /function RequireVerifiedEmail/);
  assert.match(routeGates, /!user\?\.emailVerified/);
  assert.match(routeGates, /function RequireRole/);
  assert.match(routeGates, /roles\.includes\(user\.role\)/);
  assert.match(verifiedEmailBanner, /ورود به حساب مجاز است/);
});

test("role-aware navigation reflects auth state without becoming authorization", () => {
  assert.match(authNavigation, /\/login/);
  assert.match(authNavigation, /\/register/);
  assert.match(authNavigation, /\/dashboard/);
  assert.match(authNavigation, /\/moderator/);
  assert.match(authNavigation, /\/admin/);
  assert.match(authNavigation, /ایمیل تأیید نشده/);
});

test("logout and logout-all clear private auth state", () => {
  assert.match(authApi, /"\/auth\/logout"/);
  assert.match(authApi, /"\/auth\/logout-all"/);
  assert.match(authApi, /skipAuthRefresh: true/);
  assert.match(authMutations, /useLogout/);
  assert.match(authMutations, /useLogoutAll/);
  assert.match(authMutations, /markAuthLogoutStarted\(\)/);
  assert.match(logoutAllButton, /خروج از همه دستگاه‌ها/);
});

test("private query cleanup preserves non-auth public query space", () => {
  assert.match(authQuery, /privateQueryRoots/);
  assert.match(authQuery, /"auth"/);
  assert.match(authQuery, /"dashboard"/);
  assert.doesNotMatch(authQuery, /published/);
});

test("auth code never stores tokens in browser storage or frontend cookies", () => {
  const authFiles = [apiClient, authCoordinator, authApi, authMutations, authStore].join("\n");

  assert.doesNotMatch(authFiles, /localStorage|sessionStorage|IndexedDB|document\.cookie/);
  assert.match(authCoordinator, /credentials: "include"/);
});

test("homepage keeps the design preview and adds the premium hero first", () => {
  assert.match(homePage, /<HomeHero \/>/);
  assert.match(homePage, /id="design-preview"/);
  assert.match(homePage, /پیش‌نمایش بنیاد طراحی/);
});

test("homepage hero uses the approved Afghan heritage carousel images", () => {
  assert.match(homeHero, /\/images\/herat-grand-mosque\.webp/);
  assert.match(homeHero, /\/images\/arg\.png/);
  assert.match(homeHero, /\/images\/menar\.png/);
  assert.match(homeHero, /\/images\/babur\.png/);
  assert.match(homeHero, /setInterval/);
});

test("homepage floating header uses solid controls instead of a glass nav pill", () => {
  assert.match(homeHero, /bg-transparent/);
  assert.match(homeHero, /bg-white/);
  assert.match(homeHero, /bg-primary/);
  assert.match(homeHero, /میراث افغانستان/);
  assert.match(homeHero, /کاوش محتوا/);
  assert.match(homeHero, /جست‌وجوی فرهنگ، مکان، روایت/);
  assert.match(homeHero, /ایجاد محتوا/);
  assert.match(homeHero, /ورود \/ ثبت‌نام/);
});

test("homepage header compacts on scroll while preserving logo, search, and actions", () => {
  assert.match(homeHero, /isHeaderCompact/);
  assert.match(homeHero, /window\.scrollY > 120/);
  assert.match(homeHero, /max-w-\[1040px\] gap-2 border border-border bg-card/);
  assert.match(homeHero, /h-9 min-w-\[240px\] max-w-\[320px\] border-border/);
  assert.match(homeHero, /<HeroAuthControls isCompact=\{isCompact\} \/>/);
});

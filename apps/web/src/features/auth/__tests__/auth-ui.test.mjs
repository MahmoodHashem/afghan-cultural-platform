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
const entryDetailPage = read("src/app/entries/[slug]/page.tsx");
const entryDetailContent = read("src/features/entries/components/entry-detail-content.tsx");
const entryFeedback = read("src/features/entries/components/reviews/entry-feedback.tsx");
const communityFeedbackApi = read("src/features/entries/api/community-feedback-api.ts");
const explorePage = read("src/app/explore/page.tsx");
const exploreApi = read("src/features/entries/api/public-entries-api.ts");
const exploreContent = read("src/features/entries/components/explore-content.tsx");
const homePage = read("src/app/page.tsx");
const homeApi = read("src/features/home/api/home-api.ts");
const homeContent = read("src/features/home/components/home-content.tsx");
const homeFooter = read("src/features/home/components/home-footer.tsx");
const homeHero = read("src/features/home/components/home-hero.tsx");
const sheet = read("src/components/ui/sheet.tsx");

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

test("homepage composes the public landing page from real public API data", () => {
  assert.match(homePage, /<HomeHero \/>/);
  assert.match(homePage, /getHomeData\(\)/);
  assert.match(homePage, /<HomeContent data=\{homeData\} \/>/);
  assert.match(homePage, /<HomeFooter \/>/);
  assert.match(homeApi, /"\/entries\?limit=6&sort=newest"/);
  assert.match(homeApi, /"\/taxonomy\/provinces\?limit=8"/);
  assert.match(homeApi, /next: \{ revalidate: 120 \}/);
  assert.match(homeContent, /FeaturedEntryCard/);
  assert.match(homeContent, /LatestEntriesSection/);
  assert.match(homeContent, /NationalScopeSection/);
  assert.doesNotMatch(homePage, /design-preview|پیش‌نمایش بنیاد طراحی/);
});

test("homepage hero uses the approved Afghan heritage carousel images", () => {
  assert.match(homeHero, /\/images\/gunbads2\.jpg/);
  assert.match(homeHero, /\/images\/bamyan\.jpg/);
  assert.match(homeHero, /\/images\/HERAT02\.jpg/);
  assert.match(homeHero, /\/images\/menaras\.jpg/);
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
  assert.match(homeHero, /ثبت‌نام/);
});

test("homepage header compacts on scroll while preserving logo, search, and actions", () => {
  assert.match(homeHero, /isHeaderCompact/);
  assert.match(homeHero, /window\.scrollY > 120/);
  assert.match(homeHero, /max-w-260 gap-2 border border-border bg-card/);
  assert.match(homeHero, /h-9 min-w-0 border-border bg-card/);
  assert.match(homeHero, /<HeroAuthControls isCompact=\{isCompact\} \/>/);
});

test("homepage mobile navigation uses a shadcn Sheet sidebar", () => {
  assert.match(homeHero, /function MobileNavigation/);
  assert.match(homeHero, /<Sheet open=\{isOpen\} onOpenChange=\{setIsOpen\}>/);
  assert.match(homeHero, /side="right"/);
  assert.match(homeHero, /باز کردن منوی ناوبری/);
  assert.match(homeHero, /ناوبری موبایل/);
  assert.match(homeHero, /focus-within:ring-3/);
  assert.match(sheet, /Dialog as SheetPrimitive/);
  assert.match(sheet, /XMarkIcon/);
});

test("homepage footer matches the attached full-width footer design", () => {
  assert.match(homeFooter, /w-full border-t border-border bg-background/);
  assert.match(homeFooter, /میراث افغانستان/);
  assert.match(homeFooter, /فرهنگ، تاریخ، هویت ما/);
  assert.match(homeFooter, /دسترسی سریع/);
  assert.match(homeFooter, /منابع/);
  assert.match(homeFooter, /در خبرنامه ما عضو شوید/);
  assert.match(homeFooter, /ایمیل شما/);
  assert.match(homeFooter, /siInstagram/);
  assert.match(homeFooter, /siFacebook/);
  assert.match(homeFooter, /siX/);
  assert.match(homeFooter, /siYoutube/);
});

test("explore page uses public entries and taxonomy APIs with URL filters", () => {
  assert.match(explorePage, /getPublishedEntries\(query\)/);
  assert.match(explorePage, /getExploreTaxonomyData\(\)/);
  assert.match(explorePage, /normalizeExploreQuery/);
  assert.match(exploreApi, /\/entries\?\$\{searchParams\.toString\(\)\}/);
  assert.match(exploreApi, /\/taxonomy\/provinces\?limit=100/);
  assert.match(exploreApi, /\/taxonomy\/categories\?limit=100/);
  assert.match(exploreApi, /\/taxonomy\/content-types\?limit=100/);
  assert.match(exploreContent, /action="\/explore"/);
  assert.match(exploreContent, /name="provinceSlug"/);
  assert.match(exploreContent, /name="categorySlug"/);
  assert.match(exploreContent, /name="contentTypeSlug"/);
  assert.match(exploreContent, /name="geographicScope"/);
});

test("entry detail page renders published entry data by Persian slug", () => {
  assert.match(entryDetailPage, /getPublishedEntryBySlug\(slug\)/);
  assert.match(entryDetailPage, /getPublicEntryReviews\(entry\.id\)/);
  assert.match(entryDetailPage, /notFound\(\)/);
  assert.match(entryDetailPage, /generateMetadata/);
  assert.match(exploreApi, /\/entries\/\$\{encodeURIComponent\(normalizeSlug\(slug\)\)\}/);
  assert.match(exploreApi, /\/entries\/\$\{entryId\}\/reviews/);
  assert.match(entryDetailContent, /function TiptapDocument/);
  assert.match(entryDetailContent, /case "paragraph"/);
  assert.match(entryDetailContent, /case "heading"/);
  assert.match(entryDetailContent, /case "internalEntryLink"/);
  assert.match(entryDetailContent, /YouTubeEmbed/);
  assert.match(entryDetailContent, /SourcesList/);
  assert.match(entryDetailContent, /OutgoingReferences/);
  assert.match(entryDetailContent, /IncomingReferences/);
});

test("entry detail supports public reviews and verified-user feedback", () => {
  assert.match(entryDetailContent, /EntryFeedback/);
  assert.match(entryDetailContent, /PublicReviewsList/);
  assert.match(entryDetailContent, /دیدگاه‌های خوانندگان/);
  assert.match(entryFeedback, /submitRating\(entryId, value\)/);
  assert.match(entryFeedback, /submitPublicReview\(entryId, values\.body\)/);
  assert.match(entryFeedback, /user\?\.emailVerified/);
  assert.match(entryFeedback, /برای ثبت دیدگاه باید وارد شوید و ایمیل خود را تأیید کنید/);
  assert.match(communityFeedbackApi, /\/entries\/\$\{entryId\}\/reviews/);
  assert.match(communityFeedbackApi, /\/entries\/\$\{entryId\}\/rating/);
  assert.match(communityFeedbackApi, /COMMUNITY_REVIEW_ALREADY_EXISTS/);
});

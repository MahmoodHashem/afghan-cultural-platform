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
const oauthRedirect = read("src/features/auth/utils/oauth-redirect.ts");
const oauthCallbackPage = read("src/app/auth/callback/page.tsx");
const oauthCallbackCompletion = read("src/features/auth/components/oauth-callback-completion.tsx");
const verifyEmailPage = read("src/app/(auth)/verify-email/page.tsx");
const emailVerificationCompletion = read(
  "src/features/auth/components/email-verification-completion.tsx",
);
const emailVerificationButton = read("src/features/auth/components/email-verification-button.tsx");
const authErrorMessages = read("src/features/auth/utils/auth-error-messages.ts");
const authRedirects = read("src/features/auth/utils/redirects.ts");
const apiClient = read("src/lib/api/api-client.ts");
const authCoordinator = read("src/lib/auth/auth-coordinator.ts");
const authProvider = read("src/providers/auth-provider.tsx");
const appProviders = read("src/providers/app-providers.tsx");
const pageTransition = read("src/components/layout/page-transition.tsx");
const pageBreadcrumb = read("src/components/layout/page-breadcrumb.tsx");
const shadcnBreadcrumb = read("src/components/ui/breadcrumb.tsx");
const authStore = read("src/stores/auth-store.ts");
const routeGates = read("src/features/auth/components/route-gates.tsx");
const authNavigation = read("src/features/auth/components/auth-navigation.tsx");
const logoutAllButton = read("src/features/auth/components/logout-all-button.tsx");
const verifiedEmailBanner = read("src/features/auth/components/verified-email-banner.tsx");
const authQuery = read("src/lib/auth/auth-query.ts");
const persianUtils = read("src/lib/utils/persian.ts");
const publicLayout = read("src/app/(public)/layout.tsx");
const mobileAppShell = read("src/components/layout/mobile/mobile-app-shell.tsx");
const mobileShellEvents = read("src/components/layout/mobile/mobile-shell-events.ts");
const mobileChromeVisibility = read("src/components/layout/mobile/use-mobile-chrome-visibility.ts");
const mobileChromeHidden = read("src/components/layout/mobile/use-mobile-chrome-hidden.ts");
const mobileShellAuthDrawer = read("src/components/layout/mobile/mobile-shell-auth-drawer.tsx");
const mobileAppStyles = read("src/app/mobile-app.css");
const publicError = read("src/app/(public)/error.tsx");
const createEntryPage = read("src/app/(contribute)/entries/new/page.tsx");
const createEntryLoading = read("src/app/(contribute)/entries/new/loading.tsx");
const entryDetailPage = read("src/app/(public)/entries/[slug]/page.tsx");
const entryDetailLoading = read("src/app/(public)/entries/[slug]/loading.tsx");
const entryDetailContent = read("src/features/entries/components/entry-detail-content.tsx");
const entryActionRail = read("src/features/entries/components/entry-action-rail.tsx");
const entryShareDialog = read("src/features/entries/components/entry-share-dialog.tsx");
const entryShareUtils = read("src/features/entries/utils/entry-share.ts");
const animatedIconHook = read("src/hooks/use-animated-icon.ts");
const animatedHeartIcon = read("src/components/icons/animated/heart.tsx");
const entryScrollControls = read("src/features/entries/components/entry-scroll-controls.tsx");
const entryHeaderContext = read("src/features/entries/components/entry-detail-header-context.tsx");
const entryTableOfContents = read("src/features/entries/components/entry-table-of-contents.tsx");
const engagementApi = read("src/features/engagement/api/entry-engagement-api.ts");
const engagementAccess = read("src/features/engagement/hooks/use-engagement-access.ts");
const engagementAccessProvider = read(
  "src/features/engagement/components/engagement-access-provider.tsx",
);
const engagementAccessDialog = read(
  "src/features/engagement/components/engagement-access-dialog.tsx",
);
const pendingEngagementIntent = read("src/features/engagement/utils/pending-engagement-intent.ts");
const authEvents = read("src/features/auth/utils/auth-events.ts");
const engagementInteractions = read("src/features/engagement/hooks/use-entry-interactions.ts");
const engagementCommentsHook = read("src/features/engagement/hooks/use-entry-comments.ts");
const engagementComments = read("src/features/engagement/components/entry-comments.tsx");
const commentComposer = read("src/features/engagement/components/comment-composer.tsx");
const commentEmojiPicker = read("src/features/engagement/components/comment-emoji-picker.tsx");
const commentEmojiPickerContent = read(
  "src/features/engagement/components/comment-emoji-picker-content.tsx",
);
const shadcnEmojiPicker = read("src/components/ui/emoji-picker.tsx");
const commentThread = read("src/features/engagement/components/comment-thread.tsx");
const commentMenu = read("src/features/engagement/components/comment-menu.tsx");
const commentSchema = read("src/features/engagement/schemas/entry-comment-schema.ts");
const engagementQueryKeys = read("src/features/engagement/constants/engagement-query-keys.ts");
const engagementErrors = read("src/features/engagement/utils/engagement-errors.ts");
const contributionTaxonomyApi = read("src/features/entries/api/contribution-taxonomy-api.ts");
const entryDraftsApi = read("src/features/entries/api/entry-drafts-api.ts");
const createEntryForm = read("src/features/entries/components/create-entry-form.tsx");
const createEntryEditorLayout = read(
  "src/features/entries/components/create-entry-editor-layout.tsx",
);
const createEntryOverlays = read("src/features/entries/components/create-entry-overlays.tsx");
const createEntrySections = read("src/features/entries/components/create-entry-sections.tsx");
const createEntrySelect = read("src/features/entries/components/create-entry-select.tsx");
const shadcnCombobox = read("src/components/ui/combobox.tsx");
const createEntryWritingSurface = read(
  "src/features/entries/components/create-entry-writing-surface.tsx",
);
const stagedEntryImagesHook = read("src/features/entries/hooks/use-staged-entry-images.ts");
const youtubeMetadataHook = read("src/features/entries/hooks/use-youtube-metadata.ts");
const createEntrySchema = read("src/features/entries/schemas/create-entry-schema.ts");
const tiptapContentUtils = read("src/features/entries/utils/tiptap-content.ts");
const tiptapDocumentRenderer = read("src/components/common/tiptap-document.tsx");
const richTextEditor = read("src/components/common/rich-text-editor.tsx");
const virtualKeyboardHook = read("src/hooks/use-virtual-keyboard.ts");
const explorePage = read("src/app/(public)/explore/page.tsx");
const exploreLoading = read("src/app/(public)/explore/loading.tsx");
const provincesPage = read("src/app/(public)/provinces/page.tsx");
const provincesLoading = read("src/app/(public)/provinces/loading.tsx");
const provinceDetailPage = read("src/app/(public)/provinces/[slug]/page.tsx");
const provinceDetailLoading = read("src/app/(public)/provinces/[slug]/loading.tsx");
const categoriesPage = read("src/app/(public)/categories/page.tsx");
const categoriesLoading = read("src/app/(public)/categories/loading.tsx");
const categoryDetailPage = read("src/app/(public)/categories/[slug]/page.tsx");
const categoryDetailLoading = read("src/app/(public)/categories/[slug]/loading.tsx");
const exploreApi = read("src/features/entries/api/public-entries-api.ts");
const exploreContent = read("src/features/entries/components/explore-content.tsx");
const exploreFilterForm = read("src/features/entries/components/explore-filter-form.tsx");
const exploreFilterSheet = read("src/features/entries/components/explore-filter-sheet.tsx");
const exploreResultsPanel = read("src/features/entries/components/explore-results-panel.tsx");
const publicEntryCard = read("src/features/entries/components/public-entry-card.tsx");
const animatedEntryGrid = read("src/features/entries/components/animated-entry-grid.tsx");
const taxonomyDiscoveryPages = read("src/features/entries/components/taxonomy-discovery-pages.tsx");
const filterableEntryResults = read("src/features/entries/components/filterable-entry-results.tsx");
const filterTabs = read("src/features/entries/components/filter-tabs.tsx");
const shadcnTabs = read("src/components/ui/tabs.tsx");
const entryBreadcrumb = read("src/features/entries/utils/entry-breadcrumb.ts");
const entryBreadcrumbTracker = read("src/features/entries/components/entry-breadcrumb-tracker.tsx");
const entryDetailBreadcrumb = read("src/features/entries/components/entry-detail-breadcrumb.tsx");
const provinceSearchGrid = read("src/features/entries/components/province-search-grid.tsx");
const provinceImages = read("src/lib/images/province-images.ts");
const homePage = read("src/app/page.tsx");
const homeApi = read("src/features/home/api/home-api.ts");
const homeContent = read("src/features/home/components/home-content.tsx");
const homeFooter = read("src/features/home/components/home-footer.tsx");
const homeHero = read("src/features/home/components/home-hero.tsx");
const homeScrollReveal = read("src/features/home/components/scroll-reveal.tsx");
const publicHeader = read("src/components/layout/public-header.tsx");
const sheet = read("src/components/ui/sheet.tsx");
const profilePage = read("src/app/(profile)/profile/page.tsx");
const profileLayout = read("src/app/(profile)/layout.tsx");
const profileLoading = read("src/app/(profile)/profile/loading.tsx");
const ownerProfilePage = read("src/features/profile/components/owner-profile-page.tsx");
const profileEditDialog = read("src/features/profile/components/profile-edit-dialog.tsx");
const profileImageNormalizer = read("src/features/profile/utils/normalize-profile-image.ts");
const profileSkeleton = read("src/features/profile/components/profile-page-skeleton.tsx");
const profileLogoutButton = read("src/features/profile/components/profile-logout-button.tsx");
const authLayout = read("src/features/auth/components/auth-layout.tsx");
const authCard = read("src/features/auth/components/auth-card.tsx");
const profileApi = read("src/features/profile/api/profile-api.ts");
const profileEntryStatus = read("src/features/profile/constants/entry-status.ts");
const profileEntryHooks = read("src/features/profile/hooks/use-owner-entries.ts");
const profileQueryUtils = read("src/features/profile/utils/profile-query.ts");
const moderationQueuePage = read("src/app/(moderator)/moderator/page.tsx");
const moderationReviewRoute = read("src/app/(moderator)/moderator/submissions/[id]/page.tsx");
const moderationApi = read("src/features/moderation/api/moderation-api.ts");
const moderationHooks = read("src/features/moderation/hooks/use-moderation.ts");
const moderationQueue = read("src/features/moderation/components/moderation-queue.tsx");
const moderationReviewPage = read("src/features/moderation/components/moderation-review-page.tsx");
const moderationDecisionDialog = read(
  "src/features/moderation/components/moderation-decision-dialog.tsx",
);
const moderationMapper = read("src/features/moderation/mappers/moderation-mapper.ts");
const moderationErrors = read("src/features/moderation/utils/moderation-errors.ts");
const moderationQuery = read("src/features/moderation/utils/moderation-query.ts");
const contentModerationApi = read("src/features/moderation/api/content-moderation-api.ts");
const contentModerationHooks = read("src/features/moderation/hooks/use-content-moderation.ts");
const contentModerationQueues = read(
  "src/features/moderation/components/content-moderation-queues.tsx",
);
const contentModerationDetails = read(
  "src/features/moderation/components/content-moderation-details.tsx",
);
const communityModerationActions = read(
  "src/features/moderation/components/community-moderation-actions.tsx",
);
const moderatorNavigation = read("src/features/moderation/components/moderator-navigation.tsx");
const correctionRoute = read("src/app/(moderator)/moderator/corrections/page.tsx");
const reportsRoute = read("src/app/(moderator)/moderator/reports/page.tsx");
const historyRoute = read("src/app/(moderator)/moderator/history/page.tsx");
const adminLayout = read("src/app/(admin)/admin/layout.tsx");
const adminNavigationConfig = read("src/features/admin/constants/admin-navigation.ts");
const adminNavigation = read("src/features/admin/components/admin-navigation.tsx");
const adminSidebar = read("src/features/admin/components/admin-sidebar.tsx");
const adminHeader = read("src/features/admin/components/admin-header.tsx");
const adminRoutes = read("src/features/admin/utils/admin-routes.ts");
const adminPlaceholder = read("src/features/admin/components/admin-placeholder-page.tsx");
const adminOverviewRoute = read("src/app/(admin)/admin/page.tsx");
const adminOverviewApi = read("src/features/admin/api/admin-overview-api.ts");
const adminOverviewHook = read("src/features/admin/hooks/use-admin-overview.ts");
const adminOverviewPage = read("src/features/admin/components/admin-overview-page.tsx");
const adminOverviewChart = read("src/features/admin/components/admin-overview-growth-chart.tsx");
const adminOverviewActivity = read("src/features/admin/components/admin-overview-activity.tsx");
const adminUsersRoute = read("src/app/(admin)/admin/users/page.tsx");
const adminUserDetailRoute = read("src/app/(admin)/admin/users/[id]/page.tsx");
const adminUsersApi = read("src/features/admin/api/admin-users-api.ts");
const adminUsersHooks = read("src/features/admin/hooks/use-admin-users.ts");
const adminUsersPage = read("src/features/admin/components/admin-users-page.tsx");
const adminUsersTable = read("src/features/admin/components/admin-users-table.tsx");
const adminUsersToolbar = read("src/features/admin/components/admin-users-toolbar.tsx");
const adminUserDetailPage = read("src/features/admin/components/admin-user-detail-page.tsx");
const adminUserRecords = read("src/features/admin/components/admin-user-records.tsx");
const adminUserActions = read("src/features/admin/components/admin-user-action-dialogs.tsx");
const adminUserErrors = read("src/features/admin/utils/admin-user-errors.ts");
const adminUsersUrl = read("src/features/admin/utils/admin-users-url.ts");
const adminEntriesRoute = read("src/app/(admin)/admin/entries/page.tsx");
const adminEntryDetailRoute = read("src/app/(admin)/admin/entries/[id]/page.tsx");
const adminEntriesApi = read("src/features/admin/api/admin-entries-api.ts");
const adminEntriesHooks = read("src/features/admin/hooks/use-admin-entries.ts");
const adminEntriesPage = read("src/features/admin/components/admin-entries-page.tsx");
const adminEntriesTable = read("src/features/admin/components/admin-entries-table.tsx");
const adminEntriesToolbar = read("src/features/admin/components/admin-entries-toolbar.tsx");
const adminEntryDetailPage = read("src/features/admin/components/admin-entry-detail-page.tsx");
const adminEntryLifecycleDialog = read(
  "src/features/admin/components/admin-entry-lifecycle-dialog.tsx",
);
const adminEntriesUrl = read("src/features/admin/utils/admin-entries-url.ts");
const adminTopicsRoute = read("src/app/(admin)/admin/topics/page.tsx");
const adminTopicsApi = read("src/features/admin/api/admin-topics-api.ts");
const adminTopicsHooks = read("src/features/admin/hooks/use-admin-topics.ts");
const adminTopicsPage = read("src/features/admin/components/admin-topics-page.tsx");
const adminTopicsTable = read("src/features/admin/components/admin-topics-table.tsx");
const adminTopicsToolbar = read("src/features/admin/components/admin-topics-toolbar.tsx");
const adminTopicForm = read("src/features/admin/components/admin-topic-form-sheet.tsx");
const adminTopicStatus = read("src/features/admin/components/admin-topic-status-dialog.tsx");
const adminTopicsUrl = read("src/features/admin/utils/admin-topics-url.ts");
const adminDescribedTaxonomy = read("src/features/admin/constants/admin-described-taxonomy.ts");
const adminContentTypesRoute = read("src/app/(admin)/admin/content-types/page.tsx");
const adminTagsRoute = read("src/app/(admin)/admin/tags/page.tsx");
const adminTagsApi = read("src/features/admin/api/admin-tags-api.ts");
const adminTagsHooks = read("src/features/admin/hooks/use-admin-tags.ts");
const adminTagsPage = read("src/features/admin/components/admin-tags-page.tsx");
const adminTagsTable = read("src/features/admin/components/admin-tags-table.tsx");
const adminTagsToolbar = read("src/features/admin/components/admin-tags-toolbar.tsx");
const adminTagForm = read("src/features/admin/components/admin-tag-form-sheet.tsx");
const adminTagStatus = read("src/features/admin/components/admin-tag-status-dialog.tsx");
const adminTagsUrl = read("src/features/admin/utils/admin-tags-url.ts");
const adminProvincesRoute = read("src/app/(admin)/admin/provinces/page.tsx");
const adminProvinceDetailRoute = read("src/app/(admin)/admin/provinces/[id]/page.tsx");
const adminProvincesApi = read("src/features/admin/api/admin-provinces-api.ts");
const adminProvincesHooks = read("src/features/admin/hooks/use-admin-provinces.ts");
const adminProvincesPage = read("src/features/admin/components/admin-provinces-page.tsx");
const adminProvinceDetailPage = read(
  "src/features/admin/components/admin-province-detail-page.tsx",
);
const adminProvincesTable = read("src/features/admin/components/admin-provinces-table.tsx");
const adminDistrictsTable = read("src/features/admin/components/admin-districts-table.tsx");
const adminProvinceImageDialog = read(
  "src/features/admin/components/admin-province-image-dialog.tsx",
);
const shadcnSidebar = read("src/components/ui/sidebar.tsx");
const adminPageRoutes = [
  "src/app/(admin)/admin/moderators/page.tsx",
  "src/app/(admin)/admin/reports/page.tsx",
  "src/app/(admin)/admin/audit/page.tsx",
  "src/app/(admin)/admin/settings/page.tsx",
].map(read);

test("login page renders required fields and links", () => {
  assert.match(loginPage, /title="خوش آمدید"/);
  assert.match(loginPage, /LOGIN_BACKGROUND_SRC/);
  assert.match(loginForm, /ایمیل/);
  assert.match(loginForm, /رمز عبور/);
  assert.match(loginForm, /\/forgot-password/);
  assert.match(loginForm, /ورود با گوگل/);
  assert.match(loginForm, /ورود با فیسبوک/);
  assert.match(loginForm, /createRegisterPath/);
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
  assert.match(registerForm, /createLoginPath/);
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
  assert.match(authSchemas, /برای ثبت‌نام باید شرایط استفاده و سیاست حفظ حریم خصوصی را بپذیرید/);
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
  assert.match(
    loginForm,
    /redirectToOAuthProvider\("google", nextPath \?\? searchParams\.get\("next"\)\)/,
  );
  assert.match(
    registerForm,
    /redirectToOAuthProvider\("google", nextPath \?\? searchParams\.get\("next"\)\)/,
  );
  assert.match(oauthRedirect, /createOAuthStartUrl\(provider, getSafeRedirectPath\(nextPath\)\)/);
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

test("profile email verification uses the confirmed backend contracts", () => {
  assert.match(ownerProfilePage, /EmailVerificationButton email=\{user\.email\} compact/);
  assert.doesNotMatch(ownerProfilePage, /VerifiedEmailBanner email=\{profileUser\.email\}/);
  assert.match(emailVerificationButton, /useResendEmailVerification/);
  assert.match(emailVerificationButton, /RESEND_COOLDOWN_SECONDS = 60/);
  assert.match(emailVerificationButton, /تأیید ایمیل/);
  assert.match(verifiedEmailBanner, /EmailVerificationButton email=\{emailAddress\}/);
  assert.match(authApi, /"\/auth\/resend-verification"/);
  assert.match(authApi, /body: \{ email \}/);
  assert.match(authMutations, /useResendEmailVerification/);
});

test("verification callback consumes the token once and refreshes authenticated state", () => {
  assert.match(verifyEmailPage, /index: false/);
  assert.match(verifyEmailPage, /EmailVerificationCompletion/);
  assert.match(emailVerificationCompletion, /searchParams\.get\("token"\)/);
  assert.match(emailVerificationCompletion, /startedRef\.current/);
  assert.match(emailVerificationCompletion, /router\.replace\("\/verify-email"/);
  assert.match(authApi, /"\/auth\/verify-email"/);
  assert.match(authApi, /body: \{ token \}/);
  assert.match(authMutations, /refreshAuthSessionOnce/);
  assert.match(authMutations, /updateUser\(user\)/);
  assert.match(authMutations, /publishAuthEvent/);
  assert.match(authEvents, /BroadcastChannel/);
  assert.match(authErrorMessages, /AUTH_VERIFICATION_TOKEN_INVALID/);
  assert.match(authErrorMessages, /AUTH_VERIFICATION_TOKEN_EXPIRED/);
  assert.doesNotMatch(emailVerificationCompletion, /localStorage|sessionStorage|console\./);
});

test("auth bootstrap restores the refresh-cookie session globally", () => {
  assert.match(authStore, /status: "initializing"/);
  assert.match(authProvider, /bootstrapAuthSession/);
  assert.match(appProviders, /<AuthProvider>/);
  assert.match(authCoordinator, /credentials: "include"/);
  assert.match(authCoordinator, /setAuthenticated\(session\)/);
  assert.match(authCoordinator, /setUnauthenticated\(\)/);
});

test("page transitions use Motion with reduced-motion support", () => {
  assert.match(appProviders, /MotionConfig/);
  assert.match(appProviders, /reducedMotion="user"/);
  assert.match(explorePage, /<PageTransition>/);
  assert.match(pageTransition, /AnimatePresence/);
  assert.match(pageTransition, /motion\.div/);
  assert.match(pageTransition, /usePathname/);
  assert.match(pageTransition, /useReducedMotion/);
  assert.match(pageTransition, /mode="wait"/);
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
  assert.match(routeGates, /createLoginPath\(nextPath\)/);
  assert.match(routeGates, /getSafeRedirectPath\(pathname\)/);
  assert.match(authRedirects, /function createAuthPath/);
  assert.match(authRedirects, /`\$\{authPath\}\?next=\$\{encodeURIComponent\(safePath\)\}`/);
  assert.match(loginForm, /createRegisterPath\(nextPath \?\? searchParams\.get\("next"\)/);
  assert.match(registerForm, /createLoginPath\(nextPath \?\? searchParams\.get\("next"\)/);
});

test("owner profile route is authenticated and noindexed", () => {
  assert.match(profilePage, /robots: \{/);
  assert.match(profilePage, /index: false/);
  assert.match(profilePage, /RequireAuth/);
  assert.match(profilePage, /OwnerProfilePage/);
  assert.match(profileLayout, /PublicHeader/);
  assert.match(profileLayout, /HomeFooter/);
  assert.match(profileLoading, /ProfilePageSkeleton/);
  assert.match(profileSkeleton, /در حال بارگذاری پروفایل/);
});

test("profile links replace stale account and dashboard destinations", () => {
  assert.match(publicHeader, /href="\/profile"/);
  assert.match(publicHeader, /href="\/admin"/);
  assert.match(publicHeader, /user\.role === "ADMIN"/);
  assert.match(publicHeader, /UserCircleIcon/);
  assert.match(publicHeader, /Squares2X2Icon/);
  assert.match(publicHeader, /ArrowRightStartOnRectangleIcon/);
  assert.match(authNavigation, /href="\/profile"/);
  assert.doesNotMatch(publicHeader, /href="\/account"/);
  assert.doesNotMatch(authNavigation, /href="\/dashboard"/);
});

test("owner profile uses safe authenticated user data", () => {
  assert.match(ownerProfilePage, /useAuthStore/);
  assert.match(ownerProfilePage, /user\.displayName/);
  assert.match(ownerProfilePage, /user\.emailVerified/);
  assert.match(ownerProfilePage, /createUserInitials\(user\.displayName\)/);
  assert.doesNotMatch(ownerProfilePage, /passwordHash|refreshToken|tokenHash/);
});

test("owner profile exposes confirmed logout directly in the account page", () => {
  assert.match(ownerProfilePage, /<ProfileLogoutButton \/>/);
  assert.match(profileLogoutButton, /useLogout/);
  assert.match(profileLogoutButton, /از حساب خارج می‌شوید؟/);
  assert.match(profileLogoutButton, /<AlertDialog/);
  assert.match(profileLogoutButton, /خروج از حساب/);
});

test("owner profile entries integrate the existing private entry endpoints", () => {
  assert.match(entryDraftsApi, /async function listOwnEntries/);
  assert.match(entryDraftsApi, /\/me\/entries/);
  assert.match(entryDraftsApi, /async function getOwnEntry/);
  assert.match(entryDraftsApi, /async function deleteOwnDraft/);
  assert.match(profileEntryHooks, /useOwnerEntries/);
  assert.match(profileEntryHooks, /PROFILE_ENTRIES_PAGE_SIZE = 8/);
  assert.match(profileEntryHooks, /sortBy: "updatedAt"/);
  assert.match(profileEntryHooks, /sortDirection: "desc"/);
});

test("profile tabs and filters are owned by URL search params", () => {
  assert.match(profileQueryUtils, /type ProfileTab = "entries" \| "comments" \| "bookmarks"/);
  assert.match(profileQueryUtils, /value === "reviews"/);
  assert.match(profileQueryUtils, /status\?: EntryStatus/);
  assert.match(profileQueryUtils, /createProfileHref/);
  assert.match(profileQueryUtils, /\/profile/);
  assert.match(ownerProfilePage, /useSearchParams/);
  assert.match(ownerProfilePage, /scroll=\{false\}/);
});

test("mobile profile uses compact app chrome without changing profile data ownership", () => {
  assert.match(mobileAppShell, /routeContext\?\.kind === "profile"/);
  assert.match(mobileAppShell, /<ProfileMenu user=\{user\} mobile \/>/);
  assert.match(publicHeader, /function ProfileMenu\(\{ user, mobile = false \}/);
  assert.match(publicHeader, /user\.role === "MODERATOR" \|\| user\.role === "ADMIN"/);
  assert.match(publicHeader, /user\.role === "ADMIN"/);
  assert.match(publicHeader, /<LogoutConfirmationDialog/);
  assert.match(ownerProfilePage, /lg:size-28/);
  assert.match(ownerProfilePage, /<ProfileEditDialog/);
  assert.match(ownerProfilePage, /stats\.entries/);
  assert.match(ownerProfilePage, /stats\.comments/);
  assert.match(ownerProfilePage, /stats\.bookmarks/);
});

test("profile images are normalized before upload", () => {
  assert.match(profileEditDialog, /await normalizeProfileImage\(nextFile\)/);
  assert.match(profileEditDialog, /isNormalizingImage/);
  assert.match(profileImageNormalizer, /maxDimension: 1024/);
  assert.match(profileImageNormalizer, /targetBytes: 800 \* 1024/);
  assert.match(profileImageNormalizer, /normalizeClientImage\(file, PROFILE_IMAGE_OPTIONS\)/);
});

test("mobile profile tabs coordinate with thresholded shell visibility", () => {
  assert.match(mobileChromeVisibility, /HIDE_AFTER_DISTANCE = 52/);
  assert.match(mobileChromeVisibility, /SHOW_AFTER_DISTANCE = 32/);
  assert.match(mobileShellEvents, /mobile-shell:chrome-visibility/);
  assert.match(mobileChromeHidden, /MOBILE_CHROME_VISIBILITY_EVENT/);
  assert.match(ownerProfilePage, /useMobileChromeHidden/);
  assert.match(ownerProfilePage, /className="sticky z-30/);
  assert.match(ownerProfilePage, /env\(safe-area-inset-top\)/);
  assert.match(ownerProfilePage, /layoutId="profile-active-tab"/);
  assert.match(ownerProfilePage, /prefers-reduced-motion|useReducedMotion/);
});

test("mobile authentication surfaces use dynamic viewport and safe-area behavior", () => {
  assert.match(authLayout, /min-h-dvh/);
  assert.match(authLayout, /safe-area-inset-top/);
  assert.match(authLayout, /safe-area-inset-bottom/);
  assert.match(authCard, /sm:rounded-xl/);
  assert.match(mobileShellAuthDrawer, /max-h-\[92dvh\]/);
  assert.match(mobileShellAuthDrawer, /overscroll-contain/);
  assert.match(mobileShellAuthDrawer, /safe-area-inset-bottom/);
  assert.match(mobileShellAuthDrawer, /nextPath=\{returnPath\}/);
  assert.match(mobileShellAuthDrawer, /onAuthenticated=\{onAuthenticated\}/);
});

test("profile status labels use approved Persian wording", () => {
  assert.match(profileEntryStatus, /DRAFT:[\s\S]*پیش‌نویس/);
  assert.match(profileEntryStatus, /PENDING_REVIEW:[\s\S]*در انتظار بررسی/);
  assert.match(profileEntryStatus, /CHANGES_REQUESTED:[\s\S]*نیازمند اصلاح/);
  assert.match(profileEntryStatus, /PUBLISHED:[\s\S]*منتشرشده/);
  assert.match(profileEntryStatus, /REJECTED:[\s\S]*ردشده/);
  assert.match(profileEntryStatus, /HIDDEN:[\s\S]*پنهان/);
  assert.match(profileEntryStatus, /ARCHIVED:[\s\S]*بایگانی‌شده/);
});

test("profile stats use the backend profile counts for entries comments and bookmarks", () => {
  assert.match(profileApi, /async function getMyProfileStats/);
  assert.match(profileApi, /\/profile\/me\/stats/);
  assert.match(profileEntryHooks, /getMyProfileStats/);
  assert.match(ownerProfilePage, /stats\.entries/);
  assert.match(ownerProfilePage, /stats\.comments/);
  assert.match(ownerProfilePage, /stats\.bookmarks/);
  assert.doesNotMatch(ownerProfilePage, /۸ دیدگاه|۲۴ ذخیره/);
});

test("comments and bookmarks tabs integrate profile backend endpoints", () => {
  assert.match(profileApi, /async function listMyProfileComments/);
  assert.match(profileApi, /\/profile\/me\/comments/);
  assert.match(profileApi, /async function listMyProfileBookmarks/);
  assert.match(profileApi, /\/profile\/me\/bookmarks/);
  assert.match(profileEntryHooks, /useOwnerComments/);
  assert.match(profileEntryHooks, /useOwnerBookmarks/);
  assert.match(ownerProfilePage, /OwnerCommentsPanel/);
  assert.match(ownerProfilePage, /OwnerBookmarksPanel/);
  assert.doesNotMatch(ownerProfilePage, /فعلاً داده ساختگی نشان نمی‌دهد/);
});

test("verified-email and role gates are opt-in frontend UX gates", () => {
  assert.match(routeGates, /function RequireVerifiedEmail/);
  assert.match(routeGates, /!user\?\.emailVerified/);
  assert.match(routeGates, /function RequireRole/);
  assert.match(routeGates, /roles\.includes\(user\.role\)/);
  assert.match(verifiedEmailBanner, /برای افزودن مطلب، نوشتن دیدگاه و فرستادن گزارش/);
});

test("create entry route is private, verified-email gated, and noindexed", () => {
  assert.match(createEntryPage, /robots: \{/);
  assert.match(createEntryPage, /index: false/);
  assert.match(createEntryPage, /RequireAuth/);
  assert.match(createEntryPage, /RequireVerifiedEmail/);
  assert.match(createEntryPage, /getContributionTaxonomyData\(\)/);
  assert.match(createEntryPage, /<CreateEntryForm taxonomy=\{taxonomy\} \/>/);
  assert.match(createEntryLoading, /NewEntryLoading/);
  assert.match(createEntryLoading, /Skeleton/);
});

test("create entry editor keeps writing first with contextual Tiptap tools", () => {
  assert.match(createEntryEditorLayout, /مطلب جدید/);
  assert.match(createEntryWritingSurface, /عنوان مطلب/);
  assert.match(createEntryWritingSurface, /خلاصه/);
  assert.match(createEntryWritingSurface, /متن مطلب را بنویسید/);
  assert.match(createEntryWritingSurface, /toolbarMode="responsive"/);
  assert.match(createEntryWritingSurface, /min-h-\[62dvh\]/);
  assert.match(
    richTextEditor,
    /toolbarMode\?: "always" \| "toggle" \| "bubble" \| "responsive" \| "hidden"/,
  );
  assert.match(richTextEditor, /BubbleMenu/);
  assert.match(richTextEditor, /EditorBubbleToolbar/);
  assert.match(richTextEditor, /MobileEditorToolbar/);
  assert.match(richTextEditor, /data-mobile-editor-toolbar/);
  assert.match(virtualKeyboardHook, /window\.visualViewport/);
  assert.match(richTextEditor, /ابزارهای بیشتر/);
  assert.match(richTextEditor, /setLink\(\{ href: nextUrl \}\)/);
});

test("create entry secondary sections are collapsed and editorial", () => {
  assert.match(createEntryEditorLayout, /function CreateEntryEditorSection/);
  assert.match(createEntryEditorLayout, /useState\(false\)/);
  assert.match(createEntryForm, /جزئیات مطلب/);
  assert.match(createEntryForm, /تصاویر/);
  assert.match(createEntryForm, /منابع/);
  assert.match(createEntryForm, /ویدیوی مرتبط/);
  assert.match(createEntryEditorLayout, /AnimatePresence/);
  assert.match(createEntryForm, /LazyMotion/);
});

test("create entry validation covers geography, metadata, and submission readiness", () => {
  assert.match(createEntrySchema, /GEOGRAPHIC_SCOPE_VALUES = \["PROVINCE", "NATIONAL", "NONE"\]/);
  assert.match(createEntrySchema, /برای مطلب وابسته به یک ولایت، ولایت را انتخاب کنید/);
  assert.match(createEntrySchema, /برای این محدوده جغرافیایی، ولایت نباید انتخاب شود/);
  assert.match(createEntrySchema, /موضوع را انتخاب کنید/);
  assert.match(createEntrySchema, /نوع مطلب را انتخاب کنید/);
  assert.match(createEntrySchema, /نشانی یوتیوب معتبر وارد کنید/);
  assert.match(tiptapContentUtils, /extractTiptapPlainText/);
});

test("create entry uses searchable selects and multi-select tags without new storage", () => {
  assert.match(createEntrySelect, /options\.length > 10/);
  assert.match(createEntrySelect, /SearchableCreateEntrySelect/);
  assert.match(createEntrySelect, /<Combobox/);
  assert.match(createEntrySelect, /<Select/);
  assert.match(createEntrySelect, /optionMatchesSearch/);
  assert.match(createEntrySelect, /itemToStringLabel/);
  assert.match(createEntrySelect, /isItemEqualToValue/);
  assert.match(shadcnCombobox, /@base-ui\/react\/combobox/);
  assert.match(shadcnCombobox, /ComboboxPrimitive\.Input/);
  assert.match(shadcnCombobox, /data-selected:bg-primary\/10/);
  assert.match(createEntrySelect, /selectedValues/);
  assert.match(createEntrySelect, /normalizePersianSearch/);
  assert.match(persianUtils, /replaceAll\("ي", "ی"\)/);
  assert.match(persianUtils, /replaceAll\("ك", "ک"\)/);
  assert.match(createEntrySelect, /selectedValues\.includes\(option\.value\)/);
  assert.doesNotMatch(createEntryForm, /localStorage|sessionStorage|IndexedDB|document\.cookie/);
});

test("create entry API integration uses existing backend draft contracts", () => {
  assert.match(entryDraftsApi, /apiRequest<EntryResponse>\("\/entries"/);
  assert.match(entryDraftsApi, /apiRequest<EntryResponse>\(`\/me\/entries\/\$\{entryId\}`/);
  assert.match(entryDraftsApi, /\/me\/entries\/\$\{entryId\}\/submit/);
  assert.match(entryDraftsApi, /\/me\/entries\/\$\{entryId\}\/tags/);
  assert.match(entryDraftsApi, /\/me\/entries\/\$\{entryId\}\/sources/);
  assert.match(entryDraftsApi, /\/me\/entries\/\$\{entryId\}\/images/);
  assert.match(entryDraftsApi, /\/me\/entries\/\$\{entryId\}\/youtube-video/);
  assert.match(entryDraftsApi, /\/entries\/youtube-metadata/);
  assert.match(youtubeMetadataHook, /YOUTUBE_METADATA_DEBOUNCE_MS = 650/);
  assert.match(youtubeMetadataHook, /signal/);
  assert.match(createEntrySections, /lastProcessedVideoIdRef/);
  assert.match(createEntrySections, /عنوان و توضیح ویدیو دریافت شد/);
  assert.match(contributionTaxonomyApi, /\/taxonomy\/districts\?limit=500/);
  assert.match(createEntryForm, /submitEntryForReview\(savedDraft\.id\)/);
  assert.match(
    createEntryForm,
    /revisionMode \? "تغییرات برای بررسی فرستاده شد\." : "مطلب برای بررسی فرستاده شد\."/,
  );
});

test("create entry supports sources, image staging, and unsaved-change warning", () => {
  assert.match(createEntryForm, /useFieldArray/);
  assert.match(createEntrySections, /function SourceFields/);
  assert.match(stagedEntryImagesHook, /selectImages/);
  assert.match(stagedEntryImagesHook, /moveImage/);
  assert.match(createEntrySections, /sourceFields\.move/);
  assert.match(stagedEntryImagesHook, /uploadEntryImage/);
  assert.match(createEntryForm, /beforeunload/);
  assert.match(createEntrySections, /permissionConfirmed/);
  assert.match(createEntrySections, /editingSourceIndex/);
  assert.match(createEntrySections, /editingImageId/);
  assert.match(createEntrySections, /<Drawer/);
});

test("create entry has an app-like mobile shell, preview, and readiness flow", () => {
  assert.match(createEntryEditorLayout, /MobileEditorSaveAction/);
  assert.match(createEntryEditorLayout, /env\(safe-area-inset-bottom\)/);
  assert.match(createEntryForm, /openMobileSection/);
  assert.match(createEntryForm, /getReadinessIssues/);
  assert.match(createEntryForm, /latestModerationReview\?\.comments/);
  assert.match(createEntryOverlays, /EntryPreviewDialog/);
  assert.match(createEntryOverlays, /SubmissionReadinessDrawer/);
  assert.match(createEntryOverlays, /UnsavedEntryDialog/);
  assert.match(createEntryOverlays, /TiptapDocument/);
  assert.doesNotMatch(createEntryForm, /localStorage|sessionStorage|IndexedDB/);
});

test("role-aware navigation reflects auth state without becoming authorization", () => {
  assert.match(authNavigation, /\/login/);
  assert.match(authNavigation, /\/register/);
  assert.match(authNavigation, /\/profile/);
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
  assert.match(authQuery, /"profile"/);
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
  assert.match(homeApi, /next: \{ revalidate: 120, tags \}/);
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

test("homepage uses Motion scroll reveals with reduced-motion support", () => {
  assert.match(homeContent, /ScrollReveal/);
  assert.match(homeScrollReveal, /"use client"/);
  assert.match(homeScrollReveal, /motion\.section/);
  assert.match(homeScrollReveal, /whileInView/);
  assert.match(homeScrollReveal, /viewport=\{\{ once: true, amount \}\}/);
  assert.match(homeScrollReveal, /useReducedMotion/);
  assert.match(homeScrollReveal, /prefersReducedMotion/);
});

test("homepage floating header uses solid controls instead of a glass nav pill", () => {
  assert.match(homeHero, /<PublicHeader variant="hero" \/>/);
  assert.match(publicHeader, /bg-transparent/);
  assert.match(publicHeader, /bg-background/);
  assert.match(publicHeader, /bg-primary/);
  assert.match(publicHeader, /میراث افغانستان/);
  assert.match(publicHeader, /مطالب/);
  assert.match(publicHeader, /جست‌وجو در فرهنگ افغانستان/);
  assert.match(publicHeader, /افزودن مطلب/);
  assert.match(publicHeader, /ثبت‌نام/);
});

test("homepage header compacts on scroll while preserving logo, search, and actions", () => {
  assert.match(publicHeader, /isHeaderCompact/);
  assert.match(publicHeader, /window\.scrollY > 120/);
  assert.match(publicHeader, /max-w-260 gap-2 border border-border bg-card/);
  assert.match(publicHeader, /h-9 min-w-0 border-border bg-card/);
  assert.match(publicHeader, /<HeaderAuthControls isCompact=\{isCompact\} \/>/);
});

test("homepage mobile navigation uses a shadcn Sheet sidebar", () => {
  assert.match(publicHeader, /function MobileNavigation/);
  assert.match(publicHeader, /<Sheet open=\{isOpen\} onOpenChange=\{setIsOpen\}>/);
  assert.match(publicHeader, /side="right"/);
  assert.match(publicHeader, /باز کردن منوی ناوبری/);
  assert.match(publicHeader, /ناوبری موبایل/);
  assert.match(publicHeader, /focus-within:ring-3/);
  assert.match(sheet, /Dialog as SheetPrimitive/);
  assert.match(sheet, /XMarkIcon/);
});

test("public shell provides the shared header for header-linked pages", () => {
  assert.match(publicLayout, /<PublicHeader \/>/);
  assert.match(explorePage, /getPublishedEntries\(query\)/);
  assert.match(entryDetailPage, /getPublishedEntryBySlug\(slug\)/);
  assert.match(provincesPage, /ProvinceIndexContent/);
  assert.match(categoriesPage, /CategoriesIndexContent/);
});

test("public content pages use the shared shadcn breadcrumb pattern", () => {
  assert.match(shadcnBreadcrumb, /function Breadcrumb/);
  assert.match(shadcnBreadcrumb, /function BreadcrumbList/);
  assert.match(shadcnBreadcrumb, /function BreadcrumbPage/);
  assert.match(pageBreadcrumb, /BreadcrumbList/);
  assert.match(pageBreadcrumb, /aria-label="مسیر صفحه"/);
  assert.match(exploreContent, /<PageBreadcrumb items=\{\[/);
  assert.match(entryDetailContent, /<EntryDetailBreadcrumb/);
  assert.match(entryDetailBreadcrumb, /<PageBreadcrumb/);
  assert.match(taxonomyDiscoveryPages, /<PageBreadcrumb/);
  assert.doesNotMatch(exploreContent, /بازگشت به خانه/);
  assert.doesNotMatch(entryDetailContent, /بازگشت به مطالب/);
});

test("public routes provide skeleton loading and controlled error states", () => {
  assert.match(publicError, /این صفحه بارگذاری نشد/);
  assert.match(publicError, /reset/);
  assert.match(publicError, /بازگشت به خانه/);
  assert.match(exploreLoading, /ExploreLoading/);
  assert.match(exploreLoading, /Skeleton/);
  assert.match(exploreLoading, /lg:grid-cols-\[320px_1fr\]/);
  assert.match(entryDetailLoading, /EntryDetailLoading/);
  assert.match(entryDetailLoading, /lg:grid-cols-\[56px_minmax\(0,760px\)_320px\]/);
  assert.match(entryDetailLoading, /aria-label="در حال بارگذاری مطلب"/);
  assert.match(provincesLoading, /Skeleton/);
  assert.match(categoriesLoading, /Skeleton/);
  assert.match(provinceDetailLoading, /ProvinceDetailLoading/);
  assert.match(categoryDetailLoading, /CategoryDetailLoading/);
});

test("homepage footer matches the attached full-width footer design", () => {
  assert.match(homeFooter, /w-full border-t border-border bg-background/);
  assert.match(homeFooter, /میراث افغانستان/);
  assert.match(homeFooter, /فرهنگ، تاریخ، هویت ما/);
  assert.match(homeFooter, /دسترسی سریع/);
  assert.match(homeFooter, /منابع/);
  assert.match(homeFooter, /تازه‌های میراث افغانستان/);
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
  assert.match(explorePage, /search: getOptionalSearchParam\(searchParams\.search\)/);
  assert.doesNotMatch(explorePage, /console\.log/);
  assert.match(exploreApi, /\/entries\?\$\{searchParams\.toString\(\)\}/);
  assert.match(exploreApi, /setOptionalSearchParam\(searchParams, "search", query\.search\)/);
  assert.match(exploreApi, /\/taxonomy\/provinces\?limit=100/);
  assert.match(exploreApi, /\/taxonomy\/categories\?limit=100/);
  assert.match(exploreApi, /\/taxonomy\/content-types\?limit=100/);
  assert.match(exploreApi, /function getPublishedEntryCount/);
  assert.match(exploreFilterForm, /router\.push\(nextHref, \{ scroll: false \}\)/);
  assert.match(exploreFilterForm, /name="provinceSlug"/);
  assert.match(exploreFilterForm, /name="categorySlug"/);
  assert.match(exploreFilterForm, /name="contentTypeSlug"/);
  assert.doesNotMatch(exploreFilterForm, /name="geographicScope"/);
  assert.match(exploreFilterForm, /<Select/);
  assert.match(exploreFilterSheet, /<Drawer/);
  assert.match(exploreFilterSheet, /showSwipeHandle/);
  assert.match(exploreResultsPanel, /جست‌وجوی مکان، مشاهیر، رسم یا موضوع/);
  assert.match(exploreResultsPanel, /router\.replace/);
  assert.match(exploreResultsPanel, /search: normalizedSearch \|\| undefined/);
  assert.match(exploreResultsPanel, /window\.setTimeout/);
  assert.doesNotMatch(exploreResultsPanel, /entryMatchesSearch|entries\.filter/);
  assert.match(exploreResultsPanel, /PublicEntryCardView/);
  assert.match(exploreResultsPanel, /motion\.div/);
  assert.match(publicEntryCard, /function PublicEntryCardView/);
  assert.doesNotMatch(exploreContent, /console\.log/);
});

test("province and category discovery pages match the approved taxonomy designs", () => {
  assert.match(provincesPage, /getPublicProvinces/);
  assert.match(provincesPage, /geographicScope: "PROVINCE"/);
  assert.match(categoriesPage, /getPublicCategories/);
  assert.match(taxonomyDiscoveryPages, /فرهنگ افغانستان بر اساس ولایت/);
  assert.match(taxonomyDiscoveryPages, /با فرهنگ و میراث ولایت‌های افغانستان آشنا شوید/);
  assert.match(taxonomyDiscoveryPages, /مطالب بر اساس موضوع/);
  assert.match(taxonomyDiscoveryPages, /مطالب فرهنگی افغانستان را بر اساس موضوع ببینید/);
  assert.match(taxonomyDiscoveryPages, /ProvinceSearchGrid/);
  assert.match(taxonomyDiscoveryPages, /FilterableEntryResults/);
  assert.match(provinceSearchGrid, /function ProvinceCard/);
  assert.match(provinceSearchGrid, /aspect-\[4\/5\]/);
  assert.match(provinceSearchGrid, /from-black\/78/);
  assert.match(provinceSearchGrid, /bg-white\/16/);
  assert.match(taxonomyDiscoveryPages, /CategoryCard/);
  assert.match(taxonomyDiscoveryPages, /\/images\/star-icon\.png/);
  assert.match(provinceImages, /\/images\/provinces\/herat\.jpg/);
  assert.match(provinceImages, /\/images\/provinces\/bamyan\.webp/);
  assert.match(provinceImages, /\/images\/provinces\/jawzjan\.jpeg/);
  assert.match(provinceImages, /\/images\/provinces\/saripul\.jpg/);
  assert.match(provinceImages, /\/images\/province-placeholder\.png/);
});

test("province index supports local search with Motion layout animation", () => {
  assert.match(provinceSearchGrid, /"use client"/);
  assert.match(provinceSearchGrid, /type="search"/);
  assert.match(provinceSearchGrid, /جست‌وجوی ولایت/);
  assert.match(provinceSearchGrid, /filteredProvinces/);
  assert.match(provinceSearchGrid, /AnimatePresence/);
  assert.match(provinceSearchGrid, /motion\.div layout/);
  assert.match(provinceSearchGrid, /mode="popLayout"/);
  assert.match(provinceSearchGrid, /ولایتی پیدا نشد/);
});

test("province detail filters only provincial entries and reuses entry cards", () => {
  assert.match(provinceDetailPage, /ProvinceDetailContent/);
  assert.match(provinceDetailPage, /findTaxonomyItemByRouteSegment/);
  assert.match(provinceDetailPage, /geographicScope: "PROVINCE"/);
  assert.match(provinceDetailPage, /provinceSlug: province\.slug/);
  assert.match(provinceDetailPage, /categorySlug: selectedCategorySlug/);
  assert.match(taxonomyDiscoveryPages, /فرهنگ و میراث/);
  assert.match(taxonomyDiscoveryPages, /FilterableEntryResults/);
  assert.match(animatedEntryGrid, /PublicEntryCardView/);
  assert.match(animatedEntryGrid, /AnimatePresence/);
  assert.match(animatedEntryGrid, /motion\.div layout/);
  assert.match(filterableEntryResults, /FilterTabs/);
  assert.match(filterableEntryResults, /type="search"/);
  assert.match(filterableEntryResults, /جست‌وجو در نتایج/);
  assert.match(filterableEntryResults, /filteredEntries/);
  assert.match(filterableEntryResults, /AnimatedEntryGrid entries=\{filteredEntries\}/);
  assert.match(filterTabs, /TabsList/);
  assert.match(filterTabs, /role="tab"/);
  assert.match(filterTabs, /scroll=\{false\}/);
  assert.match(filterTabs, /layoutId="taxonomy-filter-active-tab"/);
  assert.match(filterTabs, /type: "spring"/);
  assert.match(shadcnTabs, /function Tabs/);
  assert.match(taxonomyDiscoveryPages, /هنوز مطلبی برای این ولایت منتشر نشده است/);
});

test("category detail supports province and national filters without popularity sort", () => {
  assert.match(categoryDetailPage, /CategoryDetailContent/);
  assert.match(categoryDetailPage, /geographicScope: "NATIONAL"/);
  assert.match(categoryDetailPage, /provinceSlug: province\.slug/);
  assert.match(categoryDetailPage, /recentlyUpdated/);
  assert.doesNotMatch(categoryDetailPage, /popular|popularity|محبوب‌ترین/);
  assert.match(taxonomyDiscoveryPages, /همه افغانستان/);
  assert.match(taxonomyDiscoveryPages, /سراسری/);
  assert.match(taxonomyDiscoveryPages, /بر اساس ولایت/);
});

test("entry detail page renders published entry data by Persian slug", () => {
  assert.match(entryDetailPage, /getPublishedEntryBySlug\(slug\)/);
  assert.match(entryDetailPage, /getPublicEntryComments\(entry\.id, entry\.commentCount\)/);
  assert.doesNotMatch(entryDetailPage, /searchParams/);
  assert.match(entryDetailPage, /createEntryDetailBreadcrumbItems/);
  assert.match(entryDetailContent, /breadcrumbItems: PageBreadcrumbItem\[\]/);
  assert.match(entryDetailContent, /<EntryDetailBreadcrumb/);
  assert.match(entryDetailPage, /notFound\(\)/);
  assert.match(entryDetailPage, /generateMetadata/);
  assert.match(exploreApi, /\/entries\/\$\{encodeURIComponent\(normalizeSlug\(slug\)\)\}/);
  assert.match(exploreApi, /\/entries\/\$\{entryId\}\/comments/);
  assert.match(exploreApi, /cache: "no-store"/);
  assert.match(entryDetailContent, /TiptapDocument/);
  assert.match(tiptapDocumentRenderer, /function TiptapDocument/);
  assert.match(tiptapDocumentRenderer, /case "paragraph"/);
  assert.match(tiptapDocumentRenderer, /case "heading"/);
  assert.match(tiptapDocumentRenderer, /case "internalEntryLink"/);
  assert.match(entryDetailContent, /YouTubeEmbed/);
  assert.match(entryDetailContent, /SourcesList/);
  assert.match(entryDetailContent, /ReferenceCard/);
  assert.match(entryDetailContent, /IncomingReferences/);
});

test("entry cards preserve safe breadcrumb context from their source page", () => {
  assert.match(publicEntryCard, /breadcrumbParent\?: EntryBreadcrumbContext/);
  assert.match(publicEntryCard, /createEntryHref\(entry\)/);
  assert.match(publicEntryCard, /data-entry-breadcrumb-context/);
  assert.match(publicEntryCard, /serializeEntryBreadcrumbContext\(breadcrumbParent\)/);
  assert.doesNotMatch(entryBreadcrumb, /breadcrumbLabel|breadcrumbHref|URLSearchParams/);
  assert.match(entryBreadcrumb, /entryBreadcrumbStoragePrefix/);
  assert.match(entryBreadcrumb, /isSafeInternalHref/);
  assert.match(entryBreadcrumb, /!href\.startsWith\("\/\/"\)/);
  assert.match(entryBreadcrumb, /label: "مطالب"/);
  assert.match(publicLayout, /<EntryBreadcrumbTracker \/>/);
  assert.match(entryBreadcrumbTracker, /window\.sessionStorage\.setItem/);
  assert.match(entryBreadcrumbTracker, /destination\.origin !== window\.location\.origin/);
  assert.match(entryDetailBreadcrumb, /window\.sessionStorage\.getItem/);
  assert.match(entryDetailBreadcrumb, /createEntryDetailBreadcrumbItems\(entryTitle, parents\)/);
  assert.match(exploreContent, /href: createExploreHref\(query, \{\}\)/);
  assert.match(taxonomyDiscoveryPages, /label: "ولایت‌ها", href: "\/provinces"/);
  assert.match(taxonomyDiscoveryPages, /label: province\.name, href: provinceHref/);
  assert.match(taxonomyDiscoveryPages, /label: "موضوع‌ها", href: "\/categories"/);
  assert.match(taxonomyDiscoveryPages, /label: category\.name, href: categoryHref/);
});

test("entry detail includes reading navigation and sticky article tools", () => {
  assert.match(entryDetailContent, /createTiptapHeadings\(entry\.contentJson\)/);
  assert.match(entryDetailContent, /EntryTableOfContents/);
  assert.match(entryTableOfContents, /فهرست مطالب/);
  assert.match(entryTableOfContents, /IntersectionObserver/);
  assert.match(entryTableOfContents, /aria-expanded=\{isExpanded\}/);
  assert.match(entryTableOfContents, /max-h-80/);
  assert.match(entryTableOfContents, /overflow-y-auto/);
  assert.match(entryTableOfContents, /aria-current=\{isActive \? "location" : undefined\}/);
  assert.match(entryTableOfContents, /border border-primary\/20/);
  assert.match(entryTableOfContents, /event\.preventDefault\(\)/);
  assert.match(entryTableOfContents, /heading\.scrollIntoView/);
  assert.match(entryTableOfContents, /behavior: window\.matchMedia/);
  assert.match(entryTableOfContents, /prefers-reduced-motion: reduce/);
  assert.match(entryTableOfContents, /window\.history\.pushState/);
  assert.match(tiptapDocumentRenderer, /createHeadingId\(headingText, key\)/);
  assert.match(tiptapDocumentRenderer, /id=\{headingId\}/);
  assert.match(
    entryDetailContent,
    /<EntryDetailHeaderContext[\s\S]*title=\{entry\.title\}[\s\S]*hasTableOfContents=\{tableOfContents\.length > 0\}/,
  );
  assert.match(entryHeaderContext, /window\.scrollY > 420/);
  assert.match(entryHeaderContext, /PUBLIC_HEADER_CONTEXT_EVENT/);
  assert.match(entryHeaderContext, /بازگشت به مطالب/);
  assert.match(publicHeader, /HeaderContextContent/);
  assert.match(publicHeader, /transition-all duration-300 ease-out/);
  assert.match(publicHeader, /inert=\{shouldShowHeaderContext\}/);
  assert.match(entryDetailContent, /EntryActionRail/);
  assert.match(entryActionRail, /sticky top-32/);
  assert.match(entryActionRail, /bottom-\[calc\(5rem\+env\(safe-area-inset-bottom\)\)\]/);
  assert.match(entryActionRail, /showMobileDock/);
  assert.match(entryActionRail, /data-entry-intro/);
  assert.match(entryActionRail, /ChatBubbleOvalLeftEllipsisIcon/);
  assert.match(entryActionRail, /HeartIcon/);
  assert.match(entryActionRail, /BookmarkIcon/);
  assert.match(entryActionRail, /ShareIcon/);
  assert.match(entryActionRail, /EntryShareDialog/);
  assert.match(entryActionRail, /scrollHeight - window\.innerHeight/);
  assert.match(entryDetailPage, /<EntryScrollControls \/>/);
  assert.match(entryDetailPage, /<\/PageTransition>\s*<EntryScrollControls \/>/);
  assert.match(entryScrollControls, /رفتن به ابتدای مطلب/);
  assert.match(entryScrollControls, /رفتن به انتهای مطلب/);
  assert.match(entryScrollControls, /prefers-reduced-motion: reduce/);
  assert.match(entryScrollControls, /position: fixed|fixed bottom-5/);
  assert.match(entryScrollControls, /hidden flex-col/);
  assert.match(entryTableOfContents, /variant === "drawer"/);
  assert.match(entryTableOfContents, /OPEN_ENTRY_CONTENTS_EVENT/);
  assert.match(entryTableOfContents, /<Drawer/);
  assert.match(mobileAppShell, /ListBulletIcon/);
  assert.match(mobileAppShell, /OPEN_ENTRY_CONTENTS_EVENT/);
  assert.match(mobileShellEvents, /mobile-shell:open-entry-contents/);
  assert.match(entryDetailContent, /snap-x snap-mandatory/);
  assert.match(mobileAppStyles, /data-mobile-route="entry"/);
  assert.match(commentComposer, /setIsExpanded/);
  assert.match(commentComposer, /onFocus=\{\(\) => setIsExpanded\(true\)\}/);
});

test("entry sharing uses a responsive canonical share surface", () => {
  assert.match(entryShareDialog, /<Drawer/);
  assert.match(entryShareDialog, /<Dialog/);
  assert.match(entryShareDialog, /navigator\.clipboard\.writeText/);
  assert.match(entryShareDialog, /navigator\.share/);
  assert.match(entryShareDialog, /error\.name === "AbortError"/);
  assert.match(entryShareDialog, /کپی پیوند/);
  assert.match(entryShareUtils, /createCanonicalEntryUrl/);
  assert.doesNotMatch(entryShareUtils, /breadcrumb|utm_|searchParams|hash/);
  assert.match(entryShareUtils, /https:\/\/wa\.me/);
  assert.match(entryShareUtils, /https:\/\/t\.me\/share\/url/);
  assert.match(entryShareUtils, /facebook\.com\/sharer/);
  assert.match(entryShareUtils, /twitter\.com\/intent\/tweet/);
  assert.match(entryShareUtils, /mailto:/);
});

test("animated icons use desktop hover and accessible reduced-motion behavior", () => {
  assert.match(animatedIconHook, /\(hover: hover\) and \(pointer: fine\)/);
  assert.match(animatedIconHook, /useReducedMotion/);
  assert.match(animatedIconHook, /onMouseEnter/);
  assert.match(animatedIconHook, /onFocus/);
  assert.match(animatedIconHook, /playStateChange/);
  assert.match(animatedHeartIcon, /startAnimation/);
  assert.match(entryActionRail, /useAnimatedIcon/);
  assert.match(entryActionRail, /playStateChange/);
});

test("entry detail supports threaded comments and verified-user feedback", () => {
  assert.match(entryDetailContent, /EntryComments/);
  assert.doesNotMatch(entryDetailContent, /EntryFeedback|averageRating|ratingCount/);
  assert.doesNotMatch(engagementApi, /\/rating/);
  assert.match(engagementComments, /دیدگاه‌ها/);
  assert.match(engagementComments, /جدیدترین/);
  assert.match(engagementComments, /قدیمی‌ترین/);
  assert.match(engagementComments, /بیشترین پسند/);
  assert.match(engagementComments, /CommentListSkeleton/);
  assert.match(engagementComments, /commentsQuery\.isError/);
  assert.match(engagementComments, /هنوز دیدگاهی نوشته نشده است/);
  assert.match(commentThread, /CommentReplies/);
  assert.match(commentThread, /مشاهده \{formatPersianNumber\(comment\.directReplyCount\)\} پاسخ/);
  assert.match(commentThread, /isEntryAuthor/);
  assert.match(commentThread, /useReducedMotion/);
  assert.match(commentMenu, /CommentDeleteDialog/);
  assert.match(commentMenu, /ReportSheet/);
});

test("entry engagement API uses confirmed like bookmark and comment contracts", () => {
  assert.match(engagementApi, /\/entries\/\$\{entryId\}\/like/);
  assert.match(engagementApi, /method: "PUT"/);
  assert.match(engagementApi, /method: "DELETE"/);
  assert.match(engagementApi, /\/profile\/me\/bookmarks\/\$\{entryId\}/);
  assert.match(engagementApi, /\/entries\/\$\{entryId\}\/comments/);
  assert.match(engagementApi, /\/comments\/\$\{commentId\}\/replies/);
  assert.match(engagementApi, /\/comment-interactions/);
  assert.match(engagementApi, /function createEntryComment/);
  assert.match(engagementApi, /function updateEntryComment/);
  assert.match(engagementApi, /function deleteEntryComment/);
  assert.match(engagementApi, /function likeComment/);
  assert.match(engagementApi, /function unlikeComment/);
  assert.doesNotMatch(engagementApi, /current-review|toggle-like/);
});

test("like and bookmark mutations optimistically update rollback and reconcile", () => {
  assert.match(engagementInteractions, /cancelQueries/);
  assert.match(engagementInteractions, /getQueryData<EntryLikeState>/);
  assert.match(engagementInteractions, /getQueryData<EntryBookmarkState>/);
  assert.match(engagementInteractions, /context\?\.previous \?\? fallbackState/);
  assert.match(engagementInteractions, /onSuccess:.*serverState/s);
  assert.match(engagementInteractions, /invalidateQueries\(\{ queryKey, exact: true \}\)/);
  assert.match(engagementInteractions, /actionLock\.current/);
  assert.match(entryActionRail, /aria-pressed=\{active\}/);
  assert.match(entryActionRail, /aria-busy=\{pending\}/);
  assert.match(entryActionRail, /like\.likeCount/);
  assert.match(entryActionRail, /bookmark\.bookmarkCount/);
});

test("engagement access uses one contextual dialog and safe temporary intents", () => {
  assert.match(entryDetailPage, /<EngagementAccessProvider/);
  assert.match(engagementAccess, /EngagementAccessContext/);
  assert.match(engagementAccessProvider, /ensureVerifiedAccess/);
  assert.match(engagementAccessProvider, /readPendingEngagementIntent/);
  assert.match(engagementAccessProvider, /takePendingToggleIntent/);
  assert.match(engagementAccessProvider, /getCurrentUser/);
  assert.match(engagementAccessProvider, /subscribeToAuthEvents/);
  assert.match(engagementAccessDialog, /<Dialog/);
  assert.match(engagementAccessDialog, /<Drawer/);
  assert.match(engagementAccessDialog, /showSwipeHandle/);
  assert.match(engagementAccessDialog, /<LoginForm/);
  assert.match(engagementAccessDialog, /<RegisterForm/);
  assert.match(engagementAccessDialog, /nextPath=\{returnPath\}/);
  assert.match(loginForm, /onAuthenticated/);
  assert.match(registerForm, /onAuthenticated/);
  assert.match(engagementAccessDialog, /<EmailVerificationButton/);
  assert.match(engagementAccessDialog, /در حال حاضر امکان انجام این کار وجود ندارد/);
  assert.match(pendingEngagementIntent, /window\.sessionStorage/);
  assert.match(pendingEngagementIntent, /PENDING_ENGAGEMENT_INTENT_TTL_MS = 30 \* 60 \* 1000/);
  assert.match(pendingEngagementIntent, /parsed\.entryId !== entryId/);
  assert.match(pendingEngagementIntent, /isSafeEntryReturnPath/);
  assert.doesNotMatch(pendingEngagementIntent, /accessToken|refreshToken|document\.cookie/);
  assert.match(engagementErrors, /AUTH_ACCOUNT_SUSPENDED/);
  assert.match(engagementErrors, /TOO_MANY_REQUESTS/);
  assert.match(engagementErrors, /NETWORK_ERROR/);
});

test("comment mutations preserve server truth and synchronize focused caches", () => {
  assert.match(engagementCommentsHook, /useCreateComment/);
  assert.match(engagementCommentsHook, /useUpdateComment/);
  assert.match(engagementCommentsHook, /useDeleteComment/);
  assert.match(engagementCommentsHook, /useCommentLike/);
  assert.match(engagementCommentsHook, /profileQueryKeys\.commentLists\(\)/);
  assert.match(engagementCommentsHook, /profileQueryKeys\.stats\(\)/);
  assert.match(engagementCommentsHook, /engagementQueryKeys\.commentReplies/);
  assert.match(engagementCommentsHook, /cancelQueries/);
  assert.match(engagementCommentsHook, /restoreCommentListSnapshots/);
  assert.match(commentComposer, /fieldErrors\.find/);
  assert.match(commentComposer, /mode !== "edit"/);
  assert.match(engagementComments, /initialBody=\{pendingRootComment\?\.body \?\? ""\}/);
  assert.match(engagementComments, /kind: "comment", body/);
  assert.match(commentThread, /parentId: comment\.id/);
  assert.match(commentThread, /initialBody=\{pendingReply\?\.body \?\? ""\}/);
  assert.match(commentComposer, /<CommentEmojiPicker/);
  assert.match(commentComposer, /setSelectionRange\(nextCursorPosition, nextCursorPosition\)/);
  assert.match(commentComposer, /setValue\("body", nextBody/);
  assert.match(commentEmojiPicker, /PopoverTrigger/);
  assert.match(commentEmojiPicker, /aria-label="افزودن شکلک"/);
  assert.match(commentEmojiPicker, /lazy\(\(\) =>/);
  assert.match(commentEmojiPickerContent, /onEmojiSelect/);
  assert.match(shadcnEmojiPicker, /EmojiPickerPrimitive\.List/);
  assert.match(commentSchema, /min\(5/);
  assert.match(commentSchema, /max\(1000/);
});

test("engagement query keys are scoped and Profile invalidation remains precise", () => {
  assert.match(engagementQueryKeys, /entry-engagement/);
  assert.match(engagementQueryKeys, /like:/);
  assert.match(engagementQueryKeys, /bookmark:/);
  assert.match(engagementQueryKeys, /commentRoots:/);
  assert.match(engagementQueryKeys, /commentReplies:/);
  assert.match(engagementQueryKeys, /commentInteractions:/);
  assert.match(engagementInteractions, /profileQueryKeys\.bookmarkLists\(\)/);
  assert.match(engagementInteractions, /profileQueryKeys\.stats\(\)/);
  assert.doesNotMatch(engagementInteractions, /clear\(\)|removeQueries\(\)/);
});

test("moderation routes require authenticated verified moderator or admin access", () => {
  assert.match(moderationQueuePage, /RequireAuth/);
  assert.match(moderationQueuePage, /RequireRole roles=\{\["MODERATOR", "ADMIN"\]\}/);
  assert.match(moderationQueuePage, /RequireVerifiedEmail/);
  assert.match(moderationQueuePage, /index: false/);
  assert.match(moderationReviewRoute, /RequireRole roles=\{\["MODERATOR", "ADMIN"\]\}/);
});

test("moderation API uses the confirmed queue detail and decision endpoints", () => {
  assert.match(moderationApi, /\/moderation\/submissions\?/);
  assert.match(moderationApi, /\/moderation\/submissions\/\$\{entryId\}/);
  assert.match(moderationApi, /APPROVE: "approve"/);
  assert.match(moderationApi, /REQUEST_CHANGES: "request-changes"/);
  assert.match(moderationApi, /REJECT: "reject"/);
  assert.doesNotMatch(moderationApi, /publish-directly|force-publish/);
});

test("moderation queue supports backend filters pagination and complete states", () => {
  assert.match(moderationQuery, /provinceId/);
  assert.match(moderationQuery, /categoryId/);
  assert.match(moderationQuery, /contentTypeId/);
  assert.match(moderationQuery, /sortDirection/);
  assert.match(moderationQueue, /ModerationQueueSkeleton/);
  assert.match(moderationQueue, /ModerationQueueEmpty/);
  assert.match(moderationQueue, /ModerationQueueError/);
  assert.match(moderationQueue, /ModerationPagination/);
  assert.match(moderationQueue, /بررسی مطلب/);
});

test("moderation review renders the immutable submitted snapshot", () => {
  assert.match(moderationMapper, /submittedVersion\?\.snapshot/);
  assert.match(moderationReviewPage, /submission\.snapshot as ModerationSnapshot/);
  assert.match(moderationReviewPage, /TiptapDocument content=\{snapshot\.contentJson\}/);
  assert.match(moderationReviewPage, /ModerationImageGallery/);
  assert.match(moderationReviewPage, /ModerationSources/);
  assert.match(moderationReviewPage, /ModerationVideo/);
  assert.match(moderationReviewPage, /versionNumber/);
});

test("moderation decisions wait for the server and prevent duplicates", () => {
  assert.match(moderationHooks, /useMutation/);
  assert.match(moderationReviewPage, /await mutation\.mutateAsync/);
  assert.match(moderationReviewPage, /disabled=\{mutation\.isPending/);
  assert.match(moderationDecisionDialog, /disabled=\{isPending\}/);
  assert.match(moderationDecisionDialog, /moderationReasonSchema/);
  assert.match(moderationDecisionDialog, /فرستادن برای اصلاح/);
  assert.match(moderationDecisionDialog, /رد مطلب/);
});

test("self approval and stale moderation errors have controlled behavior", () => {
  assert.match(moderationReviewPage, /isOwnSubmission/);
  assert.match(moderationReviewPage, /تأیید مطلب خودتان مجاز نیست/);
  assert.match(moderationErrors, /MODERATION_SELF_APPROVAL_FORBIDDEN/);
  assert.match(moderationErrors, /MODERATION_ALREADY_DECIDED/);
  assert.match(moderationErrors, /MODERATION_CONFLICT/);
  assert.match(moderationReviewPage, /isStaleModerationError/);
});

test("moderation decisions refresh precise private query families", () => {
  assert.match(moderationHooks, /moderationKeys\.lists\(\)/);
  assert.match(moderationHooks, /profileQueryKeys\.all/);
  assert.match(moderationHooks, /\["entry-draft", input\.entryId\]/);
  assert.doesNotMatch(moderationHooks, /queryClient\.clear\(\)/);
});

test("requested changes return to the same editor and can be resubmitted", () => {
  assert.match(ownerProfilePage, /entry\.latestModerationReview\.comments/);
  assert.match(ownerProfilePage, /نظر بررسی‌کننده/);
  assert.match(ownerProfilePage, /href=\{`\/entries\/\$\{entry\.id\}\/edit`\}/);
  assert.match(createEntryForm, /submitEntryForReview\(savedDraft\.id\)/);
  assert.match(createEntryForm, /status=PENDING_REVIEW/);
});

test("remaining moderator routes use the existing role and verification gates", () => {
  for (const route of [correctionRoute, reportsRoute, historyRoute]) {
    assert.match(route, /RequireAuth/);
    assert.ok(route.includes('<RequireRole roles={["MODERATOR", "ADMIN"]}>'));
    assert.match(route, /RequireVerifiedEmail/);
    assert.match(route, /index: false/);
  }
  assert.match(moderatorNavigation, /پیشنهادهای اصلاح/);
  assert.match(moderatorNavigation, /گزارش‌ها/);
  assert.match(moderatorNavigation, /تاریخچه بررسی/);
});

test("correction and report APIs use confirmed backend contracts", () => {
  assert.match(contentModerationApi, /\/entries\/\$\{entryId\}\/corrections/);
  assert.match(contentModerationApi, /\/entries\/\$\{entryId\}\/reports/);
  assert.match(contentModerationApi, /comments\/\$\{commentId\}\/reports/);
  assert.match(contentModerationApi, /\/moderation\/corrections/);
  assert.match(contentModerationApi, /\/moderation\/reports/);
  assert.match(contentModerationApi, /\/moderation\/history/);
});

test("moderator correction review presents original and proposed content", () => {
  assert.match(contentModerationDetails, /متن فعلی/);
  assert.match(contentModerationDetails, /پیشنهاد کاربر/);
  assert.match(contentModerationDetails, /await mutation\.mutateAsync/);
  assert.match(contentModerationDetails, /disabled=\{mutation\.isPending/);
  assert.match(contentModerationQueues, /CorrectionQueue/);
});

test("reports share one queue and only expose supported resolution actions", () => {
  assert.match(contentModerationQueues, /ENTRY/);
  assert.match(contentModerationQueues, /COMMENT/);
  assert.match(contentModerationDetails, /"DISMISS", "HIDE_COMMENT"/);
  assert.match(contentModerationDetails, /"DISMISS", "HIDE_CONTENT", "ARCHIVE_CONTENT"/);
  assert.doesNotMatch(contentModerationDetails, /ESCALATE_TO_ADMIN|REMOVE_IMAGE|REMOVE_YOUTUBE/);
});

test("community moderation actions preserve failures and require verified access", () => {
  assert.match(
    communityModerationActions,
    /ensureVerifiedAccess\(action === "revision" \? "correction" : action\)/,
  );
  assert.match(communityModerationActions, /useSubmitCorrection/);
  assert.match(communityModerationActions, /useSubmitReport/);
  assert.match(communityModerationActions, /values stay intact|Keep the explanation/);
  assert.match(commentMenu, /ReportSheet/);
});

test("content moderation invalidates focused query families", () => {
  assert.match(contentModerationHooks, /contentModerationKeys\.corrections\(\)/);
  assert.match(contentModerationHooks, /contentModerationKeys\.reports\(\)/);
  assert.match(contentModerationHooks, /engagementQueryKeys\.comments/);
  assert.doesNotMatch(contentModerationHooks, /queryClient\.clear\(\)/);
});

test("admin authorization and noindex policy live at the shared layout boundary", () => {
  assert.match(adminLayout, /RequireAuth/);
  assert.ok(adminLayout.includes('<RequireRole roles={["ADMIN"]}>'));
  assert.match(adminLayout, /robots: \{ index: false, follow: false \}/);
  assert.match(adminLayout, /SidebarProvider/);
  assert.match(adminLayout, /AdminSidebar/);
  assert.match(adminLayout, /AdminHeader/);
  assert.doesNotMatch(adminLayout, /^"use client"/);
});

test("admin navigation is typed centralized and covers every approved destination", () => {
  for (const href of [
    "/admin",
    "/admin/users",
    "/admin/entries",
    "/admin/topics",
    "/admin/content-types",
    "/admin/tags",
    "/admin/provinces",
    "/admin/moderators",
    "/admin/reports",
    "/admin/audit",
    "/admin/settings",
  ]) {
    assert.ok(adminNavigationConfig.includes(`href: "${href}"`));
  }
  assert.match(adminNavigationConfig, /type AdminNavItem/);
  assert.match(adminNavigationConfig, /type AdminNavGroup/);
  assert.match(adminNavigation, /adminNavigation\.map/);
});

test("admin active-route matching supports nested pages and exact overview", () => {
  assert.match(adminRoutes, /targetPath === "\/admin"/);
  assert.match(adminRoutes, /currentPath === targetPath \|\| currentPath\.startsWith/);
  assert.match(adminNavigation, /isAdminRouteActive\(pathname, item\.href\)/);
  assert.match(adminNavigation, /aria-current=\{isActive \? "page" : undefined\}/);
});

test("admin sidebar uses shadcn right-side icon collapse and mobile behavior", () => {
  assert.match(adminSidebar, /side="right"/);
  assert.match(adminSidebar, /dir="rtl"/);
  assert.match(adminSidebar, /collapsible="icon"/);
  assert.match(adminSidebar, /SidebarRail/);
  assert.match(adminNavigation, /setOpenMobile\(false\)/);
  assert.match(shadcnSidebar, /isMobile/);
  assert.match(shadcnSidebar, /SheetContent/);
  assert.match(shadcnSidebar, /TooltipContent/);
});

test("admin sidebar motion preserves stable icons and reduced-motion behavior", () => {
  assert.match(adminNavigation, /layoutId="admin-active-navigation"/);
  assert.match(adminNavigation, /useReducedMotion/);
  assert.match(adminNavigation, /showLabels = isMobile \|\| state === "expanded"/);
  assert.match(shadcnSidebar, /cubic-bezier\(0\.22,1,0\.36,1\)/);
  assert.match(shadcnSidebar, /motion-reduce:duration-0/);
});

test("admin header is reusable and keeps future controls nonfunctional", () => {
  assert.match(adminHeader, /getAdminRouteMeta\(pathname\)/);
  assert.match(adminHeader, /SidebarTrigger/);
  assert.match(adminHeader, /AnimatePresence/);
  assert.match(adminHeader, /key=\{route\.href\}/);
  assert.match(adminHeader, /useReducedMotion/);
  assert.match(adminHeader, /readOnly/);
  assert.match(adminHeader, /useAuthStore/);
  assert.match(adminHeader, /AvatarFallback/);
  assert.doesNotMatch(adminHeader, /apiRequest|useQuery|fetch\(/);
});

test("admin overview uses the real aggregate API with shadcn chart and table", () => {
  assert.match(adminOverviewRoute, /AdminOverviewPage/);
  assert.match(adminOverviewApi, /"\/admin\/overview"/);
  assert.match(adminOverviewHook, /useQuery/);
  assert.match(adminOverviewHook, /staleTime: 60_000/);
  assert.match(adminOverviewPage, /AdminOverviewStatsGrid/);
  assert.match(adminOverviewPage, /AdminOverviewAttention/);
  assert.match(adminOverviewChart, /ChartContainer/);
  assert.match(adminOverviewChart, /AreaChart/);
  assert.match(adminOverviewActivity, /TableHeader/);
  assert.match(adminOverviewActivity, /TableBody/);
});

test("admin users use real server contracts and TanStack Table v9", () => {
  assert.match(adminUsersRoute, /AdminUsersPage/);
  assert.match(adminUserDetailRoute, /AdminUserDetailPage/);
  assert.match(adminUsersApi, /\/admin\/users/);
  assert.match(adminUsersApi, /\/entries/);
  assert.match(adminUsersApi, /\/comments/);
  assert.match(adminUsersApi, /\/activity/);
  assert.match(adminUsersApi, /\/status/);
  assert.match(adminUsersApi, /revoke-sessions/);
  assert.match(adminUsersHooks, /useQuery/);
  assert.match(adminUsersHooks, /useMutation/);
  assert.doesNotMatch(adminUsersHooks, /onMutate/);
  assert.match(adminUsersTable, /tableFeatures/);
  assert.match(adminUsersTable, /useTable/);
  assert.match(adminUsersTable, /<table/);
  assert.match(adminUsersTable, /gridTemplateColumns/);
  assert.match(adminUsersTable, /table\.FlexRender/);
});

test("admin user filters and detail records preserve useful URL state", () => {
  assert.match(adminUsersPage, /useSearchParams/);
  assert.match(adminUsersPage, /scroll: false/);
  assert.match(adminUsersToolbar, /جست‌وجو با نام یا ایمیل/);
  assert.match(adminUsersToolbar, /همه نقش‌ها/);
  assert.match(adminUsersUrl, /parseAdminUsersQuery/);
  assert.match(adminUsersUrl, /createAdminUsersHref/);
  assert.match(adminUserDetailPage, /parseTab/);
  assert.match(adminUserDetailPage, /scroll: false/);
  assert.match(adminUserRecords, /value="entries"/);
  assert.match(adminUserRecords, /value="comments"/);
  assert.match(adminUserRecords, /value="activity"/);
});

test("admin user table transitions preserve previous data and reduced-motion behavior", () => {
  assert.match(adminUsersHooks, /placeholderData: keepPreviousData/);
  assert.match(adminUsersToolbar, /AnimatePresence/);
  assert.match(adminUsersToolbar, /فیلترهای فعال/);
  assert.match(adminUsersTable, /layout="position"/);
  assert.match(adminUsersTable, /useReducedMotion/);
  assert.match(adminUsersTable, /aria-busy/);
  assert.match(adminUsersPage, /pageDirection/);
});

test("admin account security actions require confirmation and server success", () => {
  assert.match(adminUserActions, /AlertDialog/);
  assert.match(adminUserActions, /دلیل تعلیق/);
  assert.match(adminUserActions, /پایان همه نشست‌ها/);
  assert.match(adminUserActions, /pending/);
  assert.match(adminUsersHooks, /invalidateQueries/);
  assert.match(adminUserErrors, /ADMIN_USER_SELF_ACTION_FORBIDDEN/);
});

test("admin entries use real global list/detail and lifecycle contracts", () => {
  assert.match(adminEntriesRoute, /AdminEntriesPage/);
  assert.match(adminEntryDetailRoute, /AdminEntryDetailPage/);
  assert.match(adminEntriesApi, /\/admin\/entries/);
  assert.match(adminEntriesApi, /\/archive/);
  assert.match(adminEntriesApi, /\/restore/);
  assert.match(adminEntriesApi, /listAdminTaxonomy\("provinces"/);
  assert.match(adminEntriesHooks, /placeholderData: keepPreviousData/);
  assert.match(adminEntriesHooks, /adminOverviewQueryKeys/);
  assert.match(adminEntriesHooks, /\["public-entries"\]/);
});

test("admin entry list keeps URL filters, animated grid rows, and focused actions", () => {
  assert.match(adminEntriesPage, /useSearchParams/);
  assert.match(adminEntriesPage, /scroll: false/);
  assert.match(adminEntriesToolbar, /جست‌وجو در عنوان، نویسنده یا نشانی مطلب/);
  assert.match(adminEntriesToolbar, /محدوده جغرافیایی/);
  assert.match(adminEntriesTable, /tableFeatures/);
  assert.match(adminEntriesTable, /useTable/);
  assert.match(adminEntriesTable, /layout="position"/);
  assert.match(adminEntriesTable, /useReducedMotion/);
  assert.match(adminEntriesUrl, /parseAdminEntriesQuery/);
  assert.match(adminEntriesUrl, /createAdminEntriesHref/);
});

test("admin entry detail exposes inspection panels and confirmed archive restore actions", () => {
  assert.match(adminEntryDetailPage, /TiptapDocument/);
  assert.match(adminEntryDetailPage, /مشخصات مطلب/);
  assert.match(adminEntryDetailPage, /تاریخچه بررسی/);
  assert.match(adminEntryDetailPage, /moderator\/submissions/);
  assert.match(adminEntryDetailPage, /encodeURIComponent\(entry\.slug\)/);
  assert.match(adminEntryLifecycleDialog, /AlertDialog/);
  assert.match(adminEntryLifecycleDialog, /دلیل تصمیم/);
  assert.match(adminEntryLifecycleDialog, /reason\.trim\(\)\.length < 3/);
});

test("admin topics use the guarded taxonomy management contracts", () => {
  assert.match(adminTopicsRoute, /AdminTopicsView/);
  assert.match(adminDescribedTaxonomy, /endpoint: "categories"/);
  assert.match(adminTopicsApi, /\/taxonomy\/admin\/\$\{resource\}/);
  assert.match(adminTopicsApi, /\/reorder/);
  assert.match(adminTopicsApi, /\/active/);
  assert.match(adminTopicsHooks, /useMutation/);
  assert.match(adminTopicsHooks, /placeholderData: keepPreviousData/);
  assert.match(adminTopicsHooks, /adminEntriesQueryKeys\.taxonomy/);
  assert.doesNotMatch(adminTopicsHooks, /onMutate/);
});

test("admin content types reuse the described-taxonomy architecture without duplicated UI", () => {
  assert.match(adminContentTypesRoute, /AdminTopicsPage kind="contentTypes"/);
  assert.match(adminDescribedTaxonomy, /endpoint: "content-types"/);
  assert.match(adminDescribedTaxonomy, /entryFilter: "contentTypeId"/);
  assert.match(adminTopicsPage, /describedTaxonomyConfigs\[kind\]/);
  assert.match(adminTopicsHooks, /adminTopicsQueryKeys\.list\(kind, query\)/);
});

test("admin tags use their supported CRUD contracts and normalized tag fields", () => {
  assert.match(adminTagsRoute, /AdminTagsView/);
  assert.match(adminTagsApi, /\/taxonomy\/admin\/tags/);
  assert.match(adminTagsApi, /\/active/);
  assert.match(adminTagsHooks, /placeholderData: keepPreviousData/);
  assert.match(adminTagsHooks, /adminEntriesQueryKeys\.taxonomy/);
  assert.doesNotMatch(adminTagsHooks, /onMutate/);
  assert.match(adminTagsTable, /normalizedName/);
  assert.match(adminTagsTable, /tagId=/);
});

test("admin tags provide URL filters, animated rows, and confirmed soft disable", () => {
  assert.match(adminTagsPage, /useSearchParams/);
  assert.match(adminTagsPage, /scroll: false/);
  assert.match(adminTagsToolbar, /جست‌وجو با نام یا نشانی/);
  assert.match(adminTagsTable, /tableFeatures/);
  assert.match(adminTagsTable, /layout="position"/);
  assert.match(adminTagsTable, /useReducedMotion/);
  assert.match(adminTagForm, /useForm/);
  assert.match(adminTagForm, /zodResolver/);
  assert.match(adminTagForm, /DialogContent/);
  assert.match(adminTagStatus, /برچسب مطالب قبلی حذف نخواهد شد/);
  assert.match(adminTagsUrl, /parseAdminTagsQuery/);
  assert.match(adminTagsUrl, /createAdminTagsHref/);
});

test("admin topics provide URL filters, animated ordering, and accessible management surfaces", () => {
  assert.match(adminTopicsPage, /useSearchParams/);
  assert.match(adminTopicsPage, /scroll: false/);
  assert.match(adminTopicsPage, /تغییر ترتیب/);
  assert.match(adminTopicsToolbar, /جست‌وجو با نام یا نشانی/);
  assert.match(adminTopicsTable, /tableFeatures/);
  assert.match(adminTopicsTable, /layout="position"/);
  assert.match(adminTopicsTable, /useReducedMotion/);
  assert.match(adminTopicForm, /useForm/);
  assert.match(adminTopicForm, /zodResolver/);
  assert.match(adminTopicForm, /SheetContent side="right"/);
  assert.match(adminTopicStatus, /مطالب قبلی حذف نخواهند شد/);
  assert.match(adminTopicsUrl, /parseAdminTopicsQuery/);
  assert.match(adminTopicsUrl, /createAdminTopicsHref/);
});

test("admin provinces use fixed taxonomy management with nested district routes", () => {
  assert.match(adminProvincesRoute, /AdminProvincesView/);
  assert.match(adminProvinceDetailRoute, /AdminProvinceDetailPage/);
  assert.match(adminProvincesPage, /تغییر ترتیب/);
  assert.doesNotMatch(adminProvincesPage, /ولایت جدید/);
  assert.match(adminProvincesTable, /tableFeatures/);
  assert.match(adminProvincesTable, /layout="position"/);
  assert.match(adminProvinceDetailPage, /AdminDistrictsTable/);
  assert.match(adminProvinceDetailPage, /افزودن ولسوالی/);
  assert.match(adminDistrictsTable, /tableFeatures/);
});

test("admin province profile uses confirmed image and taxonomy API contracts", () => {
  assert.match(adminProvincesApi, /\/taxonomy\/admin\/provinces\/\$\{provinceId\}\/image/);
  assert.match(adminProvincesApi, /FormData/);
  assert.match(adminProvincesApi, /\/taxonomy\/admin\/districts/);
  assert.match(adminProvincesHooks, /placeholderData: keepPreviousData/);
  assert.match(adminProvincesHooks, /adminEntriesQueryKeys\.taxonomy/);
  assert.doesNotMatch(adminProvincesHooks, /onMutate/);
  assert.match(adminProvinceImageDialog, /image\/jpeg,image\/png,image\/webp/);
  assert.match(adminProvinceImageDialog, /متن جایگزین تصویر/);
  assert.match(provinceDetailPage, /province\.description/);
  assert.match(provinceImages, /province\.image\.secureUrl/);
});

test("remaining admin destinations are deliberately minimal placeholders", () => {
  assert.match(adminPlaceholder, /این بخش در مرحله بعد پیاده‌سازی می‌شود/);
  assert.doesNotMatch(adminPlaceholder, /chart|table|statistics/i);
  assert.equal(adminPageRoutes.length, 4);
  for (const route of adminPageRoutes) {
    assert.match(route, /AdminPlaceholderPage/);
    assert.match(route, /createAdminMetadata/);
  }
});

import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { OAuthProfile } from "./decorators/oauth-profile.decorator";
import { Public } from "./decorators/public.decorator";
import {
  AuthSessionResponseDto,
  CurrentUserResponseDto,
  MessageResponseDto,
  VerifyEmailResponseDto,
} from "./dto/auth-response.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResendVerificationDto } from "./dto/resend-verification.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { SetupPasswordDto } from "./dto/setup-password.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { FacebookAuthGuard } from "./guards/facebook-auth.guard";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import type { AuthRequestContext, RefreshCookie } from "./types/auth-request-context.type";
import type { CurrentUserResponse } from "./types/auth-response.type";
import type { AuthenticatedUser } from "./types/authenticated-user.type";
import type { NormalizedOAuthProfile } from "./types/oauth-profile.type";
import { parseCookieHeader } from "./utils/cookie.util";
import { readOAuthState } from "./utils/oauth-state";

@ApiTags("Authentication")
@Controller("auth")
class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Register with email and password" })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiConflictResponse({ description: "AUTH_EMAIL_ALREADY_REGISTERED" })
  @ApiBadRequestResponse({ description: "Validation failed" })
  register(
    @Body() body: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionResponseDto> {
    return this.authService.register(body, this.createAuthRequestContext(request, response));
  }

  @Public()
  @Post("login")
  @ApiOperation({ summary: "Log in with email and password" })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiUnauthorizedResponse({
    description: "AUTH_INVALID_CREDENTIALS or AUTH_PASSWORD_NOT_CONFIGURED",
  })
  @ApiForbiddenResponse({ description: "AUTH_ACCOUNT_SUSPENDED" })
  @ApiBadRequestResponse({ description: "Validation failed" })
  login(
    @Body() body: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionResponseDto> {
    return this.authService.login(body, this.createAuthRequestContext(request, response));
  }

  @Public()
  @Post("verify-email")
  @ApiOperation({ summary: "Verify an email address with a verification token" })
  @ApiBody({ type: VerifyEmailDto })
  @ApiOkResponse({ type: VerifyEmailResponseDto })
  @ApiBadRequestResponse({
    description: "AUTH_VERIFICATION_TOKEN_INVALID or AUTH_VERIFICATION_TOKEN_EXPIRED",
  })
  verifyEmail(@Body() body: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
    return this.authService.verifyEmail(body);
  }

  @Public()
  @Post("resend-verification")
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: "Request a new email verification message" })
  @ApiBody({ type: ResendVerificationDto })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ description: "Validation failed" })
  @ApiTooManyRequestsResponse({ description: "Rate limit exceeded" })
  resendVerification(@Body() body: ResendVerificationDto): Promise<MessageResponseDto> {
    return this.authService.resendVerification(body);
  }

  @Public()
  @Post("forgot-password")
  @Throttle({ default: { limit: 3, ttl: 15 * 60_000 } })
  @ApiOperation({
    summary: "Request a password reset email",
    description:
      "Always returns a neutral response. When an active account exists, a single-use reset token is emailed. The raw token is never returned in JSON.",
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ description: "Validation failed" })
  @ApiTooManyRequestsResponse({ description: "Rate limit exceeded" })
  forgotPassword(@Body() body: ForgotPasswordDto): Promise<MessageResponseDto> {
    return this.authService.forgotPassword(body);
  }

  @Public()
  @Post("reset-password")
  @ApiOperation({
    summary: "Reset a password with a single-use token",
    description:
      "Accepts the raw reset token from the frontend reset page, hashes it for lookup, sets the new password, revokes refresh sessions, and clears the refresh cookie. The user is not logged in automatically.",
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({
    description:
      "AUTH_PASSWORD_RESET_TOKEN_INVALID, AUTH_PASSWORD_RESET_TOKEN_EXPIRED, AUTH_PASSWORD_RESET_TOKEN_USED, AUTH_PASSWORD_TOO_WEAK, or validation failed",
  })
  @ApiForbiddenResponse({ description: "AUTH_ACCOUNT_SUSPENDED" })
  resetPassword(
    @Body() body: ResetPasswordDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MessageResponseDto> {
    return this.authService.resetPassword(body, this.createAuthRequestContext(request, response));
  }

  @Public()
  @Get("google")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: "Start Google OAuth login",
    description:
      "Redirects the browser to Google with profile and email scopes. The callback returns the platform JWT and safe user profile.",
  })
  @ApiOkResponse({ description: "Redirects to Google OAuth consent." })
  startGoogleLogin(): void {}

  @Public()
  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: "Handle Google OAuth callback",
    description:
      "Authenticates the normalized Google profile, links or creates a platform user, and returns the platform access token. Google tokens are never returned.",
  })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiUnauthorizedResponse({
    description: "AUTH_GOOGLE_EMAIL_NOT_VERIFIED or AUTH_GOOGLE_AUTH_FAILED",
  })
  @ApiForbiddenResponse({ description: "AUTH_ACCOUNT_SUSPENDED" })
  @ApiConflictResponse({ description: "AUTH_GOOGLE_ACCOUNT_ALREADY_LINKED" })
  googleCallback(
    @OAuthProfile() profile: NormalizedOAuthProfile,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    return this.completeOAuthCallback(profile, request, response, "google");
  }

  @Public()
  @Get("facebook")
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({
    summary: "Start Facebook OAuth login",
    description:
      "Redirects the browser to Facebook with email and public profile permissions. The callback returns the platform JWT and safe user profile.",
  })
  @ApiOkResponse({ description: "Redirects to Facebook OAuth consent." })
  startFacebookLogin(): void {}

  @Public()
  @Get("facebook/callback")
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({
    summary: "Handle Facebook OAuth callback",
    description:
      "Authenticates the normalized Facebook profile, creates or loads a linked platform user, and returns the platform access token. Facebook tokens are never returned.",
  })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiUnauthorizedResponse({
    description: "AUTH_FACEBOOK_EMAIL_REQUIRED or AUTH_FACEBOOK_AUTH_FAILED",
  })
  @ApiForbiddenResponse({ description: "AUTH_ACCOUNT_SUSPENDED" })
  @ApiConflictResponse({
    description: "AUTH_FACEBOOK_EMAIL_LINKING_NOT_ALLOWED or AUTH_FACEBOOK_ACCOUNT_ALREADY_LINKED",
  })
  facebookCallback(
    @OAuthProfile() profile: NormalizedOAuthProfile,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    return this.completeOAuthCallback(profile, request, response, "facebook");
  }

  @Public()
  @Post("refresh")
  @ApiOperation({
    summary: "Refresh the platform access token",
    description:
      "Reads the refresh token from an HTTP-only cookie, rotates the refresh session, sets a new cookie, and returns a new access token. The refresh token is never returned in JSON.",
  })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiUnauthorizedResponse({
    description:
      "AUTH_REFRESH_TOKEN_MISSING, AUTH_REFRESH_TOKEN_INVALID, AUTH_REFRESH_TOKEN_EXPIRED, AUTH_REFRESH_TOKEN_REVOKED, or AUTH_SESSION_NOT_FOUND",
  })
  @ApiForbiddenResponse({ description: "AUTH_ACCOUNT_SUSPENDED" })
  refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionResponseDto> {
    return this.authService.refresh(
      this.getRefreshTokenFromRequest(request),
      this.createAuthRequestContext(request, response),
    );
  }

  @Public()
  @Post("logout")
  @ApiOperation({
    summary: "Log out the current refresh session",
    description:
      "Reads the refresh token from the HTTP-only cookie when present, revokes the matching session, and clears the cookie. No refresh token is accepted from the request body.",
  })
  @ApiOkResponse({ type: MessageResponseDto })
  logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MessageResponseDto> {
    return this.authService.logout(
      this.getRefreshTokenFromRequest(request),
      this.createAuthRequestContext(request, response),
    );
  }

  @Post("logout-all")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Log out all refresh sessions for the current user",
    description:
      "Revokes every active refresh session for the authenticated user and clears the current refresh cookie.",
  })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "AUTH_ACCOUNT_SUSPENDED" })
  logoutAll(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MessageResponseDto> {
    return this.authService.logoutAll(user, this.createAuthRequestContext(request, response));
  }

  @Post("setup-password")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Set a password for an authenticated OAuth-only account",
    description:
      "Only works when the authenticated user does not already have a password. Successful setup revokes refresh sessions and clears the refresh cookie so the user logs in again.",
  })
  @ApiBody({ type: SetupPasswordDto })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ description: "AUTH_PASSWORD_TOO_WEAK or validation failed" })
  @ApiConflictResponse({ description: "AUTH_PASSWORD_ALREADY_CONFIGURED" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "AUTH_ACCOUNT_SUSPENDED" })
  setupPassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SetupPasswordDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MessageResponseDto> {
    return this.authService.setupPassword(
      user,
      body,
      this.createAuthRequestContext(request, response),
    );
  }

  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the current authenticated user" })
  @ApiOkResponse({ type: CurrentUserResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "AUTH_ACCOUNT_SUSPENDED" })
  getCurrentUser(@CurrentUser() user: AuthenticatedUser): CurrentUserResponse {
    return this.authService.getCurrentUser(user);
  }

  private getRefreshTokenFromRequest(request: Request): string | undefined {
    return parseCookieHeader(request.headers.cookie)[this.authService.getRefreshCookieName()];
  }

  private createAuthRequestContext(request: Request, response: Response): AuthRequestContext {
    return {
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
      setRefreshCookie: (cookie: RefreshCookie) => {
        response.cookie(cookie.name, cookie.value, cookie.options);
      },
      clearRefreshCookie: (cookie: Omit<RefreshCookie, "value">) => {
        response.clearCookie(cookie.name, cookie.options);
      },
    };
  }

  private async completeOAuthCallback(
    profile: NormalizedOAuthProfile,
    request: Request,
    response: Response,
    provider: "google" | "facebook",
  ): Promise<void> {
    try {
      await this.authService.authenticateOAuthUser(
        profile,
        this.createAuthRequestContext(request, response),
      );
      response.redirect(this.createFrontendOAuthCallbackUrl(request, provider));
    } catch (error) {
      response.redirect(
        this.createFrontendOAuthCallbackUrl(request, provider, this.getOAuthErrorCode(error)),
      );
    }
  }

  private createFrontendOAuthCallbackUrl(
    request: Request,
    provider: "google" | "facebook",
    error?: string,
  ): string {
    const callbackUrl = new URL(
      "/auth/callback",
      this.configService.getOrThrow<string>("FRONTEND_URL"),
    );
    const next = readOAuthState(
      typeof request.query.state === "string" ? request.query.state : undefined,
    );

    callbackUrl.searchParams.set("provider", provider);

    if (next) {
      callbackUrl.searchParams.set("next", next);
    }

    if (error) {
      callbackUrl.searchParams.set("error", error);
    }

    return callbackUrl.toString();
  }

  private getOAuthErrorCode(error: unknown): string {
    if (error instanceof HttpException) {
      const response = error.getResponse();

      if (typeof response === "object" && response !== null && "error" in response) {
        const authError = response.error;

        if (
          typeof authError === "object" &&
          authError !== null &&
          "code" in authError &&
          typeof authError.code === "string"
        ) {
          return authError.code;
        }
      }
    }

    return "AUTH_OAUTH_FAILED";
  }
}

export { AuthController };

import { Body, Controller, Get, Inject, Post, Req, Res, UseGuards } from "@nestjs/common";
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
import { AuthService } from "@/modules/auth/auth.service";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { OAuthProfile } from "@/modules/auth/decorators/oauth-profile.decorator";
import { Public } from "@/modules/auth/decorators/public.decorator";
import {
  AuthSessionResponseDto,
  CurrentUserResponseDto,
  MessageResponseDto,
  VerifyEmailResponseDto,
} from "@/modules/auth/dto/auth-response.dto";
import { LoginDto } from "@/modules/auth/dto/login.dto";
import { RegisterDto } from "@/modules/auth/dto/register.dto";
import { ResendVerificationDto } from "@/modules/auth/dto/resend-verification.dto";
import { VerifyEmailDto } from "@/modules/auth/dto/verify-email.dto";
import { FacebookAuthGuard } from "@/modules/auth/guards/facebook-auth.guard";
import { GoogleAuthGuard } from "@/modules/auth/guards/google-auth.guard";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import type {
  AuthRequestContext,
  RefreshCookie,
} from "@/modules/auth/types/auth-request-context.type";
import type { CurrentUserResponse } from "@/modules/auth/types/auth-response.type";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import type { NormalizedOAuthProfile } from "@/modules/auth/types/oauth-profile.type";
import { parseCookieHeader } from "@/modules/auth/utils/cookie.util";

@ApiTags("Authentication")
@Controller("auth")
class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

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
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionResponseDto> {
    return this.authService.authenticateOAuthUser(
      profile,
      this.createAuthRequestContext(request, response),
    );
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
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionResponseDto> {
    return this.authService.authenticateOAuthUser(
      profile,
      this.createAuthRequestContext(request, response),
    );
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
  @UseGuards(JwtAuthGuard)
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

  @Get("me")
  @UseGuards(JwtAuthGuard)
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
}

export { AuthController };

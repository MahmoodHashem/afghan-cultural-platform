import { Body, Controller, Get, Inject, Post, UseGuards } from "@nestjs/common";
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
import { GoogleAuthGuard } from "@/modules/auth/guards/google-auth.guard";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import type { CurrentUserResponse } from "@/modules/auth/types/auth-response.type";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import type { NormalizedOAuthProfile } from "@/modules/auth/types/oauth-profile.type";

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
  register(@Body() body: RegisterDto): Promise<AuthSessionResponseDto> {
    return this.authService.register(body);
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
  login(@Body() body: LoginDto): Promise<AuthSessionResponseDto> {
    return this.authService.login(body);
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
  googleCallback(@OAuthProfile() profile: NormalizedOAuthProfile): Promise<AuthSessionResponseDto> {
    return this.authService.authenticateOAuthUser(profile);
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
}

export { AuthController };

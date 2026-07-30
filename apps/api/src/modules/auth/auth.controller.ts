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
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import type { CurrentUserResponse } from "@/modules/auth/types/auth-response.type";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";

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

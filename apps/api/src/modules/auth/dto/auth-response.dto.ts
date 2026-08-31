import { ApiProperty } from "@nestjs/swagger";

import { UserRole, UserStatus } from "../../../generated/prisma/enums";

class SafeAuthUserDto {
  @ApiProperty({ example: "90fc7cb5-984d-4ac7-83e6-81ebf63a5c63" })
  id!: string;

  @ApiProperty({ example: "Mahmood Hashem" })
  displayName!: string;

  @ApiProperty({ example: "mahmood@example.com" })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role!: UserRole;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  status!: UserStatus;

  @ApiProperty({ example: false })
  emailVerified!: boolean;
}

class AuthSessionDataDto {
  @ApiProperty({ example: "jwt-access-token" })
  accessToken!: string;

  @ApiProperty({ type: SafeAuthUserDto })
  user!: SafeAuthUserDto;
}

class AuthSessionResponseDto {
  @ApiProperty({ type: AuthSessionDataDto })
  data!: AuthSessionDataDto;
}

class CurrentUserDataDto {
  @ApiProperty({ type: SafeAuthUserDto })
  user!: SafeAuthUserDto;
}

class CurrentUserResponseDto {
  @ApiProperty({ type: CurrentUserDataDto })
  data!: CurrentUserDataDto;
}

class MessageDataDto {
  @ApiProperty({ example: "Email verification request accepted." })
  message!: string;
}

class MessageResponseDto {
  @ApiProperty({ type: MessageDataDto })
  data!: MessageDataDto;
}

class VerifyEmailDataDto extends MessageDataDto {
  @ApiProperty({ type: SafeAuthUserDto })
  user!: SafeAuthUserDto;
}

class VerifyEmailResponseDto {
  @ApiProperty({ type: VerifyEmailDataDto })
  data!: VerifyEmailDataDto;
}

export {
  AuthSessionResponseDto,
  CurrentUserResponseDto,
  MessageResponseDto,
  SafeAuthUserDto,
  VerifyEmailResponseDto,
};

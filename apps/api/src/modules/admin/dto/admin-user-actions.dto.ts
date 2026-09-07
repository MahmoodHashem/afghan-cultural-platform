import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

import { UserRole, UserStatus } from "../../../generated/prisma/enums";

class UpdateAdminUserStatusDto {
  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  status!: UserStatus;

  @ApiPropertyOptional({ maxLength: 600 })
  @IsOptional()
  @IsString()
  @MaxLength(600)
  reason?: string;
}

class UpdateAdminUserRoleDto {
  @ApiProperty({ enum: [UserRole.USER, UserRole.MODERATOR] })
  @IsIn([UserRole.USER, UserRole.MODERATOR])
  role!: UserRole;

  @ApiProperty({ minLength: 3, maxLength: 600 })
  @IsString()
  @MaxLength(600)
  reason!: string;
}

export { UpdateAdminUserRoleDto, UpdateAdminUserStatusDto };

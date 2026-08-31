import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

import { UserStatus } from "../../../generated/prisma/enums";

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

export { UpdateAdminUserStatusDto };

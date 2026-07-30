import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

class VerifyEmailDto {
  @ApiProperty({ example: "secure-email-verification-token" })
  @IsString()
  @MinLength(1)
  token!: string;
}

export { VerifyEmailDto };

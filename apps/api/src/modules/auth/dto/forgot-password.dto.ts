import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, MaxLength } from "class-validator";

class ForgotPasswordDto {
  @ApiProperty({ example: "mahmood@example.com" })
  @IsEmail()
  @MaxLength(255)
  email!: string;
}

export { ForgotPasswordDto };

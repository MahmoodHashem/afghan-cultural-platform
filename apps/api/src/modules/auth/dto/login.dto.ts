import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

class LoginDto {
  @ApiProperty({ example: "mahmood@example.com" })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ minLength: 1, example: "StrongPass123" })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}

export { LoginDto };

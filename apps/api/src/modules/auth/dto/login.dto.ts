import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

class LoginDto {
  @ApiProperty({ example: "mahmood@example.com", description: "The email address of the user" })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ minLength: 1, example: "StrongPass123", description: "The password of the user" })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}

export { LoginDto };

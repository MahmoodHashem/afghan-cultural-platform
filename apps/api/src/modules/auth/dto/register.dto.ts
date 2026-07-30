import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

class RegisterDto {
  @ApiProperty({ example: "Mahmood Hashem", minLength: 2, maxLength: 80 })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  displayName!: string;

  @ApiProperty({ example: "mahmood@example.com" })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    minLength: 10,
    example: "StrongPass123",
    description: "At least 10 characters with uppercase, lowercase, and number characters.",
  })
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: "password must include uppercase, lowercase, and number characters",
  })
  password!: string;
}

export { RegisterDto };

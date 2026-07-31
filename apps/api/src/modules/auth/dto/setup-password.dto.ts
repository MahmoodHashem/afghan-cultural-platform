import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MaxLength, MinLength } from "class-validator";

class SetupPasswordDto {
  @ApiProperty({
    minLength: 10,
    example: "NewStrongPass123",
    description: "At least 10 characters with uppercase, lowercase, and number characters.",
  })
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: "newPassword must include uppercase, lowercase, and number characters",
  })
  newPassword!: string;
}

export { SetupPasswordDto };

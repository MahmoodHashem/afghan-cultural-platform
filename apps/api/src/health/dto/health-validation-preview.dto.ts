import { IsString } from "class-validator";

class HealthValidationPreviewDto {
  @IsString()
  name!: string;
}

export { HealthValidationPreviewDto };

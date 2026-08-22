import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength } from "class-validator";

class AdminEntryLifecycleReasonDto {
  @ApiProperty({
    minLength: 3,
    maxLength: 600,
    example: "این مطلب دیگر برای انتشار عمومی مناسب نیست.",
  })
  @IsString()
  @MaxLength(600)
  reason!: string;
}

export { AdminEntryLifecycleReasonDto };

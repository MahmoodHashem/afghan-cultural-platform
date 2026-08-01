import { Module } from "@nestjs/common";

import { CloudinaryMediaService } from "@/modules/media/cloudinary-media.service";

@Module({
  providers: [CloudinaryMediaService],
  exports: [CloudinaryMediaService],
})
class MediaModule {}

export { MediaModule };

import { Readable } from "node:stream";
import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

import { MEDIA_ERROR_CODES } from "./media.constants";

type UploadedCloudinaryImage = {
  publicId: string;
  url: string;
  secureUrl: string;
  thumbnailUrl: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
};

@Injectable()
class CloudinaryMediaService {
  private readonly logger = new Logger(CloudinaryMediaService.name);

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>("CLOUDINARY_CLOUD_NAME"),
      api_key: this.configService.getOrThrow<string>("CLOUDINARY_API_KEY"),
      api_secret: this.configService.getOrThrow<string>("CLOUDINARY_API_SECRET"),
      secure: true,
    });
  }

  async uploadEntryImage(file: Express.Multer.File): Promise<UploadedCloudinaryImage> {
    return this.uploadImage(file, "afghan-cultural-platform/entries", 480, 320);
  }

  async uploadProvinceImage(file: Express.Multer.File): Promise<UploadedCloudinaryImage> {
    return this.uploadImage(file, "afghan-cultural-platform/provinces", 720, 480);
  }

  async uploadProfileImage(file: Express.Multer.File): Promise<UploadedCloudinaryImage> {
    return this.uploadImage(file, "afghan-cultural-platform/profiles", 256, 256);
  }

  private async uploadImage(
    file: Express.Multer.File,
    folder: string,
    thumbnailWidth: number,
    thumbnailHeight: number,
  ): Promise<UploadedCloudinaryImage> {
    try {
      const upload = await this.uploadBuffer(file.buffer, folder);

      return {
        publicId: upload.public_id,
        url: upload.url,
        secureUrl: upload.secure_url,
        thumbnailUrl: this.createThumbnailUrl(upload.public_id, thumbnailWidth, thumbnailHeight),
        width: upload.width,
        height: upload.height,
        format: upload.format,
        bytes: upload.bytes,
      };
    } catch (error) {
      this.logger.error(
        "Cloudinary image upload failed",
        error instanceof Error ? error.stack : String(error),
      );
      throw new BadRequestException({
        error: MEDIA_ERROR_CODES.CLOUDINARY_UPLOAD_FAILED,
        message: "Image upload failed.",
      });
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        invalidate: true,
        resource_type: "image",
      });

      if (result.result !== "ok" && result.result !== "not found") {
        throw new Error(`Unexpected Cloudinary delete result: ${result.result}`);
      }
    } catch (error) {
      this.logger.error(
        "Cloudinary image delete failed",
        error instanceof Error ? error.stack : String(error),
      );
      throw new BadRequestException({
        error: MEDIA_ERROR_CODES.CLOUDINARY_DELETE_FAILED,
        message: "Image delete failed.",
      });
    }
  }

  private uploadBuffer(buffer: Buffer, folder: string): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
          folder,
          overwrite: false,
          resource_type: "image",
          unique_filename: true,
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary upload returned no result."));
            return;
          }

          resolve(result);
        },
      );

      Readable.from(buffer).pipe(uploadStream);
    });
  }

  private createThumbnailUrl(publicId: string, width: number, height: number): string {
    return cloudinary.url(publicId, {
      crop: "fill",
      fetch_format: "auto",
      gravity: "auto",
      height,
      quality: "auto:good",
      secure: true,
      width,
    });
  }
}

export type { UploadedCloudinaryImage };
export { CloudinaryMediaService };

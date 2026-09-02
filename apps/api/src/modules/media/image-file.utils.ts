const SUPPORTED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function detectImageMimeType(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

function isSupportedImageFile(file: Express.Multer.File): boolean {
  const detectedMimeType = detectImageMimeType(file.buffer);
  const declaredMimeType = normalizeImageMimeType(file.mimetype);

  return (
    detectedMimeType !== null &&
    SUPPORTED_IMAGE_MIME_TYPES.has(declaredMimeType) &&
    detectedMimeType === declaredMimeType
  );
}

function normalizeImageMimeType(mimeType: string) {
  const normalizedMimeType = mimeType.toLowerCase().trim();

  if (normalizedMimeType === "image/jpg" || normalizedMimeType === "image/pjpeg") {
    return "image/jpeg";
  }

  if (normalizedMimeType === "image/x-png") {
    return "image/png";
  }

  return normalizedMimeType;
}

export {
  detectImageMimeType,
  isSupportedImageFile,
  normalizeImageMimeType,
  SUPPORTED_IMAGE_MIME_TYPES,
};

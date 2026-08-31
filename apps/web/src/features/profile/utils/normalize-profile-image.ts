const PROFILE_IMAGE_MAX_DIMENSION = 1024;
const PROFILE_IMAGE_TARGET_BYTES = 800 * 1024;
const PROFILE_IMAGE_QUALITY_STEPS = [0.86, 0.78, 0.7] as const;

type LoadedImage = {
  element: HTMLImageElement;
  revoke: () => void;
};

async function normalizeProfileImage(file: File): Promise<File> {
  const image = await loadImage(file);

  try {
    const { width, height } = getConstrainedDimensions(
      image.element.naturalWidth,
      image.element.naturalHeight,
    );

    if (
      width === image.element.naturalWidth &&
      height === image.element.naturalHeight &&
      file.size <= PROFILE_IMAGE_TARGET_BYTES
    ) {
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Image canvas is unavailable.");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image.element, 0, 0, width, height);

    let normalizedBlob: Blob | null = null;

    for (const quality of PROFILE_IMAGE_QUALITY_STEPS) {
      normalizedBlob = await canvasToBlob(canvas, "image/webp", quality);

      if (normalizedBlob.size <= PROFILE_IMAGE_TARGET_BYTES) {
        break;
      }
    }

    if (!normalizedBlob) {
      throw new Error("Image encoding failed.");
    }

    return new File([normalizedBlob], createNormalizedFilename(file.name, normalizedBlob.type), {
      type: normalizedBlob.type,
      lastModified: Date.now(),
    });
  } finally {
    image.revoke();
  }
}

function loadImage(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      if (image.naturalWidth === 0 || image.naturalHeight === 0) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Image dimensions are invalid."));
        return;
      }

      resolve({
        element: image,
        revoke: () => URL.revokeObjectURL(objectUrl),
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image could not be decoded."));
    };
    image.src = objectUrl;
  });
}

function getConstrainedDimensions(width: number, height: number) {
  const scale = Math.min(1, PROFILE_IMAGE_MAX_DIMENSION / Math.max(width, height));

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Image encoding failed."));
      },
      type,
      quality,
    );
  });
}

function createNormalizedFilename(filename: string, mimeType: string) {
  const basename = filename.replace(/\.[^.]+$/, "") || "profile-image";
  const extension = mimeType === "image/webp" ? "webp" : mimeType === "image/png" ? "png" : "jpg";

  return `${basename}.${extension}`;
}

export { normalizeProfileImage };

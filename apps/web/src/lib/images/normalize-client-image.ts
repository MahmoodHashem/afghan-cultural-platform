type NormalizeClientImageOptions = {
  maxDimension: number;
  qualitySteps: readonly number[];
  targetBytes: number;
};

type LoadedImage = {
  element: HTMLImageElement;
  revoke: () => void;
};

async function normalizeClientImage(
  file: File,
  { maxDimension, qualitySteps, targetBytes }: NormalizeClientImageOptions,
): Promise<File> {
  const image = await loadImage(file);

  try {
    const { width, height } = getConstrainedDimensions(
      image.element.naturalWidth,
      image.element.naturalHeight,
      maxDimension,
    );
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

    for (const quality of qualitySteps) {
      normalizedBlob = await canvasToBlob(canvas, "image/webp", quality);

      if (normalizedBlob.size <= targetBytes) {
        break;
      }
    }

    if (!normalizedBlob || normalizedBlob.size > targetBytes) {
      throw new Error("Image could not be reduced to the upload limit.");
    }

    return new File([normalizedBlob], createNormalizedFilename(file.name), {
      type: "image/webp",
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

function getConstrainedDimensions(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height));

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

function createNormalizedFilename(filename: string) {
  const basename = filename.replace(/\.[^.]+$/, "") || "image";
  return `${basename}.webp`;
}

export type { NormalizeClientImageOptions };
export { normalizeClientImage };

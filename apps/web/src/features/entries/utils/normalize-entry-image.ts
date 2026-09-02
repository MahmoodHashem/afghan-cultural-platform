import { normalizeClientImage } from "@/lib/images/normalize-client-image";

const ENTRY_IMAGE_OPTIONS = {
  maxDimension: 2200,
  targetBytes: 1_500 * 1024,
  qualitySteps: [0.88, 0.8, 0.72, 0.64],
} as const;

function normalizeEntryImage(file: File) {
  return normalizeClientImage(file, ENTRY_IMAGE_OPTIONS);
}

export { normalizeEntryImage };

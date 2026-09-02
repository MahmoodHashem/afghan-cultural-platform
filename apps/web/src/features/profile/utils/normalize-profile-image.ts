import { normalizeClientImage } from "@/lib/images/normalize-client-image";

const PROFILE_IMAGE_OPTIONS = {
  maxDimension: 1024,
  targetBytes: 800 * 1024,
  qualitySteps: [0.86, 0.78, 0.7],
} as const;

function normalizeProfileImage(file: File) {
  return normalizeClientImage(file, PROFILE_IMAGE_OPTIONS);
}

export { normalizeProfileImage };

import type { Metadata } from "next";

function createAdminMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}

export { createAdminMetadata };

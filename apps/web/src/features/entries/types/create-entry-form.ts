import type { EntryImage, GeographicScope } from "@/features/entries/api/entry-drafts-api";

export type SaveState = "idle" | "saving" | "saved" | "unsaved" | "submitted";

export type StagedImage = {
  clientId: string;
  file: File;
  previewUrl: string;
  altText: string;
  caption: string;
  photographerOrSource: string;
  permissionConfirmed: boolean;
  status: "pending" | "uploading" | "uploaded" | "error";
  error?: string;
  uploadedImage?: EntryImage;
};

export type WatchedEntryValues = {
  geographicScope?: GeographicScope;
  provinceId?: string;
  categoryId?: string;
  contentTypeId?: string;
};

"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  deleteEntryImage,
  type EntryImage,
  uploadEntryImage,
} from "@/features/entries/api/entry-drafts-api";
import type { StagedImage } from "@/features/entries/types/create-entry-form";
import { getEntryFormErrorMessage } from "@/features/entries/utils/create-entry-errors";
import { emptyToUndefined } from "@/features/entries/utils/create-entry-form-utils";
import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
  MAX_IMAGES_PER_ENTRY,
} from "@/lib/images/image-upload-limits";
import { formatPersianNumber } from "@/lib/utils/formatters";

type UseStagedEntryImagesOptions = {
  draftId: string | null;
  getTitle: () => string;
  initialImages?: EntryImage[];
  onDirty: () => void;
};

export function useStagedEntryImages({
  draftId,
  getTitle,
  initialImages,
  onDirty,
}: UseStagedEntryImagesOptions) {
  const [images, setImages] = useState<StagedImage[]>([]);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const imagesRef = useRef<StagedImage[]>([]);
  const hydratedDraftIdRef = useRef<string | null>(null);
  const hasPendingImages = images.some(
    (image) => image.status === "pending" || image.status === "error",
  );

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      for (const image of imagesRef.current) {
        if (image.isLocalPreview) {
          URL.revokeObjectURL(image.previewUrl);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!draftId || !initialImages || hydratedDraftIdRef.current === draftId) {
      return;
    }

    hydratedDraftIdRef.current = draftId;
    setImages(
      initialImages.map((image) => ({
        clientId: image.id,
        previewUrl: image.thumbnailUrl ?? image.secureUrl,
        altText: image.altText,
        caption: image.caption ?? "",
        photographerOrSource: image.photographerOrSource ?? "",
        permissionConfirmed: image.permissionConfirmed,
        status: "uploaded",
        uploadedImage: image,
      })),
    );
  }, [draftId, initialImages]);

  function selectImages(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const remainingSlots = Math.max(0, MAX_IMAGES_PER_ENTRY - images.length);
    const filesWithinLimit = Array.from(files).filter((file) => file.size <= MAX_IMAGE_SIZE_BYTES);
    const selectedFiles = filesWithinLimit.slice(0, remainingSlots);

    if (filesWithinLimit.length < files.length) {
      toast.error(
        `حجم هر تصویر باید حداکثر ${formatPersianNumber(MAX_IMAGE_SIZE_MB)} مگابایت باشد.`,
      );
    }

    if (selectedFiles.length < filesWithinLimit.length) {
      toast.error(
        `برای هر مطلب حداکثر ${formatPersianNumber(MAX_IMAGES_PER_ENTRY)} تصویر می‌توانید اضافه کنید.`,
      );
    }

    if (selectedFiles.length === 0) {
      return;
    }

    const title = getTitle();
    const nextImages = selectedFiles.map((file) => ({
      clientId: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      isLocalPreview: true,
      altText: title ? `تصویر مربوط به ${title}` : "",
      caption: "",
      photographerOrSource: "",
      permissionConfirmed: true,
      status: "pending" as const,
    }));

    setImages((currentImages) => [...currentImages, ...nextImages]);
    onDirty();
  }

  async function removeImage(image: StagedImage) {
    if (draftId && image.uploadedImage) {
      try {
        await deleteEntryImage(draftId, image.uploadedImage.id);
      } catch (error) {
        toast.error(getEntryFormErrorMessage(error));
        return;
      }
    }

    if (image.isLocalPreview) {
      URL.revokeObjectURL(image.previewUrl);
    }
    setImages((currentImages) =>
      currentImages.filter((currentImage) => currentImage.clientId !== image.clientId),
    );
    onDirty();
  }

  function updateImage(clientId: string, patch: Partial<StagedImage>) {
    setImages((currentImages) =>
      currentImages.map((image) => (image.clientId === clientId ? { ...image, ...patch } : image)),
    );
    onDirty();
  }

  function moveImage(clientId: string, direction: "up" | "down") {
    setImages((currentImages) => {
      const currentIndex = currentImages.findIndex((image) => image.clientId === clientId);
      const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= currentImages.length) {
        return currentImages;
      }

      const nextImages = [...currentImages];
      const [image] = nextImages.splice(currentIndex, 1);

      if (!image) {
        return currentImages;
      }

      nextImages.splice(nextIndex, 0, image);

      return nextImages;
    });
    onDirty();
  }

  async function syncPendingImages(entryId: string) {
    for (const [index, image] of images.entries()) {
      if (image.status === "uploaded" || image.status === "uploading") {
        continue;
      }

      if (!image.file) {
        patchImageWithoutDirty(image.clientId, {
          status: "error",
          error: "فایل تصویر دوباره انتخاب شود.",
        });
        continue;
      }

      if (!image.altText.trim()) {
        patchImageWithoutDirty(image.clientId, {
          status: "error",
          error: "متن جایگزین تصویر را بنویسید.",
        });
        continue;
      }

      if (!image.permissionConfirmed) {
        patchImageWithoutDirty(image.clientId, {
          status: "error",
          error: "اجازه استفاده از تصویر را تأیید کنید.",
        });
        continue;
      }

      try {
        patchImageWithoutDirty(image.clientId, { status: "uploading", error: undefined });
        const uploadedImage = await uploadEntryImage(entryId, {
          file: image.file,
          altText: image.altText.trim(),
          caption: emptyToUndefined(image.caption),
          photographerOrSource: emptyToUndefined(image.photographerOrSource),
          permissionConfirmed: image.permissionConfirmed,
          displayOrder: index,
        });
        patchImageWithoutDirty(image.clientId, {
          status: "uploaded",
          error: undefined,
          uploadedImage,
        });
      } catch (error) {
        patchImageWithoutDirty(image.clientId, {
          status: "error",
          error: getEntryFormErrorMessage(error),
        });
        toast.error("پیش‌نویس ذخیره شد، اما یک تصویر بارگذاری نشد.");
      }
    }
  }

  function patchImageWithoutDirty(clientId: string, patch: Partial<StagedImage>) {
    setImages((currentImages) =>
      currentImages.map((image) => (image.clientId === clientId ? { ...image, ...patch } : image)),
    );
  }

  return {
    hasPendingImages,
    imageInputRef,
    images,
    moveImage,
    removeImage,
    selectImages,
    syncPendingImages,
    updateImage,
  };
}

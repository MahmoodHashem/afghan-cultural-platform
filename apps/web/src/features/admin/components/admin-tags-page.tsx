"use client";

import { ExclamationTriangleIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminTagFormSheet } from "@/features/admin/components/admin-tag-form-sheet";
import { AdminTagStatusDialog } from "@/features/admin/components/admin-tag-status-dialog";
import { AdminTagsTable } from "@/features/admin/components/admin-tags-table";
import { AdminTagsToolbar } from "@/features/admin/components/admin-tags-toolbar";
import {
  useAdminTags,
  useCreateAdminTag,
  useSetAdminTagActive,
  useUpdateAdminTag,
} from "@/features/admin/hooks/use-admin-tags";
import type { AdminTagFormValues } from "@/features/admin/schemas/admin-tag-schema";
import type { AdminTag, AdminTagInput, AdminTagsQuery } from "@/features/admin/types/admin-tags";
import { createAdminTagsHref, parseAdminTagsQuery } from "@/features/admin/utils/admin-tags-url";

const EMPTY_META = { page: 1, limit: 20, total: 0, totalPages: 0 };

function AdminTagsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = parseAdminTagsQuery(searchParams);
  const tagsQuery = useAdminTags(query);
  const createMutation = useCreateAdminTag();
  const [editingTag, setEditingTag] = useState<AdminTag | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const updateMutation = useUpdateAdminTag(editingTag?.id ?? "");
  const [statusTag, setStatusTag] = useState<AdminTag | null>(null);
  const statusMutation = useSetAdminTagActive(statusTag?.id ?? "");
  const [isNavigating, startTransition] = useTransition();

  const updateQuery = useCallback(
    (updates: Partial<AdminTagsQuery>) => {
      startTransition(() =>
        router.replace(createAdminTagsHref(searchParams, { page: 1, ...updates }), {
          scroll: false,
        }),
      );
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="برچسب‌ها"
        description="مدیریت برچسب‌های عمومی برای پیوند دادن و پیدا کردن مطالب مرتبط"
        actions={
          <Button
            type="button"
            onClick={() => {
              setEditingTag(null);
              setFormOpen(true);
            }}
          >
            <PlusIcon className="size-4" aria-hidden="true" />
            برچسب جدید
          </Button>
        }
      />
      <Card className="gap-0 overflow-hidden rounded-xl py-0">
        <AdminTagsToolbar
          query={query}
          total={tagsQuery.data?.meta.total ?? 0}
          pending={isNavigating || tagsQuery.isFetching}
          onChange={updateQuery}
          onClear={() => startTransition(() => router.replace("/admin/tags", { scroll: false }))}
        />
        {tagsQuery.isError ? (
          <section
            className="flex min-h-72 flex-col items-center justify-center gap-4 px-6 text-center"
            role="alert"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ExclamationTriangleIcon className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h2 className="text-[16px] font-semibold">فهرست برچسب‌ها بارگذاری نشد</h2>
              <p className="text-[13px] text-muted-foreground">
                ارتباط با سرور برقرار نشد. دوباره تلاش کنید.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => void tagsQuery.refetch()}>
              تلاش دوباره
            </Button>
          </section>
        ) : (
          <AdminTagsTable
            tags={tagsQuery.data?.data ?? []}
            meta={tagsQuery.data?.meta ?? EMPTY_META}
            loading={tagsQuery.isLoading}
            updating={
              (tagsQuery.isFetching && !tagsQuery.isLoading) ||
              createMutation.isPending ||
              updateMutation.isPending ||
              statusMutation.isPending
            }
            onEdit={(tag) => {
              setEditingTag(tag);
              setFormOpen(true);
            }}
            onStatusAction={setStatusTag}
            onPageChange={(page) =>
              startTransition(() =>
                router.replace(createAdminTagsHref(searchParams, { page }), { scroll: false }),
              )
            }
          />
        )}
      </Card>
      <AdminTagFormSheet
        tag={editingTag}
        open={formOpen}
        pending={createMutation.isPending || updateMutation.isPending}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTag(null);
        }}
        onSubmit={async (values) => {
          const input = toTagInput(values);
          if (editingTag) await updateMutation.mutateAsync(input);
          else await createMutation.mutateAsync(input);
        }}
      />
      <AdminTagStatusDialog
        tag={statusTag}
        open={Boolean(statusTag)}
        pending={statusMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setStatusTag(null);
        }}
        onConfirm={() => {
          if (!statusTag) return;
          statusMutation.mutate(!statusTag.isActive, { onSuccess: () => setStatusTag(null) });
        }}
      />
    </div>
  );
}

function toTagInput(values: AdminTagFormValues): AdminTagInput {
  return {
    name: values.name.trim(),
    isActive: values.isActive,
  };
}

export { AdminTagsPage };

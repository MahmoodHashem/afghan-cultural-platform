"use client";

import { ArrowsUpDownIcon, ExclamationTriangleIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminTopicFormSheet } from "@/features/admin/components/admin-topic-form-sheet";
import { AdminTopicStatusDialog } from "@/features/admin/components/admin-topic-status-dialog";
import { AdminTopicsTable } from "@/features/admin/components/admin-topics-table";
import { AdminTopicsToolbar } from "@/features/admin/components/admin-topics-toolbar";
import {
  useAdminTopics,
  useCreateAdminTopic,
  useReorderAdminTopics,
  useSetAdminTopicActive,
  useUpdateAdminTopic,
} from "@/features/admin/hooks/use-admin-topics";
import type { AdminTopicFormValues } from "@/features/admin/schemas/admin-topic-schema";
import type {
  AdminTopic,
  AdminTopicInput,
  AdminTopicsQuery,
} from "@/features/admin/types/admin-topics";
import {
  createAdminTopicsHref,
  parseAdminTopicsQuery,
} from "@/features/admin/utils/admin-topics-url";

const EMPTY_META = { page: 1, limit: 20, total: 0, totalPages: 0 };

function AdminTopicsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = parseAdminTopicsQuery(searchParams);
  const topicsQuery = useAdminTopics(query);
  const createMutation = useCreateAdminTopic();
  const [editingTopic, setEditingTopic] = useState<AdminTopic | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const updateMutation = useUpdateAdminTopic(editingTopic?.id ?? "");
  const [statusTopic, setStatusTopic] = useState<AdminTopic | null>(null);
  const statusMutation = useSetAdminTopicActive(statusTopic?.id ?? "");
  const reorderMutation = useReorderAdminTopics();
  const [reorderTopics, setReorderTopics] = useState<AdminTopic[] | null>(null);
  const [isNavigating, startTransition] = useTransition();
  const topics = reorderTopics ?? topicsQuery.data?.data ?? [];
  const reorderMode = reorderTopics !== null;
  const canReorder =
    !query.search &&
    query.isActive === undefined &&
    query.sortBy === "sortOrder" &&
    query.sortDirection === "asc" &&
    (topicsQuery.data?.meta.total ?? 0) === (topicsQuery.data?.data.length ?? 0);

  const updateQuery = useCallback(
    (updates: Partial<AdminTopicsQuery>) => {
      startTransition(() => {
        router.replace(createAdminTopicsHref(searchParams, { page: 1, ...updates }), {
          scroll: false,
        });
      });
    },
    [router, searchParams],
  );

  const mutationPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    statusMutation.isPending ||
    reorderMutation.isPending;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="موضوع‌ها"
        description="ساخت و ویرایش موضوع‌های اصلی برای دسته‌بندی مطالب فرهنگی"
        actions={
          reorderMode ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={reorderMutation.isPending}
                onClick={() => setReorderTopics(null)}
              >
                انصراف
              </Button>
              <Button
                type="button"
                disabled={reorderMutation.isPending}
                onClick={() => {
                  void reorderMutation
                    .mutateAsync({
                      items: topics.map((topic, index) => ({
                        id: topic.id,
                        sortOrder: (index + 1) * 10,
                      })),
                    })
                    .then(() => setReorderTopics(null));
                }}
              >
                {reorderMutation.isPending ? "در حال ذخیره..." : "ذخیره ترتیب"}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={!canReorder || topics.length < 2}
                title={
                  !canReorder
                    ? "برای تغییر ترتیب، فیلترها را حذف و مرتب‌سازی پیش‌فرض را انتخاب کنید."
                    : undefined
                }
                onClick={() => setReorderTopics([...(topicsQuery.data?.data ?? [])])}
              >
                <ArrowsUpDownIcon className="size-4" aria-hidden="true" />
                تغییر ترتیب
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setEditingTopic(null);
                  setFormOpen(true);
                }}
              >
                <PlusIcon className="size-4" aria-hidden="true" />
                موضوع جدید
              </Button>
            </>
          )
        }
      />

      <Card className="gap-0 overflow-hidden rounded-xl py-0">
        {!reorderMode ? (
          <AdminTopicsToolbar
            query={query}
            total={topicsQuery.data?.meta.total ?? 0}
            pending={isNavigating || topicsQuery.isFetching}
            onChange={updateQuery}
            onClear={() =>
              startTransition(() => router.replace("/admin/topics", { scroll: false }))
            }
          />
        ) : (
          <div className="border-b border-primary/20 bg-primary/5 px-4 py-3 text-[13px] leading-6 text-primary md:px-5">
            با دکمه‌های بالا و پایین، ترتیب نمایش موضوع‌ها را تغییر دهید و سپس آن را ذخیره کنید.
          </div>
        )}

        {topicsQuery.isError ? (
          <section
            className="flex min-h-72 flex-col items-center justify-center gap-4 px-6 text-center"
            role="alert"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ExclamationTriangleIcon className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h2 className="text-[16px] font-semibold">فهرست موضوع‌ها بارگذاری نشد</h2>
              <p className="text-[13px] text-muted-foreground">
                ارتباط با سرور برقرار نشد. دوباره تلاش کنید.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => void topicsQuery.refetch()}>
              تلاش دوباره
            </Button>
          </section>
        ) : (
          <AdminTopicsTable
            topics={topics}
            meta={topicsQuery.data?.meta ?? EMPTY_META}
            loading={topicsQuery.isLoading}
            updating={(topicsQuery.isFetching && !topicsQuery.isLoading) || mutationPending}
            reorderMode={reorderMode}
            onEdit={(topic) => {
              setEditingTopic(topic);
              setFormOpen(true);
            }}
            onStatusAction={setStatusTopic}
            onMove={(index, direction) => {
              setReorderTopics((current) => {
                if (!current) return current;
                const nextIndex = index + direction;
                if (nextIndex < 0 || nextIndex >= current.length) return current;
                const next = [...current];
                const [moved] = next.splice(index, 1);
                if (!moved) return current;
                next.splice(nextIndex, 0, moved);
                return next;
              });
            }}
            onPageChange={(page) =>
              startTransition(() =>
                router.replace(createAdminTopicsHref(searchParams, { page }), { scroll: false }),
              )
            }
          />
        )}
      </Card>

      <AdminTopicFormSheet
        topic={editingTopic}
        open={formOpen}
        pending={createMutation.isPending || updateMutation.isPending}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTopic(null);
        }}
        onSubmit={async (values) => {
          const input = toTopicInput(values);
          if (editingTopic) await updateMutation.mutateAsync(input);
          else await createMutation.mutateAsync(input);
        }}
      />

      <AdminTopicStatusDialog
        topic={statusTopic}
        open={Boolean(statusTopic)}
        pending={statusMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setStatusTopic(null);
        }}
        onConfirm={() => {
          if (!statusTopic) return;
          statusMutation.mutate(!statusTopic.isActive, { onSuccess: () => setStatusTopic(null) });
        }}
      />
    </div>
  );
}

function toTopicInput(values: AdminTopicFormValues): AdminTopicInput {
  return {
    name: values.name.trim(),
    slug: values.slug.trim() || undefined,
    description: values.description.trim() || undefined,
    sortOrder: values.sortOrder,
    isActive: values.isActive,
  };
}

export { AdminTopicsPage };

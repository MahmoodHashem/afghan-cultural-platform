"use client";

import {
  ArrowRightIcon,
  ArrowsUpDownIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminDistrictFormDialog } from "@/features/admin/components/admin-district-form-dialog";
import { AdminDistrictsTable } from "@/features/admin/components/admin-districts-table";
import { AdminGeographyStatusDialog } from "@/features/admin/components/admin-geography-status-dialog";
import { AdminGeographyToolbar } from "@/features/admin/components/admin-geography-toolbar";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminProvinceFormSheet } from "@/features/admin/components/admin-province-form-sheet";
import { AdminProvinceImageDialog } from "@/features/admin/components/admin-province-image-dialog";
import {
  useAdminDistricts,
  useAdminProvince,
  useDistrictMutations,
  useProvinceImageMutations,
  useUpdateAdminProvince,
} from "@/features/admin/hooks/use-admin-provinces";
import type { AdminDistrict, AdminGeographyQuery } from "@/features/admin/types/admin-provinces";
import {
  createAdminGeographyHref,
  parseAdminGeographyQuery,
} from "@/features/admin/utils/admin-provinces-url";
import { getProvinceImage } from "@/lib/images/province-images";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";
import { createPersianPathSegment } from "@/lib/utils/persian";

const EMPTY_META = { page: 1, limit: 50, total: 0, totalPages: 0 };

function AdminProvinceDetailPage({ provinceId }: { provinceId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const route = `/admin/provinces/${provinceId}`;
  const query = parseAdminGeographyQuery(searchParams, 50);
  const provinceQuery = useAdminProvince(provinceId);
  const districtsQuery = useAdminDistricts(provinceId, query);
  const provinceMutation = useUpdateAdminProvince(provinceId);
  const imageMutations = useProvinceImageMutations(provinceId);
  const [editingDistrict, setEditingDistrict] = useState<AdminDistrict | null>(null);
  const districtMutations = useDistrictMutations(provinceId, editingDistrict?.id);
  const [provinceFormOpen, setProvinceFormOpen] = useState(false);
  const [imageFormOpen, setImageFormOpen] = useState(false);
  const [deleteImageOpen, setDeleteImageOpen] = useState(false);
  const [districtFormOpen, setDistrictFormOpen] = useState(false);
  const [statusDistrict, setStatusDistrict] = useState<AdminDistrict | null>(null);
  const statusDistrictMutations = useDistrictMutations(provinceId, statusDistrict?.id);
  const [reorderDistricts, setReorderDistricts] = useState<AdminDistrict[] | null>(null);
  const [isNavigating, startTransition] = useTransition();
  const districts = reorderDistricts ?? districtsQuery.data?.data ?? [];
  const reorderMode = reorderDistricts !== null;
  const canReorder =
    !query.search &&
    query.isActive === undefined &&
    query.sortBy === "sortOrder" &&
    query.sortDirection === "asc" &&
    (districtsQuery.data?.meta.total ?? 0) === (districtsQuery.data?.data.length ?? 0);
  const districtPending =
    districtMutations.create.isPending ||
    districtMutations.update.isPending ||
    statusDistrictMutations.setActive.isPending ||
    districtMutations.reorder.isPending;

  const updateQuery = useCallback(
    (updates: Partial<AdminGeographyQuery>) => {
      startTransition(() =>
        router.replace(createAdminGeographyHref(searchParams, { page: 1, ...updates }, route), {
          scroll: false,
        }),
      );
    },
    [route, router, searchParams],
  );

  if (provinceQuery.isLoading) return <ProvinceDetailSkeleton />;
  if (provinceQuery.isError || !provinceQuery.data)
    return <DetailError onRetry={() => void provinceQuery.refetch()} />;
  const province = provinceQuery.data;
  const displayedImage = getProvinceImage(province);
  const publicHref = `/provinces/${encodeURIComponent(createPersianPathSegment(province.name))}`;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={province.name}
        description="اطلاعات ولایت، تصویر عمومی و ولسوالی‌های مربوط را مدیریت کنید."
        actions={
          <>
            <Button variant="outline" render={<Link href="/admin/provinces" />}>
              <ArrowRightIcon className="size-4" />
              ولایت‌ها
            </Button>
            <Button variant="outline" render={<Link href={publicHref} target="_blank" />}>
              نمایش صفحه عمومی
            </Button>
            <Button onClick={() => setProvinceFormOpen(true)}>
              <PencilSquareIcon className="size-4" />
              ویرایش ولایت
            </Button>
          </>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,.75fr)]">
        <Card className="overflow-hidden p-0">
          <div className="grid md:grid-cols-[minmax(16rem,.8fr)_minmax(0,1.2fr)]">
            <div className="relative min-h-64 bg-muted">
              <Image
                src={displayedImage.src}
                alt={displayedImage.alt}
                fill
                sizes="(min-width:1280px) 430px, 100vw"
                className="object-cover"
              />
              {!province.image ? (
                <Badge className="absolute start-3 top-3 bg-background/90 text-foreground">
                  تصویر پیش‌فرض
                </Badge>
              ) : null}
            </div>
            <div className="flex flex-col justify-between gap-6 p-5 md:p-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[22px] font-bold">{province.name}</h2>
                  <Badge
                    variant="outline"
                    className={
                      province.isActive
                        ? "border-primary/20 bg-primary/8 text-primary"
                        : "text-muted-foreground"
                    }
                  >
                    {province.isActive ? "فعال" : "غیرفعال"}
                  </Badge>
                </div>
                <p className="text-[14px] leading-8 text-muted-foreground">
                  {province.description || "هنوز توضیحی برای این ولایت ثبت نشده است."}
                </p>
                <dl className="grid gap-3 text-[12px] sm:grid-cols-2">
                  <Meta label="نشانی" value={province.slug} ltr />
                  <Meta label="ترتیب نمایش" value={formatPersianNumber(province.sortOrder)} />
                  <Meta label="ساخته‌شده" value={formatPersianDate(province.createdAt)} />
                  <Meta label="آخرین ویرایش" value={formatPersianDate(province.updatedAt)} />
                </dl>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setImageFormOpen(true)}>
                  <PhotoIcon className="size-4" />
                  {province.image ? "تغییر تصویر" : "افزودن تصویر"}
                </Button>
                {province.image ? (
                  <Button
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => setDeleteImageOpen(true)}
                  >
                    <TrashIcon className="size-4" />
                    حذف تصویر
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="همه مطالب" value={province.entryCount} />
          <Stat label="مطالب منتشرشده" value={province.publishedEntryCount} />
          <Stat label="همه ولسوالی‌ها" value={province.districtCount} />
          <Stat label="ولسوالی‌های فعال" value={province.activeDistrictCount} />
        </div>
      </section>

      <Card className="gap-0 overflow-hidden rounded-xl py-0">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
          <div>
            <h2 className="text-[18px] font-semibold">ولسوالی‌ها</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              ولسوالی‌های وابسته به {province.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {reorderMode ? (
              <>
                <Button variant="outline" onClick={() => setReorderDistricts(null)}>
                  انصراف
                </Button>
                <Button
                  disabled={districtMutations.reorder.isPending}
                  onClick={() =>
                    void districtMutations.reorder
                      .mutateAsync({
                        items: districts.map((district, index) => ({
                          id: district.id,
                          sortOrder: (index + 1) * 10,
                        })),
                      })
                      .then(() => setReorderDistricts(null))
                  }
                >
                  ذخیره ترتیب
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  disabled={!canReorder || districts.length < 2}
                  onClick={() => setReorderDistricts([...(districtsQuery.data?.data ?? [])])}
                >
                  <ArrowsUpDownIcon className="size-4" />
                  تغییر ترتیب
                </Button>
                <Button
                  onClick={() => {
                    setEditingDistrict(null);
                    setDistrictFormOpen(true);
                  }}
                >
                  <PlusIcon className="size-4" />
                  افزودن ولسوالی
                </Button>
              </>
            )}
          </div>
        </div>
        {!reorderMode ? (
          <AdminGeographyToolbar
            id="admin-district-search"
            singular="ولسوالی"
            query={query}
            total={districtsQuery.data?.meta.total ?? 0}
            pending={isNavigating || districtsQuery.isFetching}
            onChange={updateQuery}
            onClear={() => startTransition(() => router.replace(route, { scroll: false }))}
          />
        ) : (
          <div className="border-b bg-primary/5 px-4 py-3 text-[13px] text-primary">
            ترتیب ولسوالی‌ها را با دکمه‌های بالا و پایین تغییر دهید.
          </div>
        )}
        {districtsQuery.isError ? (
          <DetailError compact onRetry={() => void districtsQuery.refetch()} />
        ) : (
          <AdminDistrictsTable
            districts={districts}
            meta={districtsQuery.data?.meta ?? EMPTY_META}
            loading={districtsQuery.isLoading}
            updating={(districtsQuery.isFetching && !districtsQuery.isLoading) || districtPending}
            reorderMode={reorderMode}
            onEdit={(district) => {
              setEditingDistrict(district);
              setDistrictFormOpen(true);
            }}
            onStatusAction={setStatusDistrict}
            onMove={(index, direction) =>
              setReorderDistricts((current) => {
                if (!current) return current;
                const target = index + direction;
                if (target < 0 || target >= current.length) return current;
                const next = [...current];
                const [moved] = next.splice(index, 1);
                if (!moved) return current;
                next.splice(target, 0, moved);
                return next;
              })
            }
            onPageChange={(page) =>
              startTransition(() =>
                router.replace(createAdminGeographyHref(searchParams, { page }, route), {
                  scroll: false,
                }),
              )
            }
          />
        )}
      </Card>

      <AdminProvinceFormSheet
        province={province}
        open={provinceFormOpen}
        pending={provinceMutation.isPending}
        onOpenChange={setProvinceFormOpen}
        onSubmit={async (values) => {
          await provinceMutation.mutateAsync({
            name: values.name.trim(),
            description: values.description.trim(),
            sortOrder: values.sortOrder,
            isActive: values.isActive,
          });
        }}
      />
      <AdminProvinceImageDialog
        image={province.image}
        open={imageFormOpen}
        pending={imageMutations.upload.isPending || imageMutations.updateMetadata.isPending}
        onOpenChange={setImageFormOpen}
        onSubmit={async ({ file, altText }) => {
          if (file) await imageMutations.upload.mutateAsync({ file, altText });
          else await imageMutations.updateMetadata.mutateAsync(altText);
        }}
      />
      <AdminDistrictFormDialog
        district={editingDistrict}
        open={districtFormOpen}
        pending={districtMutations.create.isPending || districtMutations.update.isPending}
        onOpenChange={(open) => {
          setDistrictFormOpen(open);
          if (!open) setEditingDistrict(null);
        }}
        onSubmit={async (values) => {
          const input = {
            provinceId,
            name: values.name.trim(),
            sortOrder: values.sortOrder,
            isActive: values.isActive,
          };
          if (editingDistrict) await districtMutations.update.mutateAsync(input);
          else await districtMutations.create.mutateAsync(input);
        }}
      />
      <AdminGeographyStatusDialog
        item={statusDistrict}
        singular="ولسوالی"
        open={Boolean(statusDistrict)}
        pending={statusDistrictMutations.setActive.isPending}
        onOpenChange={(open) => {
          if (!open) setStatusDistrict(null);
        }}
        onConfirm={() => {
          if (!statusDistrict) return;
          statusDistrictMutations.setActive.mutate(!statusDistrict.isActive, {
            onSuccess: () => setStatusDistrict(null),
          });
        }}
      />
      <AlertDialog
        open={deleteImageOpen}
        onOpenChange={imageMutations.remove.isPending ? undefined : setDeleteImageOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف تصویر مدیریت‌شده؟</AlertDialogTitle>
            <AlertDialogDescription>
              پس از حذف، تصویر موجود در فایل‌های عمومی یا تصویر پیش‌فرض نمایش داده می‌شود.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogCancel disabled={imageMutations.remove.isPending}>انصراف</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              disabled={imageMutations.remove.isPending}
              onClick={(event) => {
                event.preventDefault();
                imageMutations.remove.mutate(undefined, {
                  onSuccess: () => setDeleteImageOpen(false),
                });
              }}
            >
              {imageMutations.remove.isPending ? "در حال حذف..." : "حذف تصویر"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Meta({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="rounded-lg bg-muted/45 px-3 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd dir={ltr ? "ltr" : undefined} className="mt-1 truncate font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="justify-center gap-1 p-4 text-center">
      <p className="text-[24px] font-bold text-primary">{formatPersianNumber(value)}</p>
      <p className="text-[12px] text-muted-foreground">{label}</p>
    </Card>
  );
}
function ProvinceDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-60" />
      <Skeleton className="h-80 w-full rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}
function DetailError({ onRetry, compact = false }: { onRetry: () => void; compact?: boolean }) {
  return (
    <section
      className={`flex flex-col items-center justify-center gap-4 p-6 text-center ${compact ? "min-h-56" : "min-h-96"}`}
      role="alert"
    >
      <ExclamationTriangleIcon className="size-8 text-destructive" />
      <div>
        <h2 className="font-semibold">اطلاعات بارگذاری نشد</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">کمی بعد دوباره تلاش کنید.</p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        تلاش دوباره
      </Button>
    </section>
  );
}

export { AdminProvinceDetailPage };

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";

function AdminPlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-8">
      <AdminPageHeader title={title} />
      <section className="flex min-h-52 items-center justify-center rounded-control border border-dashed border-line-soft bg-surface/45 px-6 text-center">
        <div className="space-y-2">
          <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
          <p className="text-[14px] text-copy">این بخش در مرحله بعد پیاده‌سازی می‌شود.</p>
        </div>
      </section>
    </div>
  );
}

export { AdminPlaceholderPage };

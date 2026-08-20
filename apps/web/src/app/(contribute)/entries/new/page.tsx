import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/page-transition";
import { RequireAuth, RequireVerifiedEmail } from "@/features/auth/components/route-gates";
import { getContributionTaxonomyData } from "@/features/entries/api/contribution-taxonomy-api";
import { CreateEntryForm } from "@/features/entries/components/create-entry-form";

export const metadata: Metadata = {
  title: "ایجاد مطلب جدید | میراث افغانستان",
  description: "نوشتن و ارسال مطلب فرهنگی برای بررسی در میراث افغانستان.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewEntryPage() {
  const taxonomy = await getContributionTaxonomyData();

  return (
    <RequireAuth>
      <RequireVerifiedEmail>
        <PageTransition>
          <CreateEntryForm taxonomy={taxonomy} />
        </PageTransition>
      </RequireVerifiedEmail>
    </RequireAuth>
  );
}

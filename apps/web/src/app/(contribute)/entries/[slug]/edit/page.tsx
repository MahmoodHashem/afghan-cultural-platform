import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/page-transition";
import { RequireAuth, RequireVerifiedEmail } from "@/features/auth/components/route-gates";
import { getContributionTaxonomyData } from "@/features/entries/api/contribution-taxonomy-api";
import { CreateEntryForm } from "@/features/entries/components/create-entry-form";

type EditEntryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const metadata: Metadata = {
  title: "ویرایش مطلب",
  description: "ویرایش پیش‌نویس مطلب فرهنگی در میراث افغانستان.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditEntryPage({ params }: EditEntryPageProps) {
  const { slug } = await params;
  const taxonomy = await getContributionTaxonomyData();

  return (
    <RequireAuth>
      <RequireVerifiedEmail>
        <PageTransition>
          <CreateEntryForm initialDraftId={slug} taxonomy={taxonomy} />
        </PageTransition>
      </RequireVerifiedEmail>
    </RequireAuth>
  );
}

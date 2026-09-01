import type { Metadata } from "next";

import { PageTransition } from "@/components/layout/page-transition";
import {
  RequireAuth,
  RequireRole,
  RequireVerifiedEmail,
} from "@/features/auth/components/route-gates";
import { ModerationReviewPage } from "@/features/moderation/components/moderation-review-page";

type ModerationSubmissionPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "بررسی مطلب",
  description: "خواندن و ثبت نتیجه بررسی مطلب فرستاده‌شده.",
  robots: { index: false, follow: false },
};

export default async function ModerationSubmissionPage({ params }: ModerationSubmissionPageProps) {
  const { id } = await params;

  return (
    <RequireAuth>
      <RequireRole roles={["MODERATOR", "ADMIN"]}>
        <RequireVerifiedEmail>
          <PageTransition>
            <ModerationReviewPage entryId={id} />
          </PageTransition>
        </RequireVerifiedEmail>
      </RequireRole>
    </RequireAuth>
  );
}

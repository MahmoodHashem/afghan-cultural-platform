import type { Metadata } from "next";

import { PageTransition } from "@/components/layout/page-transition";
import {
  RequireAuth,
  RequireRole,
  RequireVerifiedEmail,
} from "@/features/auth/components/route-gates";
import { ReportReview } from "@/features/moderation/components/content-moderation-details";

export const metadata: Metadata = {
  title: "بررسی گزارش",
  robots: { index: false, follow: false },
};

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RequireAuth>
      <RequireRole roles={["MODERATOR", "ADMIN"]}>
        <RequireVerifiedEmail>
          <PageTransition>
            <ReportReview reportId={id} />
          </PageTransition>
        </RequireVerifiedEmail>
      </RequireRole>
    </RequireAuth>
  );
}

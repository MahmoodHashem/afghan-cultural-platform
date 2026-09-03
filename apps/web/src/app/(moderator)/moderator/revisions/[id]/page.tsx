import type { Metadata } from "next";

import { PageTransition } from "@/components/layout/page-transition";
import {
  RequireAuth,
  RequireRole,
  RequireVerifiedEmail,
} from "@/features/auth/components/route-gates";
import { EntryRevisionReview } from "@/features/moderation/components/entry-revision-moderation";

export const metadata: Metadata = {
  title: "بررسی ویرایش مطلب",
  robots: { index: false, follow: false },
};

export default async function EntryRevisionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireAuth>
      <RequireRole roles={["MODERATOR", "ADMIN"]}>
        <RequireVerifiedEmail>
          <PageTransition>
            <EntryRevisionReview revisionId={id} />
          </PageTransition>
        </RequireVerifiedEmail>
      </RequireRole>
    </RequireAuth>
  );
}

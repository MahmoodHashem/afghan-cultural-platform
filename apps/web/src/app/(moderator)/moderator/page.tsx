import type { Metadata } from "next";

import { PageTransition } from "@/components/layout/page-transition";
import {
  RequireAuth,
  RequireRole,
  RequireVerifiedEmail,
} from "@/features/auth/components/route-gates";
import { getContributionTaxonomyData } from "@/features/entries/api/contribution-taxonomy-api";
import { ModerationQueue } from "@/features/moderation/components/moderation-queue";

export const metadata: Metadata = {
  title: "صف بررسی مطالب | میراث افغانستان",
  description: "بررسی مطالب فرستاده‌شده در میراث افغانستان.",
  robots: { index: false, follow: false },
};

export default async function ModeratorQueuePage() {
  const taxonomy = await getContributionTaxonomyData();

  return (
    <RequireAuth>
      <RequireRole roles={["MODERATOR", "ADMIN"]}>
        <RequireVerifiedEmail>
          <PageTransition>
            <ModerationQueue taxonomy={taxonomy} />
          </PageTransition>
        </RequireVerifiedEmail>
      </RequireRole>
    </RequireAuth>
  );
}

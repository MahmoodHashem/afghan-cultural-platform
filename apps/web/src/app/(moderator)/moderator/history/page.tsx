import type { Metadata } from "next";

import { PageTransition } from "@/components/layout/page-transition";
import {
  RequireAuth,
  RequireRole,
  RequireVerifiedEmail,
} from "@/features/auth/components/route-gates";
import { ModerationHistory } from "@/features/moderation/components/content-moderation-queues";

export const metadata: Metadata = {
  title: "تاریخچه بررسی",
  robots: { index: false, follow: false },
};

export default function HistoryPage() {
  return (
    <RequireAuth>
      <RequireRole roles={["MODERATOR", "ADMIN"]}>
        <RequireVerifiedEmail>
          <PageTransition>
            <ModerationHistory />
          </PageTransition>
        </RequireVerifiedEmail>
      </RequireRole>
    </RequireAuth>
  );
}

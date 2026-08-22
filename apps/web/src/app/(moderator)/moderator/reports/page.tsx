import type { Metadata } from "next";

import { PageTransition } from "@/components/layout/page-transition";
import {
  RequireAuth,
  RequireRole,
  RequireVerifiedEmail,
} from "@/features/auth/components/route-gates";
import { ReportsQueue } from "@/features/moderation/components/content-moderation-queues";

export const metadata: Metadata = {
  title: "گزارش‌ها | میراث افغانستان",
  robots: { index: false, follow: false },
};

export default function ReportsPage() {
  return (
    <RequireAuth>
      <RequireRole roles={["MODERATOR", "ADMIN"]}>
        <RequireVerifiedEmail>
          <PageTransition>
            <ReportsQueue />
          </PageTransition>
        </RequireVerifiedEmail>
      </RequireRole>
    </RequireAuth>
  );
}

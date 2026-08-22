import type { Metadata } from "next";

import { PageTransition } from "@/components/layout/page-transition";
import {
  RequireAuth,
  RequireRole,
  RequireVerifiedEmail,
} from "@/features/auth/components/route-gates";
import { CorrectionQueue } from "@/features/moderation/components/content-moderation-queues";

export const metadata: Metadata = {
  title: "پیشنهادهای اصلاح | میراث افغانستان",
  robots: { index: false, follow: false },
};

export default function CorrectionsPage() {
  return (
    <RequireAuth>
      <RequireRole roles={["MODERATOR", "ADMIN"]}>
        <RequireVerifiedEmail>
          <PageTransition>
            <CorrectionQueue />
          </PageTransition>
        </RequireVerifiedEmail>
      </RequireRole>
    </RequireAuth>
  );
}

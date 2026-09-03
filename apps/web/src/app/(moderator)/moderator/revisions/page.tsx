import type { Metadata } from "next";

import { PageTransition } from "@/components/layout/page-transition";
import {
  RequireAuth,
  RequireRole,
  RequireVerifiedEmail,
} from "@/features/auth/components/route-gates";
import { EntryRevisionQueue } from "@/features/moderation/components/entry-revision-moderation";

export const metadata: Metadata = {
  title: "ویرایش‌های منتشرشده",
  robots: { index: false, follow: false },
};

export default function EntryRevisionsPage() {
  return (
    <RequireAuth>
      <RequireRole roles={["MODERATOR", "ADMIN"]}>
        <RequireVerifiedEmail>
          <PageTransition>
            <EntryRevisionQueue />
          </PageTransition>
        </RequireVerifiedEmail>
      </RequireRole>
    </RequireAuth>
  );
}

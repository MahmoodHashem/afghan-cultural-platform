import type { Metadata } from "next";

import { PageTransition } from "@/components/layout/page-transition";
import { RequireAuth } from "@/features/auth/components/route-gates";
import { OwnerProfilePage } from "@/features/profile/components/owner-profile-page";

export const metadata: Metadata = {
  title: "پروفایل من",
  description: "مدیریت نوشته‌ها، دیدگاه‌ها و ذخیره‌های حساب کاربری در میراث افغانستان.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePage() {
  return (
    <RequireAuth>
      <PageTransition>
        <OwnerProfilePage />
      </PageTransition>
    </RequireAuth>
  );
}

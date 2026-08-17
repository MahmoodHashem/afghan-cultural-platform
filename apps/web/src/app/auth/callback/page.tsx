import type { Metadata } from "next";
import { Suspense } from "react";

import { OAuthCallbackCompletion } from "@/features/auth/components/oauth-callback-completion";

export const metadata: Metadata = {
  title: "تکمیل ورود | میراث افغانستان",
  description: "تکمیل ورود به میراث افغانستان.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <OAuthCallbackCompletion />
    </Suspense>
  );
}

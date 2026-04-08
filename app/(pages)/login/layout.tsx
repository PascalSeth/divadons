import type { Metadata } from "next";

import { getSettings } from "@/lib/settings";

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: `Login | ${settings.siteName}`,
    description: "Sign in to your account",
  };
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

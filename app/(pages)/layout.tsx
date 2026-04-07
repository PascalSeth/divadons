import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AnnouncementBanner } from "../components/AnnouncementBanner";

import { getSettings } from "@/lib/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: {
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.metaDescription,
    icons: {
      icon: settings.faviconUrl || "/logo/1bg.png",
    },
  };
}

export default async function PagesLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <AnnouncementBanner />
      <Navbar settings={settings} />
      {children}
      <Footer settings={settings} />
    </div>
  );
}

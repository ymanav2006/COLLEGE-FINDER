import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import StoreHydrator from "@/components/StoreHydrator";

export const metadata: Metadata = {
  metadataBase: new URL("https://collegefinder.example"),
  title: {
    default: "CollegeFinder — Your Future Has More Than One Path",
    template: "%s · CollegeFinder",
  },
  description:
    "College Finder, career counsellor, course explorer, scholarship finder, study-abroad guide and higher-education planner. Every important number shows its source, date and confidence — and every recommendation explains why you're seeing it.",
  keywords: [
    "college finder",
    "career counsellor",
    "course explorer",
    "scholarships",
    "study abroad",
    "entrance exams",
    "compare colleges",
    "student roadmap",
    "India colleges",
  ],
  openGraph: {
    title: "CollegeFinder — Explore. Compare. Plan. Move Forward.",
    description:
      "Your Future Has More Than One Path. Discover courses, careers, colleges, exams, scholarships and study-abroad options — with sources and confidence shown for every claim.",
    type: "website",
    siteName: "CollegeFinder",
  },
  twitter: {
    card: "summary_large_image",
    title: "CollegeFinder — Your Future Has More Than One Path",
    description: "Explore. Compare. Plan. Move Forward.",
  },
  robots: { index: true, follow: true },
  category: "education",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#070d21" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <StoreHydrator />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

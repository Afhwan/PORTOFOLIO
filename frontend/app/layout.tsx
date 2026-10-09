import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { getPublishedProfilePhotoUrl } from "@/lib/portfolio/queries";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export async function generateMetadata(): Promise<Metadata> {
  let iconUrl = "/default-icon.svg";
  try {
    const profilePhotoUrl = await getPublishedProfilePhotoUrl();
    if (profilePhotoUrl) {
      const url = new URL(profilePhotoUrl);
      if (url.protocol === "https:") iconUrl = url.toString();
    }
  } catch (error) {
    console.warn("Could not determine the profile photo for the site icon; using the default icon.", error);
  }

  return {
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
      : undefined,
    title: {
      default: "Cybersecurity Portfolio",
      template: "%s | Cybersecurity Portfolio",
    },
    description: "Portofolio profesional cybersecurity engineer.",
    icons: { icon: iconUrl },
    openGraph: {
      title: "Cybersecurity Portfolio",
      description: "Portofolio profesional cybersecurity engineer.",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const enableAnalytics = process.env.VERCEL === "1";
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body>{children}{enableAnalytics && <Analytics />}</body>
    </html>
  );
}

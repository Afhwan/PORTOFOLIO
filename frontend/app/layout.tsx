import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  title: {
    default: "Cybersecurity Portfolio",
    template: "%s | Cybersecurity Portfolio",
  },
  description: "Portofolio profesional cybersecurity engineer.",
  openGraph: {
    title: "Cybersecurity Portfolio",
    description: "Portofolio profesional cybersecurity engineer.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}<Analytics /></body>
    </html>
  );
}

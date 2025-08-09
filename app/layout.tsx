import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/react";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ISO 8583 Simulator",
    template: "%s · ISO 8583 Simulator",
  },
  description:
    "Simulate ISO 8583 POS transactions in the browser. Built with React, Next.js, and Tailwind CSS.",
  applicationName: "ISO 8583 Simulator",
  generator: "React, Next.js, and Tailwind CSS",
  keywords: [
    "ISO 8583",
    "POS",
    "payments",
    "simulator",
    "financial",
    "messaging",
    "Next.js",
  ],
  authors: [{ name: "ISO 8583 Simulator" }],
  creator: "ISO 8583 Simulator",
  publisher: "ISO 8583 Simulator",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "ISO 8583 Simulator",
    siteName: "ISO 8583 Simulator",
    description:
      "Simulate financial transactions from POS terminals using the ISO 8583 message format.",
    images: [
      {
        url: "/iso8583sim.png",
        width: 1152,
        height: 768,
        alt: "ISO 8583 Simulator preview",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ISO 8583 Simulator",
    description:
      "Simulate financial transactions from POS terminals using the ISO 8583 message format.",
    images: ["/iso8583sim.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/swipe-card.png",
    apple: "/swipe-card.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <SiteFooter />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

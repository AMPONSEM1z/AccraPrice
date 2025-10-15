import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "AccraPrice - Bringing the World's Best to Your Doorstep",
  description:
    "Quality imported products at affordable prices. Shop from our curated collection of premium items.",
  generator: "kojo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Load Paystack script globally before components mount */}
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>

        {/* ✅ Add Toaster globally for notifications (profile updates, password changes, etc.) */}
        <Toaster richColors position="top-center" />

        <Analytics />
      </body>
    </html>
  );
}

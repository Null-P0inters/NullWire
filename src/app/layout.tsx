import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { AppProviders } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nullwire Notary | Decentralized Firmware Integrity",
  description:
    "Launch a decentralized firmware integrity notary that notarizes updates on-chain so every IoT device can self-verify firmware authenticity before install.",
  metadataBase: new URL("https://localhost:3000"),
  openGraph: {
    title: "Nullwire Notary",
    description:
      "Blockchain-backed firmware hash registry delivering verifiable updates for IoT devices.",
    url: "https://localhost:3000",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nullwire Notary",
    description:
      "Secure IoT firmware lifecycles with decentralized hash notarization and edge verification.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} bg-[color:var(--background)] text-[color:var(--text-primary)] antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

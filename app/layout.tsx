import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VyadhiNet — AI Disease Outbreak Detection for Rural India",
  description:
    "AI-Powered Communicable Disease Outbreak Detection & Spread Prediction for 640,000+ ASHA Workers across 6 Lakh+ Indian villages",
  keywords: ["disease outbreak", "ASHA worker", "rural India health", "AI epidemiology", "VyadhiNet"],
  authors: [{ name: "VyadhiNet Team" }],
  openGraph: {
    title: "VyadhiNet — AI Disease Outbreak Detection",
    description: "Real-time, AI-powered disease surveillance for rural India.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}

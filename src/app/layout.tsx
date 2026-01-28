import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DealFlow - Pokemon Card Arbitrage Tool",
  description: "Find profitable Pokemon card flips between TCGPlayer and eBay. Real profit calculations after all fees.",
  keywords: ["Pokemon cards", "TCGPlayer", "eBay", "arbitrage", "card flipping", "profit calculator"],
  authors: [{ name: "DealFlow" }],
  openGraph: {
    title: "DealFlow - Pokemon Card Arbitrage Tool",
    description: "Find profitable Pokemon card flips between TCGPlayer and eBay",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

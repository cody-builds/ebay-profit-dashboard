import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Navigation } from "@/components/layouts/Navigation";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DealFlow - eBay Profit Dashboard",
  description: "Track your eBay sales performance with automated profit calculations, comprehensive analytics, and business intelligence insights.",
  keywords: ["eBay", "profit tracking", "sales analytics", "business dashboard", "e-commerce", "profit calculator"],
  authors: [{ name: "DealFlow" }],
  openGraph: {
    title: "DealFlow - eBay Profit Dashboard",
    description: "Track your eBay sales performance with automated profit calculations and analytics",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0066cc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <div className="min-h-screen bg-gray-50">
                <Navigation />
                <main className="container mx-auto px-4 py-6">
                  {children}
                </main>
              </div>
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

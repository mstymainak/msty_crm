import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SplashScreen from "@/app/components/SplashScreen";
import PWARegister from "@/app/components/PWARegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mahesh Sharma Tirth Yatra CRM",
  description: "Complete CRM system for pilgrimage management",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MSTY CRM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SplashScreen />
        <PWARegister />
        {children}
      </body>
    </html>
  );
}

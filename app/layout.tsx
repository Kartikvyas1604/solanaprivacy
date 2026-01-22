import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/providers/WalletProvider";
import { ArciumProvider } from "@/components/providers/ArciumProvider";
import { SmoothCursor } from "@/components/ui/smooth-cursor";

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
  title: "Spectre Protocol",
  description: "Zero-Knowledge Asset Management on Solana",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable} antialiased bg-black text-white`}>
        {/* <SmoothCursor /> */}
        <WalletProvider>
          <ArciumProvider>
            {children}
          </ArciumProvider>
        </WalletProvider>
      </body>
    </html>
  );
}

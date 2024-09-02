import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Satisfy } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/home/header";
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] });

const satisfy = Satisfy({ weight:"400", subsets: ["latin"], variable: "--font-satisfy" });

export const metadata: Metadata = {
  title: "Zen Hotels",
  description: "Find Hotel Rooms, Rates & Deals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${satisfy.variable} dark`}>
        <Header />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Contractor Burnlist - Know Who You're Working For",
  description: "A contractor-verified registry of problem customers. Search before you start.",
  icons: {
    icon: "/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-[#0a0a0a] text-white antialiased`}>
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}

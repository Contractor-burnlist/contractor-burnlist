import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Contractor Burnlist — Vet Your Customers Before You Start",
  description: "Avoid the headaches. Vet your customers before the first nail goes in. The contractor community's registry for flagging problem clients.",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: "Contractor Burnlist — Vet Your Customers Before You Start",
    description: "Avoid the headaches. Vet your customers before the first nail goes in.",
    url: "https://contractorburnlist.com",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} min-h-full bg-white text-[#111111] antialiased`}>
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Contractor Burnlist — Vet Your Customers Before You Start",
  description: "Avoid the headaches. Vet your customers before the first nail goes in. The contractor community's registry for flagging problem clients.",
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
      <body className={`${inter.className} min-h-full bg-white text-[#111111] antialiased`}>
        <Navbar />
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { DM_Sans, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const body = DM_Sans({ subsets: ["latin"], variable: '--font-body' });
const display = Barlow_Condensed({ subsets: ["latin"], weight: ['700', '800', '900'], variable: '--font-display' });

export const metadata: Metadata = {
  title: "Contractor Burnlist — Vet Your Customers Before You Start",
  description: "Avoid the headaches. Vet your customers before the first nail goes in. The contractor community's database for flagging problem clients.",
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
    <html lang="en" className={`h-full ${body.variable} ${display.variable}`}>
      <body className={`${body.className} min-h-full bg-white text-[#111111] antialiased`}>
        <Navbar />
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], weight: ['300', '400', '600', '700', '900'] });

export const metadata: Metadata = {
  title: "Super Menu",
  description: "Menù digitale di lusso",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className={`${montserrat.className} bg-white`}>{children}</body>
    </html>
  );
}
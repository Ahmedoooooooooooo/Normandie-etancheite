import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Normandie Étanchéité - Experts en toiture depuis plus de 20 ans",
  description:
    "Artisans certifiés RGE spécialisés en étanchéité et toiture en Normandie. Devis gratuit, intervention sous 48h, garantie décennale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

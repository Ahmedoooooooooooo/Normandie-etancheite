import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Normandie Étanchéité - Experts en toiture depuis 1998 · Normandie",
  description:
    "Artisans certifiés RGE spécialisés en étanchéité et toiture en Normandie. Devis gratuit, intervention sous 48h, garantie décennale. Plus de 1500 chantiers réalisés.",
  openGraph: {
    title: "Normandie Étanchéité - Experts en toiture depuis 1998",
    description:
      "Artisans certifiés RGE spécialisés en étanchéité et toiture en Normandie. Devis gratuit, intervention sous 48h, garantie décennale.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`${inter.variable} ${syne.variable} font-sans antialiased bg-[#080d14]`}
      >
        {children}
      </body>
    </html>
  );
}

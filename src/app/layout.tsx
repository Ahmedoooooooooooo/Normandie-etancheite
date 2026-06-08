import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Normandie Étanchéité — Couvreur Flers 61100',
  description: 'Expert en étanchéité et couverture à Flers (61100). Devis gratuit, intervention rapide en Normandie.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

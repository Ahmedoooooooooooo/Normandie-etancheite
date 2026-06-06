"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg leading-tight">
              Normandie{" "}
              <span className="text-orange-500">Étanchéité</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/#services"
              className="text-slate-300 hover:text-orange-400 transition-colors text-sm font-medium"
            >
              Nos services
            </Link>
            <Link
              href="/#realisations"
              className="text-slate-300 hover:text-orange-400 transition-colors text-sm font-medium"
            >
              Réalisations
            </Link>
            <Link
              href="/#temoignages"
              className="text-slate-300 hover:text-orange-400 transition-colors text-sm font-medium"
            >
              Témoignages
            </Link>
            <Link
              href="/rendez-vous"
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors"
            >
              Devis gratuit
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-slate-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-700 py-4 space-y-3">
            <Link
              href="/#services"
              className="block text-slate-300 hover:text-orange-400 transition-colors py-2"
              onClick={() => setMenuOpen(false)}
            >
              Nos services
            </Link>
            <Link
              href="/#realisations"
              className="block text-slate-300 hover:text-orange-400 transition-colors py-2"
              onClick={() => setMenuOpen(false)}
            >
              Réalisations
            </Link>
            <Link
              href="/#temoignages"
              className="block text-slate-300 hover:text-orange-400 transition-colors py-2"
              onClick={() => setMenuOpen(false)}
            >
              Témoignages
            </Link>
            <Link
              href="/rendez-vous"
              className="block bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-lg font-semibold text-center transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Devis gratuit
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

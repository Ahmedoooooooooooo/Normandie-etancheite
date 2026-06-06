"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#080d14]/95 backdrop-blur-md shadow-lg shadow-black/30 border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-700 shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
                Normandie{" "}
                <span className="text-orange-500">Étanchéité</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { href: "/#services", label: "Nos garanties" },
                { href: "/#comment-ca-marche", label: "Comment ça marche" },
                { href: "/#realisations", label: "Réalisations" },
                { href: "/#temoignages", label: "Témoignages" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-slate-300 hover:text-white transition-colors text-sm font-medium group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-400 group-hover:w-full transition-all duration-300 rounded-full" />
                </Link>
              ))}

              {/* Phone number */}
              <a
                href="tel:+33232000000"
                className="text-slate-300 hover:text-orange-400 transition-colors text-sm font-medium flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                02 32 00 00 00
              </a>

              <Link
                href="/rendez-vous"
                className="btn-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm inline-flex items-center gap-2"
              >
                Devis gratuit
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
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
        </div>
      </header>

      {/* Full-screen mobile overlay menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[#080d14]/98 backdrop-blur-xl"
          onClick={() => setMenuOpen(false)}
        />

        {/* Menu content */}
        <div
          className={`relative flex flex-col h-full px-6 pt-24 pb-10 transition-all duration-300 ${
            menuOpen ? "translate-y-0" : "-translate-y-8"
          }`}
        >
          {/* Nav links */}
          <div className="flex flex-col gap-2 mb-8">
            {[
              { href: "/#services", label: "Nos garanties" },
              { href: "/#comment-ca-marche", label: "Comment ça marche" },
              { href: "/#realisations", label: "Réalisations" },
              { href: "/#temoignages", label: "Témoignages" },
            ].map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-2xl font-bold text-slate-200 hover:text-orange-400 transition-colors py-3 border-b border-white/5"
                style={{
                  fontFamily: "var(--font-syne), sans-serif",
                  transitionDelay: menuOpen ? `${i * 60}ms` : "0ms",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3 mt-auto">
            <a
              href="tel:+33232000000"
              className="flex items-center justify-center gap-2 border border-white/10 text-white py-4 rounded-2xl font-semibold text-lg"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              02 32 00 00 00
            </a>
            <Link
              href="/rendez-vous"
              onClick={() => setMenuOpen(false)}
              className="btn-primary flex items-center justify-center gap-2 text-white py-4 rounded-2xl font-bold text-lg"
            >
              Expertise gratuite
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

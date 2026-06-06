"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";

// Before/After Gallery data
const projects = [
  {
    id: 1,
    title: "Réfection toiture ardoise",
    location: "Rouen, Seine-Maritime",
    avant: "https://placehold.co/800x500/1e293b/94a3b8?text=Avant+-+Toiture+Ardoise",
    apres: "https://placehold.co/800x500/f97316/ffffff?text=Apr%C3%A8s+-+Toiture+Ardoise",
  },
  {
    id: 2,
    title: "Étanchéité toiture terrasse",
    location: "Caen, Calvados",
    avant: "https://placehold.co/800x500/1e293b/94a3b8?text=Avant+-+Terrasse",
    apres: "https://placehold.co/800x500/f97316/ffffff?text=Apr%C3%A8s+-+Terrasse",
  },
  {
    id: 3,
    title: "Remplacement tuiles rondes",
    location: "Le Havre, Seine-Maritime",
    avant: "https://placehold.co/800x500/1e293b/94a3b8?text=Avant+-+Tuiles+Rondes",
    apres: "https://placehold.co/800x500/f97316/ffffff?text=Apr%C3%A8s+-+Tuiles+Rondes",
  },
  {
    id: 4,
    title: "Zinguerie et gouttières",
    location: "Cherbourg, Manche",
    avant: "https://placehold.co/800x500/1e293b/94a3b8?text=Avant+-+Zinguerie",
    apres: "https://placehold.co/800x500/f97316/ffffff?text=Apr%C3%A8s+-+Zinguerie",
  },
];

// Testimonials data
const testimonials = [
  {
    name: "Marie-Claire Dupont",
    location: "Rouen",
    rating: 5,
    text: "Intervention rapide et professionnelle suite à une infiltration d'eau après les fortes pluies. L'équipe est arrivée sous 48h comme promis, le travail est impeccable. Je recommande vivement !",
    date: "Novembre 2024",
  },
  {
    name: "Jean-Pierre Moreau",
    location: "Caen",
    rating: 5,
    text: "Réfection complète de ma toiture en ardoise. Devis détaillé, prix honnête et travail soigné. Les artisans ont respecté les délais et laissé le chantier propre. Excellent rapport qualité-prix.",
    date: "Octobre 2024",
  },
  {
    name: "Sophie Lambert",
    location: "Le Havre",
    rating: 5,
    text: "Très satisfaite de l'étanchéité réalisée sur ma toiture terrasse. Plus aucune infiltration depuis les travaux. L'équipe est à l'écoute et les conseils sont précieux. Parfait !",
    date: "Septembre 2024",
  },
];

// Trust badges
const trustBadges = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Devis gratuit",
    subtitle: "Sans engagement",
    desc: "Obtenez votre devis détaillé gratuitement, sans aucune obligation de votre part.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Artisans certifiés RGE",
    subtitle: "Qualité garantie",
    desc: "Nos artisans sont certifiés Reconnu Garant de l'Environnement pour des travaux de qualité.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Intervention sous 48h",
    subtitle: "Réactivité maximale",
    desc: "Nous intervenons rapidement, notamment pour les urgences et situations critiques.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: "Garantie décennale",
    subtitle: "Protégé 10 ans",
    desc: "Tous nos travaux sont couverts par notre garantie décennale pour votre tranquillité d'esprit.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? "text-orange-400" : "text-slate-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function BeforeAfterCard({ project }: { project: typeof projects[0] }) {
  const [showAfter, setShowAfter] = useState(false);

  return (
    <div className="glass-card rounded-2xl overflow-hidden hover:border-orange-500/30 transition-all duration-300 group hover:scale-[1.01]">
      <div className="relative">
        {/* Image container */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "8/5" }}>
          {/* Before image */}
          <Image
            src={project.avant}
            alt={`Avant - ${project.title}`}
            fill
            className={`object-cover transition-opacity duration-500 ${showAfter ? "opacity-0" : "opacity-100"}`}
            unoptimized
          />
          {/* After image */}
          <Image
            src={project.apres}
            alt={`Après - ${project.title}`}
            fill
            className={`object-cover transition-opacity duration-500 ${showAfter ? "opacity-100" : "opacity-0"}`}
            unoptimized
          />

          {/* Gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          {/* Premium badge */}
          <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-all duration-300 ${
            showAfter
              ? "bg-orange-500/90 text-white border border-orange-400/50"
              : "bg-black/50 text-slate-300 border border-white/10"
          }`}>
            {showAfter ? "APRÈS" : "AVANT"}
          </div>

          {/* Toggle buttons */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/60 backdrop-blur-md rounded-full p-1.5 border border-white/10">
            <button
              onClick={() => setShowAfter(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                !showAfter
                  ? "bg-white/20 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Avant
            </button>
            <button
              onClick={() => setShowAfter(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                showAfter
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Après
            </button>
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-white text-lg">{project.title}</h3>
        <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-orange-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {project.location}
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080d14] text-white">
      <Header />

      {/* ── HERO SECTION ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
        {/* Dot grid background */}
        <div className="absolute inset-0 dot-grid" />

        {/* Orange glow blurs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)" }} />

        {/* Diagonal stripe */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[800px] h-[800px] rotate-[30deg] opacity-[0.03]"
            style={{ background: "linear-gradient(135deg, #f97316 0%, transparent 60%)" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
          {/* Badge pill */}
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 rounded-full px-5 py-2 mb-10">
            <span className="text-orange-400 text-sm font-semibold">⚡ Experts en toiture depuis 1998 · Normandie</span>
          </div>

          {/* Main headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-7 max-w-4xl"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            L&apos;expertise toiture{" "}
            <br className="hidden sm:block" />
            <span className="gradient-text">qui protège votre maison</span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
            Artisans certifiés RGE spécialisés en étanchéité, réfection et rénovation de toiture en Normandie. Disponibles sous 48h.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href="/rendez-vous"
              className="btn-primary text-white px-8 py-4 rounded-2xl font-bold text-lg inline-flex items-center gap-2"
            >
              Expertise gratuite
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="tel:+33232000000"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200"
            >
              📞 02 32 00 00 00
            </a>
          </div>

          {/* Mini trust badges */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400 mb-16">
            {["Certifié RGE", "Garantie décennale", "Intervention sous 48h"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </span>
            ))}
          </div>

          {/* Stats bar */}
          <div className="w-full max-w-3xl glass-card glow-orange rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: "20+", label: "ans d'expertise" },
              { value: "1500+", label: "chantiers réalisés" },
              { value: "48h", label: "délai d'intervention" },
              { value: "4.9★", label: "satisfaction client" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-3xl font-extrabold gradient-text"
                  style={{ fontFamily: "var(--font-syne), sans-serif" }}
                >
                  {stat.value}
                </div>
                <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ────────────────────────────────────────── */}
      <section id="comment-ca-marche" className="py-24 relative overflow-hidden" style={{ background: "#0c1520" }}>
        <div className="absolute inset-0 line-grid" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">Processus</p>
            <h2
              className="text-4xl sm:text-5xl font-extrabold text-white"
              style={{ fontFamily: "var(--font-syne), sans-serif" }}
            >
              Simple, rapide, efficace
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line desktop */}
            <div className="hidden md:block absolute top-12 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

            {[
              {
                num: "1",
                title: "Prenez RDV",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                desc: "Choisissez votre créneau en ligne en 2 minutes, sans attente.",
              },
              {
                num: "2",
                title: "Expertise gratuite",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                desc: "Un expert se déplace chez vous pour évaluer votre toiture gratuitement.",
              },
              {
                num: "3",
                title: "Travaux réalisés",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                desc: "Nos artisans interviennent dans les meilleurs délais, avec soin et professionnalisme.",
              },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center group">
                {/* Step number circle */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-white relative z-10"
                    style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 0 40px rgba(249,115,22,0.3)" }}>
                    {step.icon}
                  </div>
                  <div
                    className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black border-2 border-[#0c1520]"
                    style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", fontFamily: "var(--font-syne), sans-serif" }}
                  >
                    {step.num}
                  </div>
                </div>
                <h3
                  className="text-xl font-bold text-white mb-3"
                  style={{ fontFamily: "var(--font-syne), sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-slate-400 leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/rendez-vous"
              className="btn-primary text-white px-8 py-4 rounded-2xl font-bold text-lg inline-flex items-center gap-2"
            >
              Prendre RDV maintenant
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── POURQUOI NOUS (Trust Badges) ─────────────────────────────── */}
      <section id="services" className="py-24 relative overflow-hidden bg-[#080d14]">
        <div className="absolute inset-0 dot-grid" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">Nos engagements</p>
            <h2
              className="text-4xl sm:text-5xl font-extrabold text-white mb-4"
              style={{ fontFamily: "var(--font-syne), sans-serif" }}
            >
              Les garanties{" "}
              <span className="gradient-text">Normandie Étanchéité</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Notre engagement : vous offrir le meilleur service avec des garanties solides et durables.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge) => (
              <div
                key={badge.title}
                className="glass-card rounded-2xl p-6 hover:border-l-2 hover:border-orange-500 transition-all duration-300 group hover:scale-[1.02] cursor-default"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white mb-5 transition-all duration-300"
                  style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
                >
                  {badge.icon}
                </div>
                <h3
                  className="text-lg font-bold text-white mb-1"
                  style={{ fontFamily: "var(--font-syne), sans-serif" }}
                >
                  {badge.title}
                </h3>
                <p className="text-orange-400 text-sm font-medium mb-3">{badge.subtitle}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOS RÉALISATIONS (Before/After) ──────────────────────────── */}
      <section id="realisations" className="py-24 relative overflow-hidden" style={{ background: "#0a1118" }}>
        <div className="absolute inset-0 line-grid" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">Portfolio</p>
            <h2
              className="text-4xl sm:text-5xl font-extrabold text-white mb-4"
              style={{ fontFamily: "var(--font-syne), sans-serif" }}
            >
              Nos réalisations
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Découvrez la transformation de nos chantiers. Cliquez sur &quot;Avant&quot; / &quot;Après&quot; pour comparer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-14">
            {projects.map((project) => (
              <BeforeAfterCard key={project.id} project={project} />
            ))}
          </div>

          {/* Full-width banner */}
          <div className="glass-card rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3
                className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: "var(--font-syne), sans-serif" }}
              >
                Chaque projet est unique.
              </h3>
              <p className="text-slate-400">Votre devis est gratuit et sans engagement.</p>
            </div>
            <Link
              href="/rendez-vous"
              className="btn-primary text-white px-8 py-4 rounded-2xl font-bold text-lg inline-flex items-center gap-2 shrink-0"
            >
              Demander un devis gratuit
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ──────────────────────────────────────────────── */}
      <section id="temoignages" className="py-24 relative overflow-hidden bg-[#080d14]">
        <div className="absolute inset-0 dot-grid" />
        {/* Diagonal gradient overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.03) 0%, transparent 50%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">Avis clients</p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span
                className="text-6xl font-extrabold gradient-text"
                style={{ fontFamily: "var(--font-syne), sans-serif" }}
              >
                4.9★
              </span>
            </div>
            <p className="text-slate-400 text-lg">248 avis vérifiés · Basé sur Google Reviews</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="glass-card rounded-2xl p-7 hover:border-t-2 hover:border-orange-500 transition-all duration-300 group flex flex-col"
              >
                {/* Large quote icon */}
                <div className="text-6xl font-serif text-orange-500/30 leading-none mb-4 select-none">&ldquo;</div>

                <StarRating rating={t.rating} />

                <p className="text-slate-300 mt-4 mb-6 leading-relaxed text-base flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
                  >
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{t.location} · {t.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden bg-[#080d14]">
        {/* Orange radial glow center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 65%)" }} />
        </div>
        {/* Line grid overlay */}
        <div className="absolute inset-0 line-grid" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Votre toiture mérite{" "}
            <span className="gradient-text">le meilleur</span>
          </h2>
          <p className="text-slate-400 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Ne laissez pas un problème de toiture s&apos;aggraver. Profitez d&apos;une expertise gratuite et sans engagement dès maintenant.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/rendez-vous"
              className="btn-primary text-white px-10 py-5 rounded-2xl font-bold text-xl inline-flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Expertise gratuite
            </Link>
            <a
              href="tel:+33232000000"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              02 32 00 00 00
            </a>
          </div>

          {/* Reassurance icons */}
          <div className="flex flex-wrap justify-center gap-8 text-slate-400 text-sm">
            {[
              {
                icon: (
                  <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                label: "Certifié RGE",
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                label: "Réponse sous 24h",
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ),
                label: "4.9★ satisfaction",
              },
            ].map((item) => (
              <span key={item.label} className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="bg-[#060b11] border-t border-white/5 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Column 1: Brand */}
            <div>
              <Link href="/" className="flex items-center gap-3 mb-4 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
                  Normandie <span className="text-orange-500">Étanchéité</span>
                </span>
              </Link>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Expert en étanchéité et rénovation de toiture en Normandie depuis plus de 20 ans.
              </p>
              {/* Social icons (placeholders) */}
              <div className="flex gap-3 mb-6">
                {["facebook", "instagram", "linkedin"].map((social) => (
                  <a key={social} href="#" aria-label={social}
                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-orange-500/20 border border-white/5 hover:border-orange-500/30 flex items-center justify-center transition-all duration-200">
                    <div className="w-4 h-4 bg-slate-500 rounded-sm" />
                  </a>
                ))}
              </div>
              {/* Certification pills */}
              <div className="flex flex-wrap gap-2">
                {["RGE Qualibat", "Garantie décennale", "RC Pro"].map((cert) => (
                  <span key={cert}
                    className="text-xs px-3 py-1 rounded-full border border-orange-500/20 text-orange-400/80 bg-orange-500/5">
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Column 2: Services */}
            <div>
              <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
                Nos services
              </h3>
              <ul className="space-y-2.5">
                {[
                  "Étanchéité toiture",
                  "Réfection toiture",
                  "Zinguerie & gouttières",
                  "Tuiles & ardoises",
                  "Toiture terrasse",
                  "Membrane EPDM",
                  "Diagnostic & expertise",
                ].map((service) => (
                  <li key={service}>
                    <a href="#" className="text-slate-400 hover:text-orange-400 text-sm transition-colors flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-orange-500/60" />
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Zone d'intervention */}
            <div>
              <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
                Zone d&apos;intervention
              </h3>
              <ul className="space-y-2.5">
                {["Rouen", "Caen", "Le Havre", "Cherbourg", "Évreux", "Alençon", "Lisieux", "Dieppe"].map((city) => (
                  <li key={city}>
                    <a href="#" className="text-slate-400 hover:text-orange-400 text-sm transition-colors flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-orange-500/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {city}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
                Contact
              </h3>
              <div className="space-y-4">
                <a href="tel:+33232000000"
                  className="flex items-start gap-3 text-slate-400 hover:text-orange-400 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-orange-500/20 transition-colors">
                    <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">02 32 00 00 00</p>
                    <p className="text-xs mt-0.5">Lun – Sam 8h00 – 18h00</p>
                  </div>
                </a>

                <a href="mailto:contact@normandie-etancheite.fr"
                  className="flex items-start gap-3 text-slate-400 hover:text-orange-400 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-orange-500/20 transition-colors">
                    <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">contact@normandie-etancheite.fr</p>
                    <p className="text-xs mt-0.5">Réponse sous 24h</p>
                  </div>
                </a>

                <div className="flex items-start gap-3 text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">76000 Rouen, Normandie</p>
                    <p className="text-xs mt-0.5">Zone d&apos;intervention : toute la Normandie</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-600 text-sm">
            <p>© {new Date().getFullYear()} Normandie Étanchéité. Tous droits réservés.</p>
            <p>Site réalisé par des experts pour des experts</p>
          </div>
        </div>
      </footer>

      {/* ── MOBILE STICKY BAR ────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0f1724]/95 backdrop-blur-md border-t border-white/10 p-3 flex gap-3">
        <a
          href="tel:+33232000000"
          className="flex-1 flex items-center justify-center gap-2 border border-white/10 text-white py-3 rounded-xl font-semibold text-sm hover:bg-white/5 transition-colors"
        >
          📞 Appeler
        </a>
        <Link
          href="/rendez-vous"
          className="flex-1 btn-primary flex items-center justify-center gap-2 text-white py-3 rounded-xl font-bold text-sm"
        >
          Prendre RDV
        </Link>
      </div>
    </div>
  );
}

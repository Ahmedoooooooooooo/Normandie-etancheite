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
    <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-orange-500/50 transition-all duration-300">
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
          {/* Badge */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-bold transition-all duration-300 ${showAfter ? "bg-orange-500 text-white" : "bg-slate-700 text-slate-300"}`}>
            {showAfter ? "APRÈS" : "AVANT"}
          </div>
        </div>

        {/* Toggle buttons */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-slate-900/80 backdrop-blur-sm rounded-full p-1">
          <button
            onClick={() => setShowAfter(false)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${!showAfter ? "bg-slate-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
          >
            Avant
          </button>
          <button
            onClick={() => setShowAfter(true)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${showAfter ? "bg-orange-500 text-white" : "text-slate-400 hover:text-slate-200"}`}
          >
            Après
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white">{project.title}</h3>
        <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-orange-400 text-sm font-medium">Plus de 20 ans d&apos;expertise en Normandie</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Votre toiture entre{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              les mains d&apos;experts
            </span>
            <br />
            depuis plus de 20 ans
          </h1>

          <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Artisans certifiés RGE spécialisés en étanchéité, réfection et rénovation de toiture en Normandie.
            Devis gratuit, intervention rapide, garantie décennale.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/rendez-vous"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Prendre rendez-vous gratuit
            </Link>
            <a
              href="tel:+33232000000"
              className="inline-flex items-center gap-2 border border-slate-600 hover:border-orange-500 text-slate-300 hover:text-orange-400 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              02 32 00 00 00
            </a>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: "20+", label: "Années d'expérience" },
              { value: "1500+", label: "Chantiers réalisés" },
              { value: "48h", label: "Délai d'intervention" },
              { value: "10 ans", label: "Garantie décennale" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold text-orange-500">{stat.value}</div>
                <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section id="services" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Notre engagement : vous offrir le meilleur service avec des garanties solides.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge) => (
              <div
                key={badge.title}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-500 mb-4 group-hover:bg-orange-500/20 transition-colors">
                  {badge.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{badge.title}</h3>
                <p className="text-orange-400 text-sm font-medium mb-2">{badge.subtitle}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Gallery */}
      <section id="realisations" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Nos réalisations
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Découvrez la transformation de nos chantiers. Cliquez sur &quot;Avant&quot; / &quot;Après&quot; pour comparer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <BeforeAfterCard key={project.id} project={project} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/rendez-vous"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg shadow-orange-500/25"
            >
              Demander un devis gratuit
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="temoignages" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Plus de 1500 clients satisfaits en Normandie nous font confiance.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <StarRating rating={5} />
              <span className="text-white font-semibold">4.9/5</span>
              <span className="text-slate-400">· 248 avis</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300"
              >
                {/* Quote icon */}
                <svg className="w-8 h-8 text-orange-500/40 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <StarRating rating={t.rating} />
                <p className="text-slate-300 mt-4 mb-6 leading-relaxed text-sm">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 border-t border-slate-700 pt-4">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500 font-bold text-sm">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.location} · {t.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDM0di0yaC0ydi0yaDJ2LTJoMnYyaDJ2MmgtMnpNNiA0djItSDR2LTJIMnYtMmgydi0yaDJ2MmgydjJINnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Votre toiture a besoin d&apos;une inspection ?
          </h2>
          <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
            Ne laissez pas un problème de toiture s&apos;aggraver. Prenez rendez-vous dès maintenant pour un diagnostic gratuit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/rendez-vous"
              className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Prendre rendez-vous gratuit
            </Link>
            <a
              href="tel:+33232000000"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Appelez-nous maintenant
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-white font-bold text-lg">
                  Normandie <span className="text-orange-500">Étanchéité</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Expert en étanchéité et rénovation de toiture en Normandie depuis plus de 20 ans.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-slate-400 text-sm">
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  02 32 00 00 00
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  contact@normandie-etancheite.fr
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  76000 Rouen, Normandie
                </p>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {["RGE Qualibat", "Garantie décennale", "Artisan certifié", "Assurance RC Pro"].map((cert) => (
                  <span key={cert} className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} Normandie Étanchéité. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

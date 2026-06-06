"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";

// ── Types ──────────────────────────────────────────────────────────────
interface AddressSuggestion {
  label: string;
  city: string;
  postcode: string;
  context: string;
}

interface FormData {
  // Step 1 – Date & time
  date: string;
  time: string;
  // Step 2 – Personal info
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  societe: string;
  adresse: string;
  // Step 3 – Chantier info
  surface: number;
  typeToiture: string;
  etatGeneral: string;
  description: string;
  accessibilite: string;
}

interface FormErrors {
  [key: string]: string;
}

// ── Constants ──────────────────────────────────────────────────────────
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "14:00", "15:00", "16:00", "17:00",
];

const TYPE_TOITURE_OPTIONS = [
  { value: "", label: "Sélectionnez un type" },
  { value: "tuiles-plates", label: "Tuiles plates" },
  { value: "tuiles-rondes", label: "Tuiles rondes" },
  { value: "ardoise", label: "Ardoise" },
  { value: "zinc", label: "Zinc" },
  { value: "bac-acier", label: "Bac acier" },
  { value: "membrane-epdm", label: "Membrane EPDM" },
  { value: "toiture-terrasse", label: "Toiture terrasse" },
  { value: "autre", label: "Autre" },
];

const ETAT_GENERAL_OPTIONS = [
  { value: "bon-etat", label: "Bon état", color: "green" },
  { value: "quelques-problemes", label: "Quelques problèmes", color: "yellow" },
  { value: "mauvais-etat", label: "Mauvais état", color: "orange" },
  { value: "urgence", label: "Urgence", color: "red" },
];

const ACCESSIBILITE_OPTIONS = [
  { value: "", label: "Sélectionnez l'accessibilité" },
  { value: "plain-pied", label: "Plain-pied" },
  { value: "1-etage", label: "1 étage" },
  { value: "2-etages-plus", label: "2 étages et plus" },
  { value: "difficile-acces", label: "Difficile d'accès" },
];

// ── Helper: Calendar ────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// ── Calendar Component ─────────────────────────────────────────────────
function Calendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: string;
  onSelect: (date: string) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const isPrevDisabled = viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth <= today.getMonth());

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          disabled={isPrevDisabled}
          className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          type="button"
          aria-label="Mois précédent"
        >
          <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-white font-semibold text-lg">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
          type="button"
          aria-label="Mois suivant"
        >
          <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-slate-500 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(viewYear, viewMonth, day);
          date.setHours(0, 0, 0, 0);
          const isSunday = date.getDay() === 0;
          const isPast = date < today;
          const isDisabled = isSunday || isPast;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = dateStr === selectedDate;
          const isToday = date.getTime() === today.getTime();

          return (
            <button
              key={day}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(dateStr)}
              className={`
                relative aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-150
                ${isDisabled ? "text-slate-700 cursor-not-allowed" : "cursor-pointer hover:bg-slate-700"}
                ${isSelected ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/30" : ""}
                ${isToday && !isSelected ? "border border-orange-500/50 text-orange-400" : ""}
                ${!isSelected && !isDisabled ? "text-slate-300" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Address Autocomplete ───────────────────────────────────────────────
function AddressInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) { setSuggestions([]); setIsOpen(false); return; }
    setIsLoading(true);
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await res.json();
      const formatted: AddressSuggestion[] = (data.features || []).map((f: {
        properties: { label: string; city: string; postcode: string; context: string }
      }) => ({
        label: f.properties.label,
        city: f.properties.city,
        postcode: f.properties.postcode,
        context: f.properties.context,
      }));
      setSuggestions(formatted);
      setIsOpen(formatted.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = (suggestion: AddressSuggestion) => {
    onChange(suggestion.label);
    setSuggestions([]);
    setIsOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="Ex: 12 rue de la Paix, Rouen"
          className={`w-full bg-slate-700 border ${error ? "border-red-500" : "border-slate-600"} rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors pr-10`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-xl overflow-hidden shadow-xl">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-0"
            >
              <div className="text-white text-sm font-medium">{s.label}</div>
              <div className="text-slate-400 text-xs mt-0.5">{s.context}</div>
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

// ── Step Indicator ─────────────────────────────────────────────────────
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: "Date & heure" },
    { num: 2, label: "Vos informations" },
    { num: 3, label: "Votre chantier" },
  ];

  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((step, idx) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                currentStep > step.num
                  ? "bg-orange-500 text-white"
                  : currentStep === step.num
                  ? "bg-orange-500 text-white ring-4 ring-orange-500/30"
                  : "bg-slate-700 text-slate-400"
              }`}
            >
              {currentStep > step.num ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : step.num}
            </div>
            <span className={`text-xs mt-1.5 font-medium hidden sm:block ${currentStep === step.num ? "text-orange-400" : "text-slate-500"}`}>
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mx-2 transition-colors duration-300 ${currentStep > step.num ? "bg-orange-500" : "bg-slate-700"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────
export default function RendezVousPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    date: "",
    time: "",
    prenom: "",
    nom: "",
    telephone: "",
    email: "",
    societe: "",
    adresse: "",
    surface: 50,
    typeToiture: "",
    etatGeneral: "",
    description: "",
    accessibilite: "",
  });

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  // ── Validation ──────────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const e: FormErrors = {};
    if (!formData.date) e.date = "Veuillez sélectionner une date.";
    if (!formData.time) e.time = "Veuillez sélectionner un créneau horaire.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: FormErrors = {};
    if (!formData.prenom.trim()) e.prenom = "Le prénom est requis.";
    if (!formData.nom.trim()) e.nom = "Le nom est requis.";
    if (!formData.telephone.trim()) {
      e.telephone = "Le numéro de téléphone est requis.";
    } else if (!/^(\+33|0)[1-9](\d{8}|\s\d{2}\s\d{2}\s\d{2}\s\d{2})$/.test(formData.telephone.replace(/\s/g, ""))) {
      e.telephone = "Format invalide (ex: 06 12 34 56 78).";
    }
    if (!formData.email.trim()) {
      e.email = "L'email est requis.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = "Adresse email invalide.";
    }
    if (!formData.adresse.trim()) e.adresse = "L'adresse du chantier est requise.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = (): boolean => {
    const e: FormErrors = {};
    if (!formData.typeToiture) e.typeToiture = "Veuillez sélectionner le type de toiture.";
    if (!formData.etatGeneral) e.etatGeneral = "Veuillez indiquer l'état général.";
    if (!formData.accessibilite) e.accessibilite = "Veuillez sélectionner l'accessibilité.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    let valid = false;
    if (step === 1) valid = validateStep1();
    else if (step === 2) valid = validateStep2();
    else if (step === 3) valid = validateStep3();
    if (valid) setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;
    console.log("Rendez-vous soumis :", formData);
    setSubmitted(true);
  };

  // ── Format date for display ─────────────────────────────────────────
  const formatDateFR = (dateStr: string): string => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return date.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  // ── Success state ───────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Header />
        <div className="pt-16 min-h-screen flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            {/* Success icon */}
            <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-extrabold text-white mb-3">
              Rendez-vous confirmé !
            </h1>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Merci <strong className="text-white">{formData.prenom} {formData.nom}</strong> !
              Nous vous contacterons dans les 24h pour confirmer votre rendez-vous.
            </p>

            {/* Appointment summary */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-left mb-8 space-y-3">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Récapitulatif
              </h2>
              {[
                { label: "Date", value: formatDateFR(formData.date) },
                { label: "Heure", value: formData.time },
                { label: "Contact", value: `${formData.prenom} ${formData.nom}` },
                { label: "Téléphone", value: formData.telephone },
                { label: "Email", value: formData.email },
                { label: "Adresse", value: formData.adresse },
                { label: "Surface", value: `${formData.surface} m²` },
                { label: "Type de toiture", value: TYPE_TOITURE_OPTIONS.find(o => o.value === formData.typeToiture)?.label || formData.typeToiture },
                { label: "État", value: ETAT_GENERAL_OPTIONS.find(o => o.value === formData.etatGeneral)?.label || formData.etatGeneral },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-400 shrink-0">{label}</span>
                  <span className="text-white text-right">{value}</span>
                </div>
              ))}
            </div>

            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-8">
              <p className="text-orange-300 text-sm">
                Nous vous contacterons dans les <strong>24h</strong> au {formData.telephone} pour confirmer votre rendez-vous.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />

      <div className="pt-16">
        {/* Page header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-800 py-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span className="text-orange-400 text-sm font-medium">Gratuit et sans engagement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Prendre rendez-vous
            </h1>
            <p className="text-slate-400">
              Remplissez le formulaire ci-dessous — notre expert vous rappellera sous 24h.
            </p>
          </div>
        </div>

        {/* Form container */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <StepIndicator currentStep={step} />

          <form onSubmit={handleSubmit} noValidate>
            {/* ── STEP 1: Date & Time ───────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Choisissez une date</h2>
                  <p className="text-slate-400 text-sm mb-4">Les dimanches ne sont pas disponibles.</p>
                  <Calendar selectedDate={formData.date} onSelect={(d) => updateField("date", d)} />
                  {errors.date && <p className="text-red-400 text-sm mt-2">{errors.date}</p>}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Choisissez un créneau</h2>
                  <div className="grid grid-cols-4 gap-3">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => updateField("time", slot)}
                        className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          formData.time === slot
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                            : "bg-slate-700 border border-slate-600 text-slate-300 hover:border-orange-500/50 hover:text-white"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {errors.time && <p className="text-red-400 text-sm mt-2">{errors.time}</p>}
                </div>

                {/* Summary if selected */}
                {formData.date && formData.time && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center gap-3">
                    <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-orange-300 text-sm">
                      <strong>Créneau sélectionné :</strong> {formatDateFR(formData.date)} à {formData.time}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 2: Personal Info ─────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-white mb-1">Vos informations</h2>
                <p className="text-slate-400 text-sm mb-4">Ces informations nous permettront de vous contacter.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Prénom */}
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Prénom <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={e => updateField("prenom", e.target.value)}
                      placeholder="Jean"
                      className={`w-full bg-slate-700 border ${errors.prenom ? "border-red-500" : "border-slate-600"} rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors`}
                    />
                    {errors.prenom && <p className="text-red-400 text-sm mt-1">{errors.prenom}</p>}
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Nom <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={e => updateField("nom", e.target.value)}
                      placeholder="Dupont"
                      className={`w-full bg-slate-700 border ${errors.nom ? "border-red-500" : "border-slate-600"} rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors`}
                    />
                    {errors.nom && <p className="text-red-400 text-sm mt-1">{errors.nom}</p>}
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Téléphone <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={e => updateField("telephone", e.target.value)}
                    placeholder="06 12 34 56 78"
                    className={`w-full bg-slate-700 border ${errors.telephone ? "border-red-500" : "border-slate-600"} rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors`}
                  />
                  {errors.telephone && <p className="text-red-400 text-sm mt-1">{errors.telephone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Email <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => updateField("email", e.target.value)}
                    placeholder="jean.dupont@email.com"
                    className={`w-full bg-slate-700 border ${errors.email ? "border-red-500" : "border-slate-600"} rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors`}
                  />
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Société (optional) */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Société <span className="text-slate-500">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.societe}
                    onChange={e => updateField("societe", e.target.value)}
                    placeholder="Nom de votre entreprise"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                {/* Adresse avec autocomplete */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Adresse du chantier <span className="text-orange-500">*</span>
                  </label>
                  <AddressInput
                    value={formData.adresse}
                    onChange={(val) => updateField("adresse", val)}
                    error={errors.adresse}
                  />
                  <p className="text-slate-500 text-xs mt-1">Commencez à taper pour voir des suggestions</p>
                </div>
              </div>
            )}

            {/* ── STEP 3: Chantier Info ─────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-1">Informations sur votre chantier</h2>
                <p className="text-slate-400 text-sm mb-4">Ces détails nous aident à préparer notre intervention.</p>

                {/* Surface slider */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-3">
                    Surface approximative de la toiture
                    <span className="ml-2 text-orange-400 font-bold">{formData.surface} m²</span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={500}
                    step={5}
                    value={formData.surface}
                    onChange={e => updateField("surface", Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>10 m²</span>
                    <span>500 m²</span>
                  </div>
                </div>

                {/* Type de toiture */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Type de toiture <span className="text-orange-500">*</span>
                  </label>
                  <select
                    value={formData.typeToiture}
                    onChange={e => updateField("typeToiture", e.target.value)}
                    className={`w-full bg-slate-700 border ${errors.typeToiture ? "border-red-500" : "border-slate-600"} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer`}
                  >
                    {TYPE_TOITURE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-slate-700">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.typeToiture && <p className="text-red-400 text-sm mt-1">{errors.typeToiture}</p>}
                </div>

                {/* État général */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-3">
                    État général de la toiture <span className="text-orange-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {ETAT_GENERAL_OPTIONS.map(opt => {
                      const isSelected = formData.etatGeneral === opt.value;
                      const colorMap: Record<string, string> = {
                        green: isSelected ? "border-green-500 bg-green-500/20 text-green-400" : "border-slate-600 hover:border-green-500/50",
                        yellow: isSelected ? "border-yellow-500 bg-yellow-500/20 text-yellow-400" : "border-slate-600 hover:border-yellow-500/50",
                        orange: isSelected ? "border-orange-500 bg-orange-500/20 text-orange-400" : "border-slate-600 hover:border-orange-500/50",
                        red: isSelected ? "border-red-500 bg-red-500/20 text-red-400" : "border-slate-600 hover:border-red-500/50",
                      };
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateField("etatGeneral", opt.value)}
                          className={`py-3 px-3 rounded-xl text-sm font-medium border transition-all duration-200 ${colorMap[opt.color]} ${!isSelected ? "text-slate-300 bg-slate-700" : ""}`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.etatGeneral && <p className="text-red-400 text-sm mt-2">{errors.etatGeneral}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Description du problème ou projet
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => updateField("description", e.target.value)}
                    placeholder="Décrivez votre problème ou projet (infiltrations, tuiles cassées, rénovation complète...)"
                    rows={4}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  />
                </div>

                {/* Accessibilité */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Étage / Accessibilité <span className="text-orange-500">*</span>
                  </label>
                  <select
                    value={formData.accessibilite}
                    onChange={e => updateField("accessibilite", e.target.value)}
                    className={`w-full bg-slate-700 border ${errors.accessibilite ? "border-red-500" : "border-slate-600"} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer`}
                  >
                    {ACCESSIBILITE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-slate-700">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.accessibilite && <p className="text-red-400 text-sm mt-1">{errors.accessibilite}</p>}
                </div>
              </div>
            )}

            {/* ── Navigation buttons ─────────────────────────────────── */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-6 py-3 rounded-xl font-medium transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Retour
                </button>
              ) : (
                <Link
                  href="/"
                  className="flex items-center gap-2 text-slate-400 hover:text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Accueil
                </Link>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-orange-500/25"
                >
                  Suivant
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg shadow-orange-500/25"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Confirmer le rendez-vous
                </button>
              )}
            </div>
          </form>

          {/* Trust indicators */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-slate-500 text-xs">
            {[
              "Gratuit et sans engagement",
              "Réponse sous 24h",
              "Artisans certifiés RGE",
              "Garantie décennale",
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

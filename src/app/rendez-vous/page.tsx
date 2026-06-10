'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
const AFTERNOON_SLOTS = ['14:00', '15:00', '16:00', '17:00']

function isAfternoonClosed(date: string): boolean {
  if (!date) return false
  const day = new Date(date + 'T12:00:00').getDay()
  return day === 3 || day === 5 // Mercredi ou Vendredi
}

const COMPANY_LAT = 48.7480
const COMPANY_LON = -0.5636

function getHonorairesTarif(surface: number): number {
  if (surface <= 50) return 150
  if (surface <= 100) return 200
  if (surface <= 200) return 300
  if (surface <= 500) return 450
  return 600
}

function getDeplacementTarif(distanceKm: number): number {
  if (distanceKm <= 20) return 30
  if (distanceKm <= 40) return 50
  if (distanceKm <= 60) return 80
  if (distanceKm <= 80) return 120
  return 180
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

interface FormData {
  date: string
  heure: string
  prenom: string
  nom: string
  telephone: string
  email: string
  societe: string
  adresse: string
  surface_m2: number
  type_toiture: string
  etat_general: string
  accessibilite: string
  description: string
}

const defaultForm: FormData = {
  date: '',
  heure: '',
  prenom: '',
  nom: '',
  telephone: '',
  email: '',
  societe: '',
  adresse: '',
  surface_m2: 0,
  type_toiture: '',
  etat_general: '',
  accessibilite: '',
  description: '',
}

export default function RendezVousPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  function set(field: keyof FormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function step1Valid() {
    return form.date !== '' && form.heure !== ''
  }

  function step2Valid() {
    return (
      form.prenom.trim() !== '' &&
      form.nom.trim() !== '' &&
      form.telephone.trim() !== '' &&
      form.email.trim() !== '' &&
      form.adresse.trim() !== ''
    )
  }

  function step3Valid() {
    return (
      form.surface_m2 > 0 &&
      form.type_toiture !== '' &&
      form.etat_general !== '' &&
      form.accessibilite !== ''
    )
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')

    let distanceKm = 0
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(form.adresse)}&limit=1`
      )
      const data = await res.json()
      if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].geometry.coordinates
        distanceKm = haversineDistance(COMPANY_LAT, COMPANY_LON, lat, lon)
      }
    } catch {
      // geocoding failed, distance stays 0
    }

    const honoraires = getHonorairesTarif(form.surface_m2)
    const deplacement = getDeplacementTarif(distanceKm)
    const total_ht = honoraires + deplacement
    const total_ttc = Math.round(total_ht * 1.20 * 100) / 100
    const devis_numero = `NE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

    const dateObj = new Date(form.date + 'T12:00:00')
    const date_formatee = dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const devisData = {
      ...form,
      date_formatee,
      devis_numero,
      devis_honoraires: honoraires,
      devis_deplacement: deplacement,
      devis_distance_km: Math.round(distanceKm),
      devis_total_ht: total_ht,
      devis_total_ttc: total_ttc,
      devis_signe: false,
    }

    sessionStorage.setItem('normandie_devis', JSON.stringify(devisData))
    router.push('/devis')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="text-[#1e3a5f] font-bold text-sm">
              Normandie <span className="text-orange-500">Étanchéité</span>
            </span>
          </Link>
          <span className="text-slate-400 text-sm">Prise de rendez-vous</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  s === step
                    ? 'bg-orange-500 text-white'
                    : s < step
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {s < step ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s
                )}
              </div>
              {s < 3 && <div className={`w-16 h-1 rounded ${s < step ? 'bg-[#1e3a5f]' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8">
          {/* Step 1 — Date & heure */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-[#1e3a5f] mb-1">Choisissez une date</h1>
              <p className="text-slate-500 mb-8">Sélectionnez le jour et le créneau horaire souhaité</p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Date de l&apos;intervention</label>
                <input
                  type="date"
                  min={today}
                  value={form.date}
                  onChange={(e) => {
                    const newDate = e.target.value
                    setForm((prev) => ({
                      ...prev,
                      date: newDate,
                      heure: isAfternoonClosed(newDate) && AFTERNOON_SLOTS.includes(prev.heure) ? '' : prev.heure,
                    }))
                  }}
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
                {isAfternoonClosed(form.date) && (
                  <p className="text-xs text-orange-500 mt-2">
                    Pas de rendez-vous l&apos;après-midi le mercredi et le vendredi.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Créneau horaire</label>
                <div className="grid grid-cols-4 gap-3">
                  {TIME_SLOTS.map((slot) => {
                    const disabled = isAfternoonClosed(form.date) && AFTERNOON_SLOTS.includes(slot)
                    return (
                      <button
                        key={slot}
                        onClick={() => !disabled && set('heure', slot)}
                        disabled={disabled}
                        className={`py-3 rounded-lg text-sm font-semibold border-2 transition-colors ${
                          disabled
                            ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
                            : form.heure === slot
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500'
                        }`}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Coordonnées client */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-[#1e3a5f] mb-1">Vos coordonnées</h1>
              <p className="text-slate-500 mb-8">Ces informations apparaîtront sur votre devis</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Prénom *</label>
                  <input
                    type="text"
                    value={form.prenom}
                    onChange={(e) => set('prenom', e.target.value)}
                    placeholder="Jean"
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nom *</label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => set('nom', e.target.value)}
                    placeholder="Dupont"
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Téléphone *</label>
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={(e) => set('telephone', e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="jean@exemple.fr"
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Société <span className="text-slate-400 font-normal">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={form.societe}
                  onChange={(e) => set('societe', e.target.value)}
                  placeholder="Nom de votre entreprise"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse du chantier *</label>
                <input
                  type="text"
                  value={form.adresse}
                  onChange={(e) => set('adresse', e.target.value)}
                  placeholder="12 rue de la Paix, 61000 Alençon"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
                <p className="text-xs text-slate-400 mt-1">Utilisée pour calculer les frais de déplacement</p>
              </div>
            </div>
          )}

          {/* Step 3 — Informations chantier */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-[#1e3a5f] mb-1">Votre chantier</h1>
              <p className="text-slate-500 mb-8">Ces informations permettent d&apos;établir votre devis</p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Surface approximative (m²) *</label>
                <input
                  type="number"
                  min={1}
                  value={form.surface_m2 || ''}
                  onChange={(e) => set('surface_m2', parseInt(e.target.value) || 0)}
                  placeholder="Ex : 120"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Type de toiture *</label>
                  <select
                    value={form.type_toiture}
                    onChange={(e) => set('type_toiture', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                  >
                    <option value="">Sélectionner</option>
                    {['Ardoise', 'Tuile', 'Zinc', 'Bitume', 'EPDM', 'Autre'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">État général *</label>
                  <select
                    value={form.etat_general}
                    onChange={(e) => set('etat_general', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                  >
                    <option value="">Sélectionner</option>
                    {['Bon état', 'Dégradé', 'Mauvais état', 'À rénover'].map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Accessibilité *</label>
                  <select
                    value={form.accessibilite}
                    onChange={(e) => set('accessibilite', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                  >
                    <option value="">Sélectionner</option>
                    {['Facile', 'Difficile', 'Très difficile'].map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description des travaux <span className="text-slate-400 font-normal">(optionnel)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={4}
                  placeholder="Décrivez le problème ou les travaux souhaités..."
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-semibold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 ? !step1Valid() : !step2Valid()}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-8 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                Suivant
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!step3Valid() || loading}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-8 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Calcul du devis...
                  </>
                ) : (
                  <>
                    Voir mon devis
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>

          {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
        </div>
      </div>
    </div>
  )
}

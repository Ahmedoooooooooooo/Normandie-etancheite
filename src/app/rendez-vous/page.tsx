'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DateTimePicker from './DateTimePicker'

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
const AFTERNOON_SLOTS = ['13:00', '14:00', '15:00', '16:00', '17:00']
const APPOINTMENT_DURATION_MINUTES = 60
const AVERAGE_SPEED_KMH = 50

// L'artisan doit pouvoir rentrer à Flers au plus tard à cette heure
const LATEST_RETURN_TIME = '19:30'

// Battement minimum appliqué entre deux rendez-vous lorsque le temps de
// trajet réel ne peut pas être calculé (adresse manquante ou non géocodée)
const DEFAULT_TRAVEL_BUFFER_MINUTES = 30

// Webhook n8n qui interroge en direct l'API Zoho Calendar (OAuth2) du
// calendrier "Expertise toiture" et renvoie les rendez-vous déjà
// programmés pour une date donnée.
const GET_APPOINTMENTS_WEBHOOK_URL = 'https://n8n.srv1591454.hstgr.cloud/webhook/get-appointments'

const COMPANY_LAT = 48.7480
const COMPANY_LON = -0.5636

type DayClosure = 'none' | 'afternoon' | 'full'

function getDayClosure(date: string): DayClosure {
  if (!date) return 'none'
  const day = new Date(date + 'T12:00:00').getDay()
  if (day === 5) return 'full' // Vendredi : pas de rendez-vous
  if (day === 3) return 'afternoon' // Mercredi : pas de rendez-vous l'après-midi
  return 'none'
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

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

// Distance et durée de trajet réelles (par la route) via OSRM, avec repli
// sur une estimation à vol d'oiseau si le service est indisponible
async function getDistanceAndDuration(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<{ distanceKm: number; durationMinutes: number }> {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`
    )
    const data = await res.json()
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      return { distanceKm: route.distance / 1000, durationMinutes: route.duration / 60 }
    }
  } catch {
    // OSRM indisponible
  }
  const distanceKm = haversineDistance(lat1, lon1, lat2, lon2)
  return { distanceKm, durationMinutes: (distanceKm / AVERAGE_SPEED_KMH) * 60 }
}

async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`)
    const data = await res.json()
    if (data.features && data.features.length > 0) {
      const [lon, lat] = data.features[0].geometry.coordinates
      return { lat, lon }
    }
  } catch {
    // géocodage indisponible
  }
  return null
}

interface AddressSuggestion {
  label: string
  lat: number
  lon: number
}

async function fetchAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  try {
    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`)
    const data = await res.json()
    if (Array.isArray(data.features)) {
      return data.features.map((f: { properties: { label: string }; geometry: { coordinates: [number, number] } }) => ({
        label: f.properties.label,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
      }))
    }
  } catch {
    // suggestions indisponibles
  }
  return []
}

interface RawAppointment {
  heure: string
  adresse?: string
}

interface ExistingAppointment {
  heure: string
  lat?: number
  lon?: number
}

async function fetchExistingAppointments(date: string): Promise<RawAppointment[]> {
  try {
    const res = await fetch(`${GET_APPOINTMENTS_WEBHOOK_URL}?date=${date}`)
    if (!res.ok) return []
    const data = await res.json()
    const list: RawAppointment[] = Array.isArray(data?.appointments) ? data.appointments : []
    return list.filter((a) => typeof a?.heure === 'string')
  } catch {
    return []
  }
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
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const [addressCoords, setAddressCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [geocoding, setGeocoding] = useState(false)
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [existingAppointments, setExistingAppointments] = useState<ExistingAppointment[]>([])
  const [unavailableSlots, setUnavailableSlots] = useState<Set<string>>(new Set())
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const dayClosure = getDayClosure(form.date)

  function set(field: keyof FormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Recherche des suggestions d'adresse (avec un léger débounce) et
  // géocode l'adresse saisie pour calculer les trajets
  useEffect(() => {
    const address = form.adresse.trim()
    if (!address) {
      setAddressCoords(null)
      setAddressSuggestions([])
      return
    }
    let cancelled = false
    setGeocoding(true)
    const timeout = setTimeout(async () => {
      const suggestions = await fetchAddressSuggestions(address)
      if (cancelled) return
      setAddressSuggestions(suggestions)
      setAddressCoords(suggestions.length > 0 ? { lat: suggestions[0].lat, lon: suggestions[0].lon } : null)
      setGeocoding(false)
    }, 800)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [form.adresse])

  // Dès que la date est choisie, interroge le calendrier "Expertise toiture"
  // et géocode l'adresse de chaque rendez-vous déjà programmé ce jour-là
  useEffect(() => {
    if (!form.date) {
      setExistingAppointments([])
      return
    }
    let cancelled = false
    setCheckingAvailability(true)
    ;(async () => {
      const appointments = await fetchExistingAppointments(form.date)
      if (cancelled) return
      const enriched = await Promise.all(
        appointments.map(async (a): Promise<ExistingAppointment> => {
          if (!a.adresse) return { heure: a.heure }
          const coords = await geocodeAddress(a.adresse)
          return coords ? { heure: a.heure, lat: coords.lat, lon: coords.lon } : { heure: a.heure }
        })
      )
      if (cancelled) return
      setExistingAppointments(enriched)
    })()
    return () => {
      cancelled = true
    }
  }, [form.date])

  // Recalcule les créneaux indisponibles : chevauchement direct avec un
  // rendez-vous existant, ou temps de trajet insuffisant si l'adresse du
  // client est connue
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setCheckingAvailability(true)
      let withTravel: Array<{ heure: string; travelMinutes: number | null }> = existingAppointments.map((a) => ({
        heure: a.heure,
        travelMinutes: null,
      }))
      let returnTravelMinutes: number | null = null
      if (addressCoords) {
        withTravel = await Promise.all(
          existingAppointments.map(async (appt) => {
            if (appt.lat === undefined || appt.lon === undefined) {
              return { heure: appt.heure, travelMinutes: null }
            }
            const { durationMinutes } = await getDistanceAndDuration(addressCoords.lat, addressCoords.lon, appt.lat, appt.lon)
            return { heure: appt.heure, travelMinutes: durationMinutes }
          })
        )
        const toFlers = await getDistanceAndDuration(addressCoords.lat, addressCoords.lon, COMPANY_LAT, COMPANY_LON)
        returnTravelMinutes = toFlers.durationMinutes
      }
      if (cancelled) return
      const latestReturnMinutes = timeToMinutes(LATEST_RETURN_TIME)
      const unavailable = new Set<string>()
      for (const slot of TIME_SLOTS) {
        const slotStart = timeToMinutes(slot)
        const slotEnd = slotStart + APPOINTMENT_DURATION_MINUTES

        // L'artisan doit pouvoir rentrer à Flers avant LATEST_RETURN_TIME
        // si ce rendez-vous est le dernier de la journée
        if (returnTravelMinutes !== null && slotEnd + returnTravelMinutes > latestReturnMinutes) {
          unavailable.add(slot)
          continue
        }

        for (const appt of withTravel) {
          const apptStart = timeToMinutes(appt.heure)
          const apptEnd = apptStart + APPOINTMENT_DURATION_MINUTES
          const buffer = appt.travelMinutes ?? DEFAULT_TRAVEL_BUFFER_MINUTES
          const overlap = slotStart < apptEnd && apptStart < slotEnd
          const gapBefore = apptEnd <= slotStart && slotStart - apptEnd < buffer
          const gapAfter = slotEnd <= apptStart && apptStart - slotEnd < buffer
          if (overlap || gapBefore || gapAfter) {
            unavailable.add(slot)
            break
          }
        }
      }
      setUnavailableSlots(unavailable)
      setCheckingAvailability(false)
    })()
    return () => {
      cancelled = true
    }
  }, [existingAppointments, addressCoords])

  // Réinitialise le créneau choisi s'il devient indisponible
  useEffect(() => {
    if (!form.heure) return
    const blocked =
      dayClosure === 'full' ||
      (dayClosure === 'afternoon' && AFTERNOON_SLOTS.includes(form.heure)) ||
      unavailableSlots.has(form.heure)
    if (blocked) {
      setForm((prev) => ({ ...prev, heure: '' }))
    }
  }, [form.date, form.heure, unavailableSlots, dayClosure])

  function getMissingFields(): string[] {
    const missing: string[] = []
    if (!form.prenom.trim()) missing.push('Prénom')
    if (!form.nom.trim()) missing.push('Nom')
    if (!form.telephone.trim()) missing.push('Numéro de téléphone')
    if (!form.email.trim()) missing.push('Email')
    if (!form.adresse.trim()) missing.push('Adresse du chantier')
    if (!form.date) missing.push('Date du rendez-vous')
    if (!form.heure) missing.push('Heure du rendez-vous')
    if (!form.surface_m2 || form.surface_m2 <= 0) missing.push('Surface de la toiture (m²)')
    if (!form.type_toiture) missing.push('Type de toiture')
    if (!form.etat_general) missing.push('État général')
    if (!form.accessibilite) missing.push('Accessibilité')
    return missing
  }

  async function handleSubmit() {
    const missing = getMissingFields()
    if (missing.length > 0) {
      setValidationErrors(missing)
      return
    }
    setValidationErrors([])
    setLoading(true)

    let coords = addressCoords
    if (!coords) {
      coords = await geocodeAddress(form.adresse)
    }
    const distanceKm = coords
      ? (await getDistanceAndDuration(COMPANY_LAT, COMPANY_LON, coords.lat, coords.lon)).distanceKm
      : 0

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
      {/* Header coloré */}
      <div className="bg-brand-blue text-white">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Normandie-etancheite/logo-white.png" alt="Normandie Étanchéité" className="h-8 w-auto" />
            <span className="font-bold text-white text-sm leading-tight">
              Normandie<br /><span className="text-sage font-semibold">Étanchéité</span>
            </span>
          </Link>
          <span className="text-white/60 text-sm hidden sm:block">Prise de rendez-vous</span>
        </div>
        <div className="max-w-4xl mx-auto px-4 pb-8 pt-2 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Demande de devis &amp; rendez-vous</h1>
          <p className="text-white/70 text-sm">
            Remplissez ce formulaire : nous calculons votre devis et planifions une expertise sur place
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <span className="bg-white/10 border border-white/20 text-white/90 text-xs font-semibold px-3 py-1 rounded-full">✓ Devis gratuit</span>
            <span className="bg-white/10 border border-white/20 text-white/90 text-xs font-semibold px-3 py-1 rounded-full">✓ Sans engagement</span>
            <span className="bg-white/10 border border-white/20 text-white/90 text-xs font-semibold px-3 py-1 rounded-full">✓ Réponse rapide</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Barre sage en haut de la carte */}
          <div className="h-1.5 bg-gradient-to-r from-brand-blue via-sage to-sage-700" />

          <div className="p-8 space-y-10">
          {/* Coordonnées */}
          <section>
            <h2 className="text-lg font-bold text-brand-blue mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-sage rounded-full inline-block" />
              Vos coordonnées
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Prénom *</label>
                <input
                  type="text"
                  value={form.prenom}
                  onChange={(e) => set('prenom', e.target.value)}
                  placeholder="Jean"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nom *</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => set('nom', e.target.value)}
                  placeholder="Dupont"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
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
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="jean@exemple.fr"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
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
                className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse du chantier *</label>
              <input
                type="text"
                value={form.adresse}
                onChange={(e) => set('adresse', e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="12 rue de la Paix, 61000 Alençon"
                autoComplete="off"
                className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
              />
              {showSuggestions && addressSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                  {addressSuggestions.map((s) => (
                    <li key={s.label}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          set('adresse', s.label)
                          setAddressCoords({ lat: s.lat, lon: s.lon })
                          setAddressSuggestions([])
                          setShowSuggestions(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-sage-50 transition-colors"
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-slate-400 mt-1">
                {geocoding
                  ? 'Vérification de l’adresse...'
                  : 'Utilisée pour calculer les frais de déplacement et les disponibilités'}
              </p>
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Date & créneau */}
          <section>
            <h2 className="text-lg font-bold text-brand-blue mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-sage rounded-full inline-block" />
              Date et créneau du rendez-vous
            </h2>

            <DateTimePicker
              date={form.date}
              heure={form.heure}
              today={today}
              onDateChange={(date) => setForm((prev) => ({ ...prev, date, heure: '' }))}
              onTimeChange={(heure) => set('heure', heure)}
              getDayClosure={getDayClosure}
              timeSlots={TIME_SLOTS}
              afternoonSlots={AFTERNOON_SLOTS}
              unavailableSlots={unavailableSlots}
              checkingAvailability={checkingAvailability}
              hasAddress={addressCoords !== null}
            />
          </section>

          <div className="border-t border-slate-100" />

          {/* Chantier */}
          <section>
            <h2 className="text-lg font-bold text-brand-blue mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-sage rounded-full inline-block" />
              Votre chantier
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Surface approximative (m²) *</label>
              <input
                type="number"
                min={1}
                value={form.surface_m2 || ''}
                onChange={(e) => set('surface_m2', parseInt(e.target.value) || 0)}
                placeholder="Ex : 120"
                className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Type de toiture *</label>
                <select
                  value={form.type_toiture}
                  onChange={(e) => set('type_toiture', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent bg-white"
                >
                  <option value="">Sélectionner</option>
                  {['Étanchéité bitume', 'Étanchéité membrane PVC', 'Bac sec', 'Panneau sandwich', 'Autre'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">État général *</label>
                <select
                  value={form.etat_general}
                  onChange={(e) => set('etat_general', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent bg-white"
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
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent bg-white"
                >
                  <option value="">Sélectionner</option>
                  {['Échelle crinoline', 'Nacelle', 'Lanternaux d\'accès', 'Escalier', 'Autre'].map((a) => (
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
                className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent resize-none"
              />
            </div>
          </section>

          {/* Soumission */}
          <div className="pt-2 border-t border-slate-100">
            {validationErrors.length > 0 && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-red-600 text-sm font-semibold mb-1">Merci de renseigner les champs manquants :</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {validationErrors.map((e) => (
                    <li key={e} className="text-red-500 text-sm">{e}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-sage hover:bg-sage-700 disabled:opacity-60 text-white font-bold px-8 py-4 rounded-xl text-base transition-colors flex items-center justify-center gap-2 shadow-md"
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
          </div>
          </div>{/* end p-8 space-y-10 */}
        </div>{/* end bg-white card */}
      </div>
    </div>
  )
}

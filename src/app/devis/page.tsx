'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const N8N_WEBHOOK = 'https://n8n.srv1591454.hstgr.cloud/webhook/18bc0126-ec6f-433c-89be-85f90b0a4bad'

interface DevisData {
  date: string
  date_formatee: string
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
  devis_numero: string
  devis_honoraires: number
  devis_deplacement: number
  devis_distance_km: number
  devis_total_ht: number
  devis_total_ttc: number
  devis_signe: boolean
}

export default function DevisPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [devis, setDevis] = useState<DevisData | null>(null)
  const [hasSigned, setHasSigned] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('normandie_devis')
    if (!stored) {
      router.push('/rendez-vous')
      return
    }
    setDevis(JSON.parse(stored))
  }, [router])

  function getPos(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#1e3a5f'
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSigned(true)
  }

  function stopDraw() {
    setIsDrawing(false)
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSigned(false)
  }

  async function handleSign() {
    if (!devis || !hasSigned) return
    setLoading(true)
    setSubmitError('')
    try {
      await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...devis, devis_signe: true }),
      })
      setSuccess(true)
      sessionStorage.removeItem('normandie_devis')
    } catch {
      setSubmitError('Une erreur est survenue. Vérifiez votre connexion et réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (!devis) return null

  const tva = Math.round((devis.devis_total_ttc - devis.devis_total_ht) * 100) / 100
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1e3a5f] mb-3">Rendez-vous confirmé !</h1>
          <p className="text-slate-500 mb-6">
            Votre rendez-vous du{' '}
            <strong className="text-[#1e3a5f]">{devis.date_formatee}</strong> à{' '}
            <strong className="text-[#1e3a5f]">{devis.heure}</strong> a bien été enregistré.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Devis n°</span>
              <span className="font-semibold text-[#1e3a5f]">{devis.devis_numero}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 shrink-0">Adresse</span>
              <span className="font-semibold text-[#1e3a5f] text-right">{devis.adresse}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total TTC</span>
              <span className="font-bold text-orange-500">{devis.devis_total_ttc.toFixed(2)} €</span>
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Vous recevrez une confirmation par email à l&apos;adresse {devis.email}
          </p>
          <Link
            href="/"
            className="inline-block bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm print:hidden">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="text-[#1e3a5f] font-bold text-sm">
              Normandie <span className="text-orange-500">Étanchéité</span>
            </span>
          </Link>
          <span className="text-slate-400 text-sm">Votre devis</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Quote document */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 pb-8 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <span className="text-[#1e3a5f] font-extrabold text-lg">NORMANDIE ÉTANCHÉITÉ</span>
              </div>
              <p className="text-sm text-slate-500">16 Impasse Beau Vallon, 61100 Flers</p>
              <p className="text-sm text-slate-500">SIRET : XXX XXX XXX XXXXX</p>
              <p className="text-sm text-slate-500">Assurance : N° XXXXXXXXXXXX</p>
            </div>
            <div className="sm:text-right">
              <p className="text-slate-400 text-sm">Devis n°</p>
              <p className="text-2xl font-extrabold text-[#1e3a5f]">{devis.devis_numero}</p>
              <p className="text-sm text-slate-400 mt-1">Émis le {today}</p>
              <p className="text-xs text-slate-400">Valable 30 jours</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Client</p>
              <p className="font-bold text-[#1e3a5f]">{devis.prenom} {devis.nom}</p>
              {devis.societe && <p className="text-slate-500 text-sm">{devis.societe}</p>}
              <p className="text-slate-500 text-sm">{devis.telephone}</p>
              <p className="text-slate-500 text-sm">{devis.email}</p>
              <p className="text-slate-500 text-sm mt-1">{devis.adresse}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Intervention</p>
              <p className="font-bold text-[#1e3a5f] capitalize">{devis.date_formatee}</p>
              <p className="text-slate-500 text-sm">Créneau : {devis.heure}</p>
              <p className="text-slate-500 text-sm mt-2">Surface : {devis.surface_m2} m²</p>
              <p className="text-slate-500 text-sm">Type : {devis.type_toiture}</p>
              <p className="text-slate-500 text-sm">État : {devis.etat_general}</p>
              <p className="text-slate-500 text-sm">Accès : {devis.accessibilite}</p>
            </div>
          </div>

          {devis.description && (
            <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Description</p>
              <p className="text-slate-600 text-sm">{devis.description}</p>
            </div>
          )}

          <div className="mb-8 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1e3a5f] text-white">
                  <th className="text-left px-5 py-3 text-sm font-semibold">Désignation</th>
                  <th className="text-right px-5 py-3 text-sm font-semibold">Montant HT</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-5 py-4 text-slate-700">
                    Honoraires d&apos;expertise ({devis.surface_m2} m²)
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-700">
                    {devis.devis_honoraires.toFixed(2)} €
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-5 py-4 text-slate-700">
                    Frais de déplacement ({devis.devis_distance_km} km)
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-700">
                    {devis.devis_deplacement.toFixed(2)} €
                  </td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="px-5 py-3 font-bold text-[#1e3a5f]">Total HT</td>
                  <td className="px-5 py-3 text-right font-bold text-[#1e3a5f]">
                    {devis.devis_total_ht.toFixed(2)} €
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-5 py-3 text-slate-500 text-sm">TVA 20 %</td>
                  <td className="px-5 py-3 text-right text-slate-500 text-sm">{tva.toFixed(2)} €</td>
                </tr>
                <tr className="bg-orange-50">
                  <td className="px-5 py-4 font-extrabold text-[#1e3a5f] text-lg">Total TTC</td>
                  <td className="px-5 py-4 text-right font-extrabold text-orange-500 text-lg">
                    {devis.devis_total_ttc.toFixed(2)} €
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Ce devis est valable 30 jours. La signature vaut acceptation des conditions générales de vente.
          </p>
        </div>

        {/* Signature */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-1">Signature du client</h2>
          <p className="text-slate-500 text-sm mb-5">
            Signez ci-dessous pour confirmer votre rendez-vous
          </p>

          <div className="relative border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <canvas
              ref={canvasRef}
              width={600}
              height={150}
              className="w-full touch-none cursor-crosshair"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
            {!hasSigned && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-slate-300 text-sm select-none">Signez ici</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={clearCanvas}
              className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Effacer
            </button>
            <span className={`text-xs ${hasSigned ? 'text-green-500' : 'text-slate-400'}`}>
              {hasSigned ? '✓ Signature enregistrée' : 'Signature requise'}
            </span>
          </div>

          {submitError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm">
              {submitError}
            </div>
          )}

          <button
            onClick={handleSign}
            disabled={!hasSigned || loading}
            className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Envoi en cours...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Valider et confirmer le rendez-vous
              </>
            )}
          </button>

          {!hasSigned && (
            <p className="text-center text-slate-400 text-xs mt-3">
              Veuillez signer le devis avant de confirmer
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

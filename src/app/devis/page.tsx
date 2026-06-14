'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DevisData, generateDevisPdf } from './generateDevisPdf'

type View = 'quote' | 'requesting' | 'success' | 'error'

export default function DevisPage() {
  const router = useRouter()
  const [devis, setDevis] = useState<DevisData | null>(null)
  const [view, setView] = useState<View>('quote')
  const [signError, setSignError] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('normandie_devis')
    if (!stored) {
      router.push('/rendez-vous')
      return
    }
    setDevis(JSON.parse(stored))
  }, [router])

  const handleRequestSign = async () => {
    if (!devis) return
    setView('requesting')
    try {
      const pdf_base64 = await generateDevisPdf(devis)
      const res = await fetch(
        'https://n8n.srv1591454.hstgr.cloud/webhook/zoho-sign-create',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...devis, pdf_base64 }),
        }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setView('success')
    } catch (err) {
      setSignError(err instanceof Error ? err.message : 'Erreur inconnue')
      setView('error')
    }
  }

  if (!devis) return null

  const tva = Math.round((devis.devis_total_ttc - devis.devis_total_ht) * 100) / 100
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  if (view === 'requesting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <svg className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-600 font-medium">Envoi du document en cours...</p>
        </div>
      </div>
    )
  }

  if (view === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Email envoyé !</h1>
          <p className="text-slate-600 mb-2">
            Un email de signature Zoho Sign a été envoyé à
          </p>
          <p className="font-semibold text-[#1e3a5f] mb-6">{devis.email}</p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left text-sm text-blue-800">
            <p className="font-semibold mb-1">Prochaines étapes :</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Ouvrez l&apos;email Zoho Sign</li>
              <li>Signez électroniquement le devis</li>
              <li>Votre RDV est créé automatiquement</li>
            </ol>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span className="font-medium">{devis.date_formatee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Heure</span>
              <span className="font-medium">{devis.heure}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Devis</span>
              <span className="font-medium">{devis.devis_numero}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total TTC</span>
              <span className="font-medium text-orange-600">{devis.devis_total_ttc.toFixed(2)} €</span>
            </div>
          </div>
          <a href="/Normandie-etancheite" className="block w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    )
  }

  if (view === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Erreur de signature</h1>
          <p className="text-slate-600 mb-2">Impossible de préparer le document.</p>
          {signError && <p className="text-red-500 text-sm mb-4 font-mono">{signError}</p>}
          <button onClick={() => setView('quote')} className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  // view === 'quote'
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

        {/* Electronic Signature */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-1">Signature électronique</h2>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <p className="text-blue-800 text-sm">
              La signature sera réalisée via Zoho Sign, solution certifiée eIDAS. Vous recevrez une copie signée par email.
            </p>
          </div>

          <button
            onClick={handleRequestSign}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg sm:w-auto sm:px-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
            </svg>
            Signer électroniquement avec Zoho Sign
          </button>
        </div>
      </div>
    </div>
  )
}

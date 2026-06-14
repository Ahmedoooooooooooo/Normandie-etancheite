'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DevisData } from './generateDevisPdf'

type View = 'quote' | 'requesting' | 'success' | 'error'

const LOGO = '/Normandie-etancheite/devis-logo.png'

const eur = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

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
      const res = await fetch(
        'https://n8n.srv1591454.hstgr.cloud/webhook/docuseal-create',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(devis),
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
  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  if (view === 'requesting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <svg className="w-12 h-12 animate-spin text-sage mx-auto mb-4" fill="none" viewBox="0 0 24 24">
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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-sage-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-sage-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-brand-blue mb-2">Email envoyé !</h1>
          <p className="text-slate-600 mb-2">
            Un email de signature électronique a été envoyé à
          </p>
          <p className="font-semibold text-brand-blue mb-6">{devis.email}</p>
          <div className="bg-sage-50 border border-sage/30 rounded-xl p-4 mb-6 text-left text-sm text-sage-700">
            <p className="font-semibold mb-1">Prochaines étapes :</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Ouvrez l&apos;email de signature</li>
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
              <span className="font-semibold text-sage-700">{eur(devis.devis_total_ttc)}</span>
            </div>
          </div>
          <a href="/Normandie-etancheite" className="block w-full bg-brand-blue text-white py-3 rounded-xl font-semibold hover:bg-[#162d49] transition-colors">
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    )
  }

  if (view === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
        <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-brand-blue mb-2">Erreur de signature</h1>
          <p className="text-slate-600 mb-2">Impossible de préparer le document.</p>
          {signError && <p className="text-red-500 text-sm mb-4 font-mono">{signError}</p>}
          <button onClick={() => setView('quote')} className="w-full bg-sage text-white py-3 rounded-xl font-semibold hover:bg-sage-700 transition-colors">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  // view === 'quote'
  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-white shadow-sm print:hidden">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="text-brand-blue font-bold text-sm">
              Normandie <span className="text-sage-700">Étanchéité</span>
            </span>
          </Link>
          <span className="text-slate-400 text-sm">Votre devis</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Document — même modèle que le PDF signé */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
          {/* En-tête bleu nuit */}
          <div className="bg-brand-blue px-6 sm:px-8 py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-bold text-base sm:text-lg">Normandie Étanchéité S.A.S</p>
                <p className="text-slate-300 text-xs sm:text-sm mt-1">16 Impasse Beau Vallon</p>
                <p className="text-slate-300 text-xs sm:text-sm">61 100 FLERS</p>
                <p className="text-slate-400 text-xs mt-1">Tél. : 06.51.17.45.64</p>
                <p className="text-slate-400 text-xs">contact@normandie-etancheite.com</p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt="Normandie Étanchéité" className="hidden sm:block h-16 w-auto" />
              <div className="text-right">
                <p className="text-slate-400 text-[10px] tracking-widest">DOCUMENT</p>
                <p className="text-white text-2xl font-light leading-tight">Devis</p>
                <p className="text-slate-400 text-[10px] mt-2">SIRET : 919 098 210 000 17</p>
                <p className="text-slate-400 text-[10px]">CODE APE : 4391 B</p>
                <p className="text-slate-400 text-[10px]">RCS 919 098 210 ALENÇON</p>
                <p className="text-slate-400 text-[10px]">TVA : FR93919098210</p>
              </div>
            </div>
          </div>
          <div className="h-1 bg-sage" />

          {/* Bandeau N° / Date / Validité */}
          <div className="bg-sage-50 px-6 sm:px-8 py-3 grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-bold text-sage-700 uppercase tracking-wide">N° Devis</p>
              <p className="text-slate-700 font-medium">{devis.devis_numero}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-sage-700 uppercase tracking-wide">Date</p>
              <p className="text-slate-700 font-medium">{today}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-sage-700 uppercase tracking-wide">Validité</p>
              <p className="text-slate-700 font-medium">30 jours</p>
            </div>
          </div>

          {/* DE / POUR */}
          <div className="px-6 sm:px-8 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-sage-700 uppercase tracking-wide mb-1">De</p>
              <p className="font-bold text-brand-blue">Normandie Étanchéité S.A.S</p>
              <p className="text-slate-500 text-sm">16 Impasse Beau Vallon</p>
              <p className="text-slate-500 text-sm">61 100 FLERS</p>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] font-bold text-sage-700 uppercase tracking-wide mb-1">Pour</p>
              <p className="font-bold text-brand-blue">{devis.prenom} {devis.nom}</p>
              {devis.societe && <p className="text-slate-500 text-sm">{devis.societe}</p>}
              <p className="text-slate-500 text-sm">{devis.adresse}</p>
              <p className="text-slate-500 text-sm">{devis.telephone}</p>
            </div>
          </div>

          {/* Chantier */}
          <div className="bg-sage-50 px-6 sm:px-8 py-2 flex items-center gap-3">
            <span className="text-[10px] font-bold text-sage-700 uppercase tracking-wide">Chantier</span>
            <span className="text-slate-700 text-sm">{devis.adresse}</span>
          </div>

          {/* Tableau des ouvrages */}
          <div className="px-6 sm:px-8 py-5">
            <div className="grid grid-cols-12 gap-2 border-b-2 border-sage pb-2 text-[10px] font-bold text-sage-700 uppercase tracking-wide">
              <div className="col-span-1">N°</div>
              <div className="col-span-7">Désignation des ouvrages</div>
              <div className="col-span-1 text-right">Unité</div>
              <div className="col-span-1 text-right">Qté</div>
              <div className="col-span-2 text-right">Total HT</div>
            </div>
            <div className="grid grid-cols-12 gap-2 py-4 border-b border-slate-100">
              <div className="col-span-1 text-slate-400 text-sm">01</div>
              <div className="col-span-7">
                <p className="font-semibold text-brand-blue text-sm">
                  Expertise et diagnostic d&apos;étanchéité — toiture {devis.type_toiture}, {devis.surface_m2} m²
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Intervention le {devis.date_formatee} ({devis.heure}) · Accès : {devis.accessibilite}
                </p>
                {devis.etat_general && (
                  <p className="text-slate-500 text-xs">État constaté : {devis.etat_general}</p>
                )}
                <p className="text-slate-500 text-xs">
                  Honoraires : {eur(devis.devis_honoraires)} · Déplacement {devis.devis_distance_km} km : {eur(devis.devis_deplacement)}
                </p>
                {devis.description && (
                  <p className="text-slate-500 text-xs mt-1 italic">{devis.description}</p>
                )}
              </div>
              <div className="col-span-1 text-right text-slate-600 text-sm">forfait</div>
              <div className="col-span-1 text-right text-slate-600 text-sm">1</div>
              <div className="col-span-2 text-right font-semibold text-slate-700 text-sm">{eur(devis.devis_total_ht)}</div>
            </div>

            {/* Totaux */}
            <div className="flex justify-end mt-4">
              <div className="w-full sm:w-1/2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Total HT</span>
                  <span className="text-slate-700 text-sm font-medium">{eur(devis.devis_total_ht)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 text-sm">TVA (20%)</span>
                  <span className="text-slate-700 text-sm font-medium">{eur(tva)}</span>
                </div>
                <div className="flex items-stretch mt-2 rounded-lg overflow-hidden">
                  <div className="bg-brand-blue text-white font-bold text-sm px-4 py-3 flex items-center flex-1">
                    TOTAL DEVIS TTC
                  </div>
                  <div className="bg-sage-50 text-brand-blue font-extrabold px-4 py-3 flex items-center justify-end min-w-[120px]">
                    {eur(devis.devis_total_ttc)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mention légale */}
          <div className="px-6 sm:px-8 pb-4">
            <p className="text-xs text-slate-400 italic">
              Devis valable 30 jours à compter de la date d&apos;émission.
            </p>
          </div>

          {/* Signature client (centrée, comme le PDF) */}
          <div className="border-t border-slate-100 px-6 sm:px-8 py-6 text-center">
            <p className="font-bold text-brand-blue mb-3">Bon pour accord — Signature du client</p>
            <div className="mx-auto max-w-xs border border-sage rounded-lg bg-slate-50 p-4 text-left">
              <p className="text-[10px] font-bold text-sage-700 uppercase tracking-wide">Signature</p>
              <p className="text-slate-400 text-xs mt-6">À signer via le lien sécurisé reçu par email.</p>
            </div>
          </div>

          {/* Pied de page */}
          <div className="border-t border-slate-100 py-3 text-center">
            <p className="text-xs text-sage-700">normandie-etancheite.com</p>
          </div>
        </div>

        {/* Action : signature électronique */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-lg font-bold text-brand-blue mb-1">Signature électronique</h2>
          <div className="bg-sage-50 border border-sage/30 rounded-xl p-4 my-4">
            <p className="text-sage-700 text-sm">
              La signature est réalisée en ligne, avec valeur légale. Vous recevrez une copie signée par email, et votre rendez-vous sera confirmé automatiquement.
            </p>
          </div>
          <button
            onClick={handleRequestSign}
            className="w-full bg-sage hover:bg-sage-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg sm:w-auto sm:px-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
            </svg>
            Signer électroniquement
          </button>
        </div>
      </div>
    </div>
  )
}

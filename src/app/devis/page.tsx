"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface DevisData {
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  societe: string;
  adresse: string;
  date: string;
  time: string;
  surface: number;
  typeToiture_label: string;
  etatGeneral_label: string;
  accessibilite_label: string;
  description: string;
  honoraires: number;
  deplacement: number;
  total_ht: number;
  tva: number;
  total_ttc: number;
  distance_km: number | null;
  date_formatee: string;
  devis_numero: string;
}

export default function DevisPage() {
  const [data, setData] = useState<DevisData | null>(null);
  const [signed, setSigned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("normandie_devis");
    if (raw) setData(JSON.parse(raw));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
    ctx.setLineDash([]);
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [data]);

  const getPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing.current || !lastPos.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setHasSignature(true);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    lastPos.current = null;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
    ctx.setLineDash([]);
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 2.5;
    setHasSignature(false);
  };

  const handleSign = async () => {
    if (!hasSignature || !data) return;
    setIsSubmitting(true);
    try {
      await fetch(
        "https://n8n.srv1591454.hstgr.cloud/webhook/18bc0126-ec6f-433c-89be-85f90b0a4bad",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prenom: data.prenom,
            nom: data.nom,
            telephone: data.telephone,
            email: data.email,
            societe: data.societe,
            adresse: data.adresse,
            date: data.date,
            date_formatee: data.date_formatee,
            heure: data.time,
            surface_m2: data.surface,
            type_toiture: data.typeToiture_label,
            etat_general: data.etatGeneral_label,
            accessibilite: data.accessibilite_label,
            description: data.description,
            devis_numero: data.devis_numero,
            devis_honoraires: data.honoraires,
            devis_deplacement: data.deplacement,
            devis_distance_km: data.distance_km,
            devis_total_ht: data.total_ht,
            devis_total_ttc: data.total_ttc,
            devis_signe: true,
          }),
        }
      );
    } catch {}
    setSigned(true);
    setIsSubmitting(false);
  };

  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!data) {
    return (
      <div className="min-h-screen bg-[#080d14] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Aucun devis trouvé.</p>
          <Link href="/rendez-vous" className="text-orange-400 hover:text-orange-300 underline">
            Prendre un rendez-vous
          </Link>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen bg-[#080d14] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">Devis signé !</h1>
          <p className="text-slate-300 mb-2">
            Merci <strong className="text-white">{data.prenom} {data.nom}</strong>.
          </p>
          <p className="text-slate-400 mb-8">
            Votre devis <strong className="text-orange-400">{data.devis_numero}</strong> a été signé et transmis à notre équipe. Nous vous confirmerons votre rendez-vous sous 24h.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080d14] py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Print button */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link href="/" className="text-slate-400 hover:text-white text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimer / PDF
          </button>
        </div>

        {/* Document */}
        <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl">

          {/* Header */}
          <div className="bg-gray-900 px-8 py-6 flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">NORMANDIE ÉTANCHÉITÉ</h1>
              <p className="text-gray-400 text-sm mt-1">16 Impasse Beau Vallon, 61100 Flers</p>
              <p className="text-gray-400 text-sm">contact@normandie-etancheite.fr</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full border border-orange-500/30">Certifié RGE</span>
                <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full border border-orange-500/30">Garantie décennale</span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="inline-block bg-orange-500 text-white px-4 py-1.5 rounded-lg font-bold text-sm mb-2">
                DEVIS
              </div>
              <p className="text-gray-300 text-sm font-mono">{data.devis_numero}</p>
              <p className="text-gray-400 text-xs mt-1">Émis le {today}</p>
              <p className="text-gray-400 text-xs">Valable jusqu&apos;au {validUntil}</p>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">

            {/* Client / Chantier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Client</h2>
                <p className="font-bold text-gray-900">{data.prenom} {data.nom}</p>
                {data.societe && <p className="text-gray-600 text-sm">{data.societe}</p>}
                <p className="text-gray-600 text-sm">{data.telephone}</p>
                <p className="text-gray-600 text-sm">{data.email}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Chantier</h2>
                <p className="font-bold text-gray-900 text-sm">{data.adresse}</p>
                {data.distance_km && (
                  <p className="text-gray-500 text-xs mt-1">≈ {data.distance_km} km depuis Flers</p>
                )}
                <p className="text-gray-600 text-sm mt-2">
                  RDV le <strong>{data.date_formatee}</strong> à <strong>{data.time}</strong>
                </p>
              </div>
            </div>

            {/* Objet */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Objet de l&apos;expertise</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {[
                  { label: "Surface", value: `${data.surface} m²` },
                  { label: "Type", value: data.typeToiture_label },
                  { label: "État", value: data.etatGeneral_label },
                  { label: "Accès", value: data.accessibilite_label },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-gray-500 text-xs">{label}</p>
                    <p className="font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
              {data.description && (
                <p className="text-gray-600 text-sm mt-3 border-t border-orange-100 pt-3">{data.description}</p>
              )}
            </div>

            {/* Pricing table */}
            <div>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Détail du devis</h2>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className="text-left px-4 py-3 font-semibold">Désignation</th>
                      <th className="text-center px-4 py-3 font-semibold">Qté</th>
                      <th className="text-right px-4 py-3 font-semibold">P.U. HT</th>
                      <th className="text-right px-4 py-3 font-semibold">Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">Honoraires d&apos;expertise toiture</p>
                        <p className="text-gray-500 text-xs">{data.surface} m² — {data.typeToiture_label}</p>
                      </td>
                      <td className="text-center px-4 py-3 text-gray-700">1</td>
                      <td className="text-right px-4 py-3 text-gray-700">{data.honoraires} €</td>
                      <td className="text-right px-4 py-3 font-semibold text-gray-900">{data.honoraires} €</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">Forfait déplacement</p>
                        {data.distance_km && (
                          <p className="text-gray-500 text-xs">≈ {data.distance_km} km — {data.adresse}</p>
                        )}
                      </td>
                      <td className="text-center px-4 py-3 text-gray-700">1</td>
                      <td className="text-right px-4 py-3 text-gray-700">{data.deplacement} €</td>
                      <td className="text-right px-4 py-3 font-semibold text-gray-900">{data.deplacement} €</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200 bg-gray-50">
                      <td colSpan={3} className="text-right px-4 py-2 text-gray-600 text-sm">Total HT</td>
                      <td className="text-right px-4 py-2 font-semibold text-gray-900">{data.total_ht} €</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="text-right px-4 py-2 text-gray-600 text-sm">TVA 20%</td>
                      <td className="text-right px-4 py-2 font-semibold text-gray-900">{data.tva} €</td>
                    </tr>
                    <tr className="bg-orange-500">
                      <td colSpan={3} className="text-right px-4 py-3 text-white font-bold">Total TTC</td>
                      <td className="text-right px-4 py-3 font-extrabold text-white text-lg">{data.total_ttc} €</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Conditions */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Conditions</h2>
              <ul className="text-sm text-gray-600 space-y-1.5">
                {[
                  "Paiement à réception de facture après intervention",
                  "Devis valable 30 jours à compter de la date d'émission",
                  "Expertise réalisée par un artisan certifié RGE",
                  "Garantie décennale en vigueur",
                  "Les travaux ne débutent qu'après acceptation du devis",
                ].map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Signature */}
            <div className="print:hidden">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Signature électronique — Bon pour accord</h2>
              <p className="text-sm text-gray-500 mb-3">
                En signant ci-dessous, vous acceptez le devis <strong>{data.devis_numero}</strong> d&apos;un montant de <strong>{data.total_ttc} € TTC</strong> et confirmez votre rendez-vous.
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={200}
                  className="w-full cursor-crosshair touch-none bg-[#0f172a]"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Signez dans le cadre ci-dessus avec votre doigt ou votre souris</p>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="flex items-center gap-2 border border-gray-300 text-gray-600 hover:border-gray-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Effacer
                </button>
                <button
                  type="button"
                  onClick={handleSign}
                  disabled={!hasSignature || isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-orange-500/25"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {isSubmitting ? "Envoi..." : "Valider et signer le devis"}
                </button>
              </div>
            </div>

            {/* Legal footer */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 text-center">
                Normandie Étanchéité — SIRET: XXX XXX XXX XXXXX · RGE Qualibat · Garantie décennale N° XXXXXXX
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client'
import { useEffect, useState } from 'react'

export default function SigneComplete() {
  const [sent, setSent] = useState(false)

  useEffect(() => {
    try {
      window.parent.postMessage({ type: 'zoho_sign_completed' }, '*')
    } catch {}
    setSent(true)
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-slate-700 font-medium">
        {sent ? 'Document signé — retour en cours...' : 'Traitement...'}
      </p>
    </div>
  )
}

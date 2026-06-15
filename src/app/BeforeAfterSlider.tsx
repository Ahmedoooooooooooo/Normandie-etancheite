'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  before: string
  after: string
  title: string
  location: string
}

export default function BeforeAfterSlider({ before, after, title, location }: Props) {
  const [pos, setPos] = useState(50)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoRef = useRef(true)
  const rafRef = useRef<number>()

  // Balayage automatique tant que l'utilisateur n'interagit pas
  useEffect(() => {
    let start: number | undefined
    const period = 6000 // ms pour un aller-retour complet

    const tick = (t: number) => {
      if (start === undefined) start = t
      if (autoRef.current) {
        const elapsed = (t - start) % period
        // oscillation douce entre 15% et 85%
        const phase = (1 - Math.cos((elapsed / period) * 2 * Math.PI)) / 2
        setPos(15 + phase * 70)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width)
    setPos((x / rect.width) * 100)
  }

  const stopAuto = () => {
    autoRef.current = false
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
      <div
        ref={containerRef}
        className="relative aspect-[4/3] select-none cursor-ew-resize"
        onMouseDown={(e) => {
          stopAuto()
          setDragging(true)
          updateFromClientX(e.clientX)
        }}
        onMouseMove={(e) => dragging && updateFromClientX(e.clientX)}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
        onTouchStart={(e) => {
          stopAuto()
          setDragging(true)
          updateFromClientX(e.touches[0].clientX)
        }}
        onTouchMove={(e) => dragging && updateFromClientX(e.touches[0].clientX)}
        onTouchEnd={() => setDragging(false)}
      >
        {/* Image APRÈS (fond) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={after}
          alt={`${title} — après`}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        {/* Image AVANT (clipée) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${pos}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={before}
            alt={`${title} — avant`}
            className="absolute inset-0 h-full object-cover"
            style={{ width: containerRef.current ? containerRef.current.clientWidth : '100%', maxWidth: 'none' }}
            draggable={false}
          />
        </div>

        {/* Étiquettes */}
        <span className="absolute top-3 left-3 bg-black/55 text-white text-xs font-semibold px-2.5 py-1 rounded-full pointer-events-none">
          AVANT
        </span>
        <span className="absolute top-3 right-3 bg-sage text-white text-xs font-semibold px-2.5 py-1 rounded-full pointer-events-none">
          APRÈS
        </span>

        {/* Poignée */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_6px_rgba(0,0,0,0.4)] pointer-events-none"
          style={{ left: `${pos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center">
            <svg className="w-5 h-5 text-sage-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l-4 5 4 5m8-10l4 5-4 5" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-brand-blue text-lg">{title}</h3>
        <p className="text-slate-500 text-sm">{location}</p>
      </div>
    </div>
  )
}

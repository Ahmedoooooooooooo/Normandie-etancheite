'use client'

import { useEffect, useRef, useState } from 'react'

export type DayClosure = 'none' | 'afternoon' | 'full'

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]
const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu']

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Génère les semaines en ne gardant que Lun-Jeu (4 colonnes)
function getMonthWeeks(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1)
  const dow = firstDay.getDay() // 0=Dim,1=Lun,...,6=Sam
  // décalage dans la grille 4-colonnes : Lun=0 Mar=1 Mer=2 Jeu=3 Ven/Sam/Dim→0
  const offset = dow >= 1 && dow <= 4 ? dow - 1 : 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    if (date.getDay() >= 1 && date.getDay() <= 4) cells.push(date)
  }
  while (cells.length % 4 !== 0) cells.push(null)
  const weeks: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 4) weeks.push(cells.slice(i, i + 4))
  return weeks
}

function formatLabel(date: string, heure: string): string {
  if (!date) return 'Choisir une date et un horaire'
  const label = new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const capitalized = label.charAt(0).toUpperCase() + label.slice(1)
  return heure ? `${capitalized} à ${heure}` : capitalized
}

interface DateTimePickerProps {
  date: string
  heure: string
  today: string
  onDateChange: (date: string) => void
  onTimeChange: (heure: string) => void
  getDayClosure: (date: string) => DayClosure
  timeSlots: string[]
  afternoonSlots: string[]
  unavailableSlots: Set<string>
  checkingAvailability: boolean
  hasAddress: boolean
}

export default function DateTimePicker({
  date,
  heure,
  today,
  onDateChange,
  onTimeChange,
  getDayClosure,
  timeSlots,
  afternoonSlots,
  unavailableSlots,
  checkingAvailability,
  hasAddress,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const initial = new Date((date || today) + 'T12:00:00')
  const [viewYear, setViewYear] = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth())

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const weeks = getMonthWeeks(viewYear, viewMonth)
  const todayDate = new Date(today + 'T12:00:00')
  const canGoPrev = !(viewYear === todayDate.getFullYear() && viewMonth === todayDate.getMonth())
  const dayClosure = date ? getDayClosure(date) : 'none'

  function goPrevMonth() {
    if (!canGoPrev) return
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }

  function goNextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full text-left border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent flex items-center justify-between ${
          date ? 'text-slate-700' : 'text-slate-400'
        }`}
      >
        <span>{formatLabel(date, heure)}</span>
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl p-5">
          {/* Navigation mois */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={goPrevMonth}
              disabled={!canGoPrev}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg font-bold ${
                canGoPrev ? 'text-brand-blue hover:bg-sage-50' : 'text-slate-200 cursor-not-allowed'
              }`}
            >
              ‹
            </button>
            <span className="font-bold text-brand-blue">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={goNextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg text-lg font-bold text-brand-blue hover:bg-sage-50">
              ›
            </button>
          </div>

          {/* En-têtes jours */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold text-sage-700 mb-2">
            {WEEKDAY_LABELS.map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Grille jours */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {weeks.flat().map((d, i) => {
              if (!d) return <div key={`empty-${i}`} />
              const dateStr = toDateStr(d)
              const closure = getDayClosure(dateStr)
              const isPast = dateStr < today
              const disabled = isPast || closure === 'full'
              const isSelected = dateStr === date
              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={disabled}
                  onClick={() => onDateChange(dateStr)}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    disabled
                      ? 'text-slate-200 cursor-not-allowed bg-slate-50'
                      : isSelected
                      ? 'bg-brand-blue text-white shadow-md'
                      : 'text-slate-700 hover:bg-sage hover:text-white'
                  }`}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>

          {/* Créneaux horaires */}
          {date && (
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Choisir un créneau</p>
              {dayClosure === 'afternoon' && (
                <p className="text-xs text-sage-700 mb-2">
                  Pas de rendez-vous l&apos;après-midi le mercredi — seuls les créneaux du matin et 12h sont disponibles.
                </p>
              )}
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => {
                  const closedByDay = dayClosure === 'full' || (dayClosure === 'afternoon' && afternoonSlots.includes(slot))
                  const alreadyBooked = unavailableSlots.has(slot)
                  const disabled = closedByDay || alreadyBooked
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={disabled}
                      title={alreadyBooked ? 'Créneau déjà réservé' : undefined}
                      onClick={() => { onTimeChange(slot); setOpen(false) }}
                      className={`py-2.5 rounded-lg text-sm font-bold transition-all ${
                        disabled
                          ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                          : heure === slot
                          ? 'bg-brand-blue text-white shadow-md'
                          : 'bg-sage-50 text-sage-700 hover:bg-sage hover:text-white'
                      }`}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>

              {checkingAvailability && (
                <p className="text-xs text-slate-400 mt-3">Vérification des disponibilités...</p>
              )}
              {!checkingAvailability && !hasAddress && (
                <p className="text-xs text-slate-400 mt-3">
                  Renseignez votre adresse pour affiner les disponibilités selon les temps de trajet.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

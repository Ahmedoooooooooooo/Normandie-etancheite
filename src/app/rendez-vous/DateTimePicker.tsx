'use client'

import { useEffect, useRef, useState } from 'react'

export type DayClosure = 'none' | 'afternoon' | 'full'

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]
const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getMonthWeeks(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

function formatLabel(date: string, heure: string): string {
  if (!date) return 'Choisir une date et un horaire'
  const label = new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
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
    setViewMonth((m) => (m === 0 ? 11 : m - 1))
    setViewYear((y) => (viewMonth === 0 ? y - 1 : y))
  }

  function goNextMonth() {
    setViewMonth((m) => (m === 11 ? 0 : m + 1))
    setViewYear((y) => (viewMonth === 11 ? y + 1 : y))
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full text-left border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${
          date ? 'text-slate-700' : 'text-slate-400'
        }`}
      >
        {formatLabel(date, heure)}
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full sm:w-[360px] bg-white border border-slate-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={goPrevMonth}
              disabled={!canGoPrev}
              className={`px-2 py-1 rounded ${canGoPrev ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-200 cursor-not-allowed'}`}
            >
              ‹
            </button>
            <span className="font-semibold text-slate-700 text-sm">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={goNextMonth} className="px-2 py-1 rounded text-slate-500 hover:bg-slate-100">
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-1">
            {WEEKDAY_LABELS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-3">
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
                  title={closure === 'full' ? 'Fermé le vendredi' : undefined}
                  className={`aspect-square rounded-lg text-sm transition-colors ${
                    disabled
                      ? 'text-slate-200 cursor-not-allowed'
                      : isSelected
                      ? 'bg-orange-500 text-white font-semibold'
                      : 'text-slate-600 hover:bg-orange-50'
                  }`}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>

          {date && (
            <div className="border-t border-slate-100 pt-3">
              {dayClosure === 'afternoon' && (
                <p className="text-xs text-orange-500 mb-2">
                  Pas de rendez-vous l&apos;après-midi le mercredi (sauf 12h) — seuls les créneaux du matin et 12h sont disponibles.
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
                      title={alreadyBooked ? 'Ce créneau est déjà réservé' : undefined}
                      onClick={() => {
                        onTimeChange(slot)
                        setOpen(false)
                      }}
                      className={`py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${
                        disabled
                          ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
                          : heure === slot
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500'
                      }`}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>

              {checkingAvailability && (
                <p className="text-xs text-slate-400 mt-2">Vérification des disponibilités...</p>
              )}
              {!checkingAvailability && unavailableSlots.size > 0 && (
                <p className="text-xs text-slate-400 mt-2">
                  Les créneaux grisés sont déjà réservés, ou trop proches d&apos;un autre rendez-vous compte tenu du temps de trajet.
                </p>
              )}
              {!checkingAvailability && !hasAddress && (
                <p className="text-xs text-slate-400 mt-2">
                  Renseignez votre adresse ci-dessus pour affiner les disponibilités selon les temps de trajet.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

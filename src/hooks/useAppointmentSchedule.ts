import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { api } from '../services/api'

type UseAppointmentScheduleParams = {
  selectedDate: Date | undefined
  serviceHours: number
  customHoursByDate: Record<string, string[]>
}

type AvailabilityInput = {
  allHours: string[]
  busyTimes: string[]
  serviceHours: number
}

type AppointmentLike = Record<string, unknown>

function timeToMinutes(value: string): number | null {
  const match = value.match(/^(\d{2}):(\d{2})$/)
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null
  }

  return hours * 60 + minutes
}

function minutesToTime(value: number): string {
  const hours = Math.floor(value / 60)
  const minutes = value % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function getAuthHeaders() {
  const storageCandidates = [
    localStorage.getItem('token'),
    localStorage.getItem('accessToken'),
    localStorage.getItem('authToken'),
    localStorage.getItem('userToken'),
    localStorage.getItem('jwt'),
    sessionStorage.getItem('token'),
    sessionStorage.getItem('accessToken'),
    sessionStorage.getItem('authToken')
  ]

  const rawUser = localStorage.getItem('user') ?? sessionStorage.getItem('user')

  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser) as Record<string, unknown>
      storageCandidates.push(
        String(parsed.token ?? ''),
        String(parsed.accessToken ?? ''),
        String(parsed.authToken ?? '')
      )
    } catch {
      // Ignora parse inválido do usuário salvo.
    }
  }

  const token = storageCandidates
    .map(value => String(value ?? '').trim())
    .find(value => value.length > 0)

  if (!token) return {}

  return {
    Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
  }
}

export async function fetchBusyTimesForDate(date: string): Promise<string[]> {
  try {
    const headers = getAuthHeaders()
    const response = await api.get(
      `/agendamentos/${encodeURIComponent(date)}`,
      {
        headers
      }
    )

    return extractBusyTimesFromDatePayload(response.data, date)
  } catch {
    return []
  }
}

function toHourBlocks(value: unknown): number {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return 1
  }

  if (numericValue > 10) {
    return Math.ceil(numericValue / 60)
  }

  return Math.ceil(numericValue)
}

export function getAvailableStartBlocks({
  allHours,
  busyTimes,
  serviceHours
}: AvailabilityInput): string[] {
  if (serviceHours <= 0) return []

  const freeHours = allHours.filter(slot => {
    if (busyTimes.includes(slot)) return false

    if (slot.endsWith(':00')) {
      const slotHour = slot.slice(0, 2)
      return !busyTimes.some(time => time.slice(0, 2) === slotHour)
    }

    return true
  })

  const blocks: string[] = []
  const freeHoursSet = new Set(freeHours)

  for (let i = 0; i < freeHours.length; i++) {
    let valid = true
    const startSlot = freeHours[i]
    const startMinutes = timeToMinutes(startSlot)

    if (startMinutes === null) continue

    for (let h = 0; h < serviceHours; h++) {
      const slotMinutes = startMinutes + h * 60
      const occupiedHour = Math.floor(slotMinutes / 60)

      if (occupiedHour === 12) {
        valid = false
        break
      }

      const requiredSlot = minutesToTime(slotMinutes)
      if (!freeHoursSet.has(requiredSlot)) {
        valid = false
        break
      }
    }

    if (valid) blocks.push(startSlot)
  }

  return blocks
}

export function getDefaultBusinessHours(): string[] {
  const hours: string[] = []

  for (let i = 9; i < 18; i++) {
    if (i === 12) continue
    hours.push(`${String(i).padStart(2, '0')}:00`)
  }

  return hours
}

function normalizeTime(value: unknown): string | null {
  const text = String(value ?? '').trim()

  if (/^\d{1,2}$/.test(text)) {
    const hh = Number(text)
    if (Number.isInteger(hh) && hh >= 0 && hh <= 23) {
      return `${String(hh).padStart(2, '0')}:00`
    }
  }

  const shortHourMatch = text.match(/^(\d{1,2})\s*h$/i)
  if (shortHourMatch) {
    const hh = Number(shortHourMatch[1])
    if (Number.isInteger(hh) && hh >= 0 && hh <= 23) {
      return `${String(hh).padStart(2, '0')}:00`
    }
  }

  const isoMatch = text.match(/T(\d{2}):(\d{2})(?::\d{2})?/)
  if (isoMatch) {
    const hh = Number(isoMatch[1])
    const mm = Number(isoMatch[2])

    if (
      Number.isInteger(hh) &&
      Number.isInteger(mm) &&
      hh >= 0 &&
      hh <= 23 &&
      mm >= 0 &&
      mm <= 59
    ) {
      return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
    }
  }

  const match = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
  if (!match) return null

  const hh = Number(match[1])
  const mm = Number(match[2])

  if (!Number.isInteger(hh) || !Number.isInteger(mm)) return null
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null

  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function toISODate(value: unknown): string | null {
  if (typeof value === 'string') {
    const text = value.trim()

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return text
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
      const [dayText, monthText, yearText] = text.split('/')
      const day = Number(dayText)
      const month = Number(monthText)
      const year = Number(yearText)

      if (
        Number.isInteger(day) &&
        Number.isInteger(month) &&
        Number.isInteger(year) &&
        day >= 1 &&
        day <= 31 &&
        month >= 1 &&
        month <= 12
      ) {
        return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      }
    }

    const parsed = new Date(text)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10)
    }
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }

  return null
}

function getListFromResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) return data

  if (typeof data === 'object' && data !== null) {
    const root = data as Record<string, unknown>

    if (Array.isArray(root.data)) {
      return root.data
    }

    if (Array.isArray(root.agendamentos)) {
      return root.agendamentos
    }

    if (Array.isArray(root.appointments)) {
      return root.appointments
    }

    if (Array.isArray(root.horarios)) {
      return root.horarios
    }

    if (Array.isArray(root.hours)) {
      return root.hours
    }

    if (Array.isArray(root.times)) {
      return root.times
    }
  }

  return []
}

function getNestedSource(source: AppointmentLike): AppointmentLike {
  const nestedCandidates = [source.agendamento, source.appointment, source.item]

  for (const nested of nestedCandidates) {
    if (typeof nested === 'object' && nested !== null) {
      return nested as AppointmentLike
    }
  }

  return source
}

function getDateCandidates(source: AppointmentLike): unknown[] {
  return [
    source.data,
    source.date,
    source.day,
    source.dia,
    source.bookingDate,
    source.appointmentDate
  ]
}

function getTimeCandidates(source: AppointmentLike): unknown[] {
  return [
    source.horario,
    source.horarioAgendamento,
    source.horarioInicio,
    source.horaInicio,
    source.hora,
    source.time,
    source.hour,
    source.datetime,
    source.dateTime,
    source.startAt,
    source.startTime,
    source.inicio,
    source.start
  ]
}

function parseAppointmentDate(source: AppointmentLike): string | null {
  const unwrapped = getNestedSource(source)

  for (const candidate of getDateCandidates(unwrapped)) {
    const isoDate = toISODate(candidate)
    if (isoDate) return isoDate
  }

  return null
}

function parseAppointmentTime(source: AppointmentLike): string | null {
  const unwrapped = getNestedSource(source)

  for (const candidate of getTimeCandidates(unwrapped)) {
    const normalized = normalizeTime(candidate)
    if (normalized) return normalized
  }

  return null
}

function getBusySlotsFromAppointment(source: AppointmentLike): string[] {
  const unwrapped = getNestedSource(source)
  const startTime = parseAppointmentTime(source)
  const startMinutes = startTime ? timeToMinutes(startTime) : null

  if (startMinutes === null) return []

  const durationBlocks = toHourBlocks(
    unwrapped.duracaoHoras ??
      unwrapped.duracao ??
      unwrapped.duration ??
      unwrapped.tempoEstimado ??
      unwrapped.tempo ??
      unwrapped.minutos
  )

  const slots: string[] = []

  for (let i = 0; i < durationBlocks; i++) {
    const slotMinutes = startMinutes + i * 60
    const slotHour = Math.floor(slotMinutes / 60)

    if (slotHour === 12) {
      continue
    }

    slots.push(minutesToTime(slotMinutes))
  }

  return slots
}

export function extractBusyTimesFromDatePayload(
  payload: unknown,
  selectedDate: string
): string[] {
  const busySlots = new Set<string>()
  const list = getListFromResponse(payload)

  for (const item of list) {
    if (typeof item === 'string' || typeof item === 'number') {
      const parsed = normalizeTime(item)
      if (parsed) {
        busySlots.add(parsed)
      }
      continue
    }

    if (typeof item !== 'object' || item === null) continue

    const source = item as AppointmentLike
    const itemDate = parseAppointmentDate(source)

    // Proteção anti-regressão: quando backend incluir itens de outras datas
    // no payload, mantém apenas os da data selecionada.
    if (itemDate && itemDate !== selectedDate) continue

    for (const slot of getBusySlotsFromAppointment(source)) {
      busySlots.add(slot)
    }
  }

  return [...busySlots].sort()
}

export function useAppointmentSchedule({
  selectedDate,
  serviceHours,
  customHoursByDate
}: UseAppointmentScheduleParams) {
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState('')

  const getBusyTimesForDate = useCallback(fetchBusyTimesForDate, [])

  const getEndTime = useCallback((start: string, hours: number) => {
    const startMinutes = timeToMinutes(start)
    if (startMinutes === null) return start

    const startHour = Math.floor(startMinutes / 60)
    let endMinutes = startMinutes + hours * 60

    // Se o bloco ATRAVESSA o horário de almoço (12:00), pula para depois
    // Ex: 11:00 + 1h = 12:00 (não atravessa) ✓
    // Ex: 11:00 + 2h = 13:00 (atravessaria 12:00, então pula) → 14:00
    if (startHour < 12 && endMinutes / 60 > 12) {
      endMinutes += 60 // pula o horário de almoço
    }

    return minutesToTime(endMinutes)
  }, [])

  useEffect(() => {
    if (!selectedDate || serviceHours <= 0) {
      const timeoutId = window.setTimeout(() => {
        setAvailableTimes([])
        setSelectedTime('')
      }, 0)

      return () => window.clearTimeout(timeoutId)
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd')

    async function loadAvailability() {
      const customHours = customHoursByDate[dateStr] ?? []
      const allHours =
        customHours.length > 0 ? customHours : getDefaultBusinessHours()

      const busyTimes = await getBusyTimesForDate(dateStr)

      const blocks = getAvailableStartBlocks({
        allHours,
        busyTimes,
        serviceHours
      })
      setAvailableTimes(blocks)
      setSelectedTime('')
    }

    loadAvailability()
  }, [selectedDate, serviceHours, getBusyTimesForDate, customHoursByDate])

  return {
    availableTimes,
    selectedTime,
    setSelectedTime,
    getEndTime
  }
}

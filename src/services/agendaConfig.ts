import { api } from './api'

export type AgendaConfig = {
  blockedDates: string[]
  blockedWeekdays: number[]
  customHoursByDate: Record<string, string[]>
}

const DEFAULT_CONFIG: AgendaConfig = {
  blockedDates: [],
  blockedWeekdays: [0, 1],
  customHoursByDate: {}
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
      // Ignora parse inválido do objeto de usuário.
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

function getRootObject(data: unknown): Record<string, unknown> {
  if (typeof data === 'object' && data !== null) {
    return data as Record<string, unknown>
  }

  return {}
}

function toISODate(value: unknown): string | null {
  if (typeof value === 'string') {
    const text = value.trim()

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return text
    }

    // Suporta formato brasileiro (dd/MM/yyyy), comum no painel admin.
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

function getDateCandidates(source: Record<string, unknown>): unknown[] {
  return [
    source.data,
    source.date,
    source.day,
    source.blockedDate,
    source.dia,
    source.diaBloqueado,
    source.dataBloqueada,
    source.dataBlock,
    source.blockDate
  ]
}

function parseDateFromDocument(doc: unknown): string | null {
  const source = getRootObject(doc)

  for (const value of getDateCandidates(source)) {
    const isoDate = toISODate(value)
    if (isoDate) return isoDate
  }

  return null
}

function normalizeHour(value: unknown): string | null {
  const source =
    typeof value === 'object' && value !== null
      ? (value as Record<string, unknown>)
      : null

  const raw =
    source?.time ?? source?.hora ?? source?.hour ?? source?.horario ?? value

  const text = String(raw ?? '').trim()

  const match = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
  if (!match) return null

  const hhText = match[1]
  const mmText = match[2]
  const hh = Number(hhText)
  const mm = Number(mmText)

  if (!Number.isInteger(hh) || !Number.isInteger(mm)) return null
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null

  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function parseHoursList(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  const normalized = value
    .map(normalizeHour)
    .filter((item): item is string => item !== null)

  return [...new Set(normalized)].sort()
}

function parseCustomHours(value: unknown): Record<string, string[]> {
  const result: Record<string, string[]> = {}

  if (Array.isArray(value)) {
    for (const item of value) {
      const entry = getRootObject(item)
      const date = parseDateFromDocument(item)
      if (!date) continue

      const hours = parseHoursList(
        entry.horarios ??
          entry.hours ??
          entry.slots ??
          entry.hoursToWork ??
          entry.hoursCustomized ??
          entry.horariosPersonalizados
      )

      if (hours.length > 0) {
        result[date] = hours
      }
    }

    return result
  }

  const obj = getRootObject(value)

  for (const [date, hoursValue] of Object.entries(obj)) {
    const isoDate = toISODate(date)
    if (!isoDate) continue

    const hours = parseHoursList(hoursValue)

    if (hours.length > 0) {
      result[isoDate] = hours
    }
  }

  return result
}

function parseBlockedDatesFromDocs(value: unknown): string[] {
  const dates: string[] = []

  if (Array.isArray(value)) {
    for (const item of value) {
      const primitiveDate = toISODate(item)
      if (primitiveDate) {
        dates.push(primitiveDate)
      }

      const source = getRootObject(item)

      const singleDate = parseDateFromDocument(item)
      if (singleDate) {
        dates.push(singleDate)
      }

      const listCandidates = [
        source.blockedDates,
        source.datasBloqueadas,
        source.diasBloqueados,
        source.dates,
        source.daysBlock
      ]

      for (const candidate of listCandidates) {
        if (!Array.isArray(candidate)) continue

        for (const dateValue of candidate) {
          const isoDate = toISODate(dateValue)
          if (isoDate) {
            dates.push(isoDate)
          }
        }
      }
    }

    return [...new Set(dates)].sort()
  }

  const root = getRootObject(value)
  const topLevelCandidates = [
    root.blockedDates,
    root.datasBloqueadas,
    root.diasBloqueados,
    root.dates,
    root.daysBlock
  ]

  for (const candidate of topLevelCandidates) {
    if (!Array.isArray(candidate)) continue

    for (const dateValue of candidate) {
      const isoDate = toISODate(dateValue)
      if (isoDate) {
        dates.push(isoDate)
      }
    }
  }

  return [...new Set(dates)].sort()
}

function parseCustomHoursFromDocs(value: unknown): Record<string, string[]> {
  const result: Record<string, string[]> = {}

  if (Array.isArray(value)) {
    for (const item of value) {
      const entry = getRootObject(item)
      const date = parseDateFromDocument(item)

      if (!date) continue

      const hours = parseHoursList(
        entry.horarios ??
          entry.hours ??
          entry.slots ??
          entry.hoursToWork ??
          entry.hoursCustomized ??
          entry.horariosPersonalizados
      )

      if (hours.length > 0) {
        result[date] = hours
      }
    }

    return result
  }

  const root = getRootObject(value)

  const topLevelCustom =
    root.hoursCustomized ??
    root.horariosPersonalizados ??
    root.customHours ??
    root.horarios ??
    root.hoursToWork

  if (topLevelCustom) {
    const parsedTopLevel = parseCustomHours(topLevelCustom)

    for (const [date, hours] of Object.entries(parsedTopLevel)) {
      result[date] = hours
    }
  }

  return result
}

export async function listarConfiguracaoAgenda(): Promise<AgendaConfig> {
  const headers = getAuthHeaders()

  const [blockedDatesResponse, customHoursResponse] = await Promise.all([
    api.get('/datas', { headers }),
    api.get('/datas/horarios', { headers })
  ])

  const blockedDates = parseBlockedDatesFromDocs(blockedDatesResponse.data)

  const customSource =
    getRootObject(customHoursResponse.data).hoursCustomized ??
    customHoursResponse.data

  const customHoursFromDocs = parseCustomHoursFromDocs(customSource)
  const customHoursByDate =
    Object.keys(customHoursFromDocs).length > 0
      ? customHoursFromDocs
      : parseCustomHours(customSource)

  return {
    blockedDates,
    blockedWeekdays: DEFAULT_CONFIG.blockedWeekdays,
    customHoursByDate
  }
}

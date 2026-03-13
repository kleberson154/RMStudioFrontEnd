import { useCallback, useEffect, useMemo, useState } from 'react'
import { format, addDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import {
  fetchBusyTimesForDate,
  getAvailableStartBlocks,
  getDefaultBusinessHours
} from '../../hooks/useAppointmentSchedule'

type CalendarSectionProps = {
  selectedDate: Date | undefined
  onSelectDate: (date: Date | undefined) => void
  blockedDates: string[]
  blockedWeekdays: number[]
  customHoursByDate: Record<string, string[]>
  agendaError: string
  serviceHours: number
}

export default function CalendarSection({
  selectedDate,
  onSelectDate,
  blockedDates,
  blockedWeekdays,
  customHoursByDate,
  agendaError,
  serviceHours
}: CalendarSectionProps) {
  const [availableDateKeys, setAvailableDateKeys] = useState<string[]>([])
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false)

  const availableDatesSet = useMemo(
    () => new Set(availableDateKeys),
    [availableDateKeys]
  )

  const isBlockedByAdmin = useCallback(
    (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd')

      if (blockedDates.includes(dateStr)) return true

      return blockedWeekdays.includes(date.getDay())
    },
    [blockedDates, blockedWeekdays]
  )

  const isInsideBookingWindow = useCallback((date: Date) => {
    const today = startOfDay(new Date())
    const maxDate = addDays(today, 30)

    if (date <= today) return false
    if (date > maxDate) return false

    return true
  }, [])

  function isDaySelectable(date: Date) {
    if (!isInsideBookingWindow(date)) return false
    if (isBlockedByAdmin(date)) return false
    if (!availableDatesSet.has(format(date, 'yyyy-MM-dd'))) return false

    return serviceHours > 0
  }

  useEffect(() => {
    let ignore = false

    async function loadAvailableDates() {
      if (serviceHours <= 0) {
        setIsLoadingAvailability(false)
        setAvailableDateKeys([])
        return
      }

      setIsLoadingAvailability(true)

      const today = startOfDay(new Date())
      const datesToCheck: string[] = []

      for (let offset = 1; offset <= 30; offset++) {
        const date = addDays(today, offset)

        if (!isInsideBookingWindow(date) || isBlockedByAdmin(date)) {
          continue
        }

        datesToCheck.push(format(date, 'yyyy-MM-dd'))
      }

      const results = await Promise.all(
        datesToCheck.map(async dateKey => {
          const customHours = customHoursByDate[dateKey] ?? []
          const allHours =
            customHours.length > 0 ? customHours : getDefaultBusinessHours()
          const busyTimes = await fetchBusyTimesForDate(dateKey)
          const blocks = getAvailableStartBlocks({
            allHours,
            busyTimes,
            serviceHours
          })

          return blocks.length > 0 ? dateKey : null
        })
      )

      if (ignore) return

      setAvailableDateKeys(
        results.filter((dateKey): dateKey is string => Boolean(dateKey))
      )
      setIsLoadingAvailability(false)
    }

    loadAvailableDates()

    return () => {
      ignore = true
    }
  }, [customHoursByDate, isBlockedByAdmin, isInsideBookingWindow, serviceHours])

  useEffect(() => {
    if (!selectedDate || isLoadingAvailability) return

    const selectedDateKey = format(selectedDate, 'yyyy-MM-dd')

    if (!availableDatesSet.has(selectedDateKey)) {
      onSelectDate(undefined)
    }
  }, [availableDatesSet, isLoadingAvailability, onSelectDate, selectedDate])

  return (
    <div>
      <p className="font-medium mb-2 text-lg">Escolha a data</p>

      <div className="flex flex-col max-w-fit overflow-x-auto border-2 rounded-2xl border-ametista p-3">
        <div className="min-w-fit mx-auto">
          <DayPicker
            mode="single"
            locale={ptBR}
            selected={selectedDate}
            onSelect={onSelectDate}
            disabled={date => !isDaySelectable(date)}
            modifiers={{
              blocked: date => {
                const dateString = format(date, 'yyyy-MM-dd')
                return blockedDates.includes(dateString)
              },
              customized: date => {
                const dateString = format(date, 'yyyy-MM-dd')
                return (
                  Boolean(customHoursByDate[dateString]) &&
                  availableDatesSet.has(dateString)
                )
              },
              available: date => {
                const dateString = format(date, 'yyyy-MM-dd')

                return availableDatesSet.has(dateString)
              }
            }}
            modifiersClassNames={{
              blocked: 'bg-red-500 text-white',
              customized: 'bg-blue-500 text-white',
              available: 'day-available'
            }}
            modifiersStyles={{
              blocked: {
                backgroundColor: '#ef4444',
                color: '#ffffff'
              },
              customized: {
                backgroundColor: '#3b82f6',
                color: '#ffffff'
              }
            }}
            fromDate={new Date()}
          />
        </div>

        {agendaError ? (
          <p className="mt-2 text-sm text-red-600">{agendaError}</p>
        ) : null}

        {serviceHours > 0 && isLoadingAvailability ? (
          <p className="mt-2 text-sm text-gray-600">
            Verificando dias com disponibilidade para {serviceHours}h de
            atendimento...
          </p>
        ) : null}

        <div className="flex flex-col gap-2 mt-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
            <span className="w-2 h-2 bg-ametista rounded-full shrink-0"></span>
            <span>Dias com horário disponível</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
            <span className="w-2 h-2 bg-blue-400 shrink-0"></span>
            <span>Dias com horários customizados</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
            <span className="w-2 h-2 bg-red-500 shrink-0"></span>
            <span>Dias bloqueados</span>
          </div>
        </div>
      </div>
    </div>
  )
}

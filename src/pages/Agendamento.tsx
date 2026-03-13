import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import 'react-day-picker/dist/style.css'
import { format } from 'date-fns'
import CalendarSection from '../components/agendamento/CalendarSection'
import ClientFields from '../components/agendamento/ClientFields'
import ServicesSection from '../components/agendamento/ServicesSection'
import TimeSelector from '../components/agendamento/TimeSelector'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAgendamentoData } from '../hooks/useAgendamentoData'
import { useAppointmentSchedule } from '../hooks/useAppointmentSchedule'
import { useSelectedServicesSummary } from '../hooks/useSelectedServicesSummary'
import { api } from '../services/api'
import { isValidCpf, onlyDigits } from '../utils/cpf'
import { isValidPhone, onlyDigits as onlyDigitsPhone } from '../utils/phone'
import { isValidName } from '../utils/name'

type AppointmentPayload = {
  nome: string
  cpf: string
  telefone: string
  servicos: string[]
  data: string
  horario: string
}

function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { error?: string } } }
    return axiosError.response?.data?.error || 'Erro ao criar agendamento'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Erro ao criar agendamento'
}

function isScheduleValidationError(message: string): boolean {
  const normalized = message.toLowerCase()

  return (
    normalized.includes('horário inválido') ||
    normalized.includes('horario invalido') ||
    normalized.includes('funciona de terça') ||
    normalized.includes('funciona de terca')
  )
}

export default function Agendamento() {
  const navigate = useNavigate()
  const [client, setClient] = useState({
    name: '',
    cpf: '',
    phone: ''
  })
  const [servicos, setServicos] = useState<string[]>([])
  const [isCheckingCpfPending, setIsCheckingCpfPending] = useState(false)
  const [hasPendingAppointment, setHasPendingAppointment] = useState(false)
  const [cpfPendingError, setCpfPendingError] = useState('')

  const {
    catalogServices,
    isLoadingServices,
    servicesError,
    agendaConfig,
    agendaError
  } = useAgendamentoData()

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const { serviceHours, totalPrice } = useSelectedServicesSummary({
    servicos,
    catalogServices
  })

  async function createAppointment(data: AppointmentPayload) {
    await api.post('/agendamentos', data)
  }

  function hasPendingInResponse(data: unknown): boolean {
    if (typeof data === 'boolean') return data

    if (Array.isArray(data)) {
      return data.length > 0
    }

    if (typeof data === 'object' && data !== null) {
      const root = data as Record<string, unknown>

      const directBooleanCandidates = [
        root.hasPending,
        root.pending,
        root.exists,
        root.hasPendente,
        root.temPendente,
        root.temAgendamentoPendente
      ]

      for (const candidate of directBooleanCandidates) {
        if (typeof candidate === 'boolean') return candidate
      }

      const nestedCandidates = [root.data, root.result, root.agendamento]

      for (const candidate of nestedCandidates) {
        if (typeof candidate === 'boolean') return candidate
        if (Array.isArray(candidate)) return candidate.length > 0

        if (typeof candidate === 'object' && candidate !== null) {
          const nested = candidate as Record<string, unknown>
          const nestedBoolean =
            nested.hasPending ??
            nested.pending ??
            nested.exists ??
            nested.hasPendente ??
            nested.temPendente ??
            nested.temAgendamentoPendente

          if (typeof nestedBoolean === 'boolean') {
            return nestedBoolean
          }
        }
      }
    }

    return false
  }

  const cpfDigits = useMemo(() => onlyDigits(client.cpf), [client.cpf])
  const isCpfReadyForPendingCheck =
    cpfDigits.length === 11 && isValidCpf(cpfDigits)

  useEffect(() => {
    if (!isCpfReadyForPendingCheck) {
      setHasPendingAppointment(false)
      setCpfPendingError('')
      setIsCheckingCpfPending(false)
      return
    }

    let isCancelled = false

    async function checkPendingByCpf() {
      setIsCheckingCpfPending(true)

      try {
        const response = await api.get(
          `/agendamentos/cpf/${cpfDigits}/pendente`
        )

        if (isCancelled) return

        const hasPending = hasPendingInResponse(response.data)

        setHasPendingAppointment(hasPending)
        setCpfPendingError(
          hasPending
            ? 'Este CPF já tem um agendamento pendente e não pode agendar outro agora.'
            : ''
        )
      } catch {
        if (isCancelled) return

        setHasPendingAppointment(false)
        setCpfPendingError('')
      } finally {
        if (!isCancelled) {
          setIsCheckingCpfPending(false)
        }
      }
    }

    checkPendingByCpf()

    return () => {
      isCancelled = true
    }
  }, [cpfDigits, isCpfReadyForPendingCheck])

  async function createAppointmentWithFallbacks(
    baseData: Omit<AppointmentPayload, 'data' | 'horario'>,
    dateForPayload: Date,
    selectedHour: string
  ) {
    // "yyyy-MM-dd'T'HH:mm:ss" (sem timezone) → Node.js interpreta como horário LOCAL,
    // evitando que "2026-03-24" seja lido como UTC meia-noite e vire o dia anterior
    // no fuso UTC-3, o que faz new Date(date).getDay() retornar o dia errado no backend.
    const datesToTry = [
      format(dateForPayload, "yyyy-MM-dd'T'HH:mm:ss"),
      format(dateForPayload, 'yyyy-MM-dd')
    ]

    // Remove zero à esquerda para horários como "09:00" → "9:00"
    const hourWithoutLeadingZero = selectedHour.replace(/^0(\d):/, '$1:')
    const hoursToTry = [
      selectedHour,
      hourWithoutLeadingZero,
      `${selectedHour}:00`
    ]

    const attempts: Array<{ data: string; horario: string }> = []

    for (const data of datesToTry) {
      for (const horario of hoursToTry) {
        if (
          attempts.some(
            attempt => attempt.data === data && attempt.horario === horario
          )
        ) {
          continue
        }

        attempts.push({ data, horario })
      }
    }

    let lastError: unknown = null

    for (let i = 0; i < attempts.length; i++) {
      const attempt = attempts[i]

      try {
        await createAppointment({
          ...baseData,
          data: attempt.data,
          horario: attempt.horario
        })
        return
      } catch (error) {
        lastError = error

        const message = getApiErrorMessage(error)
        const shouldTryNext =
          isScheduleValidationError(message) && i < attempts.length - 1

        if (!shouldTryNext) {
          throw error
        }
      }
    }

    throw lastError
  }

  const { availableTimes, selectedTime, setSelectedTime, getEndTime } =
    useAppointmentSchedule({
      selectedDate,
      serviceHours,
      customHoursByDate: agendaConfig.customHoursByDate
    })

  /* ------------------------------
     Submit
  -------------------------------*/
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!selectedDate || !selectedTime) {
      alert('Selecione uma data e horário.')
      return
    }

    if (servicos.length === 0) {
      alert('Selecione pelo menos um serviço.')
      return
    }

    if (!isValidName(client.name)) {
      alert('Nome inválido. Digite nome e sobrenome completos.')
      return
    }

    const cpfDigits = onlyDigits(client.cpf)
    if (!isValidCpf(cpfDigits)) {
      alert('CPF inválido. Verifique o campo e tente novamente.')
      return
    }

    if (isCheckingCpfPending) {
      alert('Aguarde a verificação de pendência do CPF.')
      return
    }

    if (hasPendingAppointment) {
      alert('Este CPF já tem um agendamento pendente e não pode agendar outro.')
      return
    }

    const phoneDigits = onlyDigitsPhone(client.phone)
    if (!isValidPhone(phoneDigits)) {
      alert('Telefone inválido. Verifique o campo e tente novamente.')
      return
    }

    // Verificar disponibilidade do horário
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const timeStr = selectedTime

      const availabilityResponse = await api.get(
        `/agendamentos/${dateStr}/${timeStr}`
      )

      // Se a resposta vem com isAvailable: false ou similar, o horário não está disponível
      const isTimeAvailable =
        availabilityResponse.data?.isAvailable !== false &&
        availabilityResponse.data?.disponivel !== false &&
        availabilityResponse.status === 200

      if (!isTimeAvailable) {
        alert(
          'Este horário não está mais disponível. Por favor, escolha outro.'
        )
        return
      }
    } catch (error) {
      // Se houver erro na verificação, continua (pode ser endpoint não implementado)
      // ou mostra erro se for algo esperado
      const errorMessage = getApiErrorMessage(error)
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        // Endpoint pode não estar implementado, continua
      } else {
        console.warn('Aviso ao verificar horário:', errorMessage)
      }
    }

    // Mapear nomes dos serviços para seus IDs
    const servicosIds = servicos
      .map(nomeServico => {
        const servico = catalogServices.find(s => s.nome === nomeServico)
        return servico?.id
      })
      .filter((id): id is string => id !== undefined)

    if (servicosIds.length !== servicos.length) {
      alert('Erro ao processar serviços selecionados.')
      return
    }

    const payloadBase = {
      nome: client.name.trim(),
      cpf: cpfDigits,
      telefone: phoneDigits,
      servicos: servicosIds
    }

    try {
      await createAppointmentWithFallbacks(
        payloadBase,
        selectedDate,
        selectedTime
      )

      navigate('/agendamento/sucesso')
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error)
      alert(`Erro: ${errorMessage}`)
    }
  }

  return (
    <div className="flex flex-col min-h-screen font-display">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center bg-[url('/BACKGROUND.png')] bg-cover bg-center py-6 px-4 sm:py-10 sm:px-5">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl flex flex-col gap-5 border-2 border-ametista rounded-2xl p-4 sm:p-6 bg-white/95 backdrop-blur"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-ametista">
            Agendamento
          </h1>
          <ClientFields
            client={client}
            onChange={setClient}
            cpfPendingError={cpfPendingError}
            isCheckingCpfPending={isCheckingCpfPending}
          />

          <ServicesSection
            catalogServices={catalogServices}
            selectedServices={servicos}
            isLoadingServices={isLoadingServices}
            servicesError={servicesError}
            serviceHours={serviceHours}
            totalPrice={totalPrice}
            onChangeSelectedServices={setServicos}
          />

          <CalendarSection
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            blockedDates={agendaConfig.blockedDates}
            blockedWeekdays={agendaConfig.blockedWeekdays}
            customHoursByDate={agendaConfig.customHoursByDate}
            agendaError={agendaError}
            serviceHours={serviceHours}
          />

          <TimeSelector
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            availableTimes={availableTimes}
            serviceHours={serviceHours}
            onChangeTime={setSelectedTime}
            getEndTime={getEndTime}
          />

          <button
            disabled={
              !selectedTime || hasPendingAppointment || isCheckingCpfPending
            }
            type="submit"
            className="w-full bg-ametista text-white py-2 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed hover:bg-green-500 transition-colors"
          >
            Agendar
          </button>
        </form>
      </main>

      <Footer />
    </div>
  )
}

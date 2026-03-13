import { useEffect, useState } from 'react'
import {
  listarConfiguracaoAgenda,
  type AgendaConfig
} from '../services/agendaConfig'
import { listarServicos, type Servico } from '../services/servicos'

type UseAgendamentoDataResult = {
  catalogServices: Servico[]
  isLoadingServices: boolean
  servicesError: string
  agendaConfig: AgendaConfig
  agendaError: string
}

const DEFAULT_AGENDA_CONFIG: AgendaConfig = {
  blockedDates: [],
  blockedWeekdays: [0, 1],
  customHoursByDate: {}
}

function toErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export function useAgendamentoData(): UseAgendamentoDataResult {
  const [catalogServices, setCatalogServices] = useState<Servico[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [servicesError, setServicesError] = useState('')
  const [agendaConfig, setAgendaConfig] = useState<AgendaConfig>(
    DEFAULT_AGENDA_CONFIG
  )
  const [agendaError, setAgendaError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadData() {
      setIsLoadingServices(true)
      setServicesError('')
      setAgendaError('')

      const [servicesResult, agendaResult] = await Promise.allSettled([
        listarServicos(),
        listarConfiguracaoAgenda()
      ])

      if (ignore) return

      if (servicesResult.status === 'fulfilled') {
        setCatalogServices(servicesResult.value)
      } else {
        setServicesError(
          toErrorMessage(
            servicesResult.reason,
            'Nao foi possivel carregar os servicos.'
          )
        )
      }

      if (agendaResult.status === 'fulfilled') {
        setAgendaConfig(agendaResult.value)
      } else {
        setAgendaError(
          toErrorMessage(
            agendaResult.reason,
            'Nao foi possivel carregar a configuracao da agenda.'
          )
        )
      }

      setIsLoadingServices(false)
    }

    loadData()

    return () => {
      ignore = true
    }
  }, [])

  return {
    catalogServices,
    isLoadingServices,
    servicesError,
    agendaConfig,
    agendaError
  }
}

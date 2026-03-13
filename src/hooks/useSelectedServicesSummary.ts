import { useMemo } from 'react'
import type { Servico } from '../services/servicos'

type UseSelectedServicesSummaryParams = {
  servicos: string[]
  catalogServices: Servico[]
}

export function useSelectedServicesSummary({
  servicos,
  catalogServices
}: UseSelectedServicesSummaryParams) {
  return useMemo(() => {
    const selectedServiceItems = catalogServices.filter(service =>
      servicos.includes(service.nome)
    )

    const totalDurationMinutes = selectedServiceItems.reduce(
      (total, service) => total + (service.duracaoMinutos ?? 0),
      0
    )

    const serviceHours =
      totalDurationMinutes > 0 ? Math.ceil(totalDurationMinutes / 60) : 0

    const totalPrice = selectedServiceItems.reduce(
      (total, service) => total + service.preco,
      0
    )

    return {
      selectedServiceItems,
      totalDurationMinutes,
      serviceHours,
      totalPrice
    }
  }, [servicos, catalogServices])
}

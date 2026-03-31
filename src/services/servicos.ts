import { api } from './api'

export type Servico = {
  id: string
  nome: string
  descricao: string
  duracaoMinutos: number
  preco: number
  ativo: boolean
}

function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: { status?: number; data?: { error?: string } }
    }

    const status = axiosError.response?.status
    const backendMessage = axiosError.response?.data?.error

    if (backendMessage) {
      return backendMessage
    }

    if (typeof status === 'number' && status >= 500) {
      return 'Servico temporariamente indisponivel. Tente novamente em instantes.'
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Nao foi possivel carregar os servicos.'
}

function toHourBlocks(value: unknown): number {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return 60
  }

  // APIs de serviços costumam enviar minutos (ex.: 30, 60, 90)
  // ou horas (ex.: 1, 2). Valores pequenos são tratados como horas inteiras.
  if (numericValue > 10) {
    return Math.ceil(numericValue)
  }

  return Math.ceil(numericValue * 60)
}

function toCurrencyNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').replace(/[^\d.]/g, '')
    const parsed = Number(normalized)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return 0
}

function getListFromResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) return data

  if (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    Array.isArray((data as { data?: unknown[] }).data)
  ) {
    return (data as { data: unknown[] }).data
  }

  if (
    typeof data === 'object' &&
    data !== null &&
    'servicos' in data &&
    Array.isArray((data as { servicos?: unknown[] }).servicos)
  ) {
    return (data as { servicos: unknown[] }).servicos
  }

  return []
}

function normalizeServico(item: unknown): Servico {
  const source = (item ?? {}) as Record<string, unknown>

  const idValue = source.id ?? source._id ?? source.nome ?? source.name
  const nomeValue = source.nome ?? source.name ?? ''
  const descricaoValue = source.descricao ?? source.description ?? ''
  const duracaoValue =
    source.duracaoMinutos ??
    source.duracaoHoras ??
    source.duracao ??
    source.duration ??
    source.tempoEstimado ??
    source.tempo ??
    source.minutos
  const precoValue =
    source.preco ?? source.valor ?? source.price ?? source.precoServico
  const ativoValue = source.ativo ?? source.active

  return {
    id: String(idValue ?? ''),
    nome: String(nomeValue),
    descricao: String(descricaoValue),
    duracaoMinutos: toHourBlocks(duracaoValue),
    preco: toCurrencyNumber(precoValue),
    ativo: Boolean(ativoValue)
  }
}

export async function listarServicos(): Promise<Servico[]> {
  try {
    const response = await api.get('/servicos')

    return getListFromResponse(response.data)
      .map(normalizeServico)
      .filter(servico => servico.id && servico.nome && servico.ativo)
  } catch (error) {
    throw new Error(getApiErrorMessage(error))
  }
}

import { describe, expect, it } from 'vitest'
import {
  extractBusyTimesFromDatePayload,
  getAvailableStartBlocks
} from './useAppointmentSchedule'

describe('getAvailableStartBlocks', () => {
  it('permite apenas blocos contínuos completos de 3h quando 16:00 está ocupado', () => {
    const allHours = [
      '09:00',
      '10:00',
      '11:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00'
    ]

    const result = getAvailableStartBlocks({
      allHours,
      busyTimes: ['16:00'],
      serviceHours: 3
    })

    expect(result).toEqual(['09:00', '13:00'])
    expect(result).not.toContain('14:00')
    expect(result).not.toContain('15:00')
  })

  it('bloqueia início cujo bloco atravessa 12:00', () => {
    const result = getAvailableStartBlocks({
      allHours: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'],
      busyTimes: [],
      serviceHours: 2
    })

    expect(result).toEqual(['09:00', '10:00', '13:00', '14:00'])
    expect(result).not.toContain('11:00')
  })
})

describe('extractBusyTimesFromDatePayload', () => {
  it('extrai horários ocupados do payload real de /agendamentos/:date', () => {
    const payload = [
      {
        id: 'ag-1',
        data: '2026-02-24',
        horario: '16:00',
        servicos: ['svc-1']
      }
    ]

    const result = extractBusyTimesFromDatePayload(payload, '2026-02-24')

    expect(result).toEqual(['16:00'])
  })

  it('ignora itens de outra data para evitar regressão de bloqueio indevido', () => {
    const payload = [
      {
        id: 'ag-1',
        data: '2026-02-24',
        horario: '16:00'
      },
      {
        id: 'ag-2',
        data: '2026-02-25',
        horario: '14:00'
      }
    ]

    const result = extractBusyTimesFromDatePayload(payload, '2026-02-24')

    expect(result).toEqual(['16:00'])
    expect(result).not.toContain('14:00')
  })
})

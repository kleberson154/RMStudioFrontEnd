type TimeSelectorProps = {
  selectedDate: Date | undefined
  selectedTime: string
  availableTimes: string[]
  serviceHours: number
  onChangeTime: (time: string) => void
  getEndTime: (start: string, hours: number) => string
}

export default function TimeSelector({
  selectedDate,
  selectedTime,
  availableTimes,
  serviceHours,
  onChangeTime,
  getEndTime
}: TimeSelectorProps) {
  return (
    <div>
      <p className="font-medium mb-2 text-lg">Escolha um horário</p>

      <select
        disabled={!selectedDate}
        value={selectedTime}
        onChange={e => onChangeTime(e.target.value)}
        className="w-full border-2 rounded-2xl border-ametista p-2 disabled:bg-gray-100 "
      >
        <option value="">Selecione...</option>

        {availableTimes.map(time => (
          <option key={time} value={time}>
            {time} até {getEndTime(time, serviceHours)}
          </option>
        ))}
      </select>

      {selectedDate && availableTimes.length === 0 ? (
        <p className="mt-2 text-sm text-gray-600">
          Nenhum horário disponível para este dia.
        </p>
      ) : null}
    </div>
  )
}

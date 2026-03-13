import type { Servico } from '../../services/servicos'

type ServicesSectionProps = {
  catalogServices: Servico[]
  selectedServices: string[]
  isLoadingServices: boolean
  servicesError: string
  serviceHours: number
  totalPrice: number
  onChangeSelectedServices: (nextServices: string[]) => void
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

function formatDuration(minutes: number) {
  if (minutes <= 0) return '0min'

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}min`
  }

  if (hours > 0) {
    return hours === 1 ? '1h' : `${hours}h`
  }

  return `${remainingMinutes}min`
}

export default function ServicesSection({
  catalogServices,
  selectedServices,
  isLoadingServices,
  servicesError,
  serviceHours,
  totalPrice,
  onChangeSelectedServices
}: ServicesSectionProps) {
  function handleToggleService(name: string) {
    if (selectedServices.includes(name)) {
      onChangeSelectedServices(
        selectedServices.filter(service => service !== name)
      )
      return
    }

    if (selectedServices.length < 3) {
      onChangeSelectedServices([...selectedServices, name])
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg">Serviços</h2>
      <p>Selecione até 3 serviços</p>

      {isLoadingServices ? <p>Carregando serviços...</p> : null}
      {servicesError ? <p className="text-red-600">{servicesError}</p> : null}
      {!isLoadingServices && !servicesError && catalogServices.length === 0 ? (
        <p>Nenhum serviço encontrado.</p>
      ) : null}

      <div className="flex gap-3 flex-wrap">
        {catalogServices.map(servico => (
          <button
            type="button"
            key={servico.id}
            onClick={() => handleToggleService(servico.nome)}
            className={`
              px-3 py-2 border-2 border-ametista rounded-xl cursor-pointer text-left
              ${selectedServices.includes(servico.nome) ? 'bg-ametista text-white' : 'bg-white'}
            `}
          >
            <span className="block font-medium">{servico.nome}</span>
            <span className="block text-sm opacity-90">
              {formatDuration(servico.duracaoMinutos)} •{' '}
              {formatCurrency(servico.preco)}
            </span>
          </button>
        ))}
      </div>

      {selectedServices.length > 0 ? (
        <p className="text-sm text-gray-700">
          Total selecionado:{' '}
          {formatDuration(
            selectedServices
              .map(
                name =>
                  catalogServices.find(s => s.nome === name)?.duracaoMinutos ||
                  0
              )
              .reduce((a, b) => a + b, 0)
          )}{' '}
          • {formatCurrency(totalPrice)} • janela reservada de {serviceHours}h
        </p>
      ) : null}
    </div>
  )
}

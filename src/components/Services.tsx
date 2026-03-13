import { useEffect, useState } from 'react'
import Card from '../subComponents/Card'
import { listarServicos, type Servico } from '../services/servicos'

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export default function Services() {
  const [services, setServices] = useState<Servico[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadServices() {
      setIsLoading(true)
      setError('')

      try {
        const result = await listarServicos()

        if (ignore) return

        setServices(result)
      } catch (err) {
        if (ignore) return

        const message =
          err instanceof Error
            ? err.message
            : 'Nao foi possivel carregar os servicos.'

        setError(message)
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadServices()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <div id="Services" className="flex flex-col items-center px-5 py-20">
      <h2 className="uppercase font-bold">Nossos</h2>
      <h1 className="uppercase font-bold text-ametista text-3xl">Serviços</h1>

      {isLoading && <p className="mt-6">Carregando servicos...</p>}
      {!isLoading && error && <p className="mt-6 text-red-500">{error}</p>}

      <div className="flex flex-col justify-center sm:flex-wrap sm:flex-row gap-3 mt-10">
        {!isLoading &&
          !error &&
          services.map(service => (
            <Card
              key={service.id}
              title={service.nome}
              description={service.descricao || 'Descricao nao informada.'}
              price={formatPrice(service.preco)}
            />
          ))}
      </div>
    </div>
  )
}

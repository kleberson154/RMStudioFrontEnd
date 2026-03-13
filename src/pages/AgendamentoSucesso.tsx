import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function AgendamentoSucesso() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen font-display">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center bg-[url('/BACKGROUND.png')] bg-cover bg-center px-4 py-16">
        <div className="bg-white/95 backdrop-blur border-2 border-ametista rounded-2xl p-8 sm:p-12 max-w-md w-full flex flex-col items-center gap-6 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-9 h-9 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-ametista">
            Agendamento confirmado!
          </h1>

          <p className="text-gray-600">
            Seu agendamento foi realizado com sucesso. Em breve entraremos em
            contato para confirmar os detalhes.
          </p>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-ametista text-white py-3 rounded-lg hover:bg-green-500 transition-colors font-semibold cursor-pointer"
          >
            Voltar para a página inicial
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}

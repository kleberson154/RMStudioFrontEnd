import { ChevronsRight } from 'lucide-react'
import Link from '../subComponents/Link'

export default function Home() {
  return (
    <div
      className="bg-ametista text-white flex flex-col items-center md:flex-row justify-between  px-0 xl:px-48 overflow-hidden xl:py-5"
      id="Home"
    >
      <div className="relative flex flex-1 items-center justify-center">
        <img
          src="/modelo.png"
          alt="modelo"
          className="relative z-9 w-sm h-full xl:top-5 "
        />
        <img
          src="/borrao.svg"
          alt="borrao"
          className="absolute top-25 left-30 z-0"
        />
      </div>
      <div className="flex flex-1 flex-1 flex-col justify-center gap-4 relative z-10 py-10 md:py-0 px-5 md:px-0 bg-black md:bg-transparent w-full">
        <h1 className="text-4xl font-bold uppercase">
          seus cabelos precisam dos cuidados certos.
        </h1>
        <p className="w-3/4">
          Realce sua beleza com atendimento especializado, produtos de qualidade
          e técnicas modernas para cuidar dos seus cabelos do jeito que você
          merece.
        </p>
        <Link
          href="/agendamentos"
          style="bg-ametista md:bg-black border-2 border-black hover:bg-black hover:border-white"
        >
          Saiba Mais <ChevronsRight className="w-4" />
        </Link>
      </div>
    </div>
  )
}

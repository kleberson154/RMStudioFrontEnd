import { ChevronsRight } from 'lucide-react'
import Link from './Link'

export default function Card({
  title,
  description,
  price
}: {
  title: string
  description: string
  price: string
}) {
  return (
    <div className="flex flex-col items-center border-2 border-gray-300 rounded-lg p-5 gap-3 w-min sm:w-80">
      <h3 className="text-ametista text-2xl">{title}</h3>
      <p className="text-center">{description}</p>
      <p className="uppercase font-bold font-inter text-lg">R$ {price}</p>
      <Link href="/agendamento" style="bg-ametista xl:bg-black hover:bg-black">
        Agendar Horário <ChevronsRight className="w-4" />
      </Link>
    </div>
  )
}

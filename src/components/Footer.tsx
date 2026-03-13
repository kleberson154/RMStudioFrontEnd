import { useEffect, useState } from 'react'
import { Facebook, Instagram, Phone } from 'lucide-react'
import { listarServicos, type Servico } from '../services/servicos'

export default function Footer() {
  const [services, setServices] = useState<Servico[]>([])

  useEffect(() => {
    let ignore = false

    listarServicos()
      .then(result => {
        if (!ignore) setServices(result)
      })
      .catch(() => {})

    return () => {
      ignore = true
    }
  }, [])

  return (
    <>
      <div className="bg-black text-white flex flex-col xl:justify-between  gap-10 sm:flex-row sm:gap-20 px-6 xl:px-48 py-10">
        <div className="flex flex-col gap-5 md:w-1/3">
          <img src="/public/logoRmStudio.png" alt="logo" />
          <p>
            No RM Studio, cada atendimento é pensado para valorizar seu estilo,
            com profissionais qualificados, cuidado em cada detalhe e resultados
            que elevam sua autoestima.
          </p>
        </div>
        <div className="flex flex-col gap-10 sm:flex-row sm:gap-20">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl text-ametista pb-3">Empresa</h3>
            <a href="#About">Sobre Nós</a>
            <a href="#Services">Serviços</a>
            <a href="#Promotion">Promoção</a>
            <a href="#Contact">Contato</a>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl text-ametista pb-3">Serviços</h3>
            {services.slice(0, 5).map(service => (
              <span key={service.id}>{service.nome}</span>
            ))}
            {services.length > 5 && (
              <a href="#Services" className="text-ametista text-sm mt-1">
                Mais Serviços...
              </a>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl text-ametista pb-3">Contato</h3>
            <a href="#">Agendar Hórario</a>
            <a
              href="tel:+5534996334454"
              className="flex gap-2 font-inter text-sm"
            >
              <Phone className="w-5" />
              (34) 99633-4454
            </a>
            <a
              href="https://wa.me/5534996334454"
              target="_blank"
              rel="noreferrer"
              className="flex gap-2 font-inter text-sm"
            >
              <img
                src="/src/assets/whatsapp.svg"
                alt="WhatsApp"
                className="w-5"
              />
              (34) 99633-4454
            </a>
            <a
              href="https://www.instagram.com/salao_rosa_m/"
              target="_blank"
              rel="noreferrer"
              className="flex gap-2"
            >
              <Instagram className="w-5" />
              Instagram
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=100063536770695&locale=pt_BR"
              target="_blank"
              rel="noreferrer"
              className="flex gap-2"
            >
              <Facebook className="w-5" />
              Facebook
            </a>
          </div>
        </div>
      </div>
      <div className="bg-neutral-900 text-ametista flex justify-center gap-10 sm:flex-row sm:gap-20 px-6 xl:px-48 py-5">
        RM Studio © Todos Direitos Reservados{' '}
      </div>
    </>
  )
}

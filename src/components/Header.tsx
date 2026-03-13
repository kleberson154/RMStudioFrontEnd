import { useState } from 'react'
import {
  Clock,
  Facebook,
  Instagram,
  Mail,
  Phone,
  TextAlignJustify,
  X
} from 'lucide-react'
import Link from '../subComponents/Link'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  return (
    <>
      {/* DIV TOP INICIO*/}
      <div className="bg-ametista text-white text-md justify-between py-4 px-6 xl:px-48 hidden md:flex">
        <div className="flex items-center gap-10 ">
          <a
            href="mailto:rosamandrade1978@gmail.com"
            className="flex items-center gap-3"
          >
            <Mail className="w-5" />
            rosamandrade1978@gmail.com
          </a>
          <a
            href="tel:+5534996334454"
            className="flex items-center gap-3 font-inter text-sm"
          >
            <Phone className="w-5" />
            (34) 99633-4454
          </a>
          <a
            href="https://wa.me/5534996334454"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 font-inter text-sm"
          >
            <img
              src="/src/assets/whatsapp.svg"
              alt="WhatsApp"
              className="w-5 "
            />
            (34) 99633-4454
          </a>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <p>Siga-nós:</p>
            <a
              href="https://www.instagram.com/salao_rosa_m/"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram className="w-5" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=100063536770695&locale=pt_BR"
              target="_blank"
              rel="noreferrer"
            >
              <Facebook className="w-5" />
            </a>
          </div>
        </div>
      </div>
      {/* DIV TOP FIM */}
      {/* DIV BOTTOM INICIO*/}
      <div className="flex justify-between px-6 xl:px-48 py-2 uppercase sm:h-auto">
        <img
          src="/public/logoRmStudio.png"
          alt="logo"
          className="w-1/2 sm:w-1/4 md:w-1/5 lg:w-1/6"
        />
        {isMenuOpen ? (
          <button
            className="text-gray-500 hover:text-ametista focus:outline-none sm:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <X />
          </button>
        ) : (
          <button
            className="text-gray-500 hover:text-ametista focus:outline-none sm:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <TextAlignJustify />
          </button>
        )}
        <div
          className={`absolute sm:static top-16 right-0 px-5 rounded-bl-lg bg-white flex-col sm:flex-row items-center z-10 gap-4 xl:gap-8 tracking-tight ${
            isMenuOpen ? 'flex' : 'hidden'
          } sm:flex`}
        >
          <a
            href="/"
            className="text-sm py-2 text-gray-500 hover:text-ametista"
          >
            Home
          </a>
          <a
            href="#About"
            className="text-sm py-2 text-gray-500 hover:text-ametista"
          >
            Sobre Nós
          </a>
          <a
            href="#Services"
            className="text-sm py-2 text-gray-500 hover:text-ametista"
          >
            Serviços
          </a>
          <a
            href="#Contact"
            className="text-sm py-2 text-gray-500 hover:text-ametista"
          >
            Contato
          </a>
          <Link
            href="/agendamento"
            style="hidden md:flex bg-black hover:bg-ametista gap-2 xl:ml-10"
          >
            Agendar Horário <Clock className="w-5" />
          </Link>
        </div>
      </div>
      {/* DIV BOTTOM FIM */}
    </>
  )
}

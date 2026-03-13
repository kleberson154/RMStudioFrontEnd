import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { ChevronsRight, Mail, Phone } from 'lucide-react'

// Configure suas credenciais em https://www.emailjs.com/
const EMAILJS_SERVICE_ID = 'SEU_SERVICE_ID'
const EMAILJS_TEMPLATE_ID = 'SEU_TEMPLATE_ID'
const EMAILJS_PUBLIC_KEY = 'SUA_PUBLIC_KEY'

type FormState = {
  nome: string
  telefone: string
  email: string
  mensagem: string
}

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function Contact() {
  const [form, setForm] = useState<FormState>({
    nome: '',
    telefone: '',
    email: '',
    mensagem: ''
  })
  const [status, setStatus] = useState<Status>('idle')

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!form.nome.trim() || !form.mensagem.trim()) {
      alert('Preencha pelo menos o nome e a mensagem.')
      return
    }

    setStatus('sending')

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.nome,
          from_phone: form.telefone,
          from_email: form.email,
          message: form.mensagem,
          to_email: 'rosamandrade1978@gmail.com'
        },
        EMAILJS_PUBLIC_KEY
      )

      setStatus('success')
      setForm({ nome: '', telefone: '', email: '', mensagem: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <div
      id="Contact"
      className="px-5 py-15 flex flex-col gap-10 sm:flex-row sm:gap-20  xl:px-48"
    >
      <div className="flex flex-col gap-3 sm:w-1/2">
        <h2 className="text-xl">Ficou com alguma dúvida?</h2>
        <h1 className="uppercase text-3xl font-bold text-ametista">
          Fale Conosco
        </h1>
        <p>
          Não perca mais tempo e entre agora em contato com nossa equipe de
          especialistas. Teremos o maior prazer em ajudar você.
        </p>
        <a
          href="tel:+5534996334454"
          className="flex items-center gap-3 text-white bg-ametista w-max py-2 px-4 rounded-3xl font-inter"
        >
          <Phone className="w-5" />
          (34) 99633-4454
        </a>
        <a
          href="https://wa.me/5534996334454"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 text-white bg-ametista w-max py-2 px-4 rounded-3xl font-inter"
        >
          <img src="/src/assets/whatsapp.svg" alt="WhatsApp" className="w-5" />
          (34) 99633-4454
        </a>
        <a
          href="mailto:rosamandrade1978@gmail.com"
          className="flex items-center gap-3 text-white bg-ametista w-max py-2 px-4 rounded-3xl font-inter"
        >
          <Mail className="w-5" />
          rosamandrade1978@gmail.com
        </a>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 border-1 border-ametista rounded-lg p-5 sm:w-1/2"
      >
        <h2 className="text-xl font-bold text-ametista">
          Formulário de Contato
        </h2>

        <input
          type="text"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          placeholder="Nome Completo"
          required
          className="border-1 border-gray-300 rounded-md p-2 placeholder:text-ametista"
        />

        <div className="flex">
          <input
            type="tel"
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
            placeholder="Celular/WhatsApp"
            className="border-1 border-gray-300 rounded-md p-2 placeholder:text-ametista w-full mr-2"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="border-1 border-gray-300 rounded-md p-2 placeholder:text-ametista w-full ml-2"
          />
        </div>

        <textarea
          name="mensagem"
          value={form.mensagem}
          onChange={handleChange}
          placeholder="Mensagem"
          required
          className="border-1 border-gray-300 rounded-md p-2 placeholder:text-ametista"
          rows={5}
        />

        {status === 'success' && (
          <p className="text-green-600 text-sm">
            Mensagem enviada com sucesso!
          </p>
        )}
        {status === 'error' && (
          <p className="text-red-500 text-sm">
            Erro ao enviar. Tente novamente.
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="bg-ametista text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'sending' ? 'Enviando...' : 'Enviar Mensagem'}
          {status !== 'sending' && <ChevronsRight className="w-4" />}
        </button>
      </form>
    </div>
  )
}

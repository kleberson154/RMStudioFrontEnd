import { formatCpf, isValidCpf, onlyDigits } from '../../utils/cpf'
import {
  formatPhone,
  isValidPhone,
  onlyDigits as onlyDigitsPhone
} from '../../utils/phone'
import { formatName, isValidName } from '../../utils/name'

type ClientData = {
  name: string
  cpf: string
  phone: string
}

type ClientFieldsProps = {
  client: ClientData
  onChange: (nextClient: ClientData) => void
  cpfPendingError?: string
  isCheckingCpfPending?: boolean
}

export default function ClientFields({
  client,
  onChange,
  cpfPendingError = '',
  isCheckingCpfPending = false
}: ClientFieldsProps) {
  const trimmedName = client.name.trim()
  const hasNameError = trimmedName.length > 0 && !isValidName(trimmedName)

  const cpfDigits = onlyDigits(client.cpf)
  const hasCpfError = cpfDigits.length === 11 && !isValidCpf(cpfDigits)
  const hasCpfPendingError = cpfPendingError.trim().length > 0

  const phoneDigits = onlyDigitsPhone(client.phone)
  const hasPhoneError =
    (phoneDigits.length === 10 || phoneDigits.length === 11) &&
    !isValidPhone(phoneDigits)

  return (
    <>
      <div className="flex flex-col gap-2 w-full">
        <label htmlFor="nome" className="text-lg">
          Nome Completo
        </label>
        <input
          type="text"
          name="nome"
          placeholder="João Silva"
          value={client.name}
          onChange={e =>
            onChange({
              ...client,
              name: formatName(e.target.value)
            })
          }
          className={`border-2 rounded-xl p-2 ${hasNameError ? 'border-red-500' : 'border-ametista'}`}
        />
        {hasNameError ? (
          <p className="text-sm text-red-600">
            Digite nome e sobrenome (mínimo 2 letras cada).
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 w-full">
        <label htmlFor="cpf" className="text-lg">
          CPF
        </label>
        <input
          type="text"
          name="cpf"
          placeholder="123.456.789-00"
          value={client.cpf}
          maxLength={14}
          inputMode="numeric"
          onChange={e =>
            onChange({
              ...client,
              cpf: formatCpf(e.target.value)
            })
          }
          className={`border-2 rounded-xl p-2 ${hasCpfError || hasCpfPendingError ? 'border-red-500' : 'border-ametista'}`}
        />
        {hasCpfError ? (
          <p className="text-sm text-red-600">CPF invalido.</p>
        ) : null}
        {hasCpfPendingError ? (
          <p className="text-sm text-red-600">{cpfPendingError}</p>
        ) : null}
        {!hasCpfError && !hasCpfPendingError && isCheckingCpfPending ? (
          <p className="text-sm text-gray-600">
            Verificando agendamento pendente...
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 w-full">
        <label htmlFor="telefone" className="text-lg">
          Telefone
        </label>
        <input
          type="text"
          name="telefone"
          placeholder="(11) 91234-5678"
          value={client.phone}
          maxLength={15}
          inputMode="tel"
          onChange={e =>
            onChange({
              ...client,
              phone: formatPhone(e.target.value)
            })
          }
          className={`border-2 rounded-xl p-2 ${hasPhoneError ? 'border-red-500' : 'border-ametista'}`}
        />
        {hasPhoneError ? (
          <p className="text-sm text-red-600">Telefone inválido.</p>
        ) : null}
      </div>
    </>
  )
}

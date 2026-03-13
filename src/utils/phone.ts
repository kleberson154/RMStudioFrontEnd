/**
 * Remove todos os caracteres não numéricos
 */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Formata o telefone no padrão (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
 * Aceita números com 8 ou 9 dígitos (sem contar o DDD)
 */
export function formatPhone(value: string): string {
  const digits = onlyDigits(value)

  // Limita a 11 caracteres (2 DDD + 9 dígitos)
  const limited = digits.slice(0, 11)

  if (limited.length <= 2) {
    return limited
  }

  if (limited.length <= 6) {
    // (XX) XXXX
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`
  }

  if (limited.length <= 10) {
    // (XX) XXXX-XXXX (telefone com 8 dígitos)
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`
  }

  // (XX) XXXXX-XXXX (telefone com 9 dígitos)
  return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`
}

/**
 * Valida se o telefone está no formato correto
 * DDD (2 dígitos) + número (8 ou 9 dígitos)
 */
export function isValidPhone(digits: string): boolean {
  const length = digits.length

  // Deve ter 10 dígitos (DDD + 8) ou 11 dígitos (DDD + 9)
  if (length !== 10 && length !== 11) {
    return false
  }

  // Validação básica: DDD não pode começar com 0
  const ddd = digits.slice(0, 2)
  if (ddd[0] === '0') {
    return false
  }

  // Para telefones com 9 dígitos, o primeiro dígito deve ser 9
  if (length === 11 && digits[2] !== '9') {
    return false
  }

  return true
}

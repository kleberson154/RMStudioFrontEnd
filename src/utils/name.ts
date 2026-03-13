/**
 * Formata o nome: capitaliza cada palavra e remove espaços extras
 */
export function formatName(value: string): string {
  // Remove espaços extras e converte para formato de nome próprio
  return value
    .replace(/\s+/g, ' ') // Remove espaços duplicados
    .split(' ')
    .map(word => {
      if (word.length === 0) return ''
      // Capitaliza primeira letra e deixa resto em minúsculo
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

/**
 * Valida se o nome é válido
 * - Deve ter pelo menos 3 caracteres
 * - Deve conter pelo menos um espaço (nome e sobrenome)
 * - Deve conter apenas letras, espaços e acentuação
 */
export function isValidName(name: string): boolean {
  const trimmed = name.trim()

  // Comprimento mínimo
  if (trimmed.length < 3) {
    return false
  }

  // Deve ter pelo menos um espaço (nome completo)
  if (!trimmed.includes(' ')) {
    return false
  }

  // Verifica se tem pelo menos 2 palavras com pelo menos 2 letras cada
  const words = trimmed.split(' ').filter(word => word.length >= 2)
  if (words.length < 2) {
    return false
  }

  // Apenas letras, espaços e acentuação (português)
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/
  if (!nameRegex.test(trimmed)) {
    return false
  }

  return true
}

// Regra única usada pela prévia do checkout e pela validação do servidor.
export const couponCodes = Object.freeze(['BISTRO10', 'VOLTE10'])
export const calculateCoupon = (value, subtotal) => {
  const code = typeof value === 'string' ? value.trim().toUpperCase() : ''
  if (value != null && typeof value !== 'string') throw new Error('Cupom inválido.')
  if (code && !couponCodes.includes(code)) throw new Error('Cupom inválido. Confira o código ou remova para continuar.')
  const discount = code ? Math.round(Math.round(subtotal * 100) * 10 / 100) / 100 : 0
  return { couponCode: code || null, discount }
}

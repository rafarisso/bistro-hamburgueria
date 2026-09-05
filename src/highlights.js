// Um destaque por abertura; re-renderizações do carrinho mantém a oferta.
export const selectHighlight = (menu, storage = globalThis.localStorage, random = Math.random) => {
  const offers = menu.filter(item => item.category === 'Promoções' || item.oldPrice)
  let previous
  try { previous = Number(storage.getItem('bistro:last-highlight:v1')) } catch {}
  const choices = offers.filter(item => item.id !== previous)
  const pool = choices.length ? choices : offers
  const selected = pool[Math.floor(random() * pool.length)]
  try { storage.setItem('bistro:last-highlight:v1', String(selected.id)) } catch {}
  return selected
}

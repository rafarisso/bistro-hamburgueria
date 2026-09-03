export const PRODUCTION = 'https://bistrohamburgueria.com.br'

export const bundleOf = html => html.match(/assets\/index-[A-Za-z0-9_-]+\.js/)?.[0] || null
export const cacheOf = serviceWorker => serviceWorker.match(/const CACHE = '([^']+)'/)?.[1] || null

export const fetchText = async url => {
  const response = await fetch(url, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } })
  if (!response.ok) throw new Error(`${url} respondeu ${response.status}.`)
  return response.text()
}

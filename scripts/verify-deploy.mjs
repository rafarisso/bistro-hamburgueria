import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { PRODUCTION, bundleOf, cacheOf, fetchText } from './release-shared.mjs'

const root = resolve(import.meta.dirname, '..')
const esperado = {
  bundle: bundleOf(await readFile(resolve(root, 'dist/index.html'), 'utf8')),
  cache: cacheOf(await readFile(resolve(root, 'dist/sw.js'), 'utf8')),
}

assert.ok(esperado.bundle, 'O build local nao produziu um bundle identificavel.')
assert.ok(esperado.cache, 'O build local nao produziu uma versao de cache identificavel.')

const espera = ms => new Promise(resolve => setTimeout(resolve, ms))

let publicado = null
for (let tentativa = 1; tentativa <= 6; tentativa++) {
  publicado = bundleOf(await fetchText(`${PRODUCTION}/`))
  if (publicado === esperado.bundle) break
  if (tentativa < 6) await espera(3000)
}

assert.equal(publicado, esperado.bundle, `A producao ainda serve ${publicado} em vez de ${esperado.bundle}. O deploy provavelmente saiu como preview, sem a opcao de producao.`)

const cachePublicado = cacheOf(await fetchText(`${PRODUCTION}/sw.js`))
assert.equal(cachePublicado, esperado.cache, `A producao serve o cache ${cachePublicado} em vez de ${esperado.cache}.`)

const aplicativo = await fetchText(`${PRODUCTION}/${esperado.bundle}`)
assert.match(aplicativo, /rawbt:base64,/, 'O aplicativo publicado nao contem a impressao direta pelo RawBT.')
assert.match(aplicativo, /\[ \]\+\$/, 'O aplicativo publicado nao contem o alinhamento da coluna de precos da comanda.')

const painel = await fetch(`${PRODUCTION}/painel`)
assert.equal(painel.status, 200, `O painel respondeu ${painel.status}.`)

const pedidos = await fetch(`${PRODUCTION}/api/orders`)
assert.equal(pedidos.status, 401, `A api de pedidos respondeu ${pedidos.status} em vez de exigir autenticacao.`)

console.log(`Producao confirmada: ${esperado.bundle}, cache ${esperado.cache}, painel no ar e impressao RawBT presente.`)

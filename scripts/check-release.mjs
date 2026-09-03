import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { PRODUCTION, bundleOf, cacheOf, fetchText } from './release-shared.mjs'

const root = resolve(import.meta.dirname, '..')
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()

const branch = git('rev-parse', '--abbrev-ref', 'HEAD')
assert.equal(branch, 'main', `A producao sai de main, mas voce esta em ${branch}.`)

assert.equal(git('status', '--porcelain'), '', 'Existem alteracoes sem commit. A producao precisa ser identica ao repositorio.')

try { git('fetch', 'origin', 'main', '--quiet') }
catch { throw new Error('Nao foi possivel consultar o GitHub. Confira a internet antes de publicar.') }

const pendentes = git('rev-list', '--count', 'origin/main..HEAD')
assert.equal(pendentes, '0', `Existem ${pendentes} commit(s) sem enviar ao GitHub. Rode git push antes de publicar.`)

const atrasados = git('rev-list', '--count', 'HEAD..origin/main')
assert.equal(atrasados, '0', `O GitHub tem ${atrasados} commit(s) que voce nao possui. Rode git pull antes de publicar.`)

const localHtml = await readFile(resolve(root, 'dist/index.html'), 'utf8')
const localSw = await readFile(resolve(root, 'dist/sw.js'), 'utf8')

const [liveHtml, liveSw] = await Promise.all([fetchText(`${PRODUCTION}/`), fetchText(`${PRODUCTION}/sw.js`)])

if (bundleOf(localHtml) !== bundleOf(liveHtml)) {
  assert.notEqual(cacheOf(localSw), cacheOf(liveSw), `O codigo do aplicativo mudou, mas o cache continua em ${cacheOf(localSw)}. Suba a versao em public/sw.js, senao os celulares seguem com a versao antiga.`)
  console.log(`Publicacao liberada: ${bundleOf(liveHtml)} sai, ${bundleOf(localHtml)} entra, cache ${cacheOf(liveSw)} para ${cacheOf(localSw)}.`)
} else console.log(`Publicacao liberada: o aplicativo ja esta em ${bundleOf(localHtml)}, apenas as funcoes serao renovadas.`)

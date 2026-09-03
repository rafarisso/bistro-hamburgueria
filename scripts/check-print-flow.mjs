import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const admin = await readFile(resolve(root, 'src/admin.js'), 'utf8')
const styles = await readFile(resolve(root, 'src/style.css'), 'utf8')
const filesWithoutDashes = [
  'src/admin.js',
  'src/customer.js',
  'src/state.js',
  'src/style.css',
  'netlify/functions/orders.ts',
  'netlify/functions/_shared/catalog.ts',
]

assert.match(admin, /class="print-button" data-print=/, 'O painel deve oferecer uma única ação clara de impressão.')
assert.doesNotMatch(admin, /afterprint/, 'A comanda não pode ser removida antes de o driver móvel terminar a impressão.')
assert.doesNotMatch(admin, /setTimeout\([\s\S]{0,180}window\.print/, 'A chamada de impressão não pode ser adiada no celular.')
assert.match(admin, /document\.body\.append\(nextSheet\)/, 'A comanda deve ser anexada diretamente ao corpo da página.')

const printingClassIndex = admin.indexOf("document.body.classList.add('printing')")
const printCallIndex = admin.indexOf('window.print()', printingClassIndex)
assert.ok(printingClassIndex >= 0 && printCallIndex > printingClassIndex, 'A comanda precisa estar pronta antes da impressão direta.')

assert.match(styles, /@page \{ size: 58mm auto; margin: 0; \}/, 'A página deve usar o padrão térmico de 58 mm.')
assert.match(styles, /width: 42mm; max-width: 42mm;/, 'A comanda deve usar a largura segura de 42 mm para o driver Bluetooth.')
assert.match(styles, /body\.printing > #app \{ display: none !important; \}/, 'O aplicativo deve ficar oculto durante a impressão da comanda.')

for (const relativePath of filesWithoutDashes) {
  const source = await readFile(resolve(root, relativePath), 'utf8')
  assert.doesNotMatch(source, /[\u2013\u2014]/u, `${relativePath} contém um travessão.`)
}

console.log('Fluxo de impressão térmica validado.')

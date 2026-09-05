import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const state = await readFile(resolve(root, 'src/state.js'), 'utf8')
const customer = await readFile(resolve(root, 'src/customer.js'), 'utf8')
const catalog = await readFile(resolve(root, 'netlify/functions/_shared/catalog.ts'), 'utf8')
const serviceWorker = await readFile(resolve(root, 'public/sw.js'), 'utf8')

const products = [
  { id: 10, name: 'Combo Big Tasty para 3 Pessoas', price: '59.9', image: 'Combo_Big_Tasty_3_Pessoas.jpeg' },
  { id: 11, name: 'Combo Duplo Cheddar e Chelsea', price: '59.9', image: 'Combo_Duplo_Cheddar_Chelsea.jpeg' },
  { id: 12, name: 'Doritos Burger', price: '35.9', image: 'Doritos_Burger.jpeg' },
  { id: 13, name: 'Combo Super 4 Família', price: '119.9', image: 'Combo_Super_4_Familia.jpeg' },
]

for (const product of products) {
  assert.match(state, new RegExp(`id: ${product.id},[\\s\\S]{0,100}name: '${product.name}'[\\s\\S]{0,300}price: ${product.price}`), `${product.name} não está completo no cardápio visual.`)
  assert.match(catalog, new RegExp(`id: ${product.id}, name: '${product.name}', price: ${product.price}`), `${product.name} não está disponível para validação do pedido.`)
  assert.match(serviceWorker, new RegExp(product.image.replace('.', '\\.')), `${product.name} não está no cache do aplicativo.`)
  assert.ok((await stat(resolve(root, 'public', product.image))).size > 50_000, `A imagem de ${product.name} está ausente ou incompleta.`)
}

assert.match(customer, /src="\$\{highlighted\.image\}" alt="\$\{highlighted\.name\}"/, 'A foto principal deve pertencer ao destaque sorteado.')
assert.match(serviceWorker, /const CACHE = 'bistro-v12'/, 'O cache precisa mudar para os celulares receberem o novo destaque e a impressão direta.')

console.log('Cardápio atualizado: quatro novos produtos, preços, fotos e cache validados.')

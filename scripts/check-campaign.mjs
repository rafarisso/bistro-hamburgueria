import assert from 'node:assert/strict'
import { menu } from '../src/state.js'
import { catalog } from '../netlify/functions/_shared/catalog.ts'
import { calculateCoupon } from '../shared/coupons.js'
import { selectHighlight } from '../src/highlights.js'
import { stat, readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { defaultStoreSettings } from '../netlify/functions/_shared/catalog.ts'

for (const id of [14, 16]) {
  const product = menu.find(item => item.id === id)
  assert.equal(product.category, 'Hambúrgueres')
  assert.equal(catalog.find(item => item.id === id).price, product.price)
  assert.equal(catalog.find(item => item.id === product.combo.variantId).price, product.price + 18)
  assert.ok((await stat(new URL(`../public${product.image}`, import.meta.url))).size > 50000)
}
assert.deepEqual(calculateCoupon(' bistro10 ', 34.9), { couponCode: 'BISTRO10', discount: 3.49 })
assert.equal(calculateCoupon('VOLTE10', 62.9).discount, 6.29)
assert.equal(calculateCoupon('', 100).discount, 0)
assert.equal(calculateCoupon(undefined, 100).discount, 0)
for (const code of ['INVALIDO', 'BISTRO10,VOLTE10', {}, ['BISTRO10']]) assert.throws(() => calculateCoupon(code, 100))
assert.equal(Number((52.9 - calculateCoupon('BISTRO10', 52.9).discount + 8).toFixed(2)), 55.61)
let last = null
const storage = { getItem: () => last, setItem: (_, value) => { last = value } }
for (let i = 0; i < 30; i++) {
  const previous = Number(last)
  const selected = selectHighlight(menu, storage, () => (i % 10) / 10)
  assert.notEqual(selected.id, previous)
  assert.ok(selected.category === 'Promoções' || selected.oldPrice)
}
assert.ok(selectHighlight(menu, { getItem() { throw Error() }, setItem() { throw Error() } }))
// Exercita o processamento real do POST sem gravar pedidos ou notificar clientes.
const source = await readFile(new URL('../netlify/functions/orders.ts', import.meta.url), 'utf8')
const js = stripTypeScriptTypes(source.slice(0, source.indexOf('const trackOrder ='))).replace(/^import [^\r\n]*\r?\n/gm, '')
const saved = []
const getStore = ({ name }) => ({ get: async () => null, setJSON: async (key, value) => { if (name === 'bistro-orders') saved.push(value) } })
const createOrder = new Function('getStore', 'catalog', 'defaultStoreSettings', 'isWithinOpeningHours', 'calculateCoupon', 'clean', 'currency', 'digits', 'json', 'Netlify', `${js}; return createOrder`)(
  getStore, catalog, defaultStoreSettings, () => true, calculateCoupon,
  value => String(value || ''), value => String(value), value => String(value).replace(/\D/g, ''),
  (body, status = 200) => new Response(JSON.stringify(body), { status }), { env: { get: () => '' } },
)
const post = async (couponCode, method = 'cash') => createOrder(new Request('http://localhost/api/orders', { method: 'POST', body: JSON.stringify({
  customer: { name: 'Teste local', phone: '11999999999' }, fulfillment: 'pickup',
  items: [{ id: 15, quantity: 2, price: 0.01 }], couponCode, discount: 999, total: 0,
  payment: { method, noChange: false, cashAmount: 100 },
}) }), { ip: 'local-test', waitUntil() {} })
for (const code of ['BISTRO10', 'VOLTE10']) {
  const result = await post(code)
  assert.equal(result.status, 201)
  const { order, whatsappUrl } = await result.json()
  assert.equal(order.subtotal, 105.8)
  assert.equal(order.discount, 10.58)
  assert.equal(order.total, 95.22)
  assert.equal(order.payment.change, 4.78)
  assert.ok(decodeURIComponent(whatsappUrl).includes(`Cupom ${code}`))
}
assert.equal((await post('INVALIDO')).status, 400)
assert.equal(saved.length, 2)
assert.equal((await post('', 'credit')).status, 201)
assert.equal(saved[2].total, 105.8)
console.log('Campanha validada: catálogo, combos, POST real isolado, adulteração de preços, descontos, troco e rotação.')

import type { Config, Context } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import webpush from 'web-push'
import { verifyAdmin } from './_shared/auth.ts'
import { catalog, defaultStoreSettings, isWithinOpeningHours, openingHours } from './_shared/catalog.ts'
import { clean, currency, digits, json } from './_shared/http.ts'

import { calculateCoupon } from '../../shared/coupons.js'

const orderStore = () => getStore({ name: 'bistro-orders', consistency: 'strong' })
const settingsStore = () => getStore({ name: 'bistro-settings', consistency: 'strong' })
const pushStore = () => getStore({ name: 'bistro-push', consistency: 'strong' })
const customerPushStore = () => getStore({ name: 'bistro-customer-push', consistency: 'strong' })
const rateStore = () => getStore({ name: 'bistro-ratelimit', consistency: 'strong' })

const getSettings = async () => ({ ...defaultStoreSettings, ...((await settingsStore().get('store', { type: 'json' })) as Record<string, unknown> || {}) })

const rateLimited = async (ip: string) => {
  const key = `ip/${ip.replace(/[^a-zA-Z0-9:._-]/g, '')}`
  const current = (await rateStore().get(key, { type: 'json' }) as { count: number, since: number } | null) || { count: 0, since: Date.now() }
  if (Date.now() - current.since > 10 * 60 * 1000) { current.count = 0; current.since = Date.now() }
  current.count += 1
  await rateStore().setJSON(key, current)
  return current.count > 5
}

const makeNumber = () => `${new Date().toISOString().slice(5, 10).replace('-', '')}${Date.now().toString(36).slice(-4).toUpperCase()}`

const findOrder = async (id: string) => {
  const { blobs } = await orderStore().list({ prefix: 'orders/' })
  const blob = blobs.find(item => item.key.includes(id))
  if (!blob) return null
  const order = await orderStore().get(blob.key, { type: 'json' }) as any
  return order ? { blob, order } : null
}

const deliveryUpdateMessage = (order: any) => `🛵 *SEU PEDIDO SAIU PARA ENTREGA!*

Oi, *${order.customer.name}*! O pedido *#${order.number}* acabou de sair da Bistrô e já está a caminho. 🍔💨

Muito obrigado pela preferência e pela confiança! 💛

👀 Por favor, fique atento ao entregador e, se possível, aguarde o contato ou fique próximo ao local de entrega. Assim ajudamos a agilizar a entrega e seu pedido chega ainda mais quentinho.

Bom apetite! 😋
*Bistrô Hamburgueria*`

const customerWhatsappUrl = (order: any) => `https://wa.me/55${digits(order.customer.phone).replace(/^55/, '')}?text=${encodeURIComponent(deliveryUpdateMessage(order))}`

const formatWhatsApp = (order: any, settings: any) => {
  const address = order.fulfillment === 'delivery'
    ? `📍 *ENTREGA*\n${order.address.street}, ${order.address.number}${order.address.complement ? ` - ${order.address.complement}` : ''}\n${order.address.neighborhood} · CEP ${order.address.cep}${order.address.reference ? `\nRef.: ${order.address.reference}` : ''}`
    : `🏪 *RETIRADA NO BALCÃO*\n${settings.address}`
  const items = order.items.map((item: any) => `• *${item.quantity}x ${item.name}* | ${currency(item.total)}${item.note ? `\n  ↳ _Obs.: ${item.note}_` : ''}`).join('\n')
  const payment: Record<string, string> = {
    pix: `⚡ *PIX*\n🔑 Chave: ${settings.pixKey}\n⚠️ _Aguardando envio do comprovante_`,
    cash: `💵 *DINHEIRO*\n${order.payment.noChange ? 'Sem necessidade de troco' : `Pagará com: ${currency(order.payment.cashAmount)}\nTroco: ${currency(order.payment.change)}`}`,
    debit: '💳 *CARTÃO DE DÉBITO*\nMotoboy levará a maquininha',
    credit: '💳 *CARTÃO DE CRÉDITO*\nMotoboy levará a maquininha',
  }
  return `🍔 *NOVO PEDIDO · BISTRÔ BURGER*\n━━━━━━━━━━\n🧾 *PEDIDO #${order.number}*\n🕐 ${new Date(order.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}\n\n👤 *CLIENTE*\n${order.customer.name}\n📱 ${order.customer.phone}\n\n${address}\n\n🛒 *ITENS*\n${items}${order.orderNote ? `\n\n💬 *OBS. GERAL*\n${order.orderNote}` : ''}\n\n💰 *VALORES*\nSubtotal: ${currency(order.subtotal)}\n${order.discount ? `Cupom ${order.couponCode}: -${currency(order.discount)}\n` : ''}${order.deliveryFee ? `Entrega: ${currency(order.deliveryFee)}\n` : ''}*TOTAL: ${currency(order.total)}*\n\n${payment[order.payment.method]}\n\n✅ _Confirme o recebimento deste pedido, por favor._`
}

const notifyAdmins = async (order: any) => {
  const publicKey = Netlify.env.get('VAPID_PUBLIC_KEY') || ''
  const privateKey = Netlify.env.get('VAPID_PRIVATE_KEY') || ''
  if (!publicKey || !privateKey) return
  webpush.setVapidDetails('mailto:pedidos@bistrohamburgueria.com.br', publicKey, privateKey)
  const { blobs } = await pushStore().list({ prefix: 'subscription/' })
  await Promise.all(blobs.map(async blob => {
    const subscription = await pushStore().get(blob.key, { type: 'json' }) as any
    if (!subscription) return
    try { await webpush.sendNotification(subscription, JSON.stringify({ title: 'Novo pedido na Bistrô! 🍔', body: `Pedido #${order.number} · ${order.customer.name} · ${currency(order.total)}`, tag: order.id, url: '/painel' })) }
    catch (error: any) { if ([404, 410].includes(error?.statusCode)) await pushStore().delete(blob.key) }
  }))
}

const notifyCustomer = async (order: any) => {
  const publicKey = Netlify.env.get('VAPID_PUBLIC_KEY') || ''
  const privateKey = Netlify.env.get('VAPID_PRIVATE_KEY') || ''
  if (!publicKey || !privateKey) return
  webpush.setVapidDetails('mailto:pedidos@bistrohamburgueria.com.br', publicKey, privateKey)
  const { blobs } = await customerPushStore().list({ prefix: `order/${order.id}/` })
  await Promise.all(blobs.map(async blob => {
    const subscription = await customerPushStore().get(blob.key, { type: 'json' }) as any
    if (!subscription) return
    try {
      await webpush.sendNotification(subscription, JSON.stringify({
        type: 'ORDER_UPDATE', title: 'Seu pedido saiu para entrega! 🛵',
        body: `Pedido #${order.number} a caminho. Fique atento ao entregador para receber seu lanche quentinho!`,
        tag: `delivery-${order.id}`, url: `/?pedido=${order.id}`, orderId: order.id, status: order.status,
      }))
    } catch (error: any) { if ([404, 410].includes(error?.statusCode)) await customerPushStore().delete(blob.key) }
  }))
}

const createOrder = async (request: Request, context: Context) => {
  if (await rateLimited(context.ip || 'unknown')) return json({ message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }, 429)
  const input = await request.json().catch(() => null)
  if (!input || input.website) return json({ message: 'Pedido inválido.' }, 400)
  const settings: any = await getSettings()
  if (!settings.open || !isWithinOpeningHours()) return json({ message: `A hamburgueria está fechada. Pedidos: ${openingHours.toLowerCase()}.` }, 409)
  const customer = { name: clean(input.customer?.name, 80), phone: clean(input.customer?.phone, 25) }
  if (customer.name.length < 2 || digits(customer.phone).length < 10) return json({ message: 'Informe nome e WhatsApp válidos.' }, 400)
  const fulfillment = input.fulfillment === 'pickup' ? 'pickup' : 'delivery'
  const address = fulfillment === 'delivery' ? {
    cep: clean(input.address?.cep, 10), neighborhood: clean(input.address?.neighborhood, 80), street: clean(input.address?.street, 120),
    number: clean(input.address?.number, 15), complement: clean(input.address?.complement, 80), reference: clean(input.address?.reference, 120),
  } : {}
  if (fulfillment === 'delivery' && (!address.cep || !address.neighborhood || !address.street || !address.number)) return json({ message: 'Preencha o endereço completo.' }, 400)
  const requestedItems = Array.isArray(input.items) ? input.items.slice(0, 30) : []
  const items = requestedItems.map((requested: any) => {
    const product = catalog.find(item => item.id === Number(requested.id))
    const quantity = Math.min(20, Math.max(1, Math.floor(Number(requested.quantity) || 1)))
    return product ? { ...product, quantity, note: clean(requested.note, 140), total: Number((product.price * quantity).toFixed(2)) } : null
  }).filter(Boolean)
  if (!items.length) return json({ message: 'O carrinho está vazio.' }, 400)
  const subtotal = Number(items.reduce((sum: number, item: any) => sum + item.total, 0).toFixed(2))
  if (subtotal < Number(settings.minimumOrder)) return json({ message: `O pedido mínimo é ${currency(Number(settings.minimumOrder))}.` }, 400)
  const deliveryFee = fulfillment === 'delivery' ? Number(settings.deliveryFee) : 0
  let coupon
  try { coupon = calculateCoupon(input.couponCode, subtotal) }
  catch (error: any) { return json({ message: error.message }, 400) }
  const { couponCode, discount } = coupon
  const total = Number((subtotal - discount + deliveryFee).toFixed(2))
  const method = ['pix', 'cash', 'debit', 'credit'].includes(input.payment?.method) ? input.payment.method : ''
  if (!method || (method === 'pix' && !settings.pixKey)) return json({ message: 'Escolha uma forma de pagamento válida.' }, 400)
  const noChange = Boolean(input.payment?.noChange)
  const cashAmount = method === 'cash' && !noChange ? Number(input.payment?.cashAmount) : null
  if (method === 'cash' && !noChange && (!cashAmount || cashAmount < total)) return json({ message: 'O valor em dinheiro precisa cobrir o total.' }, 400)
  const payment = { method, noChange, cashAmount, change: method === 'cash' && !noChange ? Number((cashAmount - total).toFixed(2)) : 0 }
  const now = new Date().toISOString(); const number = makeNumber(); const id = crypto.randomUUID(); const trackingToken = crypto.randomUUID().replace(/-/g, '')
  const order = { id, number, trackingToken, createdAt: now, updatedAt: now, status: 'new', customer, fulfillment, address, items, orderNote: clean(input.orderNote, 200), subtotal, couponCode, discount, deliveryFee, total, payment }
  await orderStore().setJSON(`orders/${now}_${id}.json`, order)
  context.waitUntil(notifyAdmins(order))
  const message = formatWhatsApp(order, settings)
  const { trackingToken: _privateTrackingToken, ...clientOrder } = order
  return json({ order: clientOrder, trackingToken, whatsappUrl: `https://wa.me/${digits(settings.whatsapp)}?text=${encodeURIComponent(message)}` }, 201)
}

const trackOrder = async (request: Request, id: string) => {
  const trackingToken = new URL(request.url).searchParams.get('tracking') || ''
  const found = await findOrder(id)
  if (!found || !trackingToken || found.order.trackingToken !== trackingToken) return json({ message: 'Pedido não encontrado.' }, 404)
  const { order } = found
  return json({ order: { id: order.id, number: order.number, status: order.status, fulfillment: order.fulfillment, createdAt: order.createdAt, updatedAt: order.updatedAt } })
}

const listOrders = async (request: Request) => {
  if (!await verifyAdmin(request)) return json({ message: 'Não autorizado.' }, 401)
  const { blobs } = await orderStore().list({ prefix: 'orders/' })
  const recent = blobs.sort((a, b) => b.key.localeCompare(a.key)).slice(0, 150)
  const orders = (await Promise.all(recent.map(blob => orderStore().get(blob.key, { type: 'json' })))).filter(Boolean)
  return json({ orders, settings: await getSettings() })
}

const updateOrder = async (request: Request, context: Context, id: string) => {
  if (!await verifyAdmin(request)) return json({ message: 'Não autorizado.' }, 401)
  const { status } = await request.json().catch(() => ({}))
  if (!['new', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled'].includes(status)) return json({ message: 'Status inválido.' }, 400)
  const found = await findOrder(id)
  if (!found) return json({ message: 'Pedido não encontrado.' }, 404)
  const { blob, order } = found
  const previousStatus = order.status
  if (status === 'out_for_delivery' && order.fulfillment !== 'delivery') return json({ message: 'Somente pedidos para entrega podem sair com o motoboy.' }, 400)
  order.status = status; order.updatedAt = new Date().toISOString()
  await orderStore().setJSON(blob.key, order)
  if (status === 'out_for_delivery' && previousStatus !== status) context.waitUntil(notifyCustomer(order))
  return json({ order, customerWhatsappUrl: status === 'out_for_delivery' ? customerWhatsappUrl(order) : null })
}

export default async (request: Request, context: Context) => {
  if (request.method === 'POST' && !context.params.id) return createOrder(request, context)
  if (request.method === 'GET' && !context.params.id) return listOrders(request)
  if (request.method === 'GET' && context.params.id) return trackOrder(request, context.params.id)
  if (request.method === 'PATCH' && context.params.id) return updateOrder(request, context, context.params.id)
  return json({ message: 'Método não permitido.' }, 405)
}

export const config: Config = { path: ['/api/orders', '/api/orders/:id'] }

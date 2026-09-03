import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import { clean, json } from './_shared/http.ts'

const orderStore = () => getStore({ name: 'bistro-orders', consistency: 'strong' })
const customerPushStore = () => getStore({ name: 'bistro-customer-push', consistency: 'strong' })

const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))).map(byte => byte.toString(16).padStart(2, '0')).join('')

export default async (request: Request) => {
  if (request.method !== 'POST') return json({ message: 'Método não permitido.' }, 405)
  const input = await request.json().catch(() => null)
  const orderId = clean(input?.orderId, 80)
  const trackingToken = clean(input?.trackingToken, 80)
  const subscription = input?.subscription
  if (!orderId || !trackingToken || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) return json({ message: 'Inscrição inválida.' }, 400)
  const { blobs } = await orderStore().list({ prefix: 'orders/' })
  const blob = blobs.find(item => item.key.includes(orderId))
  const order = blob ? await orderStore().get(blob.key, { type: 'json' }) as any : null
  if (!order || order.trackingToken !== trackingToken) return json({ message: 'Pedido não encontrado.' }, 404)
  const key = `order/${orderId}/${await hash(subscription.endpoint)}.json`
  await customerPushStore().setJSON(key, subscription)
  return json({ ok: true }, 201)
}

export const config: Config = { path: '/api/customer-push-subscriptions' }

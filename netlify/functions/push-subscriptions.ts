import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import { verifyAdmin } from './_shared/auth.ts'
import { json } from './_shared/http.ts'

const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))).map(byte => byte.toString(16).padStart(2, '0')).join('')

export default async (request: Request) => {
  if (!await verifyAdmin(request)) return json({ message: 'Não autorizado.' }, 401)
  if (request.method !== 'POST') return json({ message: 'Método não permitido.' }, 405)
  const subscription = await request.json().catch(() => null)
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) return json({ message: 'Inscrição inválida.' }, 400)
  const key = `subscription/${await hash(subscription.endpoint)}.json`
  await getStore({ name: 'bistro-push', consistency: 'strong' }).setJSON(key, subscription)
  return json({ ok: true }, 201)
}

export const config: Config = { path: '/api/push-subscriptions' }

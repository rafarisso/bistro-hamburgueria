import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import { verifyAdmin } from './_shared/auth.ts'
import { defaultStoreSettings, isWithinOpeningHours, openingHours } from './_shared/catalog.ts'
import { clean, digits, json } from './_shared/http.ts'

const settingsStore = () => getStore({ name: 'bistro-settings', consistency: 'strong' })
const getSettings = async () => ({ ...defaultStoreSettings, ...((await settingsStore().get('store', { type: 'json' })) as Record<string, unknown> || {}) })

export default async (request: Request) => {
  if (request.method === 'GET') {
    const settings = await getSettings()
    return json({ ...settings, acceptingOrders: Boolean(settings.open) && isWithinOpeningHours(), openingHours, vapidPublicKey: Netlify.env.get('VAPID_PUBLIC_KEY') || '' })
  }
  if (request.method !== 'PUT') return json({ message: 'Método não permitido.' }, 405)
  if (!await verifyAdmin(request)) return json({ message: 'Não autorizado.' }, 401)
  const input = await request.json().catch(() => ({}))
  const settings = {
    name: 'Bistrô Hamburgueria', whatsapp: digits(input.whatsapp).slice(0, 15), deliveryFee: Math.max(0, Number(input.deliveryFee) || 0),
    deliveryTime: clean(input.deliveryTime, 30), minimumOrder: Math.max(0, Number(input.minimumOrder) || 0),
    pixKey: clean(input.pixKey, 100), pixName: clean(input.pixName, 80), address: clean(input.address, 160),
    city: clean(input.city, 80), open: Boolean(input.open),
  }
  if (settings.whatsapp.length < 12 || !settings.pixKey || !settings.address) return json({ message: 'Preencha WhatsApp, chave Pix e endereço corretamente.' }, 400)
  await settingsStore().setJSON('store', settings)
  return json(settings)
}

export const config: Config = { path: '/api/settings' }

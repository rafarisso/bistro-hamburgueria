import type { Config } from '@netlify/functions'
import { createAdminToken, sameSecret } from './_shared/auth.ts'
import { json } from './_shared/http.ts'

export default async (request: Request) => {
  if (request.method !== 'POST') return json({ message: 'Método não permitido.' }, 405)
  const configuredPin = Netlify.env.get('ADMIN_PIN') || ''
  const secret = Netlify.env.get('ADMIN_SECRET') || ''
  if (!configuredPin || !secret) return json({ message: 'O acesso administrativo ainda não foi configurado.' }, 503)
  const { pin = '' } = await request.json().catch(() => ({}))
  if (!await sameSecret(String(pin), configuredPin)) return json({ message: 'PIN incorreto.' }, 401)
  return json({ token: await createAdminToken() })
}

export const config: Config = { path: '/api/admin-login' }

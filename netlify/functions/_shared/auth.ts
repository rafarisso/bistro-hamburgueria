const encoder = new TextEncoder()

const base64url = (value: Uint8Array | string) => {
  const bytes = typeof value === 'string' ? encoder.encode(value) : value
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const sign = async (payload: string) => {
  const secret = Netlify.env.get('ADMIN_SECRET') || ''
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return base64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(payload))))
}

export const createAdminToken = async () => {
  const payload = base64url(JSON.stringify({ role: 'admin', exp: Date.now() + 12 * 60 * 60 * 1000 }))
  return `${payload}.${await sign(payload)}`
}

export const verifyAdmin = async (request: Request) => {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || ''
  const [payload, signature] = token.split('.')
  if (!payload || !signature || signature !== await sign(payload)) return false
  try {
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return json.role === 'admin' && Number(json.exp) > Date.now()
  } catch { return false }
}

export const sameSecret = async (received: string, expected: string) => {
  const digest = async (value: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)))
  const [a, b] = await Promise.all([digest(received), digest(expected)])
  return a.length === b.length && a.every((byte, index) => byte === b[index])
}

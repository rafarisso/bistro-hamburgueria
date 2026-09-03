export const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
})

export const clean = (value: unknown, max = 200) => String(value ?? '').trim().slice(0, max)
export const digits = (value: unknown) => String(value ?? '').replace(/\D/g, '')
export const currency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

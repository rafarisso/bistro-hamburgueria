export const catalog = [
  { id: 16, name: 'Bistrô à Moda do Chef', price: 44.9 },
  { id: 17, name: 'Bistrô à Moda do Chef + Combo', price: 62.9 },
  { id: 14, name: 'Cheese Salada Duplo Bacon', price: 34.9 },
  { id: 15, name: 'Cheese Salada Duplo Bacon + Combo', price: 52.9 },
  { id: 1, name: 'Cheese Salada', price: 28 },
  { id: 2, name: 'Duplo Cheddar Bacon', price: 34 },
  { id: 3, name: 'Combo Bistrô', price: 42 },
  { id: 4, name: 'Combo Barão Vermelho', price: 64.9 },
  { id: 5, name: 'Penélope Charmosa', price: 34.9 },
  { id: 6, name: 'Abacaxi ao Mel', price: 30 },
  { id: 7, name: 'Abacaxi ao Mel + Combo', price: 48 },
  { id: 8, name: 'Cheese Tudo', price: 40 },
  { id: 9, name: 'Cheese Tudo + Combo', price: 58 },
  { id: 10, name: 'Combo Big Tasty para 3 Pessoas', price: 59.9 },
  { id: 11, name: 'Combo Duplo Cheddar e Chelsea', price: 59.9 },
  { id: 12, name: 'Doritos Burger', price: 35.9 },
  { id: 13, name: 'Combo Super 4 Família', price: 119.9 },
]

export const defaultStoreSettings = {
  name: 'Bistrô Hamburgueria', whatsapp: '5511972700004', deliveryFee: 8, deliveryTime: '35 a 50 min',
  minimumOrder: 20, pixKey: '', pixName: 'Bruno Barbosa', address: 'Av. Jaceguava, 330 - Balneário São José',
  city: 'São Paulo · SP', open: true,
}

export const openingHours = 'Das 18:00 às 23:59 · quarta a domingo'

export const isWithinOpeningHours = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  const minutes = Number(values.hour) * 60 + Number(values.minute)
  return ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'].includes(values.weekday) && minutes >= 18 * 60 && minutes <= 23 * 60 + 59
}

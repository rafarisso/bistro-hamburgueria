const CART_KEY = 'bistro:cart:v3'
const PROFILE_KEY = 'bistro:customer:v1'
const ONBOARDING_KEY = 'bistro:onboarding:v1'
const TRACKING_KEY = 'bistro:active-order:v1'

export const defaultSettings = {
  name: 'Bistrô Hamburgueria',
  whatsapp: '5511972700004',
  deliveryFee: 8,
  deliveryTime: '35 a 50 min',
  minimumOrder: 20,
  pixKey: '',
  pixName: 'Bruno Barbosa',
  address: 'Av. Jaceguava, 330 - Balneário São José',
  city: 'São Paulo · SP',
  open: true,
}

export const OPENING_HOURS = 'Das 18:00 às 23:59 · quarta a domingo'

export const isWithinOpeningHours = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  const minutes = Number(values.hour) * 60 + Number(values.minute)
  return ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'].includes(values.weekday) && minutes >= 18 * 60 && minutes <= 23 * 60 + 59
}

export const menu = [
  {
    id: 5,
    name: 'Penélope Charmosa',
    category: 'Promoções',
    description: 'O burger de destaque da casa: alto, suculento e carregado de queijo. Uma experiência para quem veio com fome.',
    price: 34.9,
    image: '/Destaque.jpeg',
    tag: 'Destaque',
    serves: 'Serve 1 pessoa',
  },
  {
    id: 4,
    name: 'Combo Barão Vermelho',
    category: 'Promoções',
    description: 'Barão Vermelho Salada, Burger Bacon, batata frita, cebola empanada, mix de doces e molho da casa.',
    price: 64.9,
    image: '/Promocao_Barao_Vermelho.jpeg',
    tag: 'Oferta completa',
    serves: 'Ideal para compartilhar',
  },
  {
    id: 10,
    name: 'Combo Big Tasty para 3 Pessoas',
    category: 'Combos',
    description: 'Big Tasty Original, Big Tasty Bacon e Big Tasty Duplo, com fritas, molho, Guaraná Antarctica 600 ml e carnes artesanais.',
    price: 59.9,
    oldPrice: 74.9,
    image: '/Combo_Big_Tasty_3_Pessoas.jpeg',
    tag: 'Promoção imperdível',
    serves: 'Serve até 3 pessoas',
  },
  {
    id: 11,
    name: 'Combo Duplo Cheddar e Chelsea',
    category: 'Combos',
    description: 'Duplo Cheddar Bacon com duas carnes de 80 g, Chelsea Salada com carne de 80 g, batata média de 300 g e Guaraná Antarctica 600 ml, no pão brioche.',
    price: 59.9,
    image: '/Combo_Duplo_Cheddar_Chelsea.jpeg',
    tag: 'Combo no brioche',
    serves: 'Serve 2 pessoas',
  },
  {
    id: 12,
    name: 'Doritos Burger',
    category: 'Hambúrgueres',
    description: 'Hambúrguer artesanal com queijo, bacon e a crocância marcante de Doritos.',
    price: 35.9,
    image: '/Doritos_Burger.jpeg',
    tag: 'Novidade na casa',
    serves: 'Serve 1 pessoa',
  },
  {
    id: 13,
    name: 'Combo Super 4 Família',
    category: 'Combos',
    description: 'Quatro burgers gourmet, quatro porções de fritas e Coca-Cola de 1,5 litro.',
    price: 119.9,
    image: '/Combo_Super_4_Familia.jpeg',
    tag: 'Combo família',
    serves: 'Serve até 4 pessoas',
  },
  {
    id: 1,
    name: 'Cheese Salada',
    category: 'Hambúrgueres',
    description: 'Blend artesanal, queijo derretido, alface crocante, tomate, cebola roxa e molho especial da casa.',
    price: 28,
    image: '/Cheese_Salada.jpeg',
    tag: 'Clássico da casa',
    serves: 'Serve 1 pessoa',
  },
  {
    id: 2,
    name: 'Duplo Cheddar Bacon',
    category: 'Hambúrgueres',
    description: 'Dois blends artesanais, cheddar cremoso, bacon crocante e maionese defumada no pão brioche.',
    price: 34,
    oldPrice: 38,
    image: '/Duplo_Cheddar_Bacon.jpeg',
    tag: 'Mais pedido',
    serves: 'Serve 1 pessoa',
  },
  {
    id: 6,
    name: 'Abacaxi ao Mel',
    category: 'Hambúrgueres',
    description: 'Hambúrguer artesanal com queijo derretido e abacaxi grelhado ao mel. Combo com batata e refri 200 ml por + R$ 18.',
    price: 30,
    image: '/Abacaxi_ao_mel.jpeg',
    tag: 'Novidade',
    serves: 'Serve 1 pessoa',
    combo: { variantId: 7, price: 18, label: 'Batata frita + refrigerante 200 ml' },
  },
  {
    id: 8,
    name: 'Cheese Tudo',
    category: 'Hambúrgueres',
    description: 'Carne, queijo, ovo, bacon, alface, cebola roxa, tomate e molho da casa. Combo com batata e refri 200 ml por + R$ 18.',
    price: 40,
    image: '/Combo_Cheese_Tudo.jfif',
    tag: 'Completo',
    serves: 'Serve 1 pessoa',
    combo: { variantId: 9, price: 18, label: 'Batata frita + refrigerante 200 ml' },
  },
  {
    id: 3,
    name: 'Combo Bistrô',
    category: 'Combos',
    description: 'Cheese Salada, batata frita sequinha e refrigerante gelado. A escolha completa para matar a fome.',
    price: 42,
    oldPrice: 47,
    image: '/Combo.jpeg',
    tag: 'Bom custo-benefício',
    serves: 'Serve 1 pessoa',
  },
]

export const categories = [
  { name: 'Todos', icon: '🍽️' },
  { name: 'Promoções', icon: '🔥' },
  { name: 'Hambúrgueres', icon: '🍔' },
  { name: 'Combos', icon: '🍟' },
]

export const money = value => new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL',
}).format(Number(value) || 0)

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* armazenamento indisponível */ }
}

export const loadCart = () => read(CART_KEY, [])
export const saveCart = cart => write(CART_KEY, cart)
export const loadProfile = () => read(PROFILE_KEY, { name: '', phone: '', address: {} })
export const saveProfile = profile => write(PROFILE_KEY, profile)
export const onboardingSeen = () => read(ONBOARDING_KEY, false)
export const markOnboardingSeen = () => write(ONBOARDING_KEY, true)
export const loadTracking = () => read(TRACKING_KEY, null)
export const saveTracking = tracking => write(TRACKING_KEY, tracking)
export const clearTracking = () => {
  try { localStorage.removeItem(TRACKING_KEY) } catch { /* armazenamento indisponível */ }
}

export const digits = value => String(value || '').replace(/\D/g, '')
export const maskPhone = value => {
  const number = digits(value).slice(0, 11)
  if (number.length <= 2) return number ? `(${number}` : ''
  if (number.length <= 6) return `(${number.slice(0, 2)}) ${number.slice(2)}`
  if (number.length <= 10) return `(${number.slice(0, 2)}) ${number.slice(2, 6)}-${number.slice(6)}`
  return `(${number.slice(0, 2)}) ${number.slice(2, 7)}-${number.slice(7)}`
}

export const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
})[char])

export const formatDateTime = iso => new Date(iso).toLocaleString('pt-BR', {
  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
})

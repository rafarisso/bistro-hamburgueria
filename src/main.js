import './style.css'
import { initAdmin } from './admin.js'
import { initCustomerApp } from './customer.js'

const adminRoute = window.location.pathname.startsWith('/painel')

document.title = adminRoute ? 'Bistrô Burger | Painel de pedidos' : 'Bistrô Burger | Cardápio e pedidos'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}

if (adminRoute) initAdmin()
else initCustomerApp()

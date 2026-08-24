import './style.css'

const menu = [
  { id: 1, name: 'Cheese Salada', description: 'Blend da casa, queijo, alface, tomate e molho especial.', price: 28, image: '/Cheese_Salada.jpeg', tag: 'Clássico' },
  { id: 2, name: 'Duplo Cheddar Bacon', description: 'Dois burgers, cheddar cremoso, bacon crocante e cebola.', price: 34, image: '/Duplo_Cheddar_Bacon.jpeg', tag: 'Mais pedido' },
  { id: 3, name: 'Combo Bistrô', description: 'Hambúrguer da casa, batata rústica e refrigerante.', price: 42, image: '/Combo.jpeg', tag: 'Combo' },
]

let cart = []
let orders = [
  { number: '#104', customer: 'Balcão', items: '2x Duplo Cheddar Bacon', total: 68, status: 'Em preparo', time: 'agora' },
  { number: '#103', customer: 'Marimba Bruno', items: '1x Combo Bistrô, 1x Cheese Salada', total: 70, status: 'Pronto', time: 'há 8 min' },
]

const money = value => `R$ ${value.toFixed(2).replace('.', ',')}`
const render = () => {
  const items = cart.map(item => `<div class="cart-item"><div><strong>${item.name}</strong><span>${item.quantity} x ${money(item.price)}</span></div><button class="qty" data-decrease="${item.id}">−</button><b>${item.quantity}</b><button class="qty" data-increase="${item.id}">+</button></div>`).join('')
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  document.querySelector('#app').innerHTML = `
    <header class="topbar"><div class="brand"><span class="brand-mark">B</span><div><strong>Bistrô</strong><small>HAMBURGUERIA</small></div></div><div class="top-actions"><span class="open"><i></i> Loja aberta</span><button class="icon-btn" aria-label="Notificações">♢<em>2</em></button><div class="avatar">BR</div></div></header>
    <main><section class="workspace"><div class="page-heading"><div><p class="eyebrow">SEGUNDA, 24 DE AGOSTO</p><h1>Boa noite, Bruno <span>✦</span></h1><p class="muted">Monte seu pedido e mande direto para a chapa.</p></div><div class="date-chip">◷ <span>19:42</span></div></div>
      <nav class="tabs"><button class="active" data-tab="menu">Novo pedido <b>+</b></button><button data-tab="orders">Pedidos <b>${orders.length}</b></button></nav>
      <div id="menu-view"><div class="section-title"><h2>Cardápio</h2><div class="filters"><button class="filter active">Todos</button><button class="filter">Hambúrgueres</button><button class="filter">Combos</button></div></div><div class="product-grid">${menu.map(product => `<article class="product"><div class="photo-wrap"><img src="${product.image}" alt="${product.name}"><span>${product.tag}</span></div><div class="product-body"><h3>${product.name}</h3><p>${product.description}</p><div class="product-footer"><strong>${money(product.price)}</strong><button class="add" data-add="${product.id}">Adicionar <b>+</b></button></div></div></article>`).join('')}</div></div>
      <div id="orders-view" class="hidden"><div class="section-title"><h2>Acompanhar pedidos</h2><span class="muted">${orders.length} pedidos hoje</span></div><div class="order-list">${orders.map(order => `<article class="order-row"><div class="order-number">${order.number}<small>${order.time}</small></div><div class="order-info"><strong>${order.customer}</strong><span>${order.items}</span></div><div class="order-total">${money(order.total)}</div><span class="status ${order.status === 'Pronto' ? 'ready' : ''}">${order.status}</span><button class="print" data-print="${order.number}" title="Imprimir pedido">▣</button></article>`).join('')}</div></div>
    </section><aside class="cart-panel"><div class="cart-header"><div><p class="eyebrow">COMANDA ATUAL</p><h2>Pedido #105</h2></div><span class="counter">${cart.reduce((sum, item) => sum + item.quantity, 0)} itens</span></div><div class="cart-content">${items || '<div class="empty"><div>＋</div><strong>Seu pedido está vazio</strong><span>Escolha um item do cardápio<br>para começar uma nova comanda.</span></div>'}</div><div class="cart-bottom"><div class="note">＋ <input placeholder="Adicionar observação..." /></div><div class="summary"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div class="summary total"><span>Total</span><strong>${money(subtotal)}</strong></div><button class="send-order" ${cart.length ? '' : 'disabled'}>Enviar para a cozinha <span>→</span></button><p class="print-hint">⌁ Impressora térmica conectada</p></div></aside></main><footer>Desenvolvido por RR Solutions <a href="tel:+5511910950468">(11) 91095-0468</a></footer><div id="toast" class="toast"></div>`
  bindEvents()
}

const bindEvents = () => {
  document.querySelectorAll('[data-add]').forEach(button => button.onclick = () => { const product = menu.find(item => item.id === Number(button.dataset.add)); const existing = cart.find(item => item.id === product.id); existing ? existing.quantity++ : cart.push({ ...product, quantity: 1 }); render() })
  document.querySelectorAll('[data-increase]').forEach(button => button.onclick = () => { cart.find(item => item.id === Number(button.dataset.increase)).quantity++; render() })
  document.querySelectorAll('[data-decrease]').forEach(button => button.onclick = () => { const item = cart.find(item => item.id === Number(button.dataset.decrease)); item.quantity--; cart = cart.filter(entry => entry.quantity > 0); render() })
  document.querySelectorAll('[data-tab]').forEach(button => button.onclick = () => { document.querySelectorAll('[data-tab]').forEach(tab => tab.classList.remove('active')); button.classList.add('active'); document.querySelector('#menu-view').classList.toggle('hidden', button.dataset.tab !== 'menu'); document.querySelector('#orders-view').classList.toggle('hidden', button.dataset.tab !== 'orders') })
  document.querySelector('.send-order')?.addEventListener('click', () => { if (!cart.length) return; const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); orders.unshift({ number: '#105', customer: 'Balcão', items: cart.map(item => `${item.quantity}x ${item.name}`).join(', '), total: subtotal, status: 'Em preparo', time: 'agora' }); cart = []; render(); document.querySelector('[data-tab="orders"]').click(); showToast('Pedido enviado para a cozinha') })
  document.querySelectorAll('[data-print]').forEach(button => button.onclick = () => { showToast(`Comanda ${button.dataset.print} enviada para impressão`); window.print() })
}
const showToast = message => { const toast = document.querySelector('#toast'); if (!toast) return; toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2600) }
render()

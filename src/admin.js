import { defaultSettings, escapeHtml, formatDateTime, money } from './state.js'

const TOKEN_KEY = 'bistro:admin:token'
const POLL_INTERVAL = 8000
const statusLabels = { new: 'Novo', preparing: 'Em preparo', ready: 'Pronto', out_for_delivery: 'Saiu para entrega', completed: 'Finalizado', cancelled: 'Cancelado' }
const paymentLabels = { pix: 'Pix', cash: 'Dinheiro', debit: 'Débito', credit: 'Crédito' }

const state = {
  token: sessionStorage.getItem(TOKEN_KEY) || '', orders: [], settings: { ...defaultSettings },
  loading: false, error: '', filter: 'active', settingsOpen: false, lastOrderId: null, hasLoadedOrders: false,
}

const api = async (url, options = {}) => {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}), ...(options.headers || {}) } })
  const data = await response.json().catch(() => ({}))
  if (response.status === 401) { state.token = ''; sessionStorage.removeItem(TOKEN_KEY); render(); throw new Error('Sessão expirada.') }
  if (!response.ok) throw new Error(data.message || 'Não foi possível concluir a operação.')
  return data
}

const renderLogin = () => `
  <main class="admin-login"><section><img src="/app-icon-192.png" alt="" /><span class="eyebrow">BISTRÔ BURGER</span><h1>Painel de pedidos</h1><p>Entre com o PIN administrativo para acessar a cozinha.</p><form id="admin-login-form"><label>PIN de acesso<input name="pin" type="password" inputmode="numeric" autocomplete="current-password" required autofocus placeholder="••••••" /></label>${state.error ? `<div class="admin-error">${escapeHtml(state.error)}</div>` : ''}<button class="admin-primary" type="submit">Entrar no painel</button></form><a href="/">← Voltar para a loja</a></section></main>`

const orderItems = order => order.items.map(item => `<li><b>${item.quantity}x</b><span>${escapeHtml(item.name)}${item.note ? `<small>Obs.: ${escapeHtml(item.note)}</small>` : ''}</span><strong>${money(item.total)}</strong></li>`).join('')

const orderCard = order => {
  const active = !['completed', 'cancelled'].includes(order.status)
  return `<article class="admin-order status-${order.status}">
    <div class="order-card-head"><div><span class="order-id">#${escapeHtml(order.number)}</span><small>${formatDateTime(order.createdAt)}</small></div><span class="admin-status">${statusLabels[order.status] || order.status}</span></div>
    <div class="customer-summary"><div class="customer-avatar">${escapeHtml(order.customer.name.charAt(0).toUpperCase())}</div><div><strong>${escapeHtml(order.customer.name)}</strong><a href="tel:${escapeHtml(order.customer.phone)}">${escapeHtml(order.customer.phone)}</a></div><span>${order.fulfillment === 'delivery' ? '🛵 Entrega' : '🏪 Retirada'}</span></div>
    <ul class="admin-items">${orderItems(order)}</ul>
    ${order.orderNote ? `<div class="admin-note">💬 ${escapeHtml(order.orderNote)}</div>` : ''}
    ${order.fulfillment === 'delivery' ? `<div class="admin-address"><b>📍 Entregar em</b><span>${escapeHtml(order.address.street)}, ${escapeHtml(order.address.number)}${order.address.complement ? ` · ${escapeHtml(order.address.complement)}` : ''}<br />${escapeHtml(order.address.neighborhood)} · CEP ${escapeHtml(order.address.cep)}${order.address.reference ? `<br /><small>Ref.: ${escapeHtml(order.address.reference)}</small>` : ''}</span></div>` : `<div class="admin-address"><b>🏪 Retirada no balcão</b></div>`}
    <div class="admin-payment"><div><span>Pagamento</span><strong>${paymentLabels[order.payment.method]}${order.payment.method === 'pix' ? ' · Aguardando comprovante' : ''}</strong>${order.payment.method === 'cash' ? `<small>Pagará com ${order.payment.noChange ? 'valor exato' : money(order.payment.cashAmount)} · Troco ${money(order.payment.change)}</small>` : ''}${['credit','debit'].includes(order.payment.method) ? '<small>Levar maquininha</small>' : ''}</div><div><span>Total</span><strong>${money(order.total)}</strong></div></div>
    <div class="order-actions"><button class="print-button" data-print="${order.id}" aria-label="Imprimir comanda do pedido ${escapeHtml(order.number)}">🖨️ Imprimir comanda</button>${active ? `<select data-status="${order.id}"><option value="new" ${order.status === 'new' ? 'selected' : ''}>Novo</option><option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Em preparo</option><option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Pronto</option>${order.fulfillment === 'delivery' ? `<option value="out_for_delivery" ${order.status === 'out_for_delivery' ? 'selected' : ''}>Saiu para entrega</option>` : ''}<option value="completed">Finalizado</option><option value="cancelled">Cancelado</option></select>${order.fulfillment === 'delivery' ? `<button class="dispatch-button" data-dispatch="${order.id}">${order.status === 'out_for_delivery' ? '📲 Reenviar aviso no WhatsApp' : '🛵 Avisar: saiu para entrega'}</button>` : ''}` : '<span class="order-closed">Pedido encerrado</span>'}</div>
  </article>`
}

const settingsModal = () => !state.settingsOpen ? '' : `
  <div class="modal-layer"><section class="admin-settings-modal"><div class="checkout-header"><div><span class="eyebrow">CONFIGURAÇÕES</span><h2>Dados da loja</h2></div><button class="modal-close static" data-close-settings>×</button></div><form id="admin-settings-form" class="admin-settings-form">
    <label>WhatsApp dos pedidos<input name="whatsapp" value="${escapeHtml(state.settings.whatsapp)}" required /></label><label>Chave Pix<input name="pixKey" value="${escapeHtml(state.settings.pixKey)}" placeholder="CPF, CNPJ, telefone, e-mail ou aleatória" required /></label><label>Nome do recebedor Pix<input name="pixName" value="${escapeHtml(state.settings.pixName)}" required /></label>
    <div class="two-fields"><label>Taxa de entrega<input name="deliveryFee" type="number" step="0.01" value="${state.settings.deliveryFee}" required /></label><label>Pedido mínimo<input name="minimumOrder" type="number" step="0.01" value="${state.settings.minimumOrder}" required /></label></div>
    <label>Tempo de entrega<input name="deliveryTime" value="${escapeHtml(state.settings.deliveryTime)}" required /></label><label>Endereço para retirada<input name="address" value="${escapeHtml(state.settings.address)}" required /></label><label>Cidade / UF<input name="city" value="${escapeHtml(state.settings.city)}" required /></label><div class="admin-hours-note"><strong>Horário automático</strong><span>Das 18:00 às 23:59, de quarta a domingo. O sistema bloqueia pedidos fora desse período.</span></div><label class="switch-line"><input name="open" type="checkbox" ${state.settings.open ? 'checked' : ''} /> Aceitar pedidos dentro do horário</label>
    <button class="admin-primary" type="submit">Salvar configurações</button>
  </form></section></div>`

const printLogo = () => `<svg class="print-logo" viewBox="0 0 420 132" role="img" aria-label="Bistrô Hamburgueria">
  <g fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 54c3-24 21-38 50-38s47 14 50 38H18Z"/><path d="M15 68h106M22 82h92M27 82c3 22 17 33 41 33s38-11 41-33"/><path d="M31 68c7 9 13 9 20 0 7 9 13 9 20 0 7 9 13 9 20 0 7 9 13 9 20 0"/></g>
  <text x="142" y="61" fill="currentColor" font-family="Arial, sans-serif" font-size="50" font-weight="900">BISTRÔ</text><text x="142" y="102" fill="currentColor" font-family="Arial, sans-serif" font-size="27" font-weight="800" letter-spacing="1">HAMBURGUERIA</text>
</svg>`

const printArea = order => {
  const deliveryAddress = order.fulfillment === 'delivery'
    ? `<span>${escapeHtml(order.address.street)}, ${escapeHtml(order.address.number)}${order.address.complement ? ` - ${escapeHtml(order.address.complement)}` : ''}</span><span>${escapeHtml(order.address.neighborhood)}</span><span>CEP ${escapeHtml(order.address.cep)}</span>${order.address.reference ? `<span>Ref.: ${escapeHtml(order.address.reference)}</span>` : ''}`
    : `<span>${escapeHtml(state.settings.address)}</span>`
  return `<section id="thermal-print">${printLogo()}<div class="print-kitchen-label">COMANDA DE PEDIDO</div><div class="print-order"><span>PEDIDO</span><b>#${escapeHtml(order.number)}</b><time>${formatDateTime(order.createdAt)}</time></div><div class="print-customer"><b>CLIENTE</b><span>${escapeHtml(order.customer.name)}</span><span>${escapeHtml(order.customer.phone)}</span></div><div class="print-section-title">ITENS DO PEDIDO</div><ul>${orderItems(order)}</ul>${order.orderNote ? `<p class="print-note"><b>ATENÇÃO, OBSERVAÇÃO</b><span>${escapeHtml(order.orderNote)}</span></p>` : ''}<div class="print-totals"><span>Subtotal <b>${money(order.subtotal)}</b></span>${order.deliveryFee ? `<span>Entrega <b>${money(order.deliveryFee)}</b></span>` : ''}<strong><span>TOTAL</span><b>${money(order.total)}</b></strong></div><div class="print-delivery"><b>${order.fulfillment === 'delivery' ? 'ENTREGA' : 'RETIRADA'}</b>${deliveryAddress}</div><div class="print-payment"><b>PAGAMENTO: ${paymentLabels[order.payment.method].toUpperCase()}</b>${order.payment.method === 'cash' ? `<span>Receber: ${order.payment.noChange ? 'valor exato' : money(order.payment.cashAmount)}</span><span>Troco: ${money(order.payment.change)}</span>` : ''}${['credit','debit'].includes(order.payment.method) ? '<strong>LEVAR MAQUININHA</strong>' : ''}${order.payment.method === 'pix' ? '<strong>CONFIRMAR COMPROVANTE</strong>' : ''}</div><footer>Conferido por: __________________</footer></section>`
}

const renderDashboard = () => {
  const activeOrders = state.orders.filter(order => !['completed', 'cancelled'].includes(order.status))
  const filtered = state.filter === 'all' ? state.orders : state.filter === 'active' ? activeOrders : state.orders.filter(order => order.status === state.filter)
  const todayTotal = state.orders.filter(order => new Date(order.createdAt).toDateString() === new Date().toDateString() && order.status !== 'cancelled').reduce((sum, order) => sum + order.total, 0)
  return `<main class="admin-shell"><header class="admin-header"><a class="brand" href="/"><span class="brand-symbol"><i></i><b>B</b></span><span class="brand-copy"><strong>Bistrô</strong><small>PAINEL DE PEDIDOS</small></span></a><div><button class="admin-icon-button" data-enable-push title="Ativar notificações">🔔</button><button class="admin-icon-button" data-settings title="Configurações">⚙️</button><button class="admin-logout" data-logout>Sair</button></div></header>
    <section class="admin-content"><div class="admin-welcome"><div><span class="eyebrow">OPERAÇÃO AO VIVO</span><h1>Pedidos da cozinha</h1><p>Atualização automática em até 8 segundos e instantânea com as notificações ativas.</p></div><button class="admin-refresh" data-refresh>↻ Atualizar agora</button></div>
      <div class="admin-stats"><div><span>🔥</span><small>Pedidos ativos</small><strong>${activeOrders.length}</strong></div><div><span>👨‍🍳</span><small>Em preparo</small><strong>${state.orders.filter(order => order.status === 'preparing').length}</strong></div><div><span>💰</span><small>Vendas de hoje</small><strong>${money(todayTotal)}</strong></div><div><span>🍔</span><small>Total de pedidos</small><strong>${state.orders.length}</strong></div></div>
      <nav class="admin-filters"><button class="${state.filter === 'active' ? 'active' : ''}" data-filter="active">Ativos</button><button class="${state.filter === 'new' ? 'active' : ''}" data-filter="new">Novos</button><button class="${state.filter === 'preparing' ? 'active' : ''}" data-filter="preparing">Em preparo</button><button class="${state.filter === 'ready' ? 'active' : ''}" data-filter="ready">Prontos</button><button class="${state.filter === 'out_for_delivery' ? 'active' : ''}" data-filter="out_for_delivery">Em entrega</button><button class="${state.filter === 'all' ? 'active' : ''}" data-filter="all">Todos</button></nav>
      ${state.loading ? '<div class="admin-empty">Carregando pedidos...</div>' : state.error ? `<div class="admin-error big">${escapeHtml(state.error)}</div>` : filtered.length ? `<div class="admin-orders-grid">${filtered.map(orderCard).join('')}</div>` : '<div class="admin-empty"><span>👨‍🍳</span><h2>Nenhum pedido por aqui</h2><p>Os novos pedidos aparecerão automaticamente.</p></div>'}
    </section>${settingsModal()}</main>`
}

const render = () => {
  document.querySelector('#app').innerHTML = state.token ? renderDashboard() : renderLogin()
  document.body.classList.toggle('admin-page', true)
  bindEvents()
}

const playOrderSound = () => {
  try {
    const audio = new AudioContext(); const oscillator = audio.createOscillator(); const gain = audio.createGain(); oscillator.connect(gain); gain.connect(audio.destination); oscillator.frequency.value = 880; gain.gain.setValueAtTime(.15, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .45); oscillator.start(); oscillator.stop(audio.currentTime + .45)
  } catch { /* navegador bloqueou som automático */ }
}

const loadOrders = async (quiet = false, announce = true) => {
  if (!quiet) { state.loading = true; state.error = ''; render() }
  try {
    const data = await api('/api/orders')
    const newestId = data.orders[0]?.id
    if (quiet && announce && state.hasLoadedOrders && newestId && newestId !== state.lastOrderId) {
      playOrderSound()
      if (Notification.permission === 'granted') new Notification('Novo pedido na Bistrô! 🍔', { body: `Pedido #${data.orders[0].number} · ${money(data.orders[0].total)}`, icon: '/app-icon-192.png' })
    }
    state.orders = data.orders; state.settings = { ...state.settings, ...(data.settings || {}) }; state.lastOrderId = newestId || null; state.hasLoadedOrders = true; state.error = ''
  } catch (error) { state.error = error.message }
  state.loading = false; render()
}

const urlBase64ToUint8Array = base64String => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(base64), char => char.charCodeAt(0))
}

const enablePush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) { alert('Este navegador não suporta notificações push.'); return }
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return
  const registration = await navigator.serviceWorker.ready
  const settings = await api('/api/settings')
  if (!settings.vapidPublicKey) { alert('As chaves de notificação ainda não foram configuradas.'); return }
  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(settings.vapidPublicKey) })
  await api('/api/push-subscriptions', { method: 'POST', body: JSON.stringify(subscription) })
  alert('Notificações ativadas neste aparelho!')
}

const printOrder = order => {
  if (!order) return
  const template = document.createElement('template')
  template.innerHTML = printArea(order).trim()
  const nextSheet = template.content.firstElementChild
  const previousSheet = document.querySelector('#thermal-print')
  if (previousSheet) previousSheet.replaceWith(nextSheet)
  else document.body.append(nextSheet)
  nextSheet.setAttribute('aria-hidden', 'true')
  document.body.classList.add('printing')
  if (typeof window.print !== 'function') { alert('Abra o painel no Chrome e tente novamente.'); return }
  try { window.print() } catch { alert('Não foi possível abrir a impressão. Use o menu do Chrome e escolha Imprimir.') }
}

const changeOrderStatus = async (id, status) => {
  const opensWhatsApp = status === 'out_for_delivery'
  const whatsappTab = opensWhatsApp ? window.open('', `entrega-${id}`) : null
  try {
    const result = await api(`/api/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
    if (opensWhatsApp && result.customerWhatsappUrl) {
      if (whatsappTab) whatsappTab.location.href = result.customerWhatsappUrl
      else window.location.href = result.customerWhatsappUrl
    } else whatsappTab?.close()
    await loadOrders(true, false)
  } catch (error) { whatsappTab?.close(); alert(error.message); await loadOrders(true, false) }
}

const bindEvents = () => {
  document.querySelector('#admin-login-form')?.addEventListener('submit', async event => {
    event.preventDefault(); state.error = ''
    try { const data = await api('/api/admin-login', { method: 'POST', body: JSON.stringify({ pin: new FormData(event.currentTarget).get('pin') }) }); state.token = data.token; sessionStorage.setItem(TOKEN_KEY, data.token); render(); loadOrders() }
    catch (error) { state.error = error.message; render() }
  })
  document.querySelector('[data-logout]')?.addEventListener('click', () => { state.token = ''; sessionStorage.removeItem(TOKEN_KEY); render() })
  document.querySelector('[data-refresh]')?.addEventListener('click', () => loadOrders())
  document.querySelectorAll('[data-filter]').forEach(button => button.onclick = () => { state.filter = button.dataset.filter; render() })
  document.querySelectorAll('[data-status]').forEach(select => select.onchange = () => changeOrderStatus(select.dataset.status, select.value))
  document.querySelectorAll('[data-dispatch]').forEach(button => button.onclick = () => changeOrderStatus(button.dataset.dispatch, 'out_for_delivery'))
  document.querySelectorAll('[data-print]').forEach(button => button.onclick = () => printOrder(state.orders.find(order => order.id === button.dataset.print)))
  document.querySelector('[data-settings]')?.addEventListener('click', () => { state.settingsOpen = true; render() })
  document.querySelector('[data-close-settings]')?.addEventListener('click', () => { state.settingsOpen = false; render() })
  document.querySelector('#admin-settings-form')?.addEventListener('submit', async event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); data.open = event.currentTarget.elements.open.checked; data.deliveryFee = Number(data.deliveryFee); data.minimumOrder = Number(data.minimumOrder); try { state.settings = await api('/api/settings', { method: 'PUT', body: JSON.stringify(data) }); state.settingsOpen = false; render() } catch (error) { alert(error.message) } })
  document.querySelector('[data-enable-push]')?.addEventListener('click', enablePush)
}

export const initAdmin = async () => {
  render()
  if (state.token) await loadOrders()
  navigator.serviceWorker?.addEventListener('message', event => { if (event.data?.type === 'NEW_ORDER' && state.token) loadOrders(true, false) })
  document.addEventListener('visibilitychange', () => { if (!document.hidden && state.token) loadOrders(true) })
  window.addEventListener('focus', () => { if (state.token) loadOrders(true) })
  setInterval(() => { if (state.token && !state.settingsOpen) loadOrders(true) }, POLL_INTERVAL)
}

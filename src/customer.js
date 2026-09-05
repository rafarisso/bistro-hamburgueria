import {
  categories, clearTracking, defaultSettings, digits, escapeHtml, loadCart, loadProfile, loadTracking, markOnboardingSeen,
  isWithinOpeningHours, menu, money, onboardingSeen, OPENING_HOURS, saveCart, saveProfile, saveTracking,
} from './state.js'

import { calculateCoupon } from '../shared/coupons.js'
import { selectHighlight } from './highlights.js'
const highlighted = selectHighlight(menu)

const icon = (name, size = 20) => {
  const paths = {
    bag: '<path d="M6 8V6a6 6 0 0 1 12 0v2M4 8h16l-1 13H5L4 8Z"/><path d="M9 11v1m6-1v1"/>',
    pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    minus: '<path d="M6 12h12"/>', plus: '<path d="M12 6v12M6 12h12"/>',
    close: '<path d="m7 7 10 10M17 7 7 17"/>',
    trash: '<path d="M5 7h14M9 7V4h6v3m2 0-1 13H8L7 7m3 4v5m4-5v5"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    shield: '<path d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    whatsapp: '<path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.6Z"/><path d="M8.4 8.1c.2-.4.4-.4.7-.4h.4c.1 0 .3 0 .4.3l.7 1.7c.1.2 0 .4-.1.5l-.5.6c-.2.2-.1.4 0 .6.7 1.2 1.7 2.2 3 2.7.2.1.4.1.5-.1l.8-1c.2-.2.4-.2.6-.1l1.6.7c.2.1.4.2.4.4 0 .4-.2 1.3-.6 1.7-.4.5-1.2.8-2 .8-1 0-2.8-.6-4.8-2.4-1.5-1.4-2.6-3.1-2.9-4.3-.2-.7 0-1.3.3-1.7Z"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M5 20h14"/>',
  }
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`
}

const state = {
  settings: { ...defaultSettings }, cart: loadCart(), profile: loadProfile(), activeCategory: 'Todos',
  cartOpen: false, product: null, productQuantity: 1, productNote: '', productCombo: false, checkoutOpen: false,
  profileOpen: false, showOnboarding: !onboardingSeen(), success: null, toast: '', sending: false,
  tracking: loadTracking(), deliveryNotice: null, enablingAlerts: false,
}

let installPrompt = null
let toastTimer = null

const cartQuantity = () => state.cart.reduce((total, item) => total + item.quantity, 0)
const subtotal = () => state.cart.reduce((total, item) => total + item.price * item.quantity, 0)
const visibleMenu = () => state.activeCategory === 'Todos' ? menu : menu.filter(product => product.category === state.activeCategory)
const acceptingOrders = () => Boolean(state.settings.open) && isWithinOpeningHours()
const bodyLock = () => document.body.classList.toggle('no-scroll', Boolean(state.cartOpen || state.product || state.checkoutOpen || state.profileOpen || state.showOnboarding || state.success || state.deliveryNotice))
const trackingLabels = { new: 'Pedido recebido', preparing: 'Em preparo', ready: 'Pronto', out_for_delivery: 'Saiu para entrega', completed: 'Entregue', cancelled: 'Cancelado' }

const showToast = message => {
  state.toast = message
  render()
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { state.toast = ''; render() }, 2300)
}

const productCard = product => `
  <article class="product-card ${product.id === 10 ? 'promo-product' : ''}">
    <button class="product-image" data-open-product="${product.id}" aria-label="Ver ${product.name}">
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      <span class="product-tag">${product.tag}</span>
    </button>
    <div class="product-content">
      <button class="product-copy" data-open-product="${product.id}">
        <span class="product-category">${product.category}</span><h3>${product.name}</h3><p>${product.description}</p>
      </button>
      <div class="product-bottom"><div class="price">${product.oldPrice ? `<s>${money(product.oldPrice)}</s>` : ''}<strong>${money(product.price)}</strong></div><button class="quick-add" data-quick-add="${product.id}" aria-label="Adicionar ${product.name}" ${acceptingOrders() ? '' : 'disabled title="Loja fechada no momento"'}>${icon('plus', 21)}</button></div>
    </div>
  </article>`

const cartItem = item => `
  <article class="cart-item"><img src="${item.image}" alt="" /><div class="cart-item-main">
    <div class="cart-item-title"><strong>${item.name}</strong><button data-remove="${escapeHtml(item.key)}" aria-label="Remover">${icon('trash', 17)}</button></div>
    ${item.note ? `<small>Obs.: ${escapeHtml(item.note)}</small>` : ''}
    <div class="cart-item-footer"><div class="quantity-control small"><button data-decrease="${escapeHtml(item.key)}">${icon('minus', 16)}</button><b>${item.quantity}</b><button data-increase="${escapeHtml(item.key)}">${icon('plus', 16)}</button></div><strong>${money(item.price * item.quantity)}</strong></div>
  </div></article>`

const productModal = () => {
  if (!state.product) return ''
  const comboPrice = state.product.combo?.price || 0
  const unitPrice = state.product.price + (state.productCombo ? comboPrice : 0)
  return `
  <div class="modal-layer" data-close-product-layer><section class="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-title">
    <button class="modal-close" data-close-product aria-label="Fechar">${icon('close')}</button>
    <div class="modal-photo"><img src="${state.product.image}" alt="${state.product.name}" /><span>${state.product.tag}</span></div>
    <div class="modal-content"><span class="product-category">${state.product.category}</span><h2 id="product-title">${state.product.name}</h2><p>${state.product.description}</p><div class="serves"><span>🍽️</span>${state.product.serves}</div>
      ${state.product.combo ? `<fieldset class="combo-choice"><legend>Como você quer pedir?</legend><label class="${state.productCombo ? '' : 'selected'}"><input type="radio" name="product-combo" value="no" ${state.productCombo ? '' : 'checked'} /><span><strong>Só o lanche</strong><small>${money(state.product.price)}</small></span></label><label class="${state.productCombo ? 'selected' : ''}"><input type="radio" name="product-combo" value="yes" ${state.productCombo ? 'checked' : ''} /><span><strong>Adicionar combo</strong><small>${state.product.combo.label} · + ${money(comboPrice)}</small></span></label></fieldset>` : ''}
      <label class="field-label" for="product-note">Alguma observação? <small>Opcional</small></label><textarea id="product-note" maxlength="140" placeholder="Ex.: sem cebola, molho separado...">${escapeHtml(state.productNote)}</textarea>
      <div class="modal-action"><div class="quantity-control"><button data-modal-decrease>${icon('minus')}</button><b>${state.productQuantity}</b><button data-modal-increase>${icon('plus')}</button></div><button class="primary-button add-modal" data-add-modal ${acceptingOrders() ? '' : 'disabled'}>${acceptingOrders() ? `Adicionar <span>${money(unitPrice * state.productQuantity)}</span>` : 'Loja fechada'}</button></div>
    </div>
  </section></div>`
}

const cartDrawer = () => `
  <div class="drawer-backdrop ${state.cartOpen ? 'visible' : ''}" data-close-cart></div><aside class="cart-drawer ${state.cartOpen ? 'open' : ''}" aria-hidden="${!state.cartOpen}">
    <div class="drawer-header"><div><span class="eyebrow">SEU PEDIDO</span><h2>${cartQuantity()} ${cartQuantity() === 1 ? 'item' : 'itens'}</h2></div><button class="drawer-close" data-close-cart>${icon('close')}</button></div>
    <div class="drawer-body">${state.cart.length ? state.cart.map(cartItem).join('') : '<div class="empty-cart"><div class="empty-icon">🍔</div><h3>Seu carrinho está vazio</h3><p>Escolha um dos nossos favoritos para começar.</p><button data-close-cart data-scroll-menu>Ver cardápio</button></div>'}</div>
    ${state.cart.length ? `<div class="drawer-footer"><div class="delivery-preview ${acceptingOrders() ? '' : 'closed-notice'}"><span>${icon('clock', 18)} ${acceptingOrders() ? 'Entrega estimada' : 'Pedidos fechados'}</span><strong>${acceptingOrders() ? state.settings.deliveryTime : 'Qua. a dom. · 18h às 23h59'}</strong></div><div class="drawer-total"><div><span>Subtotal</span><small>Taxa fixa de entrega: ${money(state.settings.deliveryFee)}</small></div><strong>${money(subtotal())}</strong></div><button class="primary-button checkout-button" data-checkout ${acceptingOrders() ? '' : 'disabled'}>${acceptingOrders() ? `Fechar pedido ${icon('arrow')}` : 'Fora do horário de atendimento'}</button><button class="keep-shopping" data-close-cart>Continuar escolhendo</button></div>` : ''}
  </aside>`

const addressFields = (address = {}) => `
  <label>CEP<input name="cep" inputmode="numeric" autocomplete="postal-code" value="${escapeHtml(address.cep || '')}" placeholder="00000-000" required /></label>
  <label>Bairro<input name="neighborhood" autocomplete="address-level3" value="${escapeHtml(address.neighborhood || '')}" placeholder="Seu bairro" required /></label>
  <label class="span-2">Rua / Avenida<input name="street" autocomplete="address-line1" value="${escapeHtml(address.street || '')}" placeholder="Nome da rua" required /></label>
  <label>Número<input name="number" inputmode="numeric" value="${escapeHtml(address.number || '')}" placeholder="123" required /></label>
  <label>Complemento<input name="complement" autocomplete="address-line2" value="${escapeHtml(address.complement || '')}" placeholder="Apto, bloco..." /></label>
  <label class="span-2">Referência<input name="reference" value="${escapeHtml(address.reference || '')}" placeholder="Ex.: portão preto, próximo à praça" /></label>`

const checkoutModal = () => {
  if (!state.checkoutOpen) return ''
  const profile = state.profile
  const pixAvailable = Boolean(state.settings.pixKey)
  return `
    <div class="modal-layer checkout-layer" data-close-checkout-layer><section class="checkout-modal checkout-full" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <div class="checkout-header"><div><span class="eyebrow">FINALIZAR</span><h2 id="checkout-title">Dados do pedido</h2></div><button class="modal-close static" data-close-checkout>${icon('close')}</button></div>
      <form id="checkout-form">
        ${acceptingOrders() ? '' : `<div class="hours-alert"><strong>Loja fechada para pedidos</strong><span>${OPENING_HOURS}</span></div>`}
        <div class="checkout-section"><div class="checkout-section-title"><b>1</b><span><strong>Como você quer receber?</strong><small>A taxa de entrega é ${money(state.settings.deliveryFee)}</small></span></div>
          <div class="mode-switch"><label><input type="radio" name="fulfillment" value="delivery" checked /><span>🛵 Entrega</span></label><label><input type="radio" name="fulfillment" value="pickup" /><span>🏪 Retirada</span></label></div>
        </div>
        <div class="checkout-section"><div class="checkout-section-title"><b>2</b><span><strong>Seus dados</strong><small>Vamos salvar para o próximo pedido</small></span></div><div class="form-grid">
          <label>Nome completo<input name="name" autocomplete="name" value="${escapeHtml(profile.name)}" required placeholder="Como podemos te chamar?" /></label><label>WhatsApp<input name="phone" inputmode="tel" autocomplete="tel" value="${escapeHtml(profile.phone)}" required placeholder="(11) 99999-9999" /></label>
        </div></div>
        <div class="checkout-section" id="delivery-fields"><div class="checkout-section-title"><b>3</b><span><strong>Endereço de entrega</strong><small>Confira para o motoboy encontrar você</small></span></div><div class="form-grid">${addressFields(profile.address)}</div></div>
        <div class="pickup-notice hidden" id="pickup-notice">🏪 Retirada em <strong>${escapeHtml(state.settings.address)}</strong></div>
        <div class="checkout-section"><div class="checkout-section-title"><b id="payment-step">4</b><span><strong>Forma de pagamento</strong><small>Escolha como prefere pagar</small></span></div>
          <div class="payment-grid">
            ${pixAvailable ? '<label><input type="radio" name="payment" value="pix" required /><span>⚡ Pix<small>Envie o comprovante</small></span></label>' : ''}
            <label><input type="radio" name="payment" value="cash" required /><span>💵 Dinheiro<small>Calculamos o troco</small></span></label>
            <label><input type="radio" name="payment" value="debit" required /><span>💳 Débito<small>Maquininha na entrega</small></span></label>
            <label><input type="radio" name="payment" value="credit" required /><span>💳 Crédito<small>Maquininha na entrega</small></span></label>
          </div>
          <div id="pix-details" class="payment-details hidden"><div><span>Chave Pix</span><strong>${escapeHtml(state.settings.pixKey)}</strong></div><button type="button" data-copy-pix>${icon('copy', 17)} Copiar chave</button><p>Após enviar o pedido, encaminhe o comprovante pelo WhatsApp.</p></div>
          <div id="cash-details" class="payment-details hidden"><label class="cash-no-change"><input type="checkbox" name="noChange" /> Não preciso de troco</label><label>Vai pagar com quanto?<input name="cashAmount" inputmode="decimal" placeholder="Ex.: 100,00" /></label><div class="change-result">Troco: <strong id="change-value">R$ 0,00</strong></div></div>
          <div id="card-details" class="payment-details hidden"><span class="card-machine">💳 O motoboy levará a maquininha. Tenha o cartão em mãos.</span></div>
        </div>
        <div class="checkout-section"><label>Cupom de desconto<input name="couponCode" maxlength="30" placeholder="Digite seu cupom" autocomplete="off" aria-describedby="coupon-feedback" /></label><small id="coupon-feedback" role="status">10% nos produtos. Não inclui entrega. Um cupom por pedido.</small></div>
        <label class="order-note">Observação geral<textarea name="orderNote" maxlength="200" placeholder="Alguma orientação para a entrega ou para o pedido?"></textarea></label>
        <input class="honey" name="website" tabindex="-1" autocomplete="off" />
        <div class="checkout-summary"><div><span>Subtotal</span><strong>${money(subtotal())}</strong></div><div id="discount-line" class="hidden"><span>Desconto do cupom (10%)</span><strong id="discount-value"></strong></div><div id="delivery-line"><span>Taxa de entrega</span><strong>${money(state.settings.deliveryFee)}</strong></div><div class="checkout-total"><span>Total</span><strong id="checkout-total">${money(subtotal() + state.settings.deliveryFee)}</strong></div></div>
        <button class="primary-button confirm-order" type="submit" ${state.sending || !acceptingOrders() ? 'disabled' : ''}>${state.sending ? 'Enviando pedido...' : acceptingOrders() ? `Enviar pedido ${icon('whatsapp')}` : 'Pedidos indisponíveis agora'}</button><p class="secure-note">${icon('shield', 16)} Pedido enviado ao WhatsApp e ao painel da hamburgueria.</p>
      </form>
    </section></div>`
}

const onboardingModal = () => !state.showOnboarding ? '' : `
  <div class="modal-layer onboarding-layer"><section class="onboarding-card" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
    <img class="onboarding-icon" src="/app-icon-192.png" alt="" /><span class="eyebrow">BEM-VINDO À BISTRÔ</span><h2 id="onboarding-title">Seu burger favorito,<br />a um toque de distância.</h2><p>Salve seus dados e instale nosso app para pedir ainda mais rápido.</p>
    <div class="onboarding-fields"><label>Seu nome<input id="welcome-name" value="${escapeHtml(state.profile.name)}" placeholder="Como podemos te chamar?" /></label><label>Seu WhatsApp<input id="welcome-phone" value="${escapeHtml(state.profile.phone)}" inputmode="tel" placeholder="(11) 99999-9999" /></label></div>
    <button class="primary-button install-button" data-install>${icon('download')} Instalar app</button><button class="onboarding-skip" data-skip-install>Agora não, continuar no site</button><small>Você pode alterar seus dados quando quiser.</small>
  </section></div>`

const profileModal = () => !state.profileOpen ? '' : `
  <div class="modal-layer" data-close-profile-layer><section class="profile-modal" role="dialog" aria-modal="true"><div class="checkout-header"><div><span class="eyebrow">SEUS DADOS</span><h2>Perfil do cliente</h2></div><button class="modal-close static" data-close-profile>${icon('close')}</button></div>
    <form id="profile-form"><div class="form-grid"><label>Nome<input name="name" value="${escapeHtml(state.profile.name)}" required /></label><label>WhatsApp<input name="phone" value="${escapeHtml(state.profile.phone)}" required /></label>${addressFields(state.profile.address)}</div><button class="primary-button" type="submit">Salvar meus dados</button></form>
  </section></div>`

const successModal = () => {
  if (!state.success) return ''
  const order = state.success.order
  const isPix = order.payment.method === 'pix'
  return `
    <div class="modal-layer success-layer"><section class="success-card" role="dialog" aria-modal="true"><div class="success-check">✓</div><span class="eyebrow">PEDIDO REGISTRADO</span><h2>Pedido #${escapeHtml(order.number)}</h2><p>Seu pedido já apareceu no painel da Bistrô. Agora envie a confirmação pelo WhatsApp.</p>
      ${isPix ? `<div class="pix-success"><span>1. Copie a chave Pix</span><div><strong>${escapeHtml(state.settings.pixKey)}</strong><button data-copy-pix>${icon('copy', 17)} Copiar</button></div><span>2. Faça o pagamento de <b>${money(order.total)}</b></span><span>3. Envie o comprovante no WhatsApp</span></div>` : `<div class="payment-confirmation">${order.payment.method === 'cash' ? `💵 Pagamento em dinheiro · Troco: ${money(order.payment.change || 0)}` : '💳 O motoboy levará a maquininha para o pagamento.'}</div>`}
      <a class="primary-button whatsapp-button" href="${state.success.whatsappUrl}" target="_blank" rel="noopener">${icon('whatsapp')} ${isPix ? 'Enviar pedido e comprovante' : 'Confirmar no WhatsApp'}</a>
      ${order.fulfillment === 'delivery' ? `<button class="order-alert-button" data-enable-order-alerts ${state.enablingAlerts ? 'disabled' : ''}>🔔 ${state.tracking?.pushEnabled ? 'Avisos deste pedido ativados' : state.enablingAlerts ? 'Ativando avisos...' : 'Avisar quando sair para entrega'}</button>` : ''}
      <div class="instagram-recommendation"><span>📸</span><div><strong>Siga a Bistrô no Instagram</strong><p>Acompanhe novidades e promoções em <b>@bistro_burgeeer</b>.</p></div><a href="https://www.instagram.com/bistro_burgeeer/" target="_blank" rel="noopener">Seguir</a></div>
      <button class="success-close" data-close-success>Voltar ao cardápio</button>
    </section></div>`
}

const trackingBanner = () => !state.tracking ? '' : `<section class="tracking-banner shell"><span>🧾</span><div><small>ACOMPANHANDO O PEDIDO #${escapeHtml(state.tracking.number)}</small><strong>${trackingLabels[state.tracking.status] || 'Pedido em andamento'}</strong></div>${['completed', 'cancelled'].includes(state.tracking.status) ? '<button data-clear-tracking>Encerrar</button>' : '<span class="tracking-pulse"></span>'}</section>`

const deliveryNoticeModal = () => !state.deliveryNotice ? '' : `<div class="modal-layer delivery-notice-layer"><section class="delivery-notice-card" role="dialog" aria-modal="true"><div class="delivery-scooter">🛵</div><span class="eyebrow">PEDIDO A CAMINHO</span><h2>Seu pedido saiu<br />para entrega!</h2><p>Oi, ${escapeHtml(state.profile.name?.split(' ')[0] || 'cliente')}! O pedido <strong>#${escapeHtml(state.deliveryNotice.number)}</strong> já está com o entregador.</p><div class="delivery-attention"><b>👀 Fique atento ao entregador</b><span>Se possível, aguarde o contato ou fique próximo ao local de entrega. Assim agilizamos a entrega e seu lanche chega ainda mais quentinho.</span></div><p class="delivery-thanks">Muito obrigado pela preferência e pela confiança! 💛<br /><b>Bom apetite!</b></p><button class="primary-button" data-close-delivery-notice>Entendi, vou ficar atento</button></section></div>`

const render = () => {
  const previousForm = document.querySelector('#checkout-form')
  const checkoutValues = previousForm ? Array.from(previousForm.elements).filter(el => el.name).map(el => ({ name: el.name, value: el.value, checked: el.checked, type: el.type })) : []
  const featured = menu.find(item => item.id === 4)
  const isOpen = acceptingOrders()
  document.querySelector('#app').innerHTML = `
    <div class="promo-bar"><span>🔥</span> ${highlighted.name} por ${money(highlighted.price)} <span>🔥</span></div>
    <header class="site-header"><a class="brand" href="#top"><span class="brand-symbol"><i></i><b>B</b></span><span class="brand-copy"><strong>Bistrô</strong><small>BURGER</small></span></a><div class="header-actions"><button class="location-button" data-open-profile>${icon('pin', 18)}<span><small>Entregar para</small><strong>${state.profile.name ? escapeHtml(state.profile.name.split(' ')[0]) : 'Cadastrar endereço'}</strong></span>${icon('chevron', 15)}</button><button class="user-button" data-open-profile aria-label="Meus dados">${icon('user')}</button><button class="cart-button" data-open-cart>${icon('bag')}<span>Meu pedido</span>${cartQuantity() ? `<b>${cartQuantity()}</b>` : ''}</button></div></header>
    <main id="top">
      <section class="hero hero-new shell"><div class="hero-copy"><span class="hero-kicker"><i></i> BISTRÔ BURGER · DESTAQUE DA VEZ</span><h1>${highlighted.name}</h1><p>${highlighted.description}</p><div class="hero-actions"><button class="primary-button hero-button" data-quick-add="${highlighted.id}" ${isOpen ? '' : 'disabled'}>${isOpen ? `Quero aproveitar ${icon('arrow')}` : 'Disponível no horário de atendimento'}</button><div class="hero-rating"><span>${icon('star', 17)} ${money(highlighted.price)}</span><small>${highlighted.serves}</small></div></div></div><div class="hero-photo"><img src="${highlighted.image}" alt="${highlighted.name}" /><div class="floating-card"><span>${highlighted.tag}</span><strong>${highlighted.name}</strong><small>${highlighted.oldPrice ? `de ${money(highlighted.oldPrice)} por ` : ''}${money(highlighted.price)}</small></div></div></section>
      <section class="store-strip shell"><div class="store-status"><span class="status-dot ${isOpen ? '' : 'closed'}"></span><span><strong>${isOpen ? 'Aberto agora' : 'Fechado agora'}</strong><small>${isOpen ? 'Pedidos liberados' : 'Qua. a dom. · a partir das 18h'}</small></span></div><div>${icon('clock')}<span><small>Horário</small><strong>Qua. a dom. · 18h às 23h59</strong></span></div><div>${icon('pin')}<span><small>Taxa de entrega</small><strong>${money(state.settings.deliveryFee)}</strong></span></div><div>${icon('star')}<span><small>Pedido mínimo</small><strong>${money(state.settings.minimumOrder)}</strong></span></div></section>
      ${trackingBanner()}
      <section class="featured-offer shell"><div class="featured-image"><img src="/Promocao_Barao_Vermelho.jpeg" alt="Combo Barão Vermelho" /></div><div class="featured-copy"><span class="deal-pill">🔥 OFERTA ESPECIAL</span><h2>Uma caixa.<br />Muita felicidade.</h2><p>${featured.description}</p><div class="featured-price"><small>combo completo</small><strong>${money(featured.price)}</strong></div><button class="primary-button" data-quick-add="4" ${isOpen ? '' : 'disabled'}>${isOpen ? `Adicionar ao pedido ${icon('plus')}` : 'Disponível no horário de atendimento'}</button></div></section>
      <section class="menu-section" id="menu"><div class="shell"><div class="section-heading"><div><span class="eyebrow">ESCOLHA O SEU</span><h2>Cardápio Bistrô</h2><p>Tem sempre um burger perfeito para a sua fome.</p></div><div class="result-count">${visibleMenu().length} opções</div></div><nav class="category-list">${categories.map(category => `<button class="${state.activeCategory === category.name ? 'active' : ''}" data-category="${category.name}"><span>${category.icon}</span>${category.name}</button>`).join('')}</nav><div class="product-grid">${visibleMenu().map(productCard).join('')}</div></div></section>
      <section class="experience shell"><div class="experience-photo"><img src="/Combo.jpeg" alt="Combo Bistrô" /></div><div class="experience-copy"><span class="eyebrow light">DO JEITO QUE TEM QUE SER</span><h2>Feito na hora.<br />Entregue com carinho.</h2><p>Do preparo à embalagem, cada detalhe é pensado para seu pedido chegar bonito, quentinho e delicioso.</p><div class="benefit-grid"><div><span>🥩</span><strong>Ingredientes frescos</strong><small>Selecionados todos os dias</small></div><div><span>⚡</span><strong>Preparo rápido</strong><small>Sem perder a qualidade</small></div><div><span>💛</span><strong>Feito com carinho</strong><small>Da chapa até você</small></div><div><span>💳</span><strong>Pagamento fácil</strong><small>Pix, cartão ou dinheiro</small></div></div></div></section>
    </main>
    <footer><div class="footer-main shell"><div><a class="brand footer-brand" href="#top"><span class="brand-symbol"><i></i><b>B</b></span><span class="brand-copy"><strong>Bistrô</strong><small>BURGER</small></span></a><p>Hambúrguer artesanal, feito na hora<br />e entregue com carinho.</p></div><div><strong>Peça agora</strong><a href="#menu">Cardápio</a><button data-open-cart>Meu pedido</button><a href="https://www.instagram.com/bistro_burgeeer/" target="_blank" rel="noopener">@bistro_burgeeer</a></div><div><strong>Atendimento</strong><span>${OPENING_HOURS}</span><span>${escapeHtml(state.settings.address)}</span><span>${escapeHtml(state.settings.city)}</span></div><div><strong>Gestão</strong><a href="/painel">Painel de pedidos</a></div></div><div class="footer-bottom shell"><span>© 2026 Bistrô Burger</span><span>Desenvolvido por <strong>RR Solutions</strong></span></div></footer>
    <button class="mobile-cart ${cartQuantity() ? 'visible' : ''}" data-open-cart><span>${icon('bag')} ${cartQuantity()} ${cartQuantity() === 1 ? 'item' : 'itens'}</span><strong>${money(subtotal())}</strong></button>
    ${cartDrawer()}${productModal()}${checkoutModal()}${onboardingModal()}${profileModal()}${successModal()}${deliveryNoticeModal()}<div class="toast ${state.toast ? 'show' : ''}" role="status">${escapeHtml(state.toast)}</div>`
  bodyLock()
  bindEvents()
  const currentForm = document.querySelector('#checkout-form')
  if (currentForm) {
    for (const saved of checkoutValues) {
      const elements = Array.from(currentForm.elements).filter(el => el.name === saved.name)
      for (const el of elements) {
        if (['radio', 'checkbox'].includes(saved.type)) { if (el.value === saved.value) el.checked = saved.checked }
        else el.value = saved.value
      }
    }
    updateCheckoutUI()
  }
}

const addToCart = (product, quantity = 1, note = '') => {
  const cleanNote = note.trim()
  const key = `${product.id}:${cleanNote.toLowerCase()}`
  const existing = state.cart.find(item => item.key === key)
  if (existing) existing.quantity += quantity
  else state.cart.push({ ...product, quantity, note: cleanNote, key })
  saveCart(state.cart)
}

const copyPix = async () => {
  try { await navigator.clipboard.writeText(state.settings.pixKey); showToast('Chave Pix copiada!') }
  catch { showToast(`Chave Pix: ${state.settings.pixKey}`) }
}

const urlBase64ToUint8Array = base64String => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(base64), char => char.charCodeAt(0))
}

const enableOrderAlerts = async () => {
  if (!state.tracking || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window) || !state.settings.vapidPublicKey) { showToast('Este navegador não suporta avisos do pedido.'); return }
  state.enablingAlerts = true; render()
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') throw new Error('Permita as notificações para receber o aviso.')
    const registration = await navigator.serviceWorker.ready
    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(state.settings.vapidPublicKey) })
    const response = await fetch('/api/customer-push-subscriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: state.tracking.id, trackingToken: state.tracking.trackingToken, subscription }) })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Não foi possível ativar os avisos.')
    state.tracking.pushEnabled = true; saveTracking(state.tracking); state.enablingAlerts = false; render(); showToast('Pronto! Avisaremos quando o pedido sair para entrega.')
  } catch (error) { state.enablingAlerts = false; render(); showToast(error.message || 'Não foi possível ativar os avisos.') }
}

const pollTracking = async () => {
  if (!state.tracking?.id || !state.tracking?.trackingToken) return
  try {
    const response = await fetch(`/api/orders/${encodeURIComponent(state.tracking.id)}?tracking=${encodeURIComponent(state.tracking.trackingToken)}`)
    if (!response.ok) return
    const { order } = await response.json()
    const previousStatus = state.tracking.status
    state.tracking = { ...state.tracking, ...order }
    saveTracking(state.tracking)
    if (order.status === 'out_for_delivery' && previousStatus !== order.status) state.deliveryNotice = order
    if (previousStatus !== order.status) render()
  } catch { /* tenta novamente no próximo ciclo */ }
}

const saveWelcomeProfile = () => {
  state.profile = { ...state.profile, name: document.querySelector('#welcome-name')?.value.trim() || '', phone: document.querySelector('#welcome-phone')?.value.trim() || '' }
  saveProfile(state.profile); markOnboardingSeen()
}

const installApp = async () => {
  saveWelcomeProfile()
  if (installPrompt) { installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; state.showOnboarding = false; render(); return }
  state.showOnboarding = false
  render()
  showToast(/iphone|ipad|ipod/i.test(navigator.userAgent) ? 'No Safari: toque em Compartilhar e depois Adicionar à Tela de Início.' : 'No menu do navegador, escolha Instalar app ou Adicionar à tela inicial.')
}

const updateCheckoutUI = () => {
  const form = document.querySelector('#checkout-form')
  if (!form) return
  const fulfillment = form.elements.fulfillment.value
  const payment = form.elements.payment.value
  const delivery = fulfillment === 'delivery'
  document.querySelector('#delivery-fields')?.classList.toggle('hidden', !delivery)
  document.querySelector('#pickup-notice')?.classList.toggle('hidden', delivery)
  document.querySelector('#delivery-line')?.classList.toggle('hidden', !delivery)
  document.querySelector('#payment-step').textContent = delivery ? '4' : '3'
  document.querySelectorAll('#delivery-fields input').forEach(input => { input.required = delivery && !['complement', 'reference'].includes(input.name) })
  document.querySelector('#pix-details')?.classList.toggle('hidden', payment !== 'pix')
  document.querySelector('#cash-details')?.classList.toggle('hidden', payment !== 'cash')
  document.querySelector('#card-details')?.classList.toggle('hidden', !['debit', 'credit'].includes(payment))
  let discount = 0
  const couponInput = form.elements.couponCode
  try {
    const result = calculateCoupon(couponInput.value, subtotal())
    discount = result.discount
    couponInput.setCustomValidity('')
    document.querySelector('#coupon-feedback').textContent = result.couponCode ? `${result.couponCode} aplicado: 10% nos produtos. Entrega não incluída.` : '10% nos produtos. Não inclui entrega. Um cupom por pedido.'
  } catch (error) {
    couponInput.setCustomValidity(error.message)
    document.querySelector('#coupon-feedback').textContent = error.message
  }
  document.querySelector('#discount-line').classList.toggle('hidden', !discount)
  document.querySelector('#discount-value').textContent = `- ${money(discount)}`
  const total = subtotal() - discount + (delivery ? state.settings.deliveryFee : 0)
  document.querySelector('#checkout-total').textContent = money(total)
  const noChange = form.elements.noChange?.checked
  if (form.elements.cashAmount) form.elements.cashAmount.disabled = Boolean(noChange)
  const paid = Number(String(form.elements.cashAmount?.value || '').replace(',', '.')) || 0
  const change = noChange ? 0 : Math.max(0, paid - total)
  const changeNode = document.querySelector('#change-value')
  if (changeNode) changeNode.textContent = money(change)
}

const submitOrder = async form => {
  if (!acceptingOrders()) { showToast(`Estamos fechados. ${OPENING_HOURS}.`); return }
  const data = new FormData(form)
  const fulfillment = data.get('fulfillment')
  const paymentMethod = data.get('payment')
  const delivery = fulfillment === 'delivery'
  const { discount, couponCode } = calculateCoupon(data.get('couponCode'), subtotal())
  const totalValue = subtotal() - discount + (delivery ? state.settings.deliveryFee : 0)
  const cashAmount = Number(String(data.get('cashAmount') || '').replace(',', '.')) || 0
  if (paymentMethod === 'cash' && !data.get('noChange') && cashAmount < totalValue) { showToast('O valor em dinheiro precisa cobrir o total do pedido.'); return }
  if (subtotal() < state.settings.minimumOrder) { showToast(`O pedido mínimo é ${money(state.settings.minimumOrder)}.`); return }
  const address = delivery ? { cep: data.get('cep'), neighborhood: data.get('neighborhood'), street: data.get('street'), number: data.get('number'), complement: data.get('complement'), reference: data.get('reference') } : {}
  state.profile = { name: String(data.get('name')).trim(), phone: String(data.get('phone')).trim(), address }
  saveProfile(state.profile)
  const payload = {
    couponCode, customer: state.profile, fulfillment, address, orderNote: data.get('orderNote'), website: data.get('website'),
    payment: { method: paymentMethod, cashAmount: paymentMethod === 'cash' && !data.get('noChange') ? cashAmount : null, noChange: Boolean(data.get('noChange')) },
    items: state.cart.map(item => ({ id: item.id, quantity: item.quantity, note: item.note })),
  }
  state.sending = true; render()
  try {
    const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Não foi possível enviar o pedido.')
    state.tracking = { id: result.order.id, number: result.order.number, status: result.order.status, fulfillment: result.order.fulfillment, trackingToken: result.trackingToken, pushEnabled: false }
    saveTracking(state.tracking)
    state.success = result; state.cart = []; saveCart(state.cart); state.checkoutOpen = false; state.sending = false; render()
  } catch (error) { state.sending = false; render(); showToast(error.message || 'Falha ao enviar. Tente novamente.') }
}

const bindEvents = () => {
  document.querySelectorAll('[data-scroll-menu]').forEach(button => button.onclick = () => { state.cartOpen = false; render(); setTimeout(() => document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' }), 30) })
  document.querySelectorAll('[data-category]').forEach(button => button.onclick = () => { state.activeCategory = button.dataset.category; render() })
  document.querySelectorAll('[data-open-product]').forEach(button => button.onclick = () => { state.product = menu.find(item => item.id === Number(button.dataset.openProduct)); state.productQuantity = 1; state.productNote = ''; state.productCombo = false; render() })
  document.querySelectorAll('[data-quick-add]').forEach(button => button.onclick = () => { if (!acceptingOrders()) { showToast(`Pedidos somente ${OPENING_HOURS.toLowerCase()}.`); return } const product = menu.find(item => item.id === Number(button.dataset.quickAdd)); if (product.combo) { state.product = product; state.productQuantity = 1; state.productNote = ''; state.productCombo = false; render(); return } addToCart(product); showToast(`${product.name} adicionado ao pedido`) })
  document.querySelectorAll('[data-open-cart]').forEach(button => button.onclick = () => { state.cartOpen = true; render() })
  document.querySelectorAll('[data-close-cart]').forEach(button => button.onclick = () => { state.cartOpen = false; render() })
  document.querySelectorAll('[data-increase]').forEach(button => button.onclick = () => { state.cart.find(item => item.key === button.dataset.increase).quantity++; saveCart(state.cart); render() })
  document.querySelectorAll('[data-decrease]').forEach(button => button.onclick = () => { const item = state.cart.find(entry => entry.key === button.dataset.decrease); item.quantity--; if (item.quantity <= 0) state.cart = state.cart.filter(entry => entry.key !== item.key); saveCart(state.cart); render() })
  document.querySelectorAll('[data-remove]').forEach(button => button.onclick = () => { state.cart = state.cart.filter(item => item.key !== button.dataset.remove); saveCart(state.cart); render() })
  document.querySelector('[data-modal-increase]')?.addEventListener('click', () => { state.productNote = document.querySelector('#product-note').value; state.productQuantity++; render() })
  document.querySelector('[data-modal-decrease]')?.addEventListener('click', () => { state.productNote = document.querySelector('#product-note').value; state.productQuantity = Math.max(1, state.productQuantity - 1); render() })
  document.querySelectorAll('[name="product-combo"]').forEach(input => input.onchange = () => { state.productNote = document.querySelector('#product-note').value; state.productCombo = input.value === 'yes'; render() })
  document.querySelector('[data-add-modal]')?.addEventListener('click', () => { if (!acceptingOrders()) { showToast(`Pedidos somente ${OPENING_HOURS.toLowerCase()}.`); return } const product = state.productCombo ? { ...state.product, id: state.product.combo.variantId, name: `${state.product.name} + Combo`, price: state.product.price + state.product.combo.price, tag: 'Combo' } : state.product; const name = product.name; addToCart(product, state.productQuantity, document.querySelector('#product-note').value); state.product = null; state.productCombo = false; showToast(`${name} adicionado ao pedido`) })
  document.querySelector('[data-close-product]')?.addEventListener('click', () => { state.product = null; render() })
  document.querySelector('[data-close-product-layer]')?.addEventListener('click', event => { if (event.target === event.currentTarget) { state.product = null; render() } })
  document.querySelector('[data-checkout]')?.addEventListener('click', () => { if (!acceptingOrders()) { showToast(`Estamos fechados. ${OPENING_HOURS}.`); return } state.cartOpen = false; state.checkoutOpen = true; render(); updateCheckoutUI() })
  document.querySelector('[data-close-checkout]')?.addEventListener('click', () => { state.checkoutOpen = false; render() })
  document.querySelector('[data-close-checkout-layer]')?.addEventListener('click', event => { if (event.target === event.currentTarget) { state.checkoutOpen = false; render() } })
  document.querySelector('#checkout-form')?.addEventListener('change', updateCheckoutUI)
  document.querySelector('#checkout-form')?.addEventListener('input', updateCheckoutUI)
  document.querySelector('#checkout-form')?.addEventListener('submit', event => { event.preventDefault(); if (event.currentTarget.reportValidity()) submitOrder(event.currentTarget) })
  document.querySelectorAll('[data-copy-pix]').forEach(button => button.onclick = copyPix)
  document.querySelector('[data-enable-order-alerts]')?.addEventListener('click', enableOrderAlerts)
  document.querySelector('[data-close-delivery-notice]')?.addEventListener('click', () => { state.deliveryNotice = null; render() })
  document.querySelector('[data-clear-tracking]')?.addEventListener('click', () => { clearTracking(); state.tracking = null; render() })
  document.querySelector('[data-install]')?.addEventListener('click', installApp)
  document.querySelector('[data-skip-install]')?.addEventListener('click', () => { saveWelcomeProfile(); state.showOnboarding = false; render() })
  document.querySelectorAll('[data-open-profile]').forEach(button => button.onclick = () => { state.profileOpen = true; render() })
  document.querySelector('[data-close-profile]')?.addEventListener('click', () => { state.profileOpen = false; render() })
  document.querySelector('[data-close-profile-layer]')?.addEventListener('click', event => { if (event.target === event.currentTarget) { state.profileOpen = false; render() } })
  document.querySelector('#profile-form')?.addEventListener('submit', event => { event.preventDefault(); const data = new FormData(event.currentTarget); state.profile = { name: data.get('name'), phone: data.get('phone'), address: { cep: data.get('cep'), neighborhood: data.get('neighborhood'), street: data.get('street'), number: data.get('number'), complement: data.get('complement'), reference: data.get('reference') } }; saveProfile(state.profile); state.profileOpen = false; showToast('Seus dados foram salvos.') })
  document.querySelector('[data-close-success]')?.addEventListener('click', () => { state.success = null; render() })
}

export const initCustomerApp = async () => {
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event })
  window.addEventListener('appinstalled', () => showToast('Bistrô instalada com sucesso!'))
  try {
    const response = await fetch('/api/settings')
    if (response.ok) state.settings = { ...defaultSettings, ...await response.json() }
  } catch { /* usa configuração local */ }
  render()
  pollTracking()
  navigator.serviceWorker?.addEventListener('message', event => { if (event.data?.type === 'ORDER_UPDATE' && (!event.data.orderId || event.data.orderId === state.tracking?.id)) pollTracking() })
  setInterval(pollTracking, 12000)
  setInterval(() => {
    if (!state.cartOpen && !state.product && !state.checkoutOpen && !state.profileOpen && !state.showOnboarding && !state.success) render()
  }, 60000)
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return
    if (state.product) state.product = null
    else if (state.cartOpen) state.cartOpen = false
    else if (state.checkoutOpen) state.checkoutOpen = false
    else if (state.profileOpen) state.profileOpen = false
    else return
    render()
  })
}

// ========= DATA (mock) =========
// Remplace "model" par tes fichiers .glb dans /assets
const PRODUCTS = [
  {
    id: "p1",
    name: "Bague Éclat",
    category: "Bagues",
    price: 189,
    currency: "TND",
    stock: 12,
    emoji: "💍",
    model: "assets/ring.glb",
    desc: "Bague élégante au design minimaliste, finitions premium.",
    specs: {
      "Matière": "Argent 925",
      "Pierre": "Zircon",
      "Poids": "3.2 g",
      "Taille": "Ajustable"
    }
  },
  {
    id: "p2",
    name: "Collier Perle",
    category: "Colliers",
    price: 249,
    currency: "TND",
    stock: 4,
    emoji: "📿",
    model: "assets/ring.glb",
    desc: "Collier délicat, parfait pour une touche chic au quotidien.",
    specs: {
      "Matière": "Acier inox",
      "Pierre": "Perle",
      "Longueur": "45 cm",
      "Fermoir": "Sécurisé"
    }
  },
  {
    id: "p3",
    name: "Bracelet Aura",
    category: "Bracelets",
    price: 129,
    currency: "TND",
    stock: 0,
    emoji: "✨",
    model: "assets/ring.glb",
    desc: "Bracelet fin, facile à assortir, style moderne.",
    specs: {
      "Matière": "Plaqué or",
      "Largeur": "4 mm",
      "Poids": "6 g",
      "Style": "Minimal"
    }
  },
  {
    id: "p4",
    name: "Boucles Lune",
    category: "Boucles",
    price: 99,
    currency: "TND",
    stock: 23,
    emoji: "🌙",
    model: "assets/ring.glb",
    desc: "Boucles légères, inspirées par la lune.",
    specs: {
      "Matière": "Argent 925",
      "Finition": "Polie",
      "Poids": "2 g",
      "Fermeture": "Clou"
    }
  }
];

// ========= STATE =========
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const state = {
  query: "",
  category: "Tous",
  selectedId: null
};

const CART_KEY = "bijoux_cart_v1";

function loadCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function money(v, cur="TND"){
  return `${v.toFixed(0)} ${cur}`;
}

function toast(msg){
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window.__t);
  window.__t = setTimeout(()=> el.classList.remove("show"), 1400);
}

// ========= VIEWS =========
function showView(id){
  $$(".view").forEach(v => v.classList.remove("view--active"));
  $(id).classList.add("view--active");
  window.scrollTo({top:0, behavior:"smooth"});
}

// ========= CATALOG =========
function categories(){
  const set = new Set(PRODUCTS.map(p => p.category));
  return ["Tous", ...Array.from(set)];
}

function renderChips(){
  const wrap = $("#chips");
  wrap.innerHTML = "";
  categories().forEach(cat => {
    const b = document.createElement("button");
    b.className = "chip" + (state.category === cat ? " chip--active" : "");
    b.textContent = cat;
    b.onclick = () => { state.category = cat; renderCatalog(); };
    wrap.appendChild(b);
  });
}

function filteredProducts(){
  return PRODUCTS.filter(p => {
    const q = state.query.trim().toLowerCase();
    const matchQ = !q || (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    const matchC = (state.category === "Tous") || (p.category === state.category);
    return matchQ && matchC;
  });
}

function stockPill(stock){
  if (stock <= 0) return `<span class="pill pill--out">Rupture</span>`;
  if (stock <= 5) return `<span class="pill pill--low">Stock bas</span>`;
  return `<span class="pill pill--ok">En stock</span>`;
}

function renderCatalog(){
  renderChips();
  const grid = $("#productGrid");
  const items = filteredProducts();
  if (!items.length){
    grid.innerHTML = `<div class="card">Aucun produit ne correspond à votre recherche.</div>`;
    return;
  }

  grid.innerHTML = items.map(p => `
    <div class="card productCard" data-id="${p.id}">
      <div class="productCard__img">${p.emoji}</div>
      <div class="productCard__row">
        <div>
          <div class="productCard__name">${p.name}</div>
          <div class="productCard__meta">${p.category}</div>
        </div>
        <div style="text-align:right">
          <div class="price">${money(p.price, p.currency)}</div>
          <div style="margin-top:6px">${stockPill(p.stock)}</div>
        </div>
      </div>
    </div>
  `).join("");

  $$("#productGrid .productCard").forEach(card => {
    card.addEventListener("click", () => openProduct(card.dataset.id));
  });
}

// ========= PRODUCT =========
function openProduct(id){
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  state.selectedId = id;
  $("#pName").textContent = p.name;
  $("#pPrice").textContent = money(p.price, p.currency);
  $("#pStock").outerHTML = stockPill(p.stock).replace('pill', 'pill" id="pStock');
  $("#pDesc").textContent = p.desc;

  const specs = $("#pSpecs");
  specs.innerHTML = Object.entries(p.specs).map(([k,v]) => `
    <div class="spec">
      <div class="k">${k}</div>
      <div class="v">${v}</div>
    </div>
  `).join("");

  const mv = $("#mv");
  mv.setAttribute("src", p.model);

  $("#qty").value = 1;
  $("#addToCart").disabled = p.stock <= 0;

  showView("#viewProduct");
}

// ========= CART =========
function cartCount(cart){
  return cart.reduce((n, it) => n + it.qty, 0);
}

function cartTotal(cart){
  return cart.reduce((sum, it) => {
    const p = PRODUCTS.find(x => x.id === it.id);
    return sum + (p ? p.price * it.qty : 0);
  }, 0);
}

function updateCartBadge(){
  const cart = loadCart();
  $("#cartCount").textContent = cartCount(cart);
}

function openDrawer(){
  $("#drawer").classList.add("isOpen");
  $("#drawer").setAttribute("aria-hidden", "false");
  renderCart();
}
function closeDrawer(){
  $("#drawer").classList.remove("isOpen");
  $("#drawer").setAttribute("aria-hidden", "true");
}

function addToCart(id, qty){
  const cart = loadCart();
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  const current = cart.find(x => x.id === id);
  const nextQty = (current ? current.qty : 0) + qty;

  // Sans backend: on limite par stock "mock"
  if (nextQty > p.stock){
    toast("Quantité dépasse le stock disponible.");
    return;
  }

  if (current) current.qty = nextQty;
  else cart.push({ id, qty });

  saveCart(cart);
  updateCartBadge();
  toast("Ajouté au panier ✅");
}

function setQty(id, qty){
  const cart = loadCart();
  const p = PRODUCTS.find(x => x.id === id);
  const it = cart.find(x => x.id === id);
  if (!it || !p) return;

  qty = Math.max(1, Math.min(qty, p.stock));
  it.qty = qty;

  saveCart(cart);
  renderCart();
  updateCartBadge();
}

function removeItem(id){
  let cart = loadCart();
  cart = cart.filter(x => x.id !== id);
  saveCart(cart);
  renderCart();
  updateCartBadge();
}

function clearCart(){
  saveCart([]);
  renderCart();
  updateCartBadge();
  toast("Panier vidé.");
}

function renderCart(){
  const cart = loadCart();
  const wrap = $("#cartItems");

  if (!cart.length){
    wrap.innerHTML = `<div class="card">Votre panier est vide.</div>`;
    $("#cartTotal").textContent = money(0);
    return;
  }

  wrap.innerHTML = cart.map(it => {
    const p = PRODUCTS.find(x => x.id === it.id);
    if (!p) return "";
    return `
      <div class="cartItem">
        <div class="emoji">${p.emoji}</div>
        <div>
          <div class="title">${p.name}</div>
          <div class="meta">${p.category} • ${money(p.price, p.currency)}</div>
          <div class="qtyRow" style="margin-top:8px">
            <button class="qtyBtn" data-act="dec" data-id="${p.id}">−</button>
            <strong>${it.qty}</strong>
            <button class="qtyBtn" data-act="inc" data-id="${p.id}">+</button>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
          <strong>${money(p.price * it.qty, p.currency)}</strong>
          <button class="removeBtn" data-act="rm" data-id="${p.id}">Supprimer</button>
        </div>
      </div>
    `;
  }).join("");

  $("#cartTotal").textContent = money(cartTotal(cart));

  // handlers
  wrap.querySelectorAll("button").forEach(btn => {
    const id = btn.dataset.id;
    const act = btn.dataset.act;
    btn.onclick = () => {
      const cart = loadCart();
      const it = cart.find(x => x.id === id);
      if (!it) return;

      if (act === "dec") setQty(id, it.qty - 1);
      if (act === "inc") setQty(id, it.qty + 1);
      if (act === "rm") removeItem(id);
    };
  });
}

// ========= CHECKOUT =========
function renderSummary(){
  const cart = loadCart();
  const wrap = $("#summary");
  if (!cart.length){
    wrap.innerHTML = `<div class="muted">Aucun article.</div>`;
    $("#subTotal").textContent = money(0);
    $("#shipCost").textContent = money(0);
    $("#grandTotal").textContent = money(0);
    return;
  }

  wrap.innerHTML = cart.map(it => {
    const p = PRODUCTS.find(x => x.id === it.id);
    return `
      <div style="display:flex;justify-content:space-between;gap:10px;margin:10px 0">
        <div><strong>${p.emoji} ${p.name}</strong><div class="muted" style="font-size:12px">x${it.qty}</div></div>
        <div><strong>${money(p.price * it.qty, p.currency)}</strong></div>
      </div>
    `;
  }).join("");

  const sub = cartTotal(cart);
  const ship = $("#shipping").value === "express" ? 15 : 7;
  const total = sub + ship;

  $("#subTotal").textContent = money(sub);
  $("#shipCost").textContent = money(ship);
  $("#grandTotal").textContent = money(total);
}

function goCheckout(){
  const cart = loadCart();
  if (!cart.length){
    toast("Votre panier est vide.");
    return;
  }
  closeDrawer();
  showView("#viewCheckout");
  renderSummary();
}

// ========= EVENTS =========
function init(){
  renderCatalog();
  updateCartBadge();

  // Search
  $("#searchInput").addEventListener("input", (e) => {
    state.query = e.target.value;
    renderCatalog();
  });
  $("#clearSearch").onclick = () => {
    state.query = "";
    $("#searchInput").value = "";
    renderCatalog();
  };

  // Navigation
  $("#goHome").onclick = (e) => { e.preventDefault(); showView("#viewCatalog"); };
  $("#backToCatalog").onclick = () => showView("#viewCatalog");
  $("#backToCart").onclick = () => openDrawer();

  // Product add
  $("#addToCart").onclick = () => {
    const p = PRODUCTS.find(x => x.id === state.selectedId);
    if (!p) return;
    const qty = Math.max(1, parseInt($("#qty").value || "1", 10));
    addToCart(p.id, qty);
  };

  // Drawer
  $("#openCart").onclick = openDrawer;
  $("#closeCart").onclick = closeDrawer;
  $("#closeCartBtn").onclick = closeDrawer;

  $("#clearCart").onclick = clearCart;
  $("#goCheckout").onclick = goCheckout;

  // Checkout
  $("#shipping").addEventListener("change", renderSummary);
  $("#checkoutForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());

    // Simulation commande
    const orderId = "CMD-" + Math.random().toString(16).slice(2, 8).toUpperCase();
    clearCart();

    alert(
      `Commande confirmée ✅\n\n` +
      `ID: ${orderId}\n` +
      `Nom: ${data.name}\n` +
      `Téléphone: ${data.phone}\n` +
      `Email: ${data.email}\n` +
      `Adresse: ${data.address}\n` +
      `Livraison: ${data.shipping}\n` +
      `Paiement: ${data.payment}\n\n` +
      `Merci ! (simulation frontend)`
    );

    showView("#viewCatalog");
  });
}

init();
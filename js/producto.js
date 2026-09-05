/* KIHAP - producto.js vanilla - detalle dinámico ?id= */
let currentProduct = products[0];
let detailSize = null;
let detailColor = null;
let detailQty = 1;

function productCardHTML(p){
  const media = `<div class="product-media ${catClass[p.category]}"><svg class="icon" style="color:${p.category==='cinturones' ? 'var(--ink)' : '#fff'}"><use href="#${catIcon[p.category]}"/></svg></div>`;
  return `<div class="product-card" data-id="${p.id}">
    ${media}
    <div class="product-info">
      <span class="product-cat">${catLabel[p.category]}</span>
      <span class="product-name">${p.name}</span>
      <span class="product-price">${formatPrice(p.price)}</span>
      <button class="btn-add" data-quickadd="${p.id}"><svg class="icon" style="width:14px;height:14px"><use href="#i-cart"/></svg> Agregar</button>
    </div>
  </div>`;
}
function productCardHTMLWithBadge(p){
  let html = productCardHTML(p);
  if(p.badge && !html.includes('badge-tag')){
    html = html.replace('<svg class="icon"', '<span class="badge-tag">'+p.badge+'</span><svg class="icon"');
  }
  return html;
}

function renderDetalle(){
  const p = currentProduct;
  document.getElementById("breadcrumbName").textContent = p.name;
  document.getElementById("detalleCat").textContent = catLabel[p.category];
  document.getElementById("detalleName").textContent = p.name;
  document.getElementById("detallePrice").textContent = formatPrice(p.price);
  document.getElementById("tabDescripcion").innerHTML = `<p>${p.desc}</p>`;

  const mediaColor = catClass[p.category];
  const iconColor = p.category === 'cinturones' ? 'var(--ink)' : '#fff';
  document.getElementById("galleryMain").className = "gallery-main " + mediaColor;
  document.getElementById("galleryMain").innerHTML = `<svg class="icon" style="color:${iconColor}"><use href="#${catIcon[p.category]}"/></svg>`;
  document.getElementById("galleryThumbs").innerHTML = [1,2,3].map((n,i) =>
    `<div class="thumb ${mediaColor} ${i===0?'active':''}"><svg class="icon" style="color:${iconColor}"><use href="#${catIcon[p.category]}"/></svg></div>`
  ).join("");

  const sizeBlock = document.getElementById("sizeBlock");
  if(p.sizes){
    sizeBlock.style.display = "block";
    document.getElementById("sizeRow").innerHTML = p.sizes.map(s =>
      `<button class="opt-btn ${s===detailSize?'selected':''}" data-size="${s}">${s}</button>`
    ).join("");
  } else { sizeBlock.style.display = "none"; }

  const colorBlock = document.getElementById("colorBlock");
  if(p.colors){
    colorBlock.style.display = "block";
    document.getElementById("colorRow").innerHTML = p.colors.map(c =>
      `<button class="color-dot ${c===detailColor?'selected':''}" data-color="${c}" style="${c==='#FFFFFF'?'border-color:#DDD9CF':''}"><i style="background:${c}"></i></button>`
    ).join("");
  } else { colorBlock.style.display = "none"; }

  document.getElementById("detailQty").textContent = detailQty;

  const related = products.filter(pr => pr.category === p.category && pr.id !== p.id).slice(0,4);
  const fallback = related.length ? related : products.filter(pr => pr.id !== p.id).slice(0,4);
  document.getElementById("relatedGrid").innerHTML = fallback.map(productCardHTMLWithBadge).join("");
}

function changeDetailQty(delta){
  detailQty = Math.max(1, detailQty + delta);
  document.getElementById("detailQty").textContent = detailQty;
}
function addDetailToCartHandler(){
  addDetailToCart(currentProduct, detailSize, detailColor, detailQty);
}
function buyNow(){
  addDetailToCart(currentProduct, detailSize, detailColor, detailQty);
  location.href = "carrito.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const id = Number(params.get("id")) || 1;
  currentProduct = products.find(p => p.id === id) || products[0];
  detailSize = currentProduct.sizes ? currentProduct.sizes[0] : null;
  detailColor = currentProduct.colors ? currentProduct.colors[0] : null;
  detailQty = 1;
  renderDetalle();

  document.getElementById("sizeRow").addEventListener("click", e => {
    const btn = e.target.closest("[data-size]");
    if(btn){ detailSize = btn.dataset.size; renderDetalle(); }
  });
  document.getElementById("colorRow").addEventListener("click", e => {
    const btn = e.target.closest("[data-color]");
    if(btn){ detailColor = btn.dataset.color; renderDetalle(); }
  });
  document.querySelectorAll(".tab-head").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab-head").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.querySelector(`[data-tabpanel="${tab.dataset.tab}"]`).classList.add("active");
    });
  });
  document.body.addEventListener("click", (e) => {
    const quickBtn = e.target.closest("[data-quickadd]");
    if(quickBtn){
      e.preventDefault(); e.stopPropagation();
      const p = products.find(pr => pr.id === Number(quickBtn.dataset.quickadd));
      quickAddToCart(p);
      return;
    }
    const card = e.target.closest(".product-card");
    if(card){
      location.href = "producto.html?id=" + card.dataset.id;
    }
  });
});

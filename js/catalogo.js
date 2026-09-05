/* KIHAP - catalogo.js vanilla */
function productMediaHTML(p){
  return `<div class="product-media ${catClass[p.category]}"><svg class="icon" style="color:${p.category==='cinturones' ? 'var(--ink)' : '#fff'}"><use href="#${catIcon[p.category]}"/></svg></div>`;
}
function productCardHTML(p){
  return `<div class="product-card" data-id="${p.id}">
    ${productMediaHTML(p)}
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
  if(p.badge){
    if(!html.includes('badge-tag')){
      html = html.replace('<svg class="icon"', '<span class="badge-tag">'+p.badge+'</span><svg class="icon"');
    }
  }
  return html;
}

function getActiveCategoryFilters(){
  return Array.from(document.querySelectorAll(".cat-filter:checked")).map(cb => cb.value);
}
function clearFilters(){
  document.querySelectorAll(".cat-filter").forEach(cb => cb.checked = false);
  renderCatalog();
}
function renderCatalog(){
  const active = getActiveCategoryFilters();
  let list = active.length ? products.filter(p => active.includes(p.category)) : products.slice();
  const sort = document.getElementById("sortSelect").value;
  if(sort === "menor") list.sort((a,b) => a.price - b.price);
  if(sort === "mayor") list.sort((a,b) => b.price - a.price);
  if(sort === "nuevos") list.sort((a,b) => b.id - a.id);
  document.getElementById("catalogGrid").innerHTML = list.map(productCardHTMLWithBadge).join("");
  document.getElementById("resultCount").textContent = list.length + (list.length === 1 ? " producto" : " productos");
}

document.addEventListener("DOMContentLoaded", () => {
  // pre-filtrar por ?cat= doboks|protecciones|cinturones|accesorios
  const params = new URLSearchParams(location.search);
  const cat = params.get("cat");
  if(cat){
    document.querySelectorAll(".cat-filter").forEach(cb => cb.checked = (cb.value === cat));
  }
  document.querySelectorAll(".cat-filter").forEach(cb => cb.addEventListener("change", renderCatalog));
  const sortSel = document.getElementById("sortSelect");
  if(sortSel) sortSel.addEventListener("change", renderCatalog);

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

  renderCatalog();
});

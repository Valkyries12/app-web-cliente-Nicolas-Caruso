/* KIHAP - catalogo.js vanilla | BEM español */
function productMediaHTML(p){
  return `<div class="tarjeta-producto__media ${catClass[p.category]}"><svg class="icono" style="color:${p.category==='cinturones' ? 'var(--ink)' : '#fff'}"><use href="#${catIcon[p.category]}"/></svg></div>`;
}
function productCardHTML(p){
  return `<div class="tarjeta-producto" data-id="${p.id}">
    ${productMediaHTML(p)}
    <div class="tarjeta-producto__cuerpo">
      <span class="tarjeta-producto__categoria">${catLabel[p.category]}</span>
      <span class="tarjeta-producto__nombre">${p.name}</span>
      <span class="tarjeta-producto__precio">${formatPrice(p.price)}</span>
      <button class="tarjeta-producto__accion" data-quickadd="${p.id}"><svg class="icono" style="width:14px;height:14px"><use href="#i-cart"/></svg> Agregar</button>
    </div>
  </div>`;
}
function productCardHTMLWithBadge(p){
  let html = productCardHTML(p);
  if(p.badge){
    if(!html.includes('tarjeta-producto__etiqueta')){
      html = html.replace('<svg class="icono"', '<span class="tarjeta-producto__etiqueta">'+p.badge+'</span><svg class="icono"');
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
    const card = e.target.closest(".tarjeta-producto");
    if(card){
      location.href = "producto.html?id=" + card.dataset.id;
    }
  });

  renderCatalog();
});

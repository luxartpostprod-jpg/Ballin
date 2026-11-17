/* ============================================================
   BALLIN Paris — Pages catégorie + filtres (prix, métal, pierre)
   ============================================================ */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const catId = body.dataset.cat;
    const q = new URLSearchParams(location.search).get("q");

    const isSub = SUBCATEGORIES.some(s => s.id === catId);
    const meta = isSub ? SUBCATEGORIES.find(s => s.id === catId) : CATEGORIES.find(c => c.id === catId);
    document.title = meta.label + " — BALLIN Paris";

    let base = isSub ? PRODUCTS.filter(p => p.sub === catId) : PRODUCTS.filter(p => p.cat === catId);

    document.getElementById("catBanner").src = meta.banner;
    document.getElementById("catTitle").textContent = meta.label;
    document.getElementById("catBaseline").textContent =
      isSub ? `${meta.label} d'exception, façonnés à la main à Paris.`
           : (CATEGORIES.find(c => c.id === catId).baseline || "");
    document.getElementById("catBreadcrumb").innerHTML =
      `<a href="index.html">Accueil</a> / <span>${meta.label}</span>`;

    /* Filtres dynamiques : métaux & pierres présents dans la catégorie */
    const metals = [...new Set(base.map(p => p.metal))];
    const gems = [...new Set(base.map(p => p.gem).filter(Boolean))];
    const gemLabel = g => ({ diamant: "Diamant", saphir: "Saphir", emeraude: "Émeraude", rubis: "Rubis", perle: "Perle", aigue: "Aigue-marine" }[g] || g);
    document.getElementById("fMetals").innerHTML = metals.map(m =>
      `<label><input type="checkbox" data-f="metal" value="${m}"> ${METALS[m].label}</label>`).join("");
    document.getElementById("fGems").innerHTML = gems.map(g =>
      `<label><input type="checkbox" data-f="gem" value="${g}"> ${gemLabel(g)}</label>`).join("");

    /* Sous-navigation joaillerie (puces dans la barre de filtres) */
    if (catId === "joaillerie") {
      document.getElementById("subNav").innerHTML =
        SUBCATEGORIES.map(s => `<a class="chip-link" href="${s.page}">${s.label}</a>`).join("");
    }

    /* Ferme les filtres d\u00e9pliants au clic ailleurs */
    document.addEventListener("click", e => {
      if (!e.target.closest(".fdrop")) document.querySelectorAll(".fdrop[open]").forEach(d => d.removeAttribute("open"));
    });

    const state = { price: [], metal: [], gem: [] };

    function apply() {
      let list = base.slice();
      if (q) {
        const needle = q.toLowerCase();
        list = PRODUCTS.filter(p => (p.name + " " + p.short + " " + p.desc + " " + p.cat + " " + p.sub).toLowerCase().includes(needle));
      }
      if (state.price.length) list = list.filter(p => state.price.some(r => r === "5000+" ? p.price > 5000 : r === "0-2000" ? p.price < 2000 : p.price >= 2000 && p.price <= 5000));
      if (state.metal.length) list = list.filter(p => state.metal.includes(p.metal));
      if (state.gem.length) list = list.filter(p => p.gem && state.gem.includes(p.gem));
      const sort = document.getElementById("sortSel").value;
      if (sort === "asc") list.sort((a, b) => a.price - b.price);
      if (sort === "desc") list.sort((a, b) => b.price - a.price);
      document.getElementById("catCount").textContent = list.length + " création" + (list.length > 1 ? "s" : "");
      renderProducts("grid", list);
    }

    document.getElementById("filters").addEventListener("change", e => {
      const box = e.target.closest("input[data-f]");
      if (!box) return;
      const arr = state[box.dataset.f];
      const i = arr.indexOf(box.value);
      if (box.checked && i < 0) arr.push(box.value);
      if (!box.checked && i >= 0) arr.splice(i, 1);
      apply();
    });
    document.getElementById("clearFilters").addEventListener("click", () => {
      state.price = []; state.metal = []; state.gem = [];
      document.querySelectorAll("#filters input[type=checkbox]").forEach(c => c.checked = false);
      apply();
    });
    document.getElementById("sortSel").addEventListener("change", apply);

    apply();
  });
})();

/* ============================================================
   BALLIN Paris — Pages catégorie (Fiançailles, Alliances,
   Joaillerie, Bagues, Bracelets, Colliers, Boucles d'oreilles)
   ============================================================ */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const catId = body.dataset.cat;        // ex. "fiancailles" ou sous-cat "bagues"
    const q = new URLSearchParams(location.search).get("q");

    const isSub = SUBCATEGORIES.some(s => s.id === catId);
    const meta = isSub ? SUBCATEGORIES.find(s => s.id === catId) : CATEGORIES.find(c => c.id === catId);
    document.title = meta.label + " — BALLIN Paris";

    let list = isSub ? PRODUCTS.filter(p => p.sub === catId) : PRODUCTS.filter(p => p.cat === catId);
    if (q) {
      const needle = q.toLowerCase();
      list = PRODUCTS.filter(p => (p.name + " " + p.short + " " + p.desc + " " + p.cat + " " + p.sub).toLowerCase().includes(needle));
    }

    document.getElementById("catBanner").src = meta.banner;
    document.getElementById("catTitle").innerHTML = meta.label;
    document.getElementById("catBaseline").textContent =
      isSub ? `Joaillerie — ${meta.label.toLowerCase()} d'exception, façonnés à la main à Paris.`
           : (CATEGORIES.find(c => c.id === catId).baseline || "");
    document.getElementById("catBreadcrumb").innerHTML =
      `<a href="index.html">Accueil</a> / <span>${meta.label}</span>`;

    document.getElementById("catCount").textContent = list.length + " création" + (list.length > 1 ? "s" : "");
    document.getElementById("sortSel").addEventListener("change", e => {
      const v = e.target.value;
      const sorted = [...list].sort((a, b) =>
        v === "asc" ? a.price - b.price : v === "desc" ? b.price - a.price : 0);
      renderProducts("grid", sorted);
    });
    renderProducts("grid", list);

    /* Sous-catégories (nav latérale sur Joaillerie) */
    if (catId === "joaillerie") {
      const nav = document.getElementById("subNav");
      if (nav) nav.innerHTML = `<h4 style="font-size:.74rem;letter-spacing:.24em;text-transform:uppercase;color:var(--gold-deep);margin-bottom:14px">Explorer la joaillerie</h4>` +
        SUBCATEGORIES.map(s => `<a href="${s.page}" style="display:block;padding:9px 0;font-size:.9rem;color:var(--ink-soft);border-bottom:1px solid var(--line)">${s.label}</a>`).join("");
    }
  });
})();

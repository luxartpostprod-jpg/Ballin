/* ============================================================
   BALLIN Paris — Page produit
   ============================================================ */
(function () {
  "use strict";
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const p = PRODUCTS.find(x => x.id === id) || PRODUCTS[0];
  document.title = p.name + " — BALLIN Paris";

  const state = { metal: p.metal, stone: 0, size: null, engraving: "" };
  const fmt = fmtPrice;

  function price() {
    const m = METALS[state.metal].priceMod;
    const s = p.stones ? (p.stones[state.stone].mod || 0) : 0;
    return p.price + m + s;
  }

  function updatePriceUI() {
    document.getElementById("pdpPrice").innerHTML = `${fmt(price())} <span class="tva">TTC, livraison offerte</span>`;
    const btn = document.getElementById("addCart");
    if (btn) btn.textContent = `Ajouter au panier · ${fmt(price())}`;
    const barPrice = document.getElementById("pdpBarPrice");
    if (barPrice) barPrice.textContent = fmt(price());
  }

  function render() {
    const cat = CATEGORIES.find(c => c.id === p.cat);
    const sub = SUBCATEGORIES.find(c => c.id === p.sub);
    document.getElementById("breadcrumb").innerHTML =
      `<a href="index.html">Accueil</a> / <a href="${cat.page}">${cat.label}</a>` +
      (sub ? ` / <a href="${sub.page}">${sub.label}</a>` : "") + ` / <span>${p.name}</span>`;

    document.getElementById("pdpCat").innerHTML = `${cat.label}${sub ? " · " + sub.label : ""}` +
      (p.badge ? ` <span class="pdp-badge">${p.badge}</span>` : "");
    document.getElementById("pdpName").textContent = p.name;
    updatePriceUI();
    document.getElementById("pdpRef").textContent = "Réf. BALLIN-" + p.id.toUpperCase().replace(/-/g, "");
    document.getElementById("pdpShort").textContent = p.short;

    /* Galerie : 2 vues 2D + vue 3D */
    const tabs = document.getElementById("viewTabs");
    tabs.innerHTML = `
      <button class="view-tab active" data-view="main">Photo</button>
      <button class="view-tab" data-view="detail">Détail</button>
      <button class="view-tab" data-view="3d">Vue 3D · 360°</button>`;
    const main = document.getElementById("galleryMain");
    main.innerHTML = `<img id="mainImg" src="${p.img}" alt="${p.name}">`;
    document.getElementById("thumbs").innerHTML = `
      <button class="thumb active" data-view="main"><img src="${p.img}" alt=""></button>
      <button class="thumb" data-view="detail"><img src="${p.img}" alt="" style="transform:scale(2.1) translate(8%,10%)"></button>
      <button class="thumb" data-view="3d"><img src="assets/img/logo-mark.svg" alt="3D" style="padding:14px"></button>`;

    let viewer = null;
    function showView(v) {
      document.querySelectorAll(".view-tab").forEach(t => t.classList.toggle("active", t.dataset.view === v));
      document.querySelectorAll(".thumb").forEach(t => t.classList.toggle("active", t.dataset.view === v));
      if (v === "3d") {
        main.innerHTML = `<canvas id="canvas3d" style="width:100%;height:100%"></canvas><span class="zoom-hint">Glissez pour pivoter · molette pour zoomer</span>`;
        viewer = Ballin3D.create(document.getElementById("canvas3d"), p.model3d, { metal: state.metal, gem: p.gem || "diamant" });
      } else {
        const img = `<img id="mainImg" src="${p.img}" alt="${p.name}" ${v === "detail" ? 'style="transform:scale(2.1) translate(8%,10%)"' : ""}>`;
        main.innerHTML = img + `<span class="zoom-hint">Fabriqué à la main à Paris</span>`;
      }
    }
    tabs.addEventListener("click", e => { const t = e.target.closest(".view-tab"); if (t) showView(t.dataset.view); });
    document.getElementById("thumbs").addEventListener("click", e => { const t = e.target.closest(".thumb"); if (t) showView(t.dataset.view); });

    /* Options métal */
    const metals = Object.keys(METALS).filter(m => m === p.metal || ["or", "blanc", "rose", "platine"].includes(m));
    document.getElementById("metalGroup").innerHTML = `
      <div class="opt-label"><span>Métal — <b id="metalLabel">${METALS[state.metal].label}</b></span></div>
      <div class="swatches">${metals.map(m => `
        <button class="swatch ${m === state.metal ? "active" : ""}" data-metal="${m}" title="${METALS[m].label}" style="background:${METALS[m].swatch}"></button>`).join("")}
      </div>`;
    document.getElementById("metalGroup").addEventListener("click", e => {
      const b = e.target.closest("[data-metal]"); if (!b) return;
      state.metal = b.dataset.metal;
      document.querySelectorAll("[data-metal]").forEach(x => x.classList.toggle("active", x === b));
      document.getElementById("metalLabel").textContent = METALS[state.metal].label;
      updatePriceUI();
      const active = document.querySelector('.view-tab.active');
      if (active && active.dataset.view === "3d") showView("3d");
    });

    /* Pierres */
    const sg = document.getElementById("stoneGroup");
    if (p.stones) {
      sg.style.display = "block";
      sg.innerHTML = `<div class="opt-label"><span>Pierre — <b>${p.stones[state.stone].label}</b></span></div>
        <div class="chips">${p.stones.map((s, i) => `
          <button class="chip ${i === state.stone ? "active" : ""}" data-stone="${i}">${s.label}${s.mod ? `<span class="mod">${s.mod > 0 ? "+" : "−"} ${fmt(Math.abs(s.mod))}</span>` : ""}</button>`).join("")}
        </div>`;
      sg.addEventListener("click", e => {
        const b = e.target.closest("[data-stone]"); if (!b) return;
        state.stone = +b.dataset.stone;
        sg.querySelectorAll("[data-stone]").forEach(x => x.classList.toggle("active", x === b));
        sg.querySelector("b").textContent = p.stones[state.stone].label;
        updatePriceUI();
      });
    } else sg.style.display = "none";

    /* Tailles */
    const zg = document.getElementById("sizeGroup");
    if (p.sizes) {
      zg.style.display = "block";
      zg.innerHTML = `<div class="opt-label"><span>Taille</span><a class="size-guide" href="sav.html#baguier">Guide des tailles</a></div>
        <select id="sizeSel" class="size-select" aria-label="Choisir une taille">
          <option value="">Choisir une taille…</option>
          ${p.sizes.map(s => `<option value="${s}">Taille ${s}</option>`).join("")}
        </select>`;
      zg.querySelector("#sizeSel").addEventListener("change", e => {
        state.size = e.target.value || null;
        e.target.classList.toggle("filled", !!state.size);
      });
    } else zg.style.display = "none";

    /* Gravure — panneau dédié, offert sur les modèles gravables */
    const eg = document.getElementById("engraveGroup");
    if (p.id === "alliance-eternite-diamants") { eg.style.display = "none"; }
    else {
      eg.style.display = "block";
      eg.innerHTML = `
        <div class="engrave-panel">
          <div class="engrave-head">
            <svg viewBox="0 0 24 24"><path d="M12 3l7 7-7 11L5 10l7-7z"/><line x1="5" y1="10" x2="19" y2="10"/></svg>
            <div><b>Gravure offerte</b><span>Personnalisez votre bijou — 12 caractères max, offerte par la Maison</span></div>
          </div>
          <div class="engrave"><input id="engraveInput" maxlength="12" placeholder="Ex. S ♥ A · 14.07.2025" aria-label="Votre gravure"></div>
          <div class="engrave-foot"><span class="engrave-preview" id="engravePreview"></span><span class="engrave-count" id="engraveCount">0/12</span></div>
        </div>`;
      const ei = document.getElementById("engraveInput");
      ei.addEventListener("input", e => {
        state.engraving = e.target.value;
        document.getElementById("engraveCount").textContent = e.target.value.length + "/12";
        document.getElementById("engravePreview").textContent = e.target.value ? `Aperçu : « ${e.target.value} »` : "";
      });
    }

    /* Accordéons */
    const acc = document.getElementById("accordions");
    acc.innerHTML = `
      <div class="acc open"><button class="acc-head">Description<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        <div class="acc-body"><div class="inner"><p>${p.desc}</p></div></div></div>
      <div class="acc"><button class="acc-head">Détails &amp; matériaux<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        <div class="acc-body"><div class="inner"><ul>${p.details.map(d => `<li>${d}</li>`).join("")}</ul></div></div></div>
      <div class="acc"><button class="acc-head">Livraison &amp; retours<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        <div class="acc-body"><div class="inner"><p>Livraison offerte et assurée en France métropolitaine, UE et Suisse (2 à 5 jours ouvrés). Expédition sous 48 h dans un écrin cadeau signé BALLIN. <b>Retour gratuit sous 30 jours</b>, remboursement sous 5 jours ouvrés. <a href="livraison-retours.html">En savoir plus</a>.</p></div></div></div>
      <div class="acc"><button class="acc-head">Garantie &amp; entretien<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        <div class="acc-body"><div class="inner"><p><b>Garantie à vie</b> contre tout défaut de fabrication. Nettoyage et polissage offerts à vie dans notre atelier, mise à taille offerte sous 30 jours pour les bagues. <a href="garanties.html">Découvrir nos garanties</a>.</p></div></div></div>
      <div class="acc"><button class="acc-head">Certification des pierres<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        <div class="acc-body"><div class="inner"><p>Tous nos diamants sont certifiés par des laboratoires indépendants (GIA, HRD, IGI) et respectent le processus de Kimberley. Or recyclé 18 ct, poinçon de garantie. <a href="nos-pierres.html">Nos engagements</a>.</p></div></div></div>`;
    acc.querySelectorAll(".acc-head").forEach(h => h.addEventListener("click", () => {
      const a = h.parentElement, open = a.classList.contains("open");
      acc.querySelectorAll(".acc").forEach(x => { x.classList.remove("open"); x.querySelector(".acc-body").style.maxHeight = null; });
      if (!open) { a.classList.add("open"); const b = a.querySelector(".acc-body"); b.style.maxHeight = b.scrollHeight + "px"; }
    }));
    const first = acc.querySelector(".acc.open .acc-body"); if (first) first.style.maxHeight = first.scrollHeight + "px";

    /* Panier (bouton + barre flottante) */
    function doAdd() {
      if (p.sizes && !state.size) { showToast("Veuillez choisir une taille"); document.getElementById("sizeGroup").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      addToCart(p.id, { metal: state.metal, stone: p.stones ? p.stones[state.stone].label : null, size: state.size, engraving: state.engraving || null });
    }
    document.getElementById("addCart").onclick = doAdd;
    const barAdd = document.getElementById("pdpBarAdd");
    if (barAdd) barAdd.onclick = doAdd;

    /* Barre d'achat flottante : visible quand le bouton principal est hors champ */
    const bar = document.getElementById("pdpBar");
    const buyRow = document.querySelector(".buy-row");
    document.getElementById("pdpBarImg").src = p.img;
    document.getElementById("pdpBarName").textContent = p.name;
    if (bar && buyRow && "IntersectionObserver" in window) {
      new IntersectionObserver(es => {
        const e = es[0];
        bar.classList.toggle("show", !e.isIntersecting && e.boundingClientRect.top < 0);
      }, { threshold: 0 }).observe(buyRow);
    }

    /* Favori */
    const wishBtn = document.getElementById("pdpWish");
    if (wishBtn) {
      if ((BallinStore.get("wishlist", [])).includes(p.id)) wishBtn.classList.add("active");
      wishBtn.addEventListener("click", () => toggleWish(p.id, wishBtn));
    }

    /* Date de livraison estimée (J+2) */
    const est = document.getElementById("estDate");
    if (est) {
      const d = new Date(Date.now() + 2 * 864e5);
      est.textContent = "livraison estimée " + d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    }

    /* Produits liés */
    const rel = PRODUCTS.filter(x => x.id !== p.id && (x.cat === p.cat || x.sub === p.sub)).slice(0, 4);
    renderProducts("related", rel.length ? rel : PRODUCTS.filter(x => x.id !== p.id).slice(0, 4));
  }

  document.addEventListener("DOMContentLoaded", render);
})();

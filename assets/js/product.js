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
    document.getElementById("pdpPrice").innerHTML = `<span class="pv-label">Prix de vente</span> ${fmt(price())} <span class="pv-inst">ou 3 x ${Math.round(price() / 3)} €</span>`;
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

    /* Métal — déroulant à flèche comme Taille/Gravure, lignes avec prix façon Deloison */
    const metals = Object.keys(METALS).filter(m => m === p.metal || ["or", "blanc", "rose", "platine"].includes(m));
    const mg = document.getElementById("metalGroup");
    mg.innerHTML = `
      <button type="button" class="drawer-head" id="metalDrawer">Métal
        <svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>
      </button>
      <div class="drawer-body" id="metalDrawerBody">
        <div class="metal-rows">
          ${metals.map(m => `
            <label class="metal-row${m === state.metal ? " active" : ""}">
              <input type="radio" name="metal" value="${m}" ${m === state.metal ? "checked" : ""}>
              <span class="dot" style="background:${METALS[m].swatch}"></span>
              <span class="m-name">${METALS[m].label}</span>
              <span class="m-price">${fmt(p.price + METALS[m].priceMod)}</span>
            </label>`).join("")}
        </div>
      </div>`;
    const md = document.getElementById("metalDrawer");
    md.addEventListener("click", () => {
      const open = md.classList.toggle("open");
      document.getElementById("metalDrawerBody").style.maxHeight = open ? "400px" : "0";
    });
    mg.querySelectorAll('input[name="metal"]').forEach(r => r.addEventListener("change", () => {
      state.metal = r.value;
      mg.querySelectorAll(".metal-row").forEach(x => x.classList.toggle("active", x.querySelector("input").checked));
      updatePriceUI();
      const active = document.querySelector('.view-tab.active');
      if (active && active.dataset.view === "3d") showView("3d");
    }));

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

    /* Tailles — déroulant : grille de tailles design + tableau repliable */
    const zg = document.getElementById("sizeGroup");
    if (p.sizes) {
      zg.style.display = "block";
      const miniRows = [[45,14.33],[46,14.64],[47,14.96],[48,15.28],[49,15.60],[50,15.92],[51,16.24],[52,16.56],[53,16.88],[54,17.20],[55,17.52],[56,17.70],[57,18.10],[58,18.47],[59,18.79],[60,19.11],[61,19.43],[62,19.75],[63,20.06],[64,20.38],[65,20.70],[66,21.02],[67,21.34],[68,21.66]]
        .map(r => `<tr><td>${r[0]}</td><td>${r[1].toFixed(2).replace(".", ",")}</td><td>${r[0]},0</td></tr>`).join("");
      zg.innerHTML = `
        <button type="button" class="drawer-head" id="sizeDrawer">Sélectionnez votre taille
          <svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>
        </button>
        <div class="drawer-body" id="sizeDrawerBody">
          <div class="size-picker">
            <p class="drawer-title">Sélectionnez votre taille</p>
            <div class="size-grid">
              ${p.sizes.map(s => `<button type="button" class="size-btn${s === state.size ? " active" : ""}" data-size="${s}">${s}</button>`).join("")}
            </div>
            <p class="size-note">Si vous hésitez entre deux tailles, choisissez la plus grande.</p>
            <details class="size-table-toggle">
              <summary>Voir le tableau des tailles (diamètre / circonférence)</summary>
              <table class="size-mini">
                <thead><tr><th>Taille</th><th>Diamètre</th><th>Circonférence</th></tr></thead>
                <tbody>${miniRows}</tbody>
              </table>
            </details>
            <details class="size-table-toggle">
              <summary>Trouvez ma taille : méthode de mesure</summary>
              <div class="size-guide-full">
                <p class="size-guide-title">Trouvez la taille idéale</p>
                <div class="size-how-cols" style="margin-top:18px">
                  <div>
                    <p class="size-how-lead"><b>Mesurez la circonférence de votre doigt</b> à l'aide d'un mètre ruban ou d'une bande de papier.</p>
                    <ol>
                      <li>Enroulez-le autour de la base du doigt (sans trop serrer).</li>
                      <li>Marquez le point de jonction.</li>
                      <li>Mesurez la longueur obtenue en millimètres (mm) : elle correspond à la circonférence.</li>
                      <li>Reportez-vous au tableau pour connaître votre taille française.</li>
                    </ol>
                  </div>
                  <div>
                    <p class="size-how-lead"><b>Mesurez le diamètre intérieur de votre bague</b></p>
                    <svg class="size-schema" viewBox="0 0 140 110" aria-label="Schéma : mesurer le diamètre intérieur d'une bague">
                      <defs>
                        <marker id="arrS2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#1A1512"/></marker>
                      </defs>
                      <polygon points="70,4 78,14 62,14" fill="none" stroke="#C9AE7E" stroke-width="1.5"/>
                      <circle cx="70" cy="48" r="30" fill="none" stroke="#1A1512" stroke-width="2.5"/>
                      <circle cx="70" cy="48" r="23" fill="none" stroke="#C9AE7E" stroke-width="1"/>
                      <line x1="47" y1="48" x2="93" y2="48" stroke="#1A1512" stroke-width="1.3" marker-start="url(#arrS2)" marker-end="url(#arrS2)"/>
                      <text x="70" y="98" text-anchor="middle" font-size="9" fill="#6B655C" letter-spacing="1">Ø intérieur (mm)</text>
                    </svg>
                    <ol>
                      <li>Choisissez une bague qui vous va parfaitement et que vous utilisez sur le même doigt que celui concerné.</li>
                      <li>Posez la bague sur une surface plane (assurez-vous qu'elle soit bien à plat).</li>
                      <li>Mesurez le diamètre intérieur (la distance d'un bord intérieur à l'autre, en passant par le centre de la bague) à l'aide d'une règle. Ne mesurez pas les bords extérieurs.</li>
                      <li>Notez la mesure en millimètres (mm) : elle correspond au diamètre intérieur.</li>
                      <li>Reportez-vous au tableau pour connaître votre taille française.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>`;
      const sd = document.getElementById("sizeDrawer");
      const sizeBody = document.getElementById("sizeDrawerBody");
      sd.addEventListener("click", () => {
        const open = sd.classList.toggle("open");
        sizeBody.style.maxHeight = open ? sizeBody.scrollHeight + 80 + "px" : "0";
      });
      zg.querySelectorAll("details").forEach(d => d.addEventListener("toggle", () => {
        if (sd.classList.contains("open")) sizeBody.style.maxHeight = sizeBody.scrollHeight + 80 + "px";
      }));
      zg.querySelectorAll(".size-btn").forEach(b => b.addEventListener("click", () => {
        state.size = b.dataset.size;
        zg.querySelectorAll(".size-btn").forEach(x => x.classList.toggle("active", x === b));
      }));
    } else zg.style.display = "none";

    /* Gravure — ligne dépliante façon Deloison, offerte sur les modèles gravables */
    const eg = document.getElementById("engraveGroup");
    if (p.id === "alliance-eternite-diamants") { eg.style.display = "none"; }
    else {
      eg.style.display = "block";
      eg.innerHTML = `
        <button type="button" class="drawer-head" id="engDrawer">Ajouter une gravure
          <svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>
        </button>
        <div class="drawer-body" id="engDrawerBody">
          <div class="eng-modal">
            <p class="eng-title">Ajouter une gravure</p>
            <hr class="hairline">
            <p class="eng-intro">Nous offrons la gravure sur l'ensemble de nos bagues.</p>
            <p class="drawer-title">Sélectionnez votre style</p>
            <div class="style-opts">
              <label class="style-opt"><input type="radio" name="gstyle" value="Bâton" checked> Bâton</label>
              <label class="style-opt"><input type="radio" name="gstyle" value="Italique"> <em>Italique</em></label>
            </div>
            <p class="drawer-title">Rédigez votre gravure</p>
            <input id="engraveInput" maxlength="12" placeholder="Texte de la gravure" aria-label="Texte de la gravure">
            <div class="eng-foot">
              <button type="button" class="btn-validate" id="engraveValidate">Valider</button>
            </div>
            <p class="engrave-done" id="engraveDone" hidden></p>
            <p class="eng-note">Pour toute demande de gravure différente de ce que nous proposons, n'hésitez pas à contacter l'un de nos conseillers par e-mail ou par téléphone au 01 84 60 20 24. Nous serons ravis de vous accompagner dans votre personnalisation.</p>
            <p class="center" style="margin-top:14px"><a class="size-guide" href="gravure.html">Voir les exemples de gravure</a></p>
          </div>
        </div>`;
      const ed = document.getElementById("engDrawer");
      ed.addEventListener("click", () => {
        const open = ed.classList.toggle("open");
        document.getElementById("engDrawerBody").style.maxHeight = open ? "700px" : "0";
      });
      const ei = document.getElementById("engraveInput");
      document.getElementById("engraveValidate").addEventListener("click", () => {
        const v = ei.value.trim();
        if (!v) { showToast("Saisissez un texte de gravure (12 caractères max)"); return; }
        const style = document.querySelector('input[name="gstyle"]:checked').value;
        state.engraving = v;
        state.engraveStyle = style;
        const done = document.getElementById("engraveDone");
        done.hidden = false;
        done.textContent = `Gravure ajoutée : « ${v} » (${style}) — offerte`;
        ed.classList.remove("open");
        document.getElementById("engDrawerBody").style.maxHeight = "0";
        ed.firstChild.textContent = "Gravure ajoutée ✓ ";
      });
    }

    /* Accordéons */
    const acc = document.getElementById("accordions");
    acc.innerHTML = `
      <div class="acc open"><button class="acc-head">Description et détails<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        <div class="acc-body"><div class="inner"><p>${p.desc}</p></div></div></div>
      <div class="acc"><button class="acc-head">Détails &amp; matériaux<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        <div class="acc-body"><div class="inner"><ul>${p.details.map(d => `<li>${d}</li>`).join("")}</ul></div></div></div>
      <div class="acc"><button class="acc-head">Livraison et retours<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        <div class="acc-body"><div class="inner"><p>Livraison offerte et assurée en France métropolitaine, UE et Suisse (2 à 5 jours ouvrés). Expédition sous 48 h dans un écrin cadeau signé BALLIN. <b>Retour gratuit sous 30 jours</b>, remboursement sous 5 jours ouvrés. <a href="livraison-retours.html">En savoir plus</a>.</p></div></div></div>
      <div class="acc"><button class="acc-head">Garantie à vie<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        <div class="acc-body"><div class="inner"><p><b>Garantie à vie</b> contre tout défaut de fabrication. Nettoyage et polissage offerts à vie dans notre atelier, mise à taille offerte sous 30 jours pour les bagues. <a href="garanties.html">Découvrir nos garanties</a>.</p></div></div></div>
      <div class="acc"><button class="acc-head">Entretien du bijou<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        <div class="acc-body"><div class="inner"><p>Évitez le contact avec parfums, cosmétiques et produits ménagers. Nettoyage doux à l'eau tiède savonneuse, séchage au chiffon doux. Nettoyage professionnel offert à vie en atelier.</p></div></div></div>
      <div class="acc"><button class="acc-head">Certificat d'authenticité<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
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

    /* Date de livraison estimée (J+2) */
    const est = document.getElementById("estDate");
    if (est) {
      const d = new Date(Date.now() + 2 * 864e5);
      est.textContent = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });
    }

    /* Produits liés */
    const rel = PRODUCTS.filter(x => x.id !== p.id && (x.cat === p.cat || x.sub === p.sub)).slice(0, 4);
    renderProducts("related", rel.length ? rel : PRODUCTS.filter(x => x.id !== p.id).slice(0, 4));
  }

  document.addEventListener("DOMContentLoaded", render);
})();

/* ============================================================
   BALLIN Paris — JS partagé (header, footer, catalogue, panier)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Header ---------- */
  const headerHTML = `
  <header class="site-header">
    <div class="header-top">
      <span><a href="showroom.html">Visiter notre showroom</a></span>
    </div>
    <div class="container">
      <div class="header-logo-row">
        <a class="logo" href="index.html" aria-label="BALLIN Paris — Accueil">
          <img src="assets/img/logo.svg" alt="BALLIN Paris">
        </a>
      </div>
      <div class="header-main">
        <div class="header-left">
          <a class="phone-link" href="tel:+33184602024">
            <svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>
            +33 1 84 60 20 24
          </a>
          <a class="phone-link rdv-link" href="contact.html" title="Prendre rendez-vous" aria-label="Prendre rendez-vous">
            <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>
          </a>
          <div class="nav-item lang-item">
            <button class="lang-btn" id="langBtn" type="button" aria-haspopup="true" aria-label="Choisir la langue">
              <span id="langLabel">FR</span>
            </button>
            <div class="dropdown lang-menu" id="langMenu">
              <a href="#" data-lang="fr" class="active">Français</a>
              <a href="#" data-lang="en">English</a>
              <a href="#" data-lang="de">Deutsch</a>
              <a href="#" data-lang="es">Español</a>
              <a href="#" data-lang="it">Italiano</a>
              <a href="#" data-lang="ru">Русский</a>
              <a href="#" data-lang="zh">中文</a>
            </div>
          </div>
        </div>
        <nav class="main-nav" id="mainNav">
          <div class="nav-item has-drop">
            <a class="drop-toggle" href="joaillerie.html">Joaillerie</a>
            <div class="dropdown">
              <a href="joaillerie.html">Toute la joaillerie</a>
              <a href="bagues.html">Bagues</a>
              <a href="bracelets.html">Bracelets</a>
              <a href="colliers.html">Colliers</a>
              <a href="boucles-oreilles.html">Boucles d'oreilles</a>
            </div>
          </div>
          <a href="fiancailles.html">Fiançailles</a>
          <a href="alliances.html">Alliances</a>
          <a href="nos-pierres.html">Nos pierres</a>
          <a href="la-maison.html">La Maison</a>
        </nav>
        <div class="header-actions">
          <button class="icon-btn" id="searchBtn" aria-label="Rechercher">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>
          </button>
          <button class="icon-btn" id="wishBtn" aria-label="Favoris">
            <svg viewBox="0 0 24 24"><path d="M12 20.5C7 16.5 3.5 13.3 3.5 9.6 3.5 7 5.5 5 8 5c1.6 0 3.1.8 4 2.1C12.9 5.8 14.4 5 16 5c2.5 0 4.5 2 4.5 4.6 0 3.7-3.5 6.9-8.5 10.9z"/></svg>
          </button>
          <button class="icon-btn" id="cartBtn" aria-label="Panier">
            <svg viewBox="0 0 24 24"><path d="M6 7h12l1.2 13H4.8L6 7z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>
            <span class="cart-count" id="cartCount">0</span>
          </button>
          <button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
        </div>
      </div>
    </div>
  </header>`;

  /* ---------- Footer ---------- */
  const footerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <a class="logo" href="index.html"><img src="assets/img/logo.svg" alt="BALLIN Paris"></a>
          <p>Haute joaillerie française façonnée à la main à Paris. Or éthique, diamants certifiés, garantie à vie.</p>
        </div>
        <div>
          <h4>Collections</h4>
          <ul>
            <li><a href="joaillerie.html">Joaillerie</a></li>
            <li><a href="fiancailles.html">Fiançailles</a></li>
            <li><a href="alliances.html">Alliances</a></li>
            <li><a href="bagues.html">Bagues</a></li>
            <li><a href="bracelets.html">Bracelets</a></li>
            <li><a href="colliers.html">Colliers</a></li>
            <li><a href="boucles-oreilles.html">Boucles d'oreilles</a></li>
          </ul>
        </div>
        <div>
          <h4>La Maison</h4>
          <ul>
            <li><a href="la-maison.html">Notre histoire</a></li>
            <li><a href="showroom.html">Showroom</a></li>
            <li><a href="atelier.html">L'atelier</a></li>
            <li><a href="engagements.html">Nos engagements</a></li>
            <li><a href="nos-pierres.html">Nos pierres &amp; diamants</a></li>
            <li><a href="sav.html">SAV &amp; mise à taille</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4>Aide &amp; services</h4>
          <ul>
            <li><a href="livraison-retours.html">Livraison &amp; retours</a></li>
            <li><a href="garanties.html">Garanties</a></li>
            <li><a href="sav.html#baguier">Baguier offert</a></li>
            <li><a href="cgv.html">CGV</a></li>
            <li><a href="politique-de-confidentialite.html">Confidentialité</a></li>
            <li><a href="cookies.html">Cookies</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} BALLIN Paris — Tous droits réservés</span>
        <span><a href="cgv.html">CGV</a> · <a href="politique-de-confidentialite.html">Confidentialité</a> · <a href="cookies.html">Cookies</a></span>
      </div>
    </div>
  </footer>`;

  const cookieHTML = `
  <div class="cookie-banner" id="cookieBanner" role="dialog" aria-label="Consentement cookies">
    <h3>Nous respectons votre vie privée</h3>
    <p>Nous utilisons des cookies pour mesurer l'audience et améliorer votre expérience. Vous pouvez accepter, refuser ou personnaliser votre choix à tout moment.</p>
    <div class="cookie-actions">
      <button class="btn btn-primary" data-cookie="all">Tout accepter</button>
      <button class="btn btn-outline" data-cookie="essential">Uniquement essentiels</button>
    </div>
  </div>`;

  const toastHTML = `<div class="toast" id="toast"></div>`;

  function mount() {
    const h = document.getElementById("header"); if (h) h.innerHTML = headerHTML;
    const f = document.getElementById("footer"); if (f) f.innerHTML = footerHTML;
    const c = document.getElementById("cookie"); if (c) c.innerHTML = cookieHTML;
    const t = document.getElementById("toast-slot"); if (t) t.innerHTML = toastHTML;

    const nav = document.getElementById("mainNav");
    const burger = document.getElementById("burger");
    if (burger && nav) burger.addEventListener("click", () => {
      nav.classList.toggle("open");
      burger.classList.toggle("open");
    });
    const header = document.querySelector(".site-header");
    const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".main-nav a").forEach(a => {
      if (a.getAttribute("href") === here) a.classList.add("active");
    });
    if (["joaillerie.html", "bagues.html", "bracelets.html", "colliers.html", "boucles-oreilles.html"].includes(here)) {
      const t = document.querySelector(".main-nav .drop-toggle");
      if (t) t.classList.add("active");
    }

    /* Sélecteur de langue */
    const langMenu = document.getElementById("langMenu");
    if (langMenu) {
      const CODES = { fr: "FR", en: "EN", de: "DE", es: "ES", it: "IT", ru: "RU", zh: "ZH" };
      const applyLang = code => {
        langMenu.querySelectorAll("a[data-lang]").forEach(a => a.classList.toggle("active", a.dataset.lang === code));
        document.getElementById("langLabel").textContent = CODES[code] || "FR";
      };
      langMenu.addEventListener("click", e => {
        const a = e.target.closest("a[data-lang]");
        if (!a) return;
        e.preventDefault();
        const code = a.dataset.lang;
        store.set("lang", code);
        applyLang(code);
        showToast(code === "fr" ? "Langue : Français" : "Langue : " + a.textContent.trim() + " — traduction bientôt disponible");
      });
      applyLang(store.get("lang", "fr"));
    }
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  window.showToast = function (msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
  };

  /* ---------- Panier & favoris (localStorage) ---------- */
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem("ballin_" + k)) ?? d; } catch (e) { return d; } },
    set(k, v) { localStorage.setItem("ballin_" + k, JSON.stringify(v)); },
  };
  window.BallinStore = store;

  function refreshCart() {
    const cart = store.get("cart", []);
    const el = document.getElementById("cartCount");
    if (el) {
      el.textContent = cart.reduce((n, i) => n + i.qty, 0);
      el.classList.remove("bump");
      void el.offsetWidth;
      el.classList.add("bump");
    }
  }
  window.addToCart = function (productId, opts) {
    const cart = store.get("cart", []);
    const key = productId + "|" + JSON.stringify(opts || {});
    const found = cart.find(i => i.key === key);
    if (found) found.qty += 1; else cart.push({ key, id: productId, opts: opts || {}, qty: 1 });
    store.set("cart", cart);
    refreshCart();
    showToast("Ajouté au panier — " + (PRODUCTS.find(p => p.id === productId) || {}).name);
  };
  window.toggleWish = function (id, btn) {
    const w = store.get("wishlist", []);
    const i = w.indexOf(id);
    if (i >= 0) { w.splice(i, 1); btn && btn.classList.remove("active"); showToast("Retiré des favoris"); }
    else { w.push(id); btn && btn.classList.add("active"); showToast("Ajouté aux favoris"); }
    store.set("wishlist", w);
  };

  /* ---------- Cartes produit ---------- */
  function fmt(n) { return n.toLocaleString("fr-FR") + " €"; }
  window.fmtPrice = fmt;

  window.productCard = function (p) {
    const wished = store.get("wishlist", []).includes(p.id);
    const goldBadge = ["Icône", "Bestseller", "Haute joaillerie"].includes(p.badge);
    return `
    <article class="product-card reveal">
      <div class="thumb">
        <a href="produit.html?id=${p.id}" aria-label="${p.name}">
          <img src="${p.img}" alt="${p.name}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='assets/img/placeholder.svg'">
        </a>
        ${p.badge ? `<span class="badge ${goldBadge ? "gold" : ""}">${p.badge}</span>` : ""}
        <button class="wish ${wished ? "active" : ""}" data-wish="${p.id}" aria-label="Ajouter aux favoris" title="Ajouter aux favoris">
          <svg viewBox="0 0 24 24"><path d="M12 20.5C7 16.5 3.5 13.3 3.5 9.6 3.5 7 5.5 5 8 5c1.6 0 3.1.8 4 2.1C12.9 5.8 14.4 5 16 5c2.5 0 4.5 2 4.5 4.6 0 3.7-3.5 6.9-8.5 10.9z"/></svg>
        </button>
      </div>
      <div class="info">
        <span class="cat-tag">${labelOf(p.cat)}${p.sub ? " · " + labelOf(p.sub) : ""}</span>
        <h3><a href="produit.html?id=${p.id}">${p.name}</a></h3>
        <span class="price">${fmt(p.price)}</span>
      </div>
    </article>`;
  };

  function labelOf(id) {
    const c = CATEGORIES.find(c => c.id === id) || SUBCATEGORIES.find(c => c.id === id);
    return c ? c.label : id;
  }
  window.labelOf = labelOf;

  window.renderProducts = function (elId, list) {
    const el = document.getElementById(elId);
    if (!el) return;
    if (!list.length) { el.innerHTML = `<p class="empty">Aucune création ne correspond à ces filtres.</p>`; return; }
    el.innerHTML = list.map(productCard).join("");
    bindWishes(el);
    observeReveals(el);
  };

  function bindWishes(scope) {
    (scope || document).querySelectorAll("[data-wish]").forEach(b => {
      b.addEventListener("click", e => { e.preventDefault(); toggleWish(b.dataset.wish, b); });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  let io;
  function observeReveals(scope) {
    if (!io) io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
    (scope || document).querySelectorAll(".reveal:not(.in)").forEach(el => io.observe(el));
  }
  window.observeReveals = observeReveals;

  /* ---------- Cookies ---------- */
  function initCookies() {
    const banner = document.getElementById("cookieBanner");
    if (!banner) return;
    if (store.get("cookies", null)) return;
    setTimeout(() => banner.classList.add("show"), 1200);
    banner.querySelectorAll("[data-cookie]").forEach(b => {
      b.addEventListener("click", () => {
        const choice = b.dataset.cookie;
        store.set("cookies", { choice, date: new Date().toISOString(), essential: true, analytics: choice === "all" });
        banner.classList.remove("show");
        showToast(choice === "all" ? "Tous les cookies acceptés" : "Préférences enregistrées");
      });
    });
  }

  /* ---------- Header actions ---------- */
  function initHeader() {
    refreshCart();
    const cartBtn = document.getElementById("cartBtn");
    if (cartBtn) cartBtn.addEventListener("click", () => showToast("Votre panier contient " + store.get("cart", []).reduce((n, i) => n + i.qty, 0) + " article(s) — démo"));
    const searchBtn = document.getElementById("searchBtn");
    if (searchBtn) searchBtn.addEventListener("click", () => {
      const q = prompt("Rechercher un bijou (ex. solitaire, alliance, saphir…) :");
      if (q) location.href = "joaillerie.html?q=" + encodeURIComponent(q);
    });
    const wishBtn = document.getElementById("wishBtn");
    if (wishBtn) wishBtn.addEventListener("click", () => {
      const w = store.get("wishlist", []);
      showToast(w.length ? w.length + " favori(s) : " + w.map(id => (PRODUCTS.find(p => p.id === id) || {}).name).join(", ") : "Aucun favori pour le moment");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    mount();
    initHeader();
    initCookies();
    bindWishes(document);
    observeReveals(document);
  });
})();

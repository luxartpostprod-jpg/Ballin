/* ============================================================
   BALLIN Paris — Viewer 3D WebGL maison (aucune dépendance)
   Génère procéduralement bagues, alliances, colliers, bracelets
   et boucles d'oreilles ; rotation souris, zoom, auto-rotation.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Math ---------- */
  function perspective(fov, asp, n, f) {
    const t = 1 / Math.tan(fov / 2), d = 1 / (n - f);
    return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * d, -1, 0, 0, 2 * f * n * d, 0];
  }
  function mul(a, b) {
    const o = new Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++)
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    return o;
  }
  function rotX(a) { const c = Math.cos(a), s = Math.sin(a); return [1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]; }
  function rotY(a) { const c = Math.cos(a), s = Math.sin(a); return [c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]; }
  function rotZ(a) { const c = Math.cos(a), s = Math.sin(a); return [c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1]; }
  function trans(x, y, z) { return [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]; }
  function scale(x, y, z) { return [x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1]; }
  function ident() { return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; }

  /* ---------- Géométries ---------- */
  // Torus (éventuellement partiel : arc en radians, partant de -PI/2 haut)
  function torus(R, r, seg, segR, arc) {
    arc = arc || Math.PI * 2;
    const pos = [], nor = [], idx = [];
    for (let i = 0; i <= seg; i++) {
      const u = (i / seg) * arc - Math.PI / 2; // 0 => haut
      const cu = Math.cos(u), su = Math.sin(u);
      for (let j = 0; j <= segR; j++) {
        const v = (j / segR) * Math.PI * 2;
        const cv = Math.cos(v), sv = Math.sin(v);
        const x = (R + r * cv) * cu, y = R * su, z = (R + r * cv) * sv;
        pos.push(x, y, z);
        nor.push(cv * cu, su, cv * sv);
      }
    }
    for (let i = 0; i < seg; i++) for (let j = 0; j < segR; j++) {
      const a = i * (segR + 1) + j, b = a + segR + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    return { pos, nor, idx };
  }
  // Losange taillé (profil de diamant) par révolution
  function brilliant(s) {
    const prof = [ // (rayon, y) du table au co culet
      [0.001, 0.62], [0.55, 0.62], [0.72, 0.30], [1.0, 0.0], [0.72, -0.42], [0.001, -0.95],
    ];
    const seg = 28, pos = [], nor = [], idx = [];
    for (let i = 0; i < prof.length; i++) {
      const [r0, y0] = prof[i];
      const [r1, y1] = prof[Math.min(i + 1, prof.length - 1)];
      const [rP, yP] = prof[Math.max(i - 1, 0)];
      let dx = r1 - rP, dy = y1 - yP;
      const len = Math.hypot(dx, dy) || 1;
      const ny = dx / len, nr = -dy / len; // normale du profil
      for (let j = 0; j <= seg; j++) {
        const v = (j / seg) * Math.PI * 2, cv = Math.cos(v), sv = Math.sin(v);
        pos.push(r0 * s * cv, y0 * s, r0 * s * sv);
        nor.push(nr * cv, ny, nr * sv);
      }
    }
    const rings = prof.length;
    for (let i = 0; i < rings - 1; i++) for (let j = 0; j < seg; j++) {
      const a = i * (seg + 1) + j, b = a + seg + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
    return { pos, nor, idx };
  }
  function sphere(r, seg, rings) {
    const pos = [], nor = [], idx = [];
    for (let i = 0; i <= rings; i++) {
      const ph = (i / rings) * Math.PI, sp = Math.sin(ph), cp = Math.cos(ph);
      for (let j = 0; j <= seg; j++) {
        const th = (j / seg) * Math.PI * 2, st = Math.sin(th), ct = Math.cos(th);
        const x = sp * ct, y = cp, z = sp * st;
        pos.push(x * r, y * r, z * r); nor.push(x, y, z);
      }
    }
    for (let i = 0; i < rings; i++) for (let j = 0; j < seg; j++) {
      const a = i * (seg + 1) + j, b = a + seg + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    return { pos, nor, idx };
  }
  function merge(geoms, mats) {
    const pos = [], nor = [], idx = []; let off = 0;
    geoms.forEach((g, gi) => {
      const m = mats[gi];
      pos.push(...g.pos); nor.push(...g.nor);
      for (let k = 0; k < g.pos.length; k += 3) {
        const x = g.pos[k], y = g.pos[k + 1], z = g.pos[k + 2];
        pos[off * 3 + k] = m[0] * x + m[4] * y + m[8] * z + m[12];
        pos[off * 3 + k + 1] = m[1] * x + m[5] * y + m[9] * z + m[13];
        pos[off * 3 + k + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
      }
      g.idx.forEach(i => idx.push(i + off));
      off += g.pos.length / 3;
    });
    return { pos, nor, idx };
  }

  /* ---------- Couleurs ---------- */
  const METAL_COLORS = {
    or: [0.85, 0.66, 0.30], blanc: [0.92, 0.92, 0.90], rose: [0.90, 0.68, 0.55], platine: [0.85, 0.88, 0.91],
  };
  const GEM_COLORS = {
    diamant: [0.98, 0.99, 1.0], saphir: [0.18, 0.36, 0.78], emeraude: [0.10, 0.62, 0.38],
    rubis: [0.78, 0.16, 0.22], perle: [0.97, 0.94, 0.88], aigue: [0.38, 0.72, 0.80],
  };

  /* ---------- Scènes ---------- */
  // Chaque scène : liste de {geo, mat, color, spec, shine}
  function buildScene(model, metal, gem) {
    const mc = METAL_COLORS[metal] || METAL_COLORS.or;
    const gc = GEM_COLORS[gem] || GEM_COLORS.diamant;
    const metalObj = c => ({ color: c || mc, spec: 1.0, shine: 90 });
    const gemObj = c => ({ color: c || gc, spec: 1.6, shine: 140 });
    const S = [];
    const add = (geo, mat, obj) => S.push({ geo, mat, ...obj });
    const bandM = mul(rotX(Math.PI / 2), ident());

    switch (model) {
      case "alliance":
        add(torus(1.0, 0.17, 64, 24), bandM, metalObj());
        break;
      case "alliance_pave": {
        add(torus(1.0, 0.17, 64, 24), bandM, metalObj());
        for (let i = 0; i < 26; i++) {
          const a = (i / 26) * Math.PI * 2;
          const m = mul(bandM, mul(trans(Math.cos(a) * 1.0, Math.sin(a) * 1.0, 0), scale(0.09, 0.09, 0.09)));
          add(sphere(1, 12, 8), m, gemObj());
        }
        break;
      }
      case "alliance_torsade": {
        add(torus(0.99, 0.115, 64, 18), mul(bandM, rotZ(0.0)), metalObj());
        add(torus(1.01, 0.115, 64, 18), mul(bandM, rotZ(0.13)), { color: [mc[0] * 0.92, mc[1] * 0.92, mc[2] * 0.92], spec: 1.0, shine: 70 });
        break;
      }
      case "solitaire": case "trilogie": case "halo": {
        add(torus(1.0, 0.14, 64, 24), bandM, metalObj());
        const topY = 1.0;
        if (model === "trilogie") {
          [-0.34, 0, 0.34].forEach(x => {
            const m = mul(bandM, mul(trans(x, topY + 0.10, 0), scale(0.42, 0.42, 0.42)));
            add(brilliant(1), m, gemObj());
          });
        } else if (model === "halo") {
          add(torus(0.52, 0.075, 40, 14), mul(bandM, trans(0, topY + 0.16, 0)), metalObj());
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            const m = mul(bandM, mul(trans(Math.cos(a) * 0.52, topY + 0.16 + Math.sin(a) * 0.52, 0), scale(0.085, 0.085, 0.085)));
            add(sphere(1, 10, 7), m, gemObj());
          }
          const m = mul(bandM, mul(trans(0, topY + 0.30, 0), scale(0.62, 0.62, 0.62)));
          add(brilliant(1), m, gemObj());
        } else {
          [-0.30, 0.30].forEach(x => {
            const m = mul(bandM, mul(trans(x * 0.9, topY + 0.10, 0), scale(0.05, 0.16, 0.05)));
            add(torus(0.16, 0.05, 12, 8), m, metalObj());
          });
          const m = mul(bandM, mul(trans(0, topY + 0.22, 0), scale(0.62, 0.62, 0.62)));
          add(brilliant(1), m, gemObj());
        }
        break;
      }
      case "rosace": {
        add(torus(1.0, 0.14, 64, 24), bandM, metalObj());
        const cy = 1.14;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const m = mul(bandM, mul(trans(Math.cos(a) * 0.34, cy + Math.sin(a) * 0.34, 0), mul(rotZ(a + Math.PI / 2), scale(0.30, 0.20, 0.16))));
          add(sphere(1, 14, 10), m, gemObj());
        }
        const m = mul(bandM, mul(trans(0, cy, 0), scale(0.30, 0.30, 0.30)));
        add(sphere(1, 18, 12), m, gemObj([gc[0] * 1.05, gc[1] * 1.05, gc[2] * 1.05]));
        break;
      }
      case "perle": {
        add(torus(1.0, 0.14, 64, 24), bandM, metalObj());
        const m = mul(bandM, mul(trans(0, 1.32, 0), scale(0.42, 0.42, 0.42)));
        add(sphere(1, 24, 16), m, { color: gc, spec: 0.9, shine: 60 });
        break;
      }
      case "chevaliere": {
        add(torus(1.0, 0.16, 64, 24), bandM, metalObj());
        const m = mul(bandM, mul(trans(0, 1.18, 0), scale(0.55, 0.22, 0.42)));
        add(sphere(1, 24, 14), m, metalObj());
        const g = mul(bandM, mul(trans(0, 1.42, 0), scale(0.20, 0.20, 0.20)));
        add(brilliant(1), g, gemObj());
        break;
      }
      case "jonc": {
        add(torus(1.25, 0.09, 72, 20), mul(rotX(Math.PI / 2.4), trans(0, -0.2, 0)), metalObj());
        break;
      }
      case "riviere": {
        add(torus(1.25, 0.085, 72, 20), mul(rotX(Math.PI / 2.4), trans(0, -0.2, 0)), metalObj());
        for (let i = -3; i <= 3; i++) {
          const a = -Math.PI / 2 + i * 0.30;
          const x = Math.cos(a) * 1.25, y = -0.2 + Math.sin(a) * 1.25;
          const m = mul(rotX(Math.PI / 2.4), mul(trans(x, y, 0), scale(0.16 - Math.abs(i) * 0.012, 0.16 - Math.abs(i) * 0.012, 0.16)));
          add(brilliant(1), m, gemObj());
        }
        break;
      }
      case "manchette": {
        add(torus(1.25, 0.30, 72, 24), mul(rotX(Math.PI / 2.4), mul(trans(0, -0.2, 0), scale(1, 0.62, 1))), metalObj());
        for (let i = -4; i <= 4; i++) {
          const a = -Math.PI / 2 + i * 0.20;
          const r = 1.25, y = -0.2 + Math.sin(a) * 1.25 * 0.62, x = Math.cos(a) * r;
          const m = mul(rotX(Math.PI / 2.4), mul(trans(x, y, 0), mul(rotZ(a + Math.PI / 2), scale(0.05, 0.22, 0.05))));
          add(torus(0.2, 0.05, 10, 8), m, metalObj());
        }
        const g = mul(rotX(Math.PI / 2.4), mul(trans(0, -0.2 + 1.25 * 0.62 + 0.28, 0), scale(0.34, 0.34, 0.34)));
        add(brilliant(1), g, gemObj());
        break;
      }
      case "pendentif": case "collier_riviere": case "ras_perle": {
        // chaîne : arc de tore ouvert vers le bas
        add(torus(1.55, 0.035, 64, 10, Math.PI * 1.35), mul(rotX(Math.PI / 2), trans(0, 0.55, 0)), metalObj());
        const by = 0.55 - 1.55 * Math.cos((Math.PI * 1.35) / 2) + 0.02;
        if (model === "collier_riviere") {
          for (let i = -2; i <= 2; i++) {
            const t = (i / 2) * 0.5;
            const a = Math.PI / 2 + t;
            const x = Math.cos(a) * 1.55, y = 0.55 + Math.sin(a) * 1.55;
            const s = 0.20 - Math.abs(i) * 0.03;
            const m = mul(rotX(Math.PI / 2), mul(trans(x, y - 0.06, 0), scale(s, s, s)));
            add(brilliant(1), m, gemObj());
          }
        } else if (model === "ras_perle") {
          const m = mul(rotX(Math.PI / 2), mul(trans(0, by - 0.28, 0), scale(0.30, 0.30, 0.30)));
          add(sphere(1, 24, 16), m, { color: gc, spec: 0.9, shine: 60 });
        } else {
          const m = mul(rotX(Math.PI / 2), mul(trans(0, by - 0.05, 0), scale(0.34, 0.34, 0.34)));
          add(brilliant(1), m, gemObj());
        }
        break;
      }
      case "creoles": case "pendantes": case "puces": {
        [-0.62, 0.62].forEach(ox => {
          if (model === "creoles") {
            add(torus(0.42, 0.075, 40, 14), mul(rotX(Math.PI / 2), trans(ox, 0.15, 0)), metalObj());
            const m = mul(rotX(Math.PI / 2), mul(trans(ox, 0.15 - 0.42, 0), scale(0.13, 0.13, 0.13)));
            add(brilliant(1), m, gemObj());
          } else if (model === "puces") {
            const m = mul(trans(ox, 0.05, 0), scale(0.24, 0.24, 0.24));
            add(brilliant(1), m, gemObj());
          } else {
            add(torus(0.16, 0.045, 20, 10, Math.PI * 1.2), mul(rotX(Math.PI / 2), trans(ox, 0.55, 0)), metalObj());
            const m = mul(trans(ox, 0.16, 0), scale(0.30, 0.30, 0.30));
            add(brilliant(1), m, gemObj());
          }
        });
        break;
      }
      default:
        add(torus(1.0, 0.15, 64, 24), bandM, metalObj());
    }
    return S;
  }

  /* ---------- Moteur de rendu ---------- */
  const VS = `
    attribute vec3 aPos; attribute vec3 aNor;
    uniform mat4 uProj, uView, uModel;
    varying vec3 vPos; varying vec3 vNor;
    void main(){
      vec4 wp = uModel * vec4(aPos,1.0);
      vPos = wp.xyz; vNor = mat3(uModel[0].xyz, uModel[1].xyz, uModel[2].xyz) * aNor;
      gl_Position = uProj * uView * wp;
    }`;
  const FS = `
    precision mediump float;
    varying vec3 vPos; varying vec3 vNor;
    uniform vec3 uColor, uCam;
    uniform float uSpec, uShine;
    void main(){
      vec3 N = normalize(vNor);
      vec3 base = uColor;
      vec3 amb = base * 0.42 + vec3(0.10,0.09,0.07);
      vec3 col = amb;
      vec3 L1 = normalize(vec3(0.6, 0.9, 0.5));  vec3 L2 = normalize(vec3(-0.7, 0.35, 0.6)); vec3 L3 = normalize(vec3(0.1, -0.2, -0.9));
      vec3 cols[3]; cols[0]=vec3(1.0,0.96,0.88); cols[1]=vec3(0.85,0.88,1.0); cols[2]=vec3(1.0,0.85,0.70);
      vec3 Ls[3]; Ls[0]=L1; Ls[1]=L2; Ls[2]=L3;
      for(int i=0;i<3;i++){
        float d = max(dot(N, Ls[i]), 0.0);
        vec3 V = normalize(uCam - vPos);
        vec3 H = normalize(Ls[i] + V);
        float s = pow(max(dot(N,H),0.0), uShine) * uSpec;
        col += base * cols[i] * d * 0.75 + vec3(1.0) * s * 0.9;
      }
      // léger reflet "studio" en haut
      float rim = pow(1.0 - max(dot(N, normalize(uCam - vPos)), 0.0), 3.0);
      col += vec3(1.0,0.98,0.92) * rim * 0.25;
      gl_FragColor = vec4(col, 1.0);
    }`;

  function create(canvas, model, opts) {
    opts = opts || {};
    const gl = canvas.getContext("webgl", { alpha: true, antialias: true }) || canvas.getContext("experimental-webgl", { alpha: true, antialias: true });
    if (!gl) { canvas.style.display = "none"; return null; }
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);

    function sh(type, src) {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
      return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); gl.useProgram(prog);
    const loc = {
      aPos: gl.getAttribLocation(prog, "aPos"), aNor: gl.getAttribLocation(prog, "aNor"),
      uProj: gl.getUniformLocation(prog, "uProj"), uView: gl.getUniformLocation(prog, "uView"),
      uModel: gl.getUniformLocation(prog, "uModel"), uColor: gl.getUniformLocation(prog, "uColor"),
      uCam: gl.getUniformLocation(prog, "uCam"), uSpec: gl.getUniformLocation(prog, "uSpec"),
      uShine: gl.getUniformLocation(prog, "uShine"),
    };

    const metal = opts.metal || "or", gem = opts.gem || "diamant";
    const scene = buildScene(model, metal, gem);
    const meshes = scene.map(o => {
      const pb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(o.geo.pos), gl.STATIC_DRAW);
      const nb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, nb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(o.geo.nor), gl.STATIC_DRAW);
      const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(o.geo.idx), gl.STATIC_DRAW);
      return { pb, nb, ib, count: o.geo.idx.length, color: o.color, spec: o.spec, shine: o.shine };
    });

    let rx = -0.35, ry = 0.6, dist = opts.dist || 3.6, targetDist = dist, auto = true, dragging = false, px = 0, py = 0, raf = null, visible = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = w * dpr; canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function frame() {
      if (!visible) { raf = null; return; }
      resize();
      if (auto && !dragging) ry += 0.006;
      dist += (targetDist - dist) * 0.12;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const asp = canvas.width / canvas.height;
      const proj = perspective(38 * Math.PI / 180, asp, 0.1, 50);
      const view = mul(trans(0, -0.15, -dist), mul(rotX(rx), rotY(ry)));
      // caméra monde (avant view) : position approximative pour les reflets
      const camPos = [dist * Math.sin(ry) * Math.cos(rx), -0.15 + dist * Math.sin(rx) * -1 + 0, dist * Math.cos(ry) * Math.cos(rx)];
      gl.uniformMatrix4fv(loc.uProj, false, new Float32Array(proj));
      gl.uniformMatrix4fv(loc.uView, false, new Float32Array(view));
      gl.uniform3fv(loc.uCam, camPos);
      meshes.forEach(m => {
        gl.uniformMatrix4fv(loc.uModel, false, new Float32Array(ident()));
        gl.uniform3fv(loc.uColor, m.color);
        gl.uniform1f(loc.uSpec, m.spec); gl.uniform1f(loc.uShine, m.shine);
        gl.bindBuffer(gl.ARRAY_BUFFER, m.pb);
        gl.enableVertexAttribArray(loc.aPos); gl.vertexAttribPointer(loc.aPos, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, m.nb);
        gl.enableVertexAttribArray(loc.aNor); gl.vertexAttribPointer(loc.aNor, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.ib);
        gl.drawElements(gl.TRIANGLES, m.count, gl.UNSIGNED_SHORT, 0);
      });
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && visible) raf = requestAnimationFrame(frame); }

    canvas.addEventListener("pointerdown", e => { dragging = true; auto = false; px = e.clientX; py = e.clientY; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener("pointermove", e => {
      if (!dragging) return;
      ry += (e.clientX - px) * 0.01; rx += (e.clientY - py) * 0.01;
      rx = Math.max(-1.4, Math.min(1.4, rx));
      px = e.clientX; py = e.clientY;
    });
    ["pointerup", "pointercancel"].forEach(ev => canvas.addEventListener(ev, () => { dragging = false; setTimeout(() => { if (!dragging) auto = true; }, 2500); }));
    canvas.addEventListener("wheel", e => { e.preventDefault(); targetDist = Math.max(2.4, Math.min(6, targetDist + e.deltaY * 0.0022)); }, { passive: false });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) start(); }, { threshold: 0.05 }).observe(canvas);
    }
    window.addEventListener("resize", () => { if (visible) { resize(); } });
    start();
    return { restart: start };
  }

  window.Ballin3D = { create };
})();

#!/usr/bin/env python3
# Generateur d'actifs SVG pour BALLIN Paris (aucune dependance externe).
import os, math, re

ROOT = os.path.join(os.path.dirname(__file__), "..", "assets", "img")
P = os.path.join(ROOT, "products")
G = os.path.join(ROOT, "pages")
os.makedirs(P, exist_ok=True)
os.makedirs(G, exist_ok=True)

METALS = {
    "or":      ("#F7E7BE", "#D9B36A", "#A97F3F", "#8A6428"),
    "blanc":   ("#F7F7F5", "#DCDCD8", "#B9B9B3", "#96968F"),
    "rose":    ("#F9DCC9", "#E2AC8D", "#C08368", "#9C6450"),
    "platine": ("#F0F2F4", "#CFD5DA", "#AAB3BA", "#868F96"),
}
GEMS = {
    "diamant": ("#FFFFFF", "#EAF1FB", "#B9CDEA", "#8FA8CC"),
    "saphir":  ("#7FA8F0", "#2F5BC4", "#16337F", "#0B2258"),
    "emeraude":("#8FE3B0", "#1F9D5C", "#0B5C36", "#063A22"),
    "rubis":   ("#F28B8B", "#C22E3E", "#7A1220", "#4D0A14"),
    "perle":   ("#FFFFFF", "#F3EAD9", "#D9CBB0", "#B8A888"),
    "aigue":   ("#BFE8F2", "#5FB8CC", "#2E7E96", "#1B5568"),
}

def metal_grad(name, gid):
    c = METALS[name]
    return (f'<linearGradient id="{gid}" x1="0" y1="0" x2="1" y2="1">'
            f'<stop offset="0" stop-color="{c[0]}"/><stop offset=".45" stop-color="{c[1]}"/>'
            f'<stop offset=".75" stop-color="{c[2]}"/><stop offset="1" stop-color="{c[3]}"/></linearGradient>')

def gem_radial(name, gid):
    c = GEMS[name]
    return (f'<radialGradient id="{gid}" cx=".38" cy=".32" r=".85">'
            f'<stop offset="0" stop-color="{c[0]}"/><stop offset=".4" stop-color="{c[1]}"/>'
            f'<stop offset=".75" stop-color="{c[2]}"/><stop offset="1" stop-color="{c[3]}"/></radialGradient>')

def sparkle(x, y, s, op=0.9):
    return (f'<path d="M {x} {y-s} L {x+s*0.22} {y-s*0.22} L {x+s} {y} L {x+s*0.22} {y+s*0.22} '
            f'L {x} {y+s} L {x-s*0.22} {y+s*0.22} L {x-s} {y} L {x-s*0.22} {y-s*0.22} Z" '
            f'fill="#FFFFFF" opacity="{op}"/>')

def bg(w, h, gid="bg"):
    return (f'<radialGradient id="{gid}" cx=".5" cy=".38" r=".9">'
            f'<stop offset="0" stop-color="#FFFDF8"/><stop offset=".6" stop-color="#FAF4E9"/>'
            f'<stop offset="1" stop-color="#F1E8D8"/></radialGradient>'
            f'<rect width="{w}" height="{h}" fill="url(#{gid})"/>'
            f'<circle cx="{w*0.5}" cy="{h*0.42}" r="{min(w,h)*0.42}" fill="#FFFFFF" opacity="0.35"/>')

def shadow(cx, cy, rx, ry=18, op=0.18):
    return (f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#8A6F45" opacity="{op}" '
            f'filter="url(#blur)"/>')

def defs_common(metal, gem):
    return (f'<filter id="blur" x="-50%" y="-50%" width="200%" height="200%">'
            f'<feGaussianBlur stdDeviation="10"/></filter>'
            f'<filter id="soft" x="-50%" y="-50%" width="200%" height="200%">'
            f'<feGaussianBlur stdDeviation="3"/></filter>'
            + metal_grad(metal, "m") + gem_radial(gem, "g")
            + '<linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">'
              '<stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>')

def band(cx, cy, r, metal, w=34, gid="m"):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="url(#{gid})" stroke-width="{w}"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="{w*0.28}" '
            f'stroke-dasharray="{r*1.2} {r*5}" stroke-dashoffset="-{r*0.6}" stroke-linecap="round"/>')

def brilliant(cx, cy, s, gem):
    # diamant taille brillant, vue de cote : couronne trapeze + pavilion
    pts_top = [(cx-s, cy-s*0.15), (cx+s, cy-s*0.15), (cx+s*0.55, cy-s*0.85), (cx-s*0.55, cy-s*0.85)]
    poly = " ".join(f"{x},{y}" for x, y in pts_top)
    out = [f'<polygon points="{poly}" fill="url(#g)" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="2"/>',
           f'<polygon points="{cx-s*0.55},{cy-s*0.85} {cx+s*0.55},{cy-s*0.85} {cx},{cy+s*0.95}" fill="url(#g)" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="2"/>',
           f'<line x1="{cx-s*0.55}" y1="{cy-s*0.85}" x2="{cx-s*0.28}" y2="{cy+s*0.95}" stroke="#fff" stroke-opacity=".6" stroke-width="1.4"/>',
           f'<line x1="{cx+s*0.55}" y1="{cy-s*0.85}" x2="{cx+s*0.28}" y2="{cy+s*0.95}" stroke="#fff" stroke-opacity=".6" stroke-width="1.4"/>',
           f'<line x1="{cx-s*0.28}" y1="{cy-s*0.15}" x2="{cx-s*0.28}" y2="{cy+s*0.95}" stroke="#fff" stroke-opacity=".45" stroke-width="1.2"/>',
           f'<line x1="{cx+s*0.28}" y1="{cy-s*0.15}" x2="{cx+s*0.28}" y2="{cy+s*0.95}" stroke="#fff" stroke-opacity=".45" stroke-width="1.2"/>',
           f'<line x1="{cx-s}" y1="{cy-s*0.15}" x2="{cx+s}" y2="{cy-s*0.15}" stroke="#fff" stroke-opacity=".8" stroke-width="1.6"/>',
           f'<polygon points="{cx-s*0.55},{cy-s*0.85} {cx+s*0.55},{cy-s*0.85} {cx+s*0.3},{cy-s*0.45} {cx-s*0.3},{cy-s*0.45}" fill="url(#shine)" opacity=".8"/>']
    return "".join(out)

def prongs(cx, cy, r, s):
    ys = cy - r - s*0.15
    return "".join(f'<line x1="{cx+d}" y1="{ys+8}" x2="{cx+d*0.5}" y2="{cy-s*0.9}" stroke="#C9A86A" stroke-width="5" stroke-linecap="round"/>'
                   for d in (-s*0.75, s*0.75))

def ring_svg(metal, gem, s=1.0, halo=False):
    cx, cy, r = 400, 470, 165
    g = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">',
         f'<defs>{defs_common(metal, gem)}</defs>', bg(800, 800), shadow(cx, cy+r+42, 200, 22)]
    if halo:
        g.append(f'<circle cx="{cx}" cy="{cy-r+6}" r="{118*s}" fill="none" stroke="url(#m)" stroke-width="14"/>')
        for i in range(10):
            a = i/10*2*math.pi
            g.append(f'<circle cx="{cx+118*s*math.cos(a)}" cy="{cy-r+6+118*s*math.sin(a)}" r="9" fill="url(#g)" stroke="#fff" stroke-opacity=".7" stroke-width="1.5"/>')
        g.append(brilliant(cx, cy-r-8, 92*s, gem))
    else:
        g.append(prongs(cx, cy, r, 96*s))
        g.append(brilliant(cx, cy-r-14, 96*s, gem))
    g.append(band(cx, cy, r, metal))
    g.append(sparkle(cx-120, cy-r-70, 26) + sparkle(cx+140, cy-r-30, 18, .8) + sparkle(cx+60, cy-r-160, 14, .7))
    g.append('</svg>')
    return "".join(g)

def alliance_svg(metal, gems=False):
    cx, cy, r = 400, 420, 185
    w = 40
    g = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">',
         f'<defs>{defs_common(metal, "diamant")}</defs>', bg(800, 800), shadow(cx, cy+r+40, 210, 22)]
    g.append(band(cx, cy, r, metal, w))
    if gems:
        for i in range(12):
            a = -math.pi/2 + i/12*2*math.pi
            g.append(f'<circle cx="{cx+r*math.cos(a)}" cy="{cy+r*math.sin(a)}" r="10" fill="url(#g)" stroke="#fff" stroke-opacity=".75" stroke-width="1.5"/>')
    else:
        g.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#8A6F45" stroke-opacity=".35" stroke-width="2" stroke-dasharray="1 7"/>')
    g.append(sparkle(cx-150, cy-120, 20, .7) + sparkle(cx+160, cy+40, 14, .6))
    g.append('</svg>')
    return "".join(g)

def gem_round(cx, cy, r, gem):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#g)" stroke="#FFFFFF" stroke-opacity=".65" stroke-width="2"/>'
            f'<ellipse cx="{cx-r*0.3}" cy="{cy-r*0.35}" rx="{r*0.42}" ry="{r*0.26}" fill="#FFFFFF" opacity=".55"/>')

def rosette(cx, cy, r, metal, gem):
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r*0.45}" fill="url(#g)" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>']
    for i in range(8):
        a = i/8*2*math.pi
        out.append(f'<ellipse cx="{cx+r*0.62*math.cos(a)}" cy="{cy+r*0.62*math.sin(a)}" rx="{r*0.42}" ry="{r*0.24}" '
                   f'fill="url(#g)" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" transform="rotate({math.degrees(a)+90} {cx+r*0.62*math.cos(a)} {cy+r*0.62*math.sin(a)})"/>')
    return "".join(out)

def bague_svg(metal, gem, style="solitaire"):
    cx, cy, r = 400, 480, 160
    g = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">',
         f'<defs>{defs_common(metal, gem)}</defs>', bg(800, 800), shadow(cx, cy+r+40, 190, 20)]
    if style == "rosace":
        g.append(f'<circle cx="{cx}" cy="{cy-r+4}" r="86" fill="none" stroke="url(#m)" stroke-width="16"/>')
        g.append(rosette(cx, cy-r-4, 78, metal, gem))
    elif style == "chevaliere":
        g.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="url(#m)" stroke-width="26"/>')
        g.append(f'<ellipse cx="{cx}" cy="{cy-r-16}" rx="92" ry="46" fill="url(#m)" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>')
        g.append(f'<ellipse cx="{cx-24}" cy="{cy-r-30}" rx="34" ry="12" fill="url(#shine)" opacity=".8"/>')
        g.append(f'<circle cx="{cx}" cy="{cy-r-16}" r="20" fill="url(#g)" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>')
    else:  # perle
        g.append(prongs(cx, cy, r, 70))
        g.append(gem_round(cx, cy-r-20, 62, gem))
        g.append(sparkle(cx-90, cy-r-60, 16, .8))
    g.append(band(cx, cy, r, metal, 30))
    g.append('</svg>')
    return "".join(g)

def bracelet_svg(metal, gem, style="jonc"):
    cx, cy, rx, ry = 400, 400, 235, 150
    g = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">',
         f'<defs>{defs_common(metal, gem)}</defs>', bg(800, 800), shadow(cx, cy+ry+46, 240, 20)]
    w = 46 if style == "manchette" else 22
    g.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" stroke="url(#m)" stroke-width="{w}"/>')
    g.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="{w*0.3}" '
             f'stroke-dasharray="{rx*1.5} {rx*6}" stroke-linecap="round"/>')
    if style == "riviere":
        for i in range(7):
            t = -math.pi/2 + (i-3)*0.32
            g.append(gem_round(cx+rx*math.cos(t)*1.0, cy+ry*math.sin(t)*1.0-6, 20, gem))
        g.append(sparkle(cx-60, cy-ry-24, 18) + sparkle(cx+90, cy-ry+6, 12, .7))
    elif style == "manchette":
        for i in range(9):
            a = -math.pi/2 + (i-4)*0.22
            l = 30 if i != 4 else 44
            x1, y1 = cx+(rx-26)*math.cos(a), cy+(ry-18)*math.sin(a)
            x2, y2 = cx+(rx-26+l)*math.cos(a), cy+(ry-18+l*0.6)*math.sin(a)
            g.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="url(#m)" stroke-width="10" stroke-linecap="round"/>')
        g.append(gem_round(cx, cy-ry-30, 26, gem))
    else:
        g.append(gem_round(cx, cy-ry-8, 22, gem) if gem == "diamant" else "")
    g.append('</svg>')
    return "".join(g)

def collier_svg(metal, gem, style="pendentif"):
    cx, cy = 400, 330
    g = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">',
         f'<defs>{defs_common(metal, gem)}</defs>', bg(800, 800), shadow(cx, 640, 150, 16, .12)]
    # chaine en perles
    for i in range(41):
        t = i/40*math.pi  # demi-cercle ouvert vers le bas
        x = cx + 250*math.cos(math.pi - t)
        y = cy - 150 + 250*math.sin(t)*1.0
        r = 7 if i % 2 == 0 else 5.4
        g.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="url(#m)" stroke="#fff" stroke-opacity=".4" stroke-width="1"/>')
    py = cy + 100
    if style == "riviere":
        for i in range(5):
            t = i - 2
            g.append(gem_round(cx + t*52, py - abs(t)*8 + 18, 24 - abs(t)*3, gem))
        g.append(sparkle(cx-140, py-10, 18) + sparkle(cx+150, py+16, 14, .8))
    else:
        g.append(f'<line x1="{cx}" y1="{py-6}" x2="{cx}" y2="{py+34}" stroke="url(#m)" stroke-width="6"/>')
        if style == "ras" or gem == "perle":
            g.append(gem_round(cx, py+64, 46, gem))
        else:
            g.append(brilliant(cx, py+52, 58, gem))
        g.append(sparkle(cx-90, py+10, 18) + sparkle(cx+95, py+70, 13, .75))
    g.append('</svg>')
    return "".join(g)

def boucles_svg(metal, gem, style="creoles"):
    g = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">',
         f'<defs>{defs_common(metal, gem)}</defs>', bg(800, 800)]
    for ox in (270, 530):
        if style == "creoles":
            g.append(f'<circle cx="{ox}" cy="360" r="95" fill="none" stroke="url(#m)" stroke-width="20"/>')
            g.append(f'<circle cx="{ox}" cy="360" r="95" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="6" stroke-dasharray="120 500" stroke-linecap="round"/>')
            g.append(gem_round(ox, 360+95, 26, gem))
        elif style == "puces":
            g.append(f'<circle cx="{ox}" cy="380" r="46" fill="url(#g)" stroke="#fff" stroke-opacity=".7" stroke-width="2.5"/>')
            g.append(f'<ellipse cx="{ox-14}" cy="{366}" rx="16" ry="10" fill="#fff" opacity=".6"/>')
        else:  # pendantes
            g.append(f'<path d="M {ox} 300 q 26 30 0 62" fill="none" stroke="url(#m)" stroke-width="10" stroke-linecap="round"/>')
            g.append(f'<circle cx="{ox}" cy="372" r="14" fill="url(#m)"/>')
            g.append(brilliant(ox, 452, 52, gem))
    g.append(sparkle(200, 250, 18, .8) + sparkle(600, 230, 14, .7) + sparkle(610, 520, 16, .75))
    g.append('</svg>')
    return "".join(g)

# ---------------- LOGO ----------------
def logo_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 160">
<defs>
 <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#C9A86A"/><stop offset=".5" stop-color="#A9834B"/><stop offset="1" stop-color="#8A6A3C"/>
 </linearGradient>
 <radialGradient id="dg" cx=".35" cy=".3" r=".9">
  <stop offset="0" stop-color="#FFFFFF"/><stop offset=".45" stop-color="#E9F0FA"/><stop offset="1" stop-color="#A9BEDC"/>
 </radialGradient>
</defs>
<g>
 <polygon points="80,18 112,44 80,96 48,44" fill="url(#dg)" stroke="url(#lg)" stroke-width="3"/>
 <line x1="48" y1="44" x2="112" y2="44" stroke="#C9A86A" stroke-width="1.6"/>
 <line x1="80" y1="18" x2="66" y2="44" stroke="#fff" stroke-width="1.2" opacity=".9"/>
 <line x1="80" y1="18" x2="94" y2="44" stroke="#fff" stroke-width="1.2" opacity=".9"/>
 <line x1="66" y1="44" x2="80" y2="96" stroke="#fff" stroke-width="1" opacity=".7"/>
 <line x1="94" y1="44" x2="80" y2="96" stroke="#fff" stroke-width="1" opacity=".7"/>
</g>
<text x="140" y="82" font-family="Cormorant Garamond, Playfair Display, Georgia, serif" font-size="64" letter-spacing="14" fill="#2E2A25">BALLIN</text>
<text x="143" y="112" font-family="Jost, Montserrat, Arial, sans-serif" font-size="15" letter-spacing="9" fill="#A9834B">PARIS</text>
<line x1="142" y1="126" x2="330" y2="126" stroke="#C9A86A" stroke-width="1"/>
<text x="338" y="131" font-family="Jost, Montserrat, Arial, sans-serif" font-size="13" letter-spacing="4" fill="#7A7166">JOAILLERIE</text>
</svg>'''

def logo_mark_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
<defs>
 <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C9A86A"/><stop offset="1" stop-color="#8A6A3C"/></linearGradient>
 <radialGradient id="dg" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#E9F0FA"/><stop offset="1" stop-color="#A9BEDC"/></radialGradient>
</defs>
<circle cx="80" cy="80" r="74" fill="#FBF7EF" stroke="url(#lg)" stroke-width="3"/>
<polygon points="80,34 116,64 80,122 44,64" fill="url(#dg)" stroke="url(#lg)" stroke-width="3"/>
<line x1="44" y1="64" x2="116" y2="64" stroke="#C9A86A" stroke-width="1.6"/>
<line x1="80" y1="34" x2="64" y2="64" stroke="#fff" stroke-width="1.3"/><line x1="80" y1="34" x2="96" y2="64" stroke="#fff" stroke-width="1.3"/>
<line x1="64" y1="64" x2="80" y2="122" stroke="#fff" stroke-width="1.1" opacity=".75"/><line x1="96" y1="64" x2="80" y2="122" stroke="#fff" stroke-width="1.1" opacity=".75"/>
</svg>'''

# ---------------- BANNIERES PAGES ----------------
def banner(w, h, title_word, piece):
    # composition abstraite : grand bijou stylisé à droite, halos dorés
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid slice">
<defs>{defs_common("or", "diamant")}
 <radialGradient id="hb" cx=".72" cy=".45" r=".55"><stop offset="0" stop-color="#FFFDF6" stop-opacity=".9"/><stop offset="1" stop-color="#F3EAD8" stop-opacity="0"/></radialGradient>
</defs>
<rect width="{w}" height="{h}" fill="#F8F2E7"/>
<circle cx="{w*0.72}" cy="{h*0.45}" r="{h*0.75}" fill="url(#hb)"/>
<circle cx="{w*0.2}" cy="{h*0.85}" r="{h*0.5}" fill="#F1E7D2" opacity=".6"/>
{piece}
</svg>'''

def hero_home():
    ring = ring_svg("or", "diamant", 1.0, halo=True)
    # extraire le groupe interne
    inner = ring.split("</defs>", 1)[1].rsplit("</svg>", 1)[0]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
<defs>{defs_common("or", "diamant")}
 <radialGradient id="hb" cx=".68" cy=".42" r=".6"><stop offset="0" stop-color="#FFFDF6"/><stop offset="1" stop-color="#F5EDDD"/></radialGradient>
 <linearGradient id="wash" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FBF7EF" stop-opacity=".95"/><stop offset=".55" stop-color="#FBF7EF" stop-opacity=".4"/><stop offset="1" stop-color="#FBF7EF" stop-opacity="0"/></linearGradient>
</defs>
<rect width="1600" height="900" fill="#F8F2E7"/>
<circle cx="1120" cy="400" r="560" fill="url(#hb)"/>
<circle cx="260" cy="820" r="300" fill="#F1E7D2" opacity=".55"/>
<circle cx="1460" cy="120" r="180" fill="#F3EAD8" opacity=".7"/>
<g transform="translate(760 60) scale(1.05)">{inner}</g>
<rect width="1600" height="900" fill="url(#wash)"/>
</svg>'''

def _round(m):
    v = float(m.group())
    r = round(v, 1)
    return str(int(r)) if r == int(r) else str(r)

def write(path, content):
    content = re.sub(r"\d+\.\d{3,}", _round, content)  # arrondit les flottants longs
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("ok", path)

PRODUCTS_IMG = [
    ("solitaire-aube", ring_svg("or", "diamant", 1.0)),
    ("solitaire-riviere", ring_svg("blanc", "diamant", 1.05)),
    ("trilogie-trois-voeux", ring_svg("or", "diamant", 0.9, halo=False)),
    ("halo-couronne", ring_svg("rose", "diamant", 1.1, halo=True)),
    ("alliance-eternite", alliance_svg("or", False)),
    ("alliance-eternite-diamants", alliance_svg("blanc", True)),
    ("alliance-bombee", alliance_svg("rose", False)),
    ("alliance-deux-ames", alliance_svg("or", False)),
    ("bague-rosace", bague_svg("or", "saphir", "rosace")),
    ("bague-perle", bague_svg("blanc", "perle", "perle")),
    ("chevaliere-heritage", bague_svg("or", "diamant", "chevaliere")),
    ("bracelet-ligne", bracelet_svg("or", "diamant", "jonc")),
    ("bracelet-riviere", bracelet_svg("blanc", "diamant", "riviere")),
    ("bracelet-manchette", bracelet_svg("rose", "rubis", "manchette")),
    ("collier-goutte", collier_svg("or", "diamant", "pendentif")),
    ("collier-riviere", collier_svg("blanc", "diamant", "riviere")),
    ("collier-ras-perle", collier_svg("or", "perle", "ras")),
    ("boucles-creoles", boucles_svg("or", "diamant", "creoles")),
    ("boucles-pendantes", boucles_svg("blanc", "diamant", "pendantes")),
    ("boucles-puces", boucles_svg("rose", "diamant", "puces")),
]

for name, svg in PRODUCTS_IMG:
    write(os.path.join(P, name + ".svg"), svg)

write(os.path.join(ROOT, "logo.svg"), logo_svg())
write(os.path.join(ROOT, "logo-mark.svg"), logo_mark_svg())
write(os.path.join(ROOT, "favicon.svg"), logo_mark_svg())
write(os.path.join(G, "hero-home.svg"), hero_home())

# Bannieres categories (piece = extrait du svg produit correspondant, mis à droite)
def banner_from(img_svg, w=1600, h=640):
    inner = img_svg.split("</defs>", 1)[1].rsplit("</svg>", 1)[0]
    inner = inner.replace('viewBox="0 0 800 800"', "")
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid slice">
<defs>{defs_common("or", "diamant")}
 <radialGradient id="hb" cx=".7" cy=".5" r=".55"><stop offset="0" stop-color="#FFFDF6" stop-opacity=".95"/><stop offset="1" stop-color="#F5EDDD" stop-opacity="0"/></radialGradient>
 <linearGradient id="wash" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F8F2E7" stop-opacity=".96"/><stop offset=".5" stop-color="#F8F2E7" stop-opacity=".35"/><stop offset="1" stop-color="#F8F2E7" stop-opacity="0"/></linearGradient>
</defs>
<rect width="{w}" height="{h}" fill="#F8F2E7"/>
<circle cx="{w*0.72}" cy="{h*0.5}" r="{h*1.15}" fill="url(#hb)"/>
<g transform="translate({w*0.72-260} {h*0.5-280}) scale(0.72)">{inner}</g>
<rect width="{w}" height="{h}" fill="url(#wash)"/>
</svg>'''

banners = {
    "cat-fiancailles.svg": ring_svg("or", "diamant", 1.05, halo=True),
    "cat-alliances.svg": alliance_svg("or", True),
    "cat-joaillerie.svg": collier_svg("or", "diamant", "pendentif"),
    "cat-bagues.svg": bague_svg("or", "saphir", "rosace"),
    "cat-bracelets.svg": bracelet_svg("or", "diamant", "riviere"),
    "cat-colliers.svg": collier_svg("blanc", "diamant", "riviere"),
    "cat-boucles.svg": boucles_svg("or", "diamant", "creoles"),
}
for name, svg in banners.items():
    write(os.path.join(G, name), banner_from(svg))

# Pages maison : compositions abstraites chaleureuses
def maison_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
<defs><radialGradient id="a" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#FFFDF6"/><stop offset="1" stop-color="#F3EAD8"/></radialGradient>
<linearGradient id="go" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E9CD9A"/><stop offset="1" stop-color="#B08D57"/></linearGradient></defs>
<rect width="1200" height="700" fill="#F8F2E7"/><circle cx="600" cy="330" r="430" fill="url(#a)"/>
<circle cx="600" cy="330" r="240" fill="none" stroke="url(#go)" stroke-width="3" opacity=".8"/>
<circle cx="600" cy="330" r="170" fill="none" stroke="#D9C29A" stroke-width="1.4" stroke-dasharray="2 8"/>
<polygon points="600,180 668,240 600,380 532,240" fill="#EFF4FB" stroke="url(#go)" stroke-width="3"/>
<line x1="532" y1="240" x2="668" y2="240" stroke="#C9A86A" stroke-width="1.6"/>
<path d="M 240 560 q 360 90 720 0" fill="none" stroke="#D9C29A" stroke-width="2" opacity=".7"/>
<circle cx="330" cy="180" r="5" fill="#C9A86A"/><circle cx="880" cy="160" r="4" fill="#C9A86A"/><circle cx="920" cy="480" r="5" fill="#C9A86A"/>
</svg>'''

def atelier_svg():
    steps = ""
    for i, (x, label) in enumerate([(150, ""), (420, ""), (690, ""), (960, "")]):
        steps += (f'<circle cx="{x}" cy="300" r="54" fill="#FFFDF8" stroke="#D9C29A" stroke-width="2"/>'
                  f'<circle cx="{x}" cy="300" r="40" fill="none" stroke="#E7D9BE" stroke-width="1.5" stroke-dasharray="3 6"/>'
                  f'<text x="{x}" y="312" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="#A9834B">{i+1}</text>')
        if i < 3:
            steps += f'<line x1="{x+62}" y1="300" x2="{x+216}" y2="300" stroke="#D9C29A" stroke-width="2" stroke-dasharray="4 6"/>'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 560" preserveAspectRatio="xMidYMid slice">
<defs><radialGradient id="a" cx=".5" cy=".35" r=".9"><stop offset="0" stop-color="#FFFDF6"/><stop offset="1" stop-color="#F4ECDC"/></radialGradient></defs>
<rect width="1200" height="560" fill="#F8F2E7"/><ellipse cx="600" cy="220" rx="520" ry="200" fill="url(#a)"/>
{steps}
<path d="M 120 430 q 480 70 960 0" fill="none" stroke="#D9C29A" stroke-width="2" opacity=".6"/>
</svg>'''

def pierres_svg():
    gems = [("saphir", 260, 300, 90), ("emeraude", 480, 220, 70), ("rubis", 620, 360, 100), ("diamant", 860, 250, 80), ("aigue", 760, 470, 60)]
    out = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 620" preserveAspectRatio="xMidYMid slice">',
           '<defs>' + defs_common("or", "diamant")]
    for gname, _, _, _ in gems:
        out.append(gem_radial(gname, "g_" + gname))
    out.append('<radialGradient id="a" cx=".5" cy=".4" r=".85"><stop offset="0" stop-color="#FFFDF6"/><stop offset="1" stop-color="#F4ECDC"/></radialGradient></defs>')
    out.append('<rect width="1200" height="620" fill="#F8F2E7"/><ellipse cx="600" cy="300" rx="540" ry="250" fill="url(#a)"/>')
    for gname, x, y, s in gems:
        out.append(f'<g transform="translate({x} {y})"><polygon points="0,{-s} {s*0.8},{-s*0.25} {s*0.5},{s} {-s*0.5},{s} {-s*0.8},{-s*0.25}" fill="url(#g_{gname})" stroke="#fff" stroke-opacity=".7" stroke-width="2.5"/>'
                   f'<line x1="{-s*0.8}" y1="{-s*0.25}" x2="{s*0.8}" y2="{-s*0.25}" stroke="#fff" stroke-opacity=".8" stroke-width="1.5"/>'
                   f'<line x1="0" y1="{-s}" x2="0" y2="{s}" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/></g>')
    out.append('</svg>')
    return "".join(out)

write(os.path.join(G, "maison.svg"), maison_svg())
write(os.path.join(G, "atelier.svg"), atelier_svg())
write(os.path.join(G, "pierres.svg"), pierres_svg())
write(os.path.join(G, "sav.svg"), banner_from(ring_svg("or", "diamant", 0.9)))
write(os.path.join(G, "contact.svg"), banner_from(collier_svg("or", "perle", "ras")))
write(os.path.join(G, "engagements.svg"), banner_from(boucles_svg("or", "emeraude", "pendantes")))
write(os.path.join(G, "garanties.svg"), banner_from(alliance_svg("or", True)))
write(os.path.join(G, "cgv.svg"), banner_from(bracelet_svg("or", "diamant", "riviere")))
write(os.path.join(G, "livraison.svg"), banner_from(collier_svg("or", "diamant", "pendentif")))
print("TERMINE")

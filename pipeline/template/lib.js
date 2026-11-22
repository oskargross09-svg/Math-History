// =====================================================================
// Bibliothek für die Shorts "Math History" / "Geschichte der Mathematik"
// Design System: https://claude.ai/code/artifact/cebb52f8-9993-406c-9a61-3673a0d21b0d
// Eine Episode liefert scenes.js mit  SCENES = { <beat-id>(t, b) { return svg } }  und  function CUES(add) {…}
// window.CFG = {lang, timing:{total,beats:[{id,start,end,text}]}, ep:<episode.json>, logo:{vb, inner}}
// =====================================================================
const CFG = window.CFG;
const LANG = CFG.lang;
const EP = CFG.ep;
const TM = CFG.timing;
const B = {}; TM.beats.forEach((b, i) => { B[b.id] = b; b.i = i; });
const ORDER = TM.beats.map(b => b.id);
const END_START = TM.total + 0.15;
const END_DUR = 2.4;
const DURATION = END_START + END_DUR;

// ---------- Tokens ----------
const K = {schwarz:'#111111', weiss:'#F4F4F0', gd:'#3A3A3A', gh:'#A6A6A6', haut:'#F5C9A0', haarGrau:'#DCDCDC',
  haarBraun:'#6B4226', haarDunkel:'#3B2A1E', blau:'#2F5D8A', rot:'#D23A2A', gruen:'#5E9A3C', gelb:'#F2B33D',
  orange:'#F08A24', braun:'#7A4A2A', creme:'#F1E7D3', senf:'#D9A441', wasser:'#7CC4E8', holz:'#B5793F', metall:'#8A8F98',
  pergament:'#EBD9AE', zunge:'#E2725B', tafelgruen:'#2E4A3A', silber:'#DCDCDC'};
const FD = 'font-family="Kalam" font-weight="700"';
const FT = 'font-family="Patrick Hand"';
// Layout (1080 × 1920): Safe Zones oben 240, unten 480, links 64, rechts 160
const X0 = 64, X1 = 920, CX = 492, TITLE_Y = 330, FLOOR = 1262;

// Texte der Episode in der aktuellen Sprache:  T('ort')
const TX = EP.text[LANG];
const T = k => { if (!(k in TX)) throw new Error('Text fehlt: ' + k); return TX[k]; };

// ---------- Zeit & Easing ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = x => Math.pow(clamp(x), 3);
const easeInOut = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const backOut = x => { x = clamp(x); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const prog = (t, a, d) => clamp((t - a) / d);          // 0→1 zwischen a und a+d
const pop = (t, a, d = .35) => t < a ? 0 : backOut((t - a) / d);  // Skalierung mit Überschwingen
const idle = (t, f = 1.6, a = 4) => Math.sin(t * f) * a;
const blinkAt = (t, seed) => ((t + seed * 1.7) % 3.3) < 0.12;
// Zeitpunkt eines Stichworts im gesprochenen Beat: kw('bad','tiefer') – Stichwort aus text.<lang>.kw.<key>
function kw(id, key) {
  const b = B[id]; const w = (TX.kw || {})[key]; if (w === undefined) throw new Error('Stichwort fehlt: kw.' + key);
  const i = b.text.indexOf(w); if (i < 0) console.warn('Stichwort nicht im Text: ' + w);
  return b.start + (i < 0 ? 0 : i / b.text.length) * (b.end - b.start);
}

// ---------- SVG-Grundformen (Kontur figur-kontur, runde Enden) ----------
const ST = 'stroke="#111111" stroke-linejoin="round" stroke-linecap="round"';
const P = (d, f, w = 5, ex = '') => `<path d="${d}" fill="${f}" ${ST} stroke-width="${w}" ${ex}/>`;
const LN = (d, w = 3.5) => `<path d="${d}" fill="none" ${ST} stroke-width="${w}"/>`;
const E = (cx, cy, rx, ry, f, w = 5, ex = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" ${ST} stroke-width="${w}" ${ex}/>`;
const C = (cx, cy, r, f, w = 5) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}" ${ST} stroke-width="${w}"/>`;
const R = (x, y, w, h, rx, f, sw = 5, ex = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" ${ST} stroke-width="${sw}" ${ex}/>`;
const cloud = (cs, col, sw = 10) => `<g fill="#111111" stroke="#111111" stroke-width="${sw}">${cs.map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}"/>`).join('')}</g><g fill="${col}">${cs.map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}"/>`).join('')}</g>`;
const G = (tr, inner, ex = '') => `<g transform="${tr}" ${ex}>${inner}</g>`;
const RIM = 'filter="url(#rim)"';   // weisser Aussenrand (Sticker-Look) – auf jede Figur/jedes Requisit
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ---------- Kreide ----------
const mctx = document.createElement('canvas').getContext('2d');
function tw(txt, size, disp) { mctx.font = disp ? `700 ${size}px Kalam` : `${size}px "Patrick Hand"`; return mctx.measureText(txt).width; }
function wrap(txt, size, disp, maxW) {
  const out = []; let cur = '';
  for (const w of String(txt).split(' ')) { const c = cur ? cur + ' ' + w : w; if (tw(c, size, disp) > maxW && cur) { out.push(cur); cur = w; } else cur = c; }
  if (cur) out.push(cur); return out;
}
let CLIPN = 0, DEFS = [];
// Kreidetext mit Schreib-Animation. o: {size, disp(Kalam, Standard true), anchor, color, p(0..1), ex}
// Grössen: titel-xl 120 · titel 88 · formel 96 · zwischentitel 64 (Kalam) · untertitel 56 · text 44 · notiz 34 · quelle 28 (Patrick Hand)
function chalkText(txt, x, y, o = {}) {
  const size = o.size || 64, disp = o.disp !== false, anchor = o.anchor || 'start', col = o.color || K.weiss;
  const p = o.p === undefined ? 1 : o.p; if (p <= 0) return '';
  const w = tw(txt, size, disp); const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  const id = 'c' + (CLIPN++);
  DEFS.push(`<clipPath id="${id}"><rect x="${x0 - 10}" y="${y - size * 1.3}" width="${(w + 20) * p}" height="${size * 1.8}"/></clipPath>`);
  return `<text x="${x}" y="${y}" ${disp ? FD : FT} font-size="${size}" fill="${col}" text-anchor="${anchor}" clip-path="url(#${id})" filter="url(#chalk)" ${o.ex || ''}>${esc(txt)}</text>`;
}
// Mehrzeiliger Kreidetext (umbrochen auf maxW), Zeilen nacheinander geschrieben
function chalkBlock(txt, x, y, o = {}) {
  const size = o.size || 64, disp = o.disp !== false, lh = o.lh || size * 1.08;
  const lines = wrap(txt, size, disp, o.maxW || (X1 - x)); const p = o.p === undefined ? 1 : o.p;
  return lines.map((l, i) => chalkText(l, x, y + i * lh, {...o, p: clamp(p * lines.length - i)})).join('');
}
// Kreidelinie mit Zeichen-Animation (Pfad d, Fortschritt p). Strich 9 px = kreide-strich
function chalkLine(d, p = 1, w = 9, col = K.weiss) {
  if (p <= 0) return '';
  return `<path d="${d}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${1 - clamp(p)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" filter="url(#chalkL)"/>`;
}
function chalkArrow(x1, y1, x2, y2, p = 1, w = 9) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 26;
  const l = `M${x1},${y1} L${x2},${y2}`;
  const hd = `M${x2 - h * Math.cos(a - .5)},${y2 - h * Math.sin(a - .5)} L${x2},${y2} L${x2 - h * Math.cos(a + .5)},${y2 - h * Math.sin(a + .5)}`;
  return chalkLine(l, clamp(p * 1.4), w) + chalkLine(hd, clamp(p * 3 - 2), w);
}
const chalkCheck = (x, y, p = 1, s = 1) => chalkLine(`M${x},${y} l${22 * s},${24 * s} l${46 * s},${-56 * s}`, p, 10);
const chalkCross = (x, y, r, p = 1) => chalkLine(`M${x - r},${y - r} L${x + r},${y + r}`, clamp(p * 2), 11) + chalkLine(`M${x + r},${y - r} L${x - r},${y + r}`, clamp(p * 2 - 1), 11);
const chalkUnderline = (x1, x2, y, p = 1) => chalkLine(`M${x1},${y} Q${(x1 + x2) / 2},${y + 14} ${x2},${y - 6}`, p, 9);

// ---------- Figuren (Arbeitsfläche 400 × 600, Füsse bei 200/560) ----------
const EXPR = {
  freundlich: {augen: '<circle cx="168" cy="160" r="8" fill="#111111"/><circle cx="171" cy="157" r="2.6" fill="#ffffff"/><circle cx="232" cy="160" r="8" fill="#111111"/><circle cx="235" cy="157" r="2.6" fill="#ffffff"/>',
    brauen: LN('M154,138 Q168,131 182,137', 6) + LN('M218,137 Q232,131 246,138', 6), mund: LN('M184,233 Q200,245 216,233', 5)},
  staunen: {augen: '<circle cx="168" cy="160" r="10" fill="#111111"/><circle cx="171" cy="157" r="2.6" fill="#ffffff"/><circle cx="232" cy="160" r="10" fill="#111111"/><circle cx="235" cy="157" r="2.6" fill="#ffffff"/>',
    brauen: LN('M152,128 Q168,116 184,126', 6) + LN('M216,126 Q232,116 248,128', 6), mund: '<ellipse cx="200" cy="234" rx="9" ry="12" fill="#111111"/>'},
  denken: {augen: '<circle cx="172" cy="155" r="8" fill="#111111"/><circle cx="175" cy="152" r="2.6" fill="#ffffff"/><circle cx="236" cy="155" r="8" fill="#111111"/><circle cx="239" cy="152" r="2.6" fill="#ffffff"/>',
    brauen: LN('M154,140 L182,139', 6) + LN('M218,128 Q233,118 247,125', 6), mund: LN('M190,233 Q203,228 214,231', 5)},
  lachen: {augen: LN('M158,163 Q168,149 178,163', 5) + LN('M222,163 Q232,149 242,163', 5),
    brauen: LN('M154,134 Q168,126 182,132', 6) + LN('M218,132 Q232,126 246,134', 6),
    mund: P('M178,222 Q200,254 222,222 Z', '#111111', 4) + '<path d="M190,235 Q200,231 210,235 Q200,240 190,235 Z" fill="#E2725B"/>'},
  verwirrt: {augen: '<circle cx="168" cy="160" r="8" fill="#111111"/><circle cx="171" cy="157" r="2.6" fill="#ffffff"/><circle cx="232" cy="160" r="6" fill="#111111"/><circle cx="235" cy="157" r="2.6" fill="#ffffff"/>',
    brauen: LN('M154,131 L182,140', 6) + LN('M218,136 Q232,130 246,128', 6), mund: LN('M182,232 Q191,224 200,232 Q209,240 218,232', 5)},
  zwinkern: {augen: '<circle cx="168" cy="160" r="8" fill="#111111"/><circle cx="171" cy="157" r="2.6" fill="#ffffff"/>' + LN('M222,160 Q232,168 242,160', 5),
    brauen: LN('M154,136 Q168,129 182,135', 6) + LN('M218,141 Q232,137 246,142', 6), mund: LN('M186,230 Q205,238 218,223', 5)},
};
const BLINK = LN('M158,161 Q168,166 178,161', 5) + LN('M222,161 Q232,166 242,161', 5);
const HAIR = {
  locken: [[109.4,145.1,27],[117.3,122.3,27],[131.6,102.5,27],[151.2,87.1,27],[174.6,77.3,27],[200,74,27],[225.4,77.3,27],[248.8,87.1,27],[268.4,102.5,27],[282.7,122.3,27],[290.6,145.1,27],[160,92,26],[240,92,26],[200,84,26]],
  seiten: [[112,128,20],[102,150,22],[106,176,20],[288,128,20],[298,150,22],[294,176,20]],
};
const BEARDS = {
  voll: [[130,200,20],[140,228,24],[164,252,26],[200,262,28],[236,252,26],[260,228,24],[270,200,20],[200,236,34]],
  gross: [[126,196,26],[132,230,30],[156,262,32],[200,282,36],[244,262,32],[268,230,30],[274,196,26],[200,240,44],[170,225,30],[230,225,30]],
  kurz: [[150,236,18],[176,252,20],[200,258,22],[224,252,20],[250,236,18],[200,240,24]],
};
const OHREN = E(107, 172, 15, 22, K.haut) + E(293, 172, 15, 22, K.haut) + LN('M104,164 Q98,174 106,182') + LN('M296,164 Q302,174 294,182');

// Kopf. o: {haar:'locken'|'kurz'|'glatze'|'dutt'|'lang'|'keins', haarFarbe, bart:'voll'|'gross'|'kurz'|null, bartFarbe,
//           kopf:'lorbeer'|'diadem'|'zipfel'|null, brille, expr, blink, schweiss}
function head(o) {
  const ex = EXPR[o.expr || 'freundlich']; const hc = o.haarFarbe || K.haarBraun;
  const bearded = !!o.bart; const dy = bearded ? 9 : 0;
  let s = '';
  if (o.haar === 'glatze') s += cloud(HAIR.seiten, hc);
  if (o.haar === 'dutt') s += P('M88,205 L88,150 A112,96 0 0 1 312,150 L312,205 Q312,222 292,222 L108,222 Q88,222 88,205 Z', hc) + C(200, 56, 26, hc);
  if (o.haar === 'lang') s += P('M86,150 Q86,58 200,56 Q314,58 314,150 L326,312 Q200,334 74,312 Z', hc);
  s += OHREN + E(200, 165, 95, 88, K.haut);
  if (o.haar === 'locken') s += cloud(HAIR.locken, hc);
  if (o.haar === 'kurz') s += P('M104,150 Q110,82 200,74 Q290,82 296,150 Q272,122 236,116 Q226,128 206,124 Q170,110 140,124 Q118,132 104,150 Z', hc);
  if (o.haar === 'dutt' || o.haar === 'lang') s += P('M104,150 Q110,82 200,74 Q290,82 296,150 Q270,118 226,110 Q214,128 196,126 Q160,112 104,150 Z', hc);
  if (o.haar === 'glatze') s += LN('M110,132 Q200,58 290,132', 4);
  s += o.blink ? BLINK : ex.augen;
  s += ex.brauen;
  if (bearded) s += cloud(BEARDS[o.bart] || BEARDS.voll, o.bartFarbe || hc);
  s += G(`translate(0 ${dy})`, ex.mund);
  if (bearded && o.bart !== 'kurz') s += cloud([[180, 216, 13], [220, 216, 13]], o.bartFarbe || hc, 8);
  s += E(200, 196, 20, 18, K.haut);
  if (o.brille) s += '<circle cx="168" cy="160" r="19" fill="#ffffff" fill-opacity=".18" stroke="#111111" stroke-width="4.5"/><circle cx="232" cy="160" r="19" fill="#ffffff" fill-opacity=".18" stroke="#111111" stroke-width="4.5"/>' + LN('M187,158 Q200,150 213,158', 4.5) + LN('M149,156 L118,150', 4) + LN('M251,156 L282,150', 4);
  if (o.kopf === 'lorbeer') for (let i = 0; i < 13; i++) { const a = Math.PI * (1 - i / 12); const x = 200 + 92 * Math.cos(a), y = 132 - 60 * Math.sin(a) ; s += E(x.toFixed(1), y.toFixed(1), 15, 7, K.gruen, 3.5, `transform="rotate(${(i % 2 ? 40 : -20) + (180 - a * 180 / Math.PI)} ${x.toFixed(1)} ${y.toFixed(1)})"`); }
  if (o.kopf === 'diadem') { // hellenistisches Königsdiadem: weisses Stoffband
    s += `<path d="M106,124 Q200,86 294,124" fill="none" stroke="#111111" stroke-width="24" stroke-linecap="round"/><path d="M106,124 Q200,86 294,124" fill="none" stroke="${K.creme}" stroke-width="14" stroke-linecap="round"/>`;
    s += P('M104,128 Q86,150 92,176 L104,172 Q100,152 114,134 Z', K.creme, 4) + P('M110,132 Q104,160 116,184 L126,176 Q116,156 120,138 Z', K.creme, 4) + C(200, 98, 9, K.gelb, 3.5);
  }
  if (o.kopf === 'zipfel') s += P('M100,140 Q104,66 200,60 Q262,62 292,110 L350,150 Q362,132 346,118 L300,92 Q262,40 200,40 Q108,46 100,140 Z', o.kopfFarbe || K.rot) + P('M98,136 Q200,104 302,136 L302,150 Q200,118 98,150 Z', K.creme, 4) + C(356, 150, 14, K.creme, 4);
  if (o.schweiss) s += P('M300,112 q-12,18 0,26 q12,-8 0,-26 Z', K.wasser, 3.5);
  return s;
}
// Hand: 'faust' | 'zeigen' | 'offen'. side +1 = rechte Hand der Figur (Betrachter links)
function hand(type, side) {
  if (type === 'zeigen') return R(-6.5, 62, 13, 40, 6.5, K.haut, 4.5) + C(0, 62, 17, K.haut) + E(-13 * side, 58, 7, 10, K.haut, 4, `transform="rotate(${30 * side} ${-13 * side} 58)"`);
  if (type === 'offen') {
    let s = '';
    [[-16, 18, -11], [-8.5, 6, -3.5], [-1, -6, 4], [6, -18, 11]].forEach(f => s += R(f[0], 68, 10, 24, 5, K.haut, 4, `transform="rotate(${f[1]} ${f[2]} 70)"`));
    return s + C(0, 62, 18, K.haut) + E(-17 * side, 54, 7, 11, K.haut, 4, `transform="rotate(${50 * side} ${-17 * side} 54)"`);
  }
  return C(0, 60, 18, K.haut);
}
// Arm mit Schulter-/Ellbogenwinkel; prop = Requisit in der Hand (bleibt aufrecht)
function arm(px, py, S, Eb, sleeve, handType, side, prop, forearm) {
  let lower = R(-15, -12, 30, 62, 15, forearm || K.haut);
  if (prop) lower += G(`translate(0 62) rotate(${-(S + Eb)})`, prop);
  lower += hand(handType, side);
  return G(`translate(${px} ${py}) rotate(${S})`, G(`translate(0 58) rotate(${Eb})`, lower) + R(-16, -14, 32, 76, 16, sleeve));
}
// Körper je Kleidung. o.kleidung: 'toga' (Antike) | 'gewand' (Mittelalter) | 'kleid' | 'anzug' (Neuzeit)
function bodyParts(o) {
  const f = o.farbe || K.creme;
  let legs = '', body = '', sleeve = f, forearm = K.haut;
  if (o.kleidung === 'gewand') {
    legs = E(163, 546, 30, 14, K.haarDunkel) + E(237, 546, 30, 14, K.haarDunkel);
    body = P('M140,262 Q200,246 260,262 L300,532 Q200,550 100,532 Z', f) + LN('M170,400 Q166,470 160,530') + LN('M232,400 Q238,470 244,530');
    body += R(126, 372, 148, 26, 8, o.guertel || K.braun, 4.5);
    forearm = f;
  } else if (o.kleidung === 'kleid') {
    legs = [[150, 163], [212, 237]].map(l => R(l[0], 482, 38, 60, 12, K.haarDunkel) + E(l[1], 546, 30, 14, '#111111')).join('');
    body = P('M142,262 Q200,248 258,262 L266,380 L296,500 Q200,516 104,500 L134,380 Z', f) + P('M174,256 L200,290 L226,256 Q200,268 174,256 Z', '#ffffff', 4) + LN('M134,380 Q200,392 266,380', 4) + C(200, 312, 4.5, '#111111', 0) + C(200, 340, 4.5, '#111111', 0);
    forearm = f;
  } else if (o.kleidung === 'anzug') {
    legs = [[150, 163], [212, 237]].map(l => R(l[0], 470, 38, 72, 12, o.hose || K.gd) + E(l[1], 546, 30, 14, '#111111')).join('');
    body = P('M142,262 Q200,248 258,262 L272,486 Q200,500 128,486 Z', f) + P('M176,258 L200,300 L224,258 Q200,266 176,258 Z', '#ffffff', 4);
    if (o.krawatte) body += P('M194,286 L206,286 L212,360 L200,376 L188,360 Z', o.krawatte, 4);
    body += LN('M200,300 L200,486', 3.5) + C(186, 380, 4.5, '#111111', 0) + C(186, 420, 4.5, '#111111', 0);
    forearm = f;
  } else { // toga
    legs = [[150, 169, 163], [212, 231, 237]].map(l => R(l[0], 490, 38, 52, 12, K.haut) + LN(`M${l[0] + 2},530 L${l[0] + 36},538`, 4) + E(l[2], 546, 30, 14, K.braun)).join('');
    body = P('M140,262 Q200,246 260,262 L292,508 Q200,524 108,508 Z', f) + LN('M160,330 Q170,420 150,500') + LN('M245,350 Q238,430 252,505');
  }
  if (o.schuerze) body += P('M146,318 L254,318 L268,500 Q200,512 132,500 Z', o.schuerze) + LN('M150,322 L172,262', 4) + LN('M250,322 L228,262', 4) + LN('M140,350 L260,350', 4);
  if (o.schaerpe) body += P('M136,268 Q160,250 192,258 L292,472 Q290,500 268,506 Z', o.schaerpe) + C(160, 270, 9, K.gelb, 3.5);
  return {legs, body, sleeve, forearm};
}
// Stehende Figur. spec = Aussehen (siehe FIG), pose = {rS,rE,lS,lE (Grad), rH,lH (Hand), rProp,lProp, expr, blink, tilt, armsFront, schweiss, above}
function figure(spec, pose) {
  const bp = bodyParts(spec);
  const aR = arm(142, 276, pose.rS, pose.rE, bp.sleeve, pose.rH || 'faust', 1, pose.rProp, bp.forearm);
  const aL = arm(258, 276, pose.lS, pose.lE, bp.sleeve, pose.lH || 'faust', -1, pose.lProp, bp.forearm);
  const hd = G(`rotate(${pose.tilt || 0} 200 252)`, head({...spec, expr: pose.expr, blink: pose.blink, schweiss: pose.schweiss}));
  return bp.legs + bp.body + (pose.armsFront ? '' : aR + aL) + hd + (pose.armsFront ? aR + aL : '') + (pose.above || '');
}
// Figur platzieren: Füsse bei (x, y), Skalierung s (1 = 600 px hoch). Max. 2 Figuren pro Szene.
function place(x, y, s, inner, ex = '') { return `<g transform="translate(${x - 200 * s} ${y - 560 * s}) scale(${s})" ${RIM} ${ex}>${inner}</g>`; }
// Standardposen (Schulter/Ellbogen aus dem Design System)
const POSE = {
  stehen: {rS: 14, rE: 6, lS: -14, lE: -6},
  zeigen: {rS: 14, rE: 6, lS: -118, lE: -38, lH: 'zeigen'},           // linker Arm hoch, zeigt nach rechts oben
  zeigenSeite: {rS: 14, rE: 6, lS: -100, lE: -10, lH: 'zeigen'},      // zeigt waagrecht nach rechts
  geben: {rS: 14, rE: 6, lS: -78, lE: -22},                            // hält etwas nach rechts hin (lProp)
  staunen: {rS: 125, rE: 30, lS: -125, lE: -30, rH: 'offen', lH: 'offen'},
  denken: {rS: -20, rE: -135, lS: -14, lE: -6, armsFront: true},
  halten: {rS: 40, rE: -95, lS: -40, lE: 95, armsFront: true},          // beide Hände vor dem Bauch
};
// Fertige Figuren. Eigene Figuren: {...FIG.x, haarFarbe: …} oder neu nach Epochen-Regeln (max. 3 Kleidungsfarben)
const FIG = {
  archimedes: {kleidung: 'toga', farbe: K.creme, schaerpe: K.rot, haar: 'locken', haarFarbe: K.haarBraun, bart: 'voll'},
  pythagoras: {kleidung: 'toga', farbe: K.creme, schaerpe: K.blau, haar: 'glatze', haarFarbe: K.haarGrau, bart: 'gross', kopf: 'lorbeer'},
  hieron: {kleidung: 'toga', farbe: K.creme, schaerpe: K.blau, haar: 'locken', haarFarbe: K.haarDunkel, bart: 'voll', kopf: 'diadem'},
  handwerker: {kleidung: 'toga', farbe: K.creme, schuerze: K.braun, haar: 'kurz', haarFarbe: K.haarDunkel},
  euklid: {kleidung: 'toga', farbe: K.creme, schaerpe: K.gruen, haar: 'glatze', haarFarbe: K.haarGrau, bart: 'voll', bartFarbe: K.haarGrau},
  hypatia: {kleidung: 'toga', farbe: K.creme, schaerpe: K.blau, haar: 'dutt', haarFarbe: K.haarDunkel},
  fibonacci: {kleidung: 'gewand', farbe: K.gruen, guertel: K.braun, haar: 'kurz', haarFarbe: K.haarDunkel, bart: 'kurz', bartFarbe: K.haarDunkel, kopf: 'zipfel', kopfFarbe: K.rot},
  noether: {kleidung: 'kleid', farbe: K.senf, haar: 'dutt', haarFarbe: K.haarDunkel, brille: true},
  gelehrterNeuzeit: {kleidung: 'anzug', farbe: K.blau, krawatte: K.rot, haar: 'kurz', haarFarbe: K.haarBraun, brille: true},
};
const blinkFig = (t, seed) => blinkAt(t, seed);

// ---------- Requisiten ----------
function crown(s = 1) { // goldener Kranz
  let r = `<ellipse cx="0" cy="0" rx="86" ry="30" fill="none" stroke="#111111" stroke-width="20"/><ellipse cx="0" cy="0" rx="86" ry="30" fill="none" stroke="${K.gelb}" stroke-width="10"/>`;
  const leaves = [];
  for (let i = 0; i < 16; i++) { const a = Math.PI * 2 * i / 16; leaves.push([86 * Math.cos(a), 30 * Math.sin(a), a]); }
  leaves.sort((a, b) => a[1] - b[1]);
  leaves.forEach(([x, y, a], i) => { const rot = (Math.cos(a) * 60 + (i % 2 ? 35 : -35)); r += E(x.toFixed(1), (y - 10).toFixed(1), 22, 10, K.gelb, 4, `transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${(y - 10).toFixed(1)})"`); });
  return G(`scale(${s})`, r + C(0, 22, 9, K.rot, 3.5));
}
const goldbar = (s = 1, col = K.gelb) => G(`scale(${s})`, P('M-58,18 L-40,-18 L40,-18 L58,18 Z', col) + LN('M-36,-6 L36,-6', 3.5));
const lump = (s = 1, col = K.gelb) => G(`scale(${s})`, P('M-34,10 Q-40,-14 -16,-22 Q8,-34 26,-18 Q42,-4 32,14 Q10,26 -34,10 Z', col));
function bulb(s = 1) { // Idee-Glühbirne
  let r = '';
  [[-58.3, -31.2, -82.7, -40.1], [-35.6, -60.8, -50.5, -82.1], [0, -72, 0, -98], [35.6, -60.8, 50.5, -82.1], [58.3, -31.2, 82.7, -40.1]].forEach(a => r += `<path d="M${a[0]},${a[1]} L${a[2]},${a[3]}" stroke="${K.orange}" stroke-width="9" stroke-linecap="round"/>`);
  r += P('M-22,30 Q-22,16 -32,4 A42,42 0 1 1 32,4 Q22,16 22,30 Z', K.gelb) + LN('M-12,26 L-8,-6 Q0,-16 8,-6 L12,26', 4) + LN('M-8,-6 Q-12,-20 0,-18 Q12,-20 8,-6', 4);
  r += R(-22, 28, 44, 22, 5, K.metall) + LN('M-20,36 L20,40') + LN('M-20,44 L20,48') + P('M-12,50 L12,50 L6,60 L-6,60 Z', '#111111', 3);
  return G(`scale(${s})`, r);
}
function cube(side, col) { // flacher Würfel, Boden-Mitte bei 0,0
  const d = side * 0.38, h = side, x0 = -side / 2 - d / 2;
  return P(`M${x0},0 L${x0 + side},0 L${x0 + side},${-h} L${x0},${-h} Z`, col) +
    P(`M${x0},${-h} L${x0 + d},${-h - d} L${x0 + side + d},${-h - d} L${x0 + side},${-h} Z`, col) +
    P(`M${x0 + side},0 L${x0 + side + d},${-d} L${x0 + side + d},${-h - d} L${x0 + side},${-h} Z`, col);
}
const drop = (x, y, s = 1) => G(`translate(${x} ${y}) scale(${s})`, P('M0,-10 q-9,14 0,20 q9,-6 0,-20 Z', K.wasser, 3.5));
const dreieck = (s = 1) => G(`scale(${s})`, P('M-18,22 L-18,-78 L74,22 Z', K.gelb) + LN('M2,22 L2,2 L-18,2', 4));
const kreide = (s = 1) => G(`scale(${s})`, R(-6, -6, 12, 36, 4, '#ffffff', 4, 'transform="rotate(-20)"'));
function schriftrolle(s = 1) {
  return G(`scale(${s})`, R(-90, -60, 180, 120, 6, K.pergament) + E(-90, 0, 16, 64, K.pergament) + E(90, 0, 16, 64, K.pergament) + LN('M-60,-30 L60,-30 M-60,-8 L50,-8 M-60,14 L60,14 M-60,36 L30,36', 4));
}
function zirkel(s = 1) {
  return G(`scale(${s})`, LN('M0,-60 L-40,60', 9) + `<path d="M0,-60 L-40,60" stroke="${K.metall}" stroke-width="4" stroke-linecap="round"/>` + LN('M0,-60 L40,60', 9) + `<path d="M0,-60 L40,60" stroke="${K.metall}" stroke-width="4" stroke-linecap="round"/>` + C(0, -64, 10, K.gelb, 4));
}
// Kreidetafel-Requisit (Holzrahmen, Tafelgrün). inner = Kreide-SVG in Tafelkoordinaten (-114..114 × -64..64)
function tafel(s = 1, inner = '') {
  return G(`scale(${s})`, `<path d="M-90,70 L-110,150 M90,70 L110,150" stroke="#111111" stroke-width="12" stroke-linecap="round"/><path d="M-90,70 L-110,150 M90,70 L110,150" stroke="${K.holz}" stroke-width="5" stroke-linecap="round"/>` +
    R(-130, -80, 260, 160, 10, K.holz) + R(-114, -64, 228, 128, 4, K.tafelgruen, 4) + inner);
}
// Balkenwaage: Sockel bei (cx, baseY), Balken bei beamY, Halblänge half, Winkel ang (Grad, + = rechts tiefer)
function balance(cx, baseY, beamY, half, ang, leftProp = '', rightProp = '') {
  const a = ang * Math.PI / 180;
  const ax = cx - half * Math.cos(a), ay = beamY - half * Math.sin(a), bx = cx + half * Math.cos(a), by = beamY + half * Math.sin(a);
  let w = P(`M${cx - 90},${baseY} L${cx + 90},${baseY} L${cx + 60},${baseY - 28} L${cx - 60},${baseY - 28} Z`, K.holz) + R(cx - 16, beamY, 32, baseY - 28 - beamY, 8, K.holz) + C(cx, beamY - 30, 18, K.metall);
  const pan = (x, y, prop) => LN(`M${x},${y} L${x - 80},${y + 190} M${x},${y} L${x + 80},${y + 190}`, 5) + G(`translate(${x} ${y + 172})`, prop) + E(x, y + 196, 100, 20, K.metall) + C(x, y, 9, K.metall, 4);
  w += pan(ax, ay, leftProp) + pan(bx, by, rightProp);
  w += G(`rotate(${ang} ${cx} ${beamY})`, R(cx - half - 14, beamY - 11, 2 * half + 28, 22, 11, K.metall));
  return `<g ${RIM}>${w}</g>`;
}
// Archimedes in der Holzwanne (400 × 480; Boden der Wanne bei y=592). o: {rS,rE,hand,headDy,expr,blink,tilt,spritzer,goneX,goneY,bulb}
function tubScene(o) {
  const sx = o.goneX || 0, sy = o.goneY || 0;
  let s = E(200, 430, 182, 34, K.holz) + E(200, 430, 164, 24, K.wasser);
  let person = arm(122, 438, o.rS, o.rE, K.haut, o.hand || 'offen', 1) + arm(278, 438, -o.rS, -o.rE, K.haut, o.hand || 'offen', -1);
  person += G(`translate(0 ${128 + (o.headDy || 0)}) rotate(${o.tilt || 0} 200 252)`, head({...FIG.archimedes, expr: o.expr, blink: o.blink}));
  if (o.bulb) person += o.bulb;
  s += G(`translate(${sx} ${sy})`, person);
  s += P('M120,436 Q140,424 160,434 Q180,422 200,434 Q220,422 240,434 Q260,424 280,436 Q200,452 120,436 Z', K.wasser, 4);
  s += P('M18,430 A182,34 0 0 0 382,430 L370,566 Q366,592 336,592 L64,592 Q34,592 30,566 Z', K.holz) +
    P('M22,478 Q200,508 378,478 L376,496 Q200,526 24,496 Z', K.metall, 4) + P('M30,548 Q200,576 370,548 L368,566 Q200,594 32,566 Z', K.metall, 4) +
    LN('M90,467 L85,582') + LN('M150,463 L147,582') + LN('M250,463 L252,582') + LN('M310,467 L315,582');
  return s + (o.spritzer || '');
}
// Wanne platzieren: Boden-Mitte bei (x, y), Skalierung s
const placeTub = (x, y, s, inner) => `<g transform="translate(${x} ${y}) scale(${s}) translate(-200 -592)" ${RIM}>${inner}</g>`;

// ---------- Hintergrund & Filter ----------
function background() {
  let s = `<rect width="1080" height="1920" fill="${K.schwarz}"/>`;
  [[160, 520, 260, 60, -8], [880, 300, 220, 40, 6], [760, 1560, 300, 70, -4], [240, 1700, 260, 50, 5], [940, 1100, 160, 90, 0], [120, 1150, 140, 80, 10]]
    .forEach(b => s += `<ellipse cx="${b[0]}" cy="${b[1]}" rx="${b[2]}" ry="${b[3]}" fill="${K.gd}" opacity=".22" transform="rotate(${b[4]} ${b[0]} ${b[1]})" filter="url(#smudge)"/>`);
  s += `<path d="M90,1500 q200,-30 380,10" stroke="${K.gd}" stroke-width="14" fill="none" opacity=".35" stroke-linecap="round" filter="url(#chalkL)"/>`;
  s += `<path d="M640,640 q120,-20 260,6" stroke="${K.gd}" stroke-width="10" fill="none" opacity=".3" stroke-linecap="round" filter="url(#chalkL)"/>`;
  return s;
}
const CHALK_FX = '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G" result="d"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.35" result="a"/><feComposite in="d" in2="a" operator="in"/>';
const FILTERS = `<filter id="rim" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d"/><feFlood flood-color="#F4F4F0"/><feComposite in2="d" operator="in" result="rim"/><feMerge><feMergeNode in="rim"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="chalk" x="-5%" y="-20%" width="110%" height="140%">${CHALK_FX}</filter>
<filter id="chalkL" filterUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920">${CHALK_FX}</filter>
<filter id="smudge" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="18"/></filter>`;

// ---------- Untertitel (untertitel 56 px, max. 2 Zeilen à 28 Zeichen, direkt über der unteren Safe Zone) ----------
function chunksFor(b) {
  const wrapC = txt => { const out = []; let cur = ''; for (const w of txt.split(' ')) { const c = cur ? cur + ' ' + w : w; if (c.length > 28 && cur) { out.push(cur); cur = w; } else cur = c; } if (cur) out.push(cur); return out; };
  const sents = (b.text.match(/[^.!?:]+[.!?:]+[»“"']?\s*|[^.!?:]+$/g) || [b.text]).map(x => x.trim()).filter(Boolean);
  const groups = [];
  for (const se of sents) {
    const ls = wrapC(se); const last = groups[groups.length - 1];
    if (ls.length === 1 && last && last.length === 1 && (last[0] + ' ' + ls[0]).length <= 56) {
      const merged = wrapC(last[0] + ' ' + ls[0]); if (merged.length <= 2) { groups[groups.length - 1] = merged; continue; }
    }
    for (let i = 0; i < ls.length; i += 2) groups.push(ls.slice(i, i + 2));
  }
  const total = groups.reduce((a, g) => a + g.join(' ').length, 0);
  let t = b.start; const dur = b.end - b.start;
  return groups.map(g => { const d = dur * g.join(' ').length / total; const r = {lines: g, a: t, e: t + d}; t += d; return r; });
}
const SUBS = TM.beats.flatMap(chunksFor);
function subtitles(t) {
  if (t >= END_START - .1) return '';
  const c = SUBS.find(s => t >= s.a - .05 && t < s.e + .25 && !(SUBS.find(n => n !== s && t >= n.a - .05 && n.a > s.a)));
  if (!c) return '';
  const k = clamp((t - c.a + .05) / .12);
  const ys = c.lines.length === 2 ? [1352, 1419] : [1419];
  return `<g opacity="${k}" transform="translate(0 ${(1 - k) * 10})">` + c.lines.map((l, i) => `<text x="${CX}" y="${ys[i]}" ${FT} font-size="56" fill="${K.weiss}" text-anchor="middle" stroke="${K.schwarz}" stroke-width="10" paint-order="stroke" stroke-linejoin="round">${esc(l)}</text>`).join('') + '</g>';
}

// ---------- Abspann (Wortmarke + Slogan) ----------
const SLOGAN = {de: 'Jeden Tag eine wahre Geschichte aus der Mathematik.', en: 'One true story from the history of math – every day.'};
function endcard(t) {
  const lt = t - END_START; if (lt < -0.3) return '';
  const a = clamp((lt + .3) / .3);
  const vb = CFG.logo.vb, vw = +vb.split(' ')[2], vh = +vb.split(' ')[3];
  const w = LANG === 'de' ? 820 : 640, h = w * vh / vw;
  const p = easeOut(prog(lt, 0, .8));
  DEFS.push(`<clipPath id="logoClip"><rect x="${CX - w / 2 - 10}" y="0" width="${(w + 20) * p}" height="1920"/></clipPath>`);
  let s = `<g opacity="${a}"><g clip-path="url(#logoClip)"><svg x="${CX - w / 2}" y="${840 - h / 2}" width="${w}" height="${h}" viewBox="${vb}">${CFG.logo.inner}</svg></g>`;
  wrap(SLOGAN[LANG], 44, false, 760).forEach((l, i) => s += chalkText(l, CX, 1110 + i * 58, {size: 44, disp: false, anchor: 'middle', p: prog(lt, .6 + i * .3, .6)}));
  return s + '</g>';
}

// ---------- Szenen-Steuerung ----------
function sceneWindow(id) {
  const b = B[id]; const nxt = TM.beats[b.i + 1];
  return {a: b.i === 0 ? -1 : b.start - .3, e: nxt ? nxt.start - .2 : END_START + .05, b};
}
const sceneAlpha = (t, w) => Math.min(clamp((t - w.a) / .25), clamp((w.e - t) / .25));

function render(t) {
  CLIPN = 0; DEFS = [];
  let body = background();
  for (const id of ORDER) {
    const w = sceneWindow(id);
    if (t < w.a || t > w.e) continue;
    if (!SCENES[id]) throw new Error('Szene fehlt: ' + id);
    body += `<g opacity="${sceneAlpha(t, w).toFixed(3)}">${SCENES[id](t, w.b)}</g>`;
  }
  // Quelle (quelle 28 px, fg-muted) ab 1 s im letzten Beat bis zum Abspann
  const lb = TM.beats[TM.beats.length - 1];
  if (EP.text[LANG].quelle && t > lb.start + 1 && t < END_START + .2) body += chalkText(T('quelle'), X0, 1256, {size: 28, disp: false, color: K.gh, p: prog(t, lb.start + 1, .8)});
  body += endcard(t);
  body += subtitles(t);
  document.getElementById('s').innerHTML = `<defs>${FILTERS}${DEFS.join('')}</defs>` + body;
}
function cueList() {
  const c = [];
  const add = (t, n, g = 1) => c.push({t: +(+t).toFixed(3), n, g});
  if (typeof CUES === 'function') CUES(add);
  add(END_START, 'chime', .9); add(END_START + .05, 'chalk', .8);
  return c.sort((a, b) => a.t - b.t);
}
window.addEventListener('load', () => { window.RENDER = render; window.DURATION = DURATION; window.CUES_LIST = cueList; window.READY = true; });

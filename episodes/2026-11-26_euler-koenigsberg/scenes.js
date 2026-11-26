// Folge: Euler und die sieben Brücken von Königsberg – Szenen (eine Funktion pro Beat-ID aus episode.json)
// Jede Szene bekommt die globale Zeit t (s) und ihren Beat b {start,end,text}. Rückgabe: SVG-String.

// Figuren (18. Jh.) als Karikaturen
const EULER = {kleidung: 'anzug', farbe: K.braun, hose: K.gd, haar: 'kurz', haarFarbe: K.haarGrau};
const BUERGER = {kleidung: 'anzug', farbe: K.gruen, hose: K.braun, haar: 'kurz', haarFarbe: K.haarBraun};

// ---------- Königsberg-Karte (lokale Koordinaten, Mitte 0,0; ca. 780 × 420) ----------
// Landteile wie bei Euler: A Kneiphof (Insel), B Nordufer, C Südufer, D Ostteil (zwischen den Flussarmen)
const NODE = {A: [-150, 0], B: [-60, -175], C: [-60, 175], D: [260, 0]};
const RIVER = ['M-390,0 L60,0', 'M40,-20 Q170,-120 390,-130', 'M40,20 Q170,120 390,130'];
const RIVER_W = [210, 84, 84];
// Brücken: [x, y, Länge, Winkel] (a–g wie bei Euler)
const BRIDGES = [[-225, -74, 92, 90], [-85, -74, 92, 90], [-225, 74, 92, 90], [-85, 74, 92, 90], [45, 0, 130, 0], [215, -98, 104, 90], [215, 98, 104, 90]];
function fluss(p = 1) {
  if (p <= 0) return '';
  const op = `opacity="${p.toFixed(2)}"`;
  let s = '';
  RIVER.forEach((d, i) => s += `<path d="${d}" fill="none" stroke="#111111" stroke-width="${RIVER_W[i] + 12}" stroke-linecap="butt"/>`);
  RIVER.forEach((d, i) => s += `<path d="${d}" fill="none" stroke="${K.wasser}" stroke-width="${RIVER_W[i]}" stroke-linecap="butt"/>`);
  s += E(-150, 0, 132, 46, K.gd, 5); // Insel Kneiphof
  return `<g ${op} ${RIM}>${s}</g>`;
}
function bruecke(i, sc = 1) {
  if (sc <= 0) return '';
  const [x, y, l, a] = BRIDGES[i];
  return G(`translate(${x} ${y}) rotate(${a}) scale(${sc})`, R(-l / 2, -14, l, 28, 6, K.holz, 4.5) + LN(`M${-l / 2 + 10},-14 L${-l / 2 + 10},14 M${l / 2 - 10},-14 L${l / 2 - 10},14`, 3.5), RIM);
}
// komplette Karte; br(i) → Skalierung der Brücke i
function karte(x, y, s, pf, br = () => 1, op = 1) {
  let inner = fluss(pf);
  for (let i = 0; i < 7; i++) inner += bruecke(i, br(i));
  return G(`translate(${x} ${y}) scale(${s})`, inner, `opacity="${op.toFixed(2)}"`);
}
// Graph-Kanten (Kreide): [von, nach, Bogen]
const EDGES = [['A', 'B', -60], ['A', 'B', 60], ['A', 'C', 60], ['A', 'C', -60], ['A', 'D', 0], ['B', 'D', 30], ['C', 'D', -30]];
// Pfad in absolute Koordinaten umrechnen (Kreide-Filter braucht absolute Koordinaten)
const tf = (d, x, y, s) => d.replace(/(-?[\d.]+),(-?[\d.]+)/g, (m, a, b) => `${(x + a * s).toFixed(1)},${(y + b * s).toFixed(1)}`);
function kante(e, p, x0, y0, s, w = 9) {
  const [a, b, bow] = e; const [x1, y1] = NODE[a], [x2, y2] = NODE[b];
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
  const cx = mx - dy / L * bow, cy = my + dx / L * bow;
  return chalkLine(tf(`M${x1},${y1} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2},${y2}`, x0, y0, s), p, w);
}
function punkt(id, sc) { if (sc <= 0) return ''; const [x, y] = NODE[id]; return `<circle cx="${x}" cy="${y}" r="${(24 * sc).toFixed(1)}" fill="${K.weiss}"/>`; }
function graph(t, x, y, s, pDots, pEdge, dotStart) {
  let inner = '', out = '';
  EDGES.forEach((e, i) => out += kante(e, pEdge(i), x, y, s));
  ['A', 'B', 'C', 'D'].forEach((id, i) => inner += punkt(id, pDots(i)));
  return out + G(`translate(${x} ${y}) scale(${s})`, inner);
}

const SCENES = {
  hook(t, b) {
    let s = '';
    wrap(T('hook'), 88, true, 840).forEach((l, i) => s += chalkText(l, X0, TITLE_Y + i * 92, {size: 88, p: t < .05 ? 1 : prog(t, .05 + i * .3, .4)}));
    const tb = kw('hook', 'bruecken'), te = kw('hook', 'einmal');
    s += karte(CX, 880 + idle(t, 1.4, 4), .98, prog(t, 0, .4), i => pop(t, Math.min(tb - .4, .35) + i * .12, .3));
    // gestrichelter Spazierweg + großes Fragezeichen beim „einmal“
    s += chalkLine(tf('M-300,-170 Q-225,-120 -225,-74 Q-225,-20 -150,-20 Q-85,-20 -85,-74 Q-85,-150 60,-170 Q215,-170 215,-98 Q215,-30 300,0', CX, 880, .98), prog(t, te - .5, 1.2), 7);
    if (t > te) s += G(`translate(840 ${1200 + idle(t, 3, 8)}) scale(${pop(t, te, .4)}) rotate(${10 + Math.sin(t * 4) * 6})`, chalkText('?', 0, 0, {size: 160, anchor: 'middle'}));
    return s;
  },
  ort(t, b) {
    let s = chalkText(T('ort'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .7)});
    const tp = kw('ort', 'pregel'), tv = kw('ort', 'vier'), ts = kw('ort', 'sieben');
    const mx = CX, my = 860, sc = .98;
    s += karte(mx, my, sc, prog(t, b.start, .5), i => pop(t, ts - .5 + i * .1, .3));
    // Fluss-Name
    s += chalkText(T('pregel'), mx - 360 * sc, my + 175, {size: 56, disp: false, p: prog(t, tp - .1, .5)});
    s += chalkArrow(mx - 300 * sc, my + 140, mx - 290 * sc, my + 70, prog(t, tp + .2, .3), 7);
    // vier Landteile A–D
    Object.entries(NODE).forEach(([id, [x, y]], i) => {
      const off = id === 'A' ? [0, 0] : id === 'B' ? [-120, -20] : id === 'C' ? [-120, 30] : [60, 0];
      const k = pop(t, tv - .1 + i * .15, .35);
      if (k > 0) s += G(`translate(${mx + (x + off[0]) * sc} ${my + (y + off[1]) * sc + 22}) scale(${k})`, chalkText(id, 0, 0, {size: 64, anchor: 'middle'}));
    });
    // Zähler 1–7
    const n = t < ts - .5 ? 0 : Math.min(7, 1 + Math.floor((t - ts + .5) / .1));
    if (n > 0) s += chalkText('= ' + n, 640, 560, {size: 88, p: 1}) + G('translate(560 535) scale(.9)', bruecke(0, 1).replace(/translate\([^)]*\)/, 'translate(0 0)'));
    return s;
  },
  raetsel(t, b) {
    let s = chalkText(T('sonntag'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .6)});
    s += chalkText(T('ueber'), X0, TITLE_Y + 60, {size: 34, disp: false, color: K.gh, p: prog(t, b.start + .4, .5)});
    const tsn = kw('raetsel', 'sonntags'), tk = kw('raetsel', 'keiner');
    // kleine Karte oben rechts, Versuch eines Weges
    const mx = 560, my = 690, sc = .56;
    s += karte(mx, my, sc, prog(t, b.start, .4), i => pop(t, b.start + .1 + i * .06, .25));
    const path = 'M-300,-170 Q-225,-120 -225,-74 Q-225,-20 -150,-20 Q-85,-20 -85,-74 Q-85,-150 60,-170 Q215,-170 215,-98 Q215,-30 300,0 Q30,0 -150,10 Q-225,40 -225,74 Q-225,150 -60,175 Q-85,120 -85,74';
    s += chalkLine(tf(path, mx, my, sc), prog(t, tsn - .2, Math.max(.8, tk - tsn)), 7);
    if (t > tk - .1) s += chalkCross(mx - 85 * sc + 40, my + 74 * sc + 50, 40, prog(t, tk - .1, .35));
    // Spaziergänger läuft hin und her
    const walk = t < tk ? (t - b.start) : (tk - b.start);
    const fx = 220 + Math.sin(walk * 1.3) * 70;
    const sad = t > tk;
    s += place(fx, FLOOR + (sad ? 0 : -Math.abs(Math.sin(t * 7)) * 8), .62 * pop(t, b.start - .1, .4), figure(BUERGER, {...(sad ? POSE.denken : POSE.stehen), expr: sad ? 'verwirrt' : 'freundlich', blink: blinkAt(t, 2), schweiss: sad, tilt: sad ? -6 : Math.sin(t * 7) * 3}));
    if (t > tk - .1) s += G(`translate(690 ${1080 + idle(t, 2, 5)}) scale(${pop(t, tk - .1, .4)}) rotate(-4)`, chalkText(T('keiner'), 0, 0, {size: 64, anchor: 'middle'}));
    return s;
  },
  euler(t, b) {
    let s = chalkText(T('stadt'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .6)});
    const te = kw('euler', 'euler'), tb = kw('euler', 'banal'), tm = Math.min(kw('euler', 'mathe'), tb + .7);
    s += chalkText(T('name'), X0, TITLE_Y + 76, {size: 56, disp: false, p: prog(t, te - .1, .5)});
    const bored = t > tb - .1;
    s += place(280, FLOOR + idle(t, 2, 2), .8 * pop(t, b.start, .45), figure(EULER, {...(t > tm ? POSE.zeigen : bored ? POSE.denken : POSE.stehen), expr: t > tm ? 'zwinkern' : bored ? 'verwirrt' : 'freundlich', blink: blinkAt(t, 3), tilt: bored && t < tm ? 8 : 0}));
    if (t > tb - .1) s += G(`translate(690 ${640 + idle(t, 2.5, 6)}) scale(${pop(t, tb - .1, .4)}) rotate(-6)`, chalkText(T('banal'), 0, 0, {size: 120, anchor: 'middle'}));
    s += chalkText(T('mathe'), 690, 770, {size: 44, disp: false, anchor: 'middle', p: prog(t, tm - .1, .6)});
    // Brief
    const tl = b.start + .4;
    s += G(`translate(690 ${1010 + idle(t, 1.8, 5)}) scale(${.7 * pop(t, tl, .4)}) rotate(${-8 + Math.sin(t * 1.5) * 3})`, schriftrolle(1), RIM);
    s += chalkText(T('brief'), 690, 1170, {size: 34, disp: false, anchor: 'middle', color: K.gh, p: prog(t, tl + .4, .5)});
    return s;
  },
  trick(t, b) {
    let s = chalkText(T('trick'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .6)});
    const tt = kw('trick', 'trick'), tp = kw('trick', 'punkt'), tl = kw('trick', 'bruecke');
    const mx = 450, my = 820, sc = .86;
    const fade = 1 - .75 * prog(t, tp, .8);
    s += karte(mx, my, sc, 1, () => 1, fade);
    s += graph(t, mx, my, sc, i => pop(t, tp - .1 + i * .12, .35), i => prog(t, tl - .1 + i * .08, .3));
    s += chalkText(T('teil'), X0, 1110, {size: 44, disp: false, p: prog(t, tp, .5)});
    s += chalkText(T('bruecke'), X0, 1180, {size: 44, disp: false, p: prog(t, tl, .5)});
    s += place(800, FLOOR + idle(t, 2, 2), .5 * pop(t, b.start, .4), figure(EULER, {...(t > tt ? POSE.zeigen : POSE.denken), expr: t > tl ? 'lachen' : t > tt ? 'zwinkern' : 'denken', blink: blinkAt(t, 4)}));
    if (t > tt - .1 && t < tp + .5) s += G(`translate(840 ${560 + idle(t, 3, 6)}) scale(${.8 * pop(t, tt - .1, .35)})`, bulb(1), RIM);
    return s;
  },
  regel(t, b) {
    let s = chalkText(T('regel'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .5)});
    const tb = kw('regel', 'betritt'), tv = kw('regel', 'verlassen'), tg = kw('regel', 'gerade'), ts = kw('regel', 'start');
    // ein Punkt: rein → raus
    const px = 330, py = 720;
    s += `<circle cx="${px}" cy="${py}" r="${(28 * pop(t, b.start, .35)).toFixed(1)}" fill="${K.weiss}"/>`;
    s += chalkArrow(px - 240, py - 120, px - 40, py - 20, prog(t, tb - .3, .5));
    s += chalkText(T('rein'), px - 250, py - 140, {size: 44, disp: false, p: prog(t, tb, .3)});
    s += chalkArrow(px + 40, py - 20, px + 240, py - 120, prog(t, tv - .3, .5));
    s += chalkText(T('raus'), px + 200, py - 140, {size: 44, disp: false, p: prog(t, tv, .3)});
    // zweites Paar Linien (4 = gerade)
    s += chalkLine(`M${px - 240},${py + 120} L${px},${py} L${px + 240},${py + 120}`, prog(t, tg - .4, .5));
    if (t > tg - .1) {
      s += G(`translate(${px} ${py + 230}) scale(${pop(t, tg - .1, .35)})`, chalkText('2, 4, 6 …', 0, 0, {size: 64, anchor: 'middle'}));
      s += chalkText(T('gerade'), X0, 1060, {size: 44, disp: false, p: prog(t, tg, .5)}) + chalkCheck(X0 + tw(T('gerade'), 44, false) + 30, 1030, prog(t, tg + .4, .3));
    }
    s += chalkText(T('ausser'), X0, 1140, {size: 44, disp: false, p: prog(t, ts - .1, .5)});
    s += place(790, FLOOR + idle(t, 2, 2), .58 * pop(t, b.start, .4), figure(EULER, {...(t > ts ? POSE.zeigen : t > tg ? POSE.halten : POSE.denken), expr: t > ts ? 'zwinkern' : 'denken', blink: blinkAt(t, 5)}));
    return s;
  },
  zaehlen(t, b) {
    let s = chalkText(T('zaehlen'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .5)});
    const tf = kw('zaehlen', 'fuenf'), td = kw('zaehlen', 'drei'), tu = kw('zaehlen', 'ungerade'), tm = kw('zaehlen', 'unm');
    const mx = 430, my = 800, sc = .82;
    s += graph(t, mx, my, sc, i => pop(t, b.start + i * .08, .3), i => prog(t, b.start + .1 + i * .06, .3));
    const nums = [['A', '5', -40, -70, tf], ['B', '3', 60, -40, td], ['C', '3', 60, 70, td + .35], ['D', '3', 0, -60, td + .7]];
    nums.forEach(([id, n, ox, oy, a], i) => {
      const k = pop(t, a - .1, .35); if (k <= 0) return;
      const x = mx + NODE[id][0] * sc + ox, y = my + NODE[id][1] * sc + oy;
      s += G(`translate(${x} ${y}) scale(${k})`, chalkText(n, 0, 22, {size: 72, anchor: 'middle'}));
      s += chalkLine(`M${x + 44},${y} A44,44 0 1 0 ${x + 44},${y + 1}`, prog(t, tu - .1 + i * .1, .35), 6);
    });
    s += chalkText(T('ungerade'), X0, 520, {size: 56, disp: false, p: prog(t, tu, .4)});
    if (t > tm - .1) s += G(`translate(400 1150) scale(${pop(t, tm - .1, .4)}) rotate(-5)`, chalkText(T('unm'), 0, 0, {size: 110, anchor: 'middle'}));
    s += place(810, FLOOR + idle(t, 2, 2), .5 * pop(t, b.start, .4), figure(EULER, {...(t > tm ? POSE.staunen : POSE.zeigenSeite), expr: t > tm ? 'lachen' : 'freundlich', blink: blinkAt(t, 6)}));
    return s;
  },
  funfact(t, b) {
    const tg = kw('funfact', 'graph'), tn = kw('funfact', 'navi');
    let s = chalkText(T('fun'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .4)});
    if (t > tg - .1) s += G(`translate(${CX} 500) scale(${pop(t, tg - .1, .4)}) rotate(-3)`, chalkText(T('graph'), 0, 0, {size: 100, anchor: 'middle'}));
    // Strassennetz als Graph, Route leuchtet
    const pts = [[150, 680], [330, 640], [520, 700], [720, 650], [190, 860], [380, 830], [560, 900], [770, 840], [140, 1060], [340, 1030], [540, 1100], [760, 1050]];
    const ed = [[0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 6], [3, 7], [4, 5], [5, 6], [6, 7], [4, 8], [5, 9], [6, 10], [7, 11], [8, 9], [9, 10], [10, 11], [1, 4], [6, 11]];
    ed.forEach(([a, c], i) => s += chalkLine(`M${pts[a][0]},${pts[a][1]} L${pts[c][0]},${pts[c][1]}`, prog(t, b.start + .1 + i * .04, .3), 6, K.gh));
    pts.forEach(([x, y], i) => s += `<circle cx="${x}" cy="${y}" r="${(14 * pop(t, b.start + i * .04, .3)).toFixed(1)}" fill="${K.weiss}"/>`);
    const route = [8, 9, 5, 6, 7, 3];
    s += chalkLine('M' + route.map(i => pts[i].join(',')).join(' L'), prog(t, tn - .3, 1.2), 14);
    if (t > tn + .6) {
      const pin = pts[3];
      s += G(`translate(${pin[0]} ${pin[1] - 40}) scale(${pop(t, tn + .6, .35)})`, P('M0,40 Q-34,0 -30,-20 A30,30 0 1 1 30,-20 Q34,0 0,40 Z', K.rot, 5) + C(0, -20, 11, K.weiss, 4), RIM);
    }
    s += chalkText(T('navi'), CX, 1190, {size: 44, disp: false, anchor: 'middle', p: prog(t, tn, .5)});
    return s;
  },
};

// Soundeffekte: add(zeitpunkt, name, lautstärke). Namen: siehe pipeline/sfx.py (LIB)
function CUES(add) {
  add(0.0, 'pop', .7); add(0.05, 'chalk'); add(.1, 'water', .4); add(kw('hook', 'einmal'), 'boing', .8);
  add(B.ort.start, 'chalk'); add(kw('ort', 'pregel'), 'trickle', .6); add(kw('ort', 'vier') - .1, 'pop', .6);
  for (let i = 0; i < 7; i++) add(kw('ort', 'sieben') - .5 + i * .1, 'plop', .5);
  add(B.raetsel.start, 'chalk'); add(kw('raetsel', 'sonntags'), 'whoosh', .5); add(kw('raetsel', 'keiner') - .1, 'buzz', .7);
  add(B.euler.start, 'pop', .7); add(kw('euler', 'banal') - .1, 'hmm', .7); add(Math.min(kw('euler', 'mathe'), kw('euler', 'banal') + .7), 'chalk', .6);
  add(B.trick.start, 'chalk'); add(kw('trick', 'trick') - .1, 'ding', .8); add(kw('trick', 'punkt') - .1, 'pop', .7); add(kw('trick', 'bruecke') - .1, 'zip', .6);
  add(B.regel.start, 'chalk'); add(kw('regel', 'betritt') - .2, 'whoosh', .5); add(kw('regel', 'verlassen') - .2, 'whoosh', .5); add(kw('regel', 'gerade'), 'ding', .7);
  add(kw('zaehlen', 'fuenf') - .1, 'pop', .7); add(kw('zaehlen', 'drei') - .1, 'pop', .6); add(kw('zaehlen', 'unm') - .1, 'stamp', .9);
  add(B.funfact.start, 'chalk'); add(kw('funfact', 'graph') - .1, 'sparkle', .9); add(kw('funfact', 'navi') + .6, 'chime', .6);
}

// Folge: Hippasos und die irrationale Wurzel aus 2 – Szenen (eine Funktion pro Beat-ID aus episode.json)
// Jede Szene bekommt die globale Zeit t (s) und ihren Beat b {start,end,text}. Rückgabe: SVG-String.

// Figur (Süditalien, 5. Jh. v. Chr.): Hippasos als Karikatur
const HIP = {kleidung: 'toga', farbe: K.creme, schaerpe: K.senf, haar: 'kurz', haarFarbe: K.haarDunkel, bart: 'kurz', bartFarbe: K.haarDunkel};

// Requisiten
// Boot (lokal: Deck bei y -40, Kiel bei +44), Mast + Segel hinten, Rumpf vorne (verdeckt die Beine)
const bootHinten = () => R(96, -300, 14, 262, 6, K.holz, 4) + P('M118,-290 Q200,-200 118,-80 Z', K.creme, 4);
const bootVorne = () => P('M-180,-40 L180,-40 Q150,40 0,46 Q-150,40 -180,-40 Z', K.holz) + LN('M-160,-6 Q0,14 160,-6', 4) + C(-110, -16, 7, K.braun, 3);
// Boot mit Figur, schaukelnd. x,y = Mitte Deck
function bootMitFigur(t, x, y, sc, pose, ang = 0) {
  const fig = place(0, 0, .62, figure(HIP, pose));
  return G(`translate(${x} ${y}) rotate(${ang}) scale(${sc})`, G('', bootHinten(), RIM) + G('translate(-20 10)', fig) + G('', bootVorne(), RIM));
}
// Kreide-Wellen (laufen nach links)
function wellen(y, t, p, amp = 14, wl = 120, w = 8) {
  let d = '';
  for (let x = X0; x <= X1; x += 12) { const yy = y + amp * Math.sin((x / wl) * Math.PI * 2 + t * 2.4); d += (x === X0 ? 'M' : 'L') + x + ',' + yy.toFixed(1) + ' '; }
  return chalkLine(d, p, w);
}
function blitz(s = 1) { return G(`scale(${s})`, P('M10,-60 L-26,6 L-2,6 L-18,62 L30,-10 L4,-10 L22,-60 Z', K.gelb, 5)); }
function wolke(s = 1) { return G(`scale(${s})`, cloud([[-70, 10, 46], [-20, -18, 58], [44, -6, 52], [86, 18, 38], [10, 24, 46]], K.gh)); }
// Strecke mit Teilstrichen (n Einheiten à u px)
function strecke(x, y, n, u, p) {
  let d = `M${x},${y} L${x + n * u},${y}`;
  for (let i = 0; i <= n; i++) d += ` M${x + i * u},${y - 16} L${x + i * u},${y + 16}`;
  return chalkLine(d, p, 8);
}

const SCENES = {
  hook(t, b) {
    let s = '';
    wrap(T('hook'), 88, true, 840).forEach((l, i) => s += chalkText(l, X0, TITLE_Y + i * 92, {size: 88, p: t < .05 ? 1 : prog(t, .05 + i * .3, .4)}));
    const tz = kw('hook', 'zahl');
    const by = 1150 + idle(t, 2.2, 6);
    s += G(`translate(0 ${(1 - pop(t, .1, .5)) * 300})`, bootMitFigur(t, 400, by, 1, {...(t > tz ? POSE.staunen : POSE.stehen), expr: t > tz ? 'staunen' : 'freundlich', blink: blinkAt(t, 1)}, Math.sin(t * 1.8) * 5));
    s += wellen(1205, t, prog(t, 0, .6), 14) + wellen(1245, t + 1, prog(t, .15, .6), 12);
    if (t > tz - .1) s += G(`translate(760 ${760 + idle(t, 2, 8)}) scale(${pop(t, tz - .1, .45)}) rotate(${-6 + Math.sin(t * 3) * 4})`, chalkText('√2', 0, 0, {size: 160, anchor: 'middle'}));
    return s;
  },
  ort(t, b) {
    let s = chalkText(T('ort'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .7)});
    const tp = kw('ort', 'pyth'), tm = kw('ort', 'motto');
    s += place(250, FLOOR + idle(t, 2, 2), .85 * pop(t, b.start - .1), figure(FIG.pythagoras, {...(t > tm ? POSE.zeigen : POSE.stehen), expr: t > tm ? 'lachen' : 'freundlich', blink: blinkAt(t, 2)}));
    s += chalkText(T('schule'), 250, 690, {size: 56, disp: false, anchor: 'middle', p: prog(t, tp - .2, .5)});
    if (t > tm - .1) {
      s += G(`translate(${CX} 480) scale(${pop(t, tm - .1, .4)}) rotate(-3)`, chalkText(T('motto'), 0, 0, {size: 88, anchor: 'middle'}));
      s += chalkUnderline(150, 830, 515, prog(t, tm + .4, .4));
    }
    // Zahlen schweben auf
    [['1', 600, 820], ['2', 800, 760], ['3', 700, 960], ['4', 860, 1010], ['5', 590, 1120], ['6', 780, 1180]].forEach(([n, x, y], i) => {
      const sc = pop(t, tm + .2 + i * .12, .35);
      if (sc > 0) s += G(`translate(${x} ${y + idle(t + i, 2, 10)}) scale(${sc}) rotate(${Math.sin(t * 2 + i) * 8})`, chalkText(n, 0, 0, {size: 88, anchor: 'middle'}));
    });
    return s;
  },
  glaube(t, b) {
    let s = chalkText(T('glaube'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .6)});
    const tv = kw('glaube', 'verh'), td = kw('glaube', 'drei'), tf = kw('glaube', 'fuenf');
    // a : b
    if (t > tv - .1) {
      s += G(`translate(${CX} 470) scale(${pop(t, tv - .1, .4)})`, chalkText('a : b', 0, 0, {size: 96, anchor: 'middle'}));
      s += chalkText(T('ganz'), CX, 540, {size: 44, disp: false, anchor: 'middle', p: prog(t, tv + .3, .5)});
    }
    // 3 : 2
    s += strecke(140, 660, 3, 90, prog(t, td - .3, .5)) + strecke(140, 740, 2, 90, prog(t, td - .1, .4));
    if (t > td) s += G(`translate(560 720) scale(${pop(t, td, .35)})`, chalkText('3 : 2', 0, 0, {size: 72})) + chalkCheck(780, 690, prog(t, td + .4, .3));
    // 5 : 4
    s += strecke(140, 880, 5, 70, prog(t, tf - .3, .5)) + strecke(140, 960, 4, 70, prog(t, tf - .1, .4));
    if (t > tf) s += G(`translate(560 940) scale(${pop(t, tf, .35)})`, chalkText('5 : 4', 0, 0, {size: 72})) + chalkCheck(780, 910, prog(t, tf + .15, .25));
    s += place(400, FLOOR + idle(t, 2, 2), .48 * pop(t, b.start, .4), figure(FIG.pythagoras, {...(t > tf ? POSE.staunen : POSE.denken), expr: t > tf ? 'lachen' : 'denken', blink: blinkAt(t, 3)}));
    return s;
  },
  quadrat(t, b) {
    let s = chalkText(T('quadrat'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .6)});
    const tq = kw('quadrat', 'quadrat'), td = kw('quadrat', 'diag'), tw2 = kw('quadrat', 'wurzel');
    const x0 = 140, y0 = 700, a = 380;
    s += chalkLine(`M${x0},${y0 + a} L${x0 + a},${y0 + a} L${x0 + a},${y0} L${x0},${y0} Z`, prog(t, Math.min(tq - .3, b.start + .2), .9), 9);
    s += chalkText('1', x0 + a / 2, y0 + a + 70, {size: 64, anchor: 'middle', p: prog(t, tq + .3, .3)});
    s += chalkText('1', x0 - 50, y0 + a / 2 + 20, {size: 64, anchor: 'middle', p: prog(t, tq + .5, .3)});
    s += chalkLine(`M${x0},${y0 + a} L${x0 + a},${y0}`, prog(t, td - .2, .6), 11);
    s += chalkText(T('diag'), 0, 0, {size: 44, disp: false, anchor: 'middle', p: prog(t, td + .2, .5), ex: `transform="translate(${x0 + a / 2 + 40} ${y0 + a / 2 + 52}) rotate(-45)"`});
    if (t > tw2 - .1) s += G(`translate(${x0 + a / 2 - 70} ${y0 + a / 2 - 30}) scale(${pop(t, tw2 - .1, .4)}) rotate(-8)`, chalkText('√2', 0, 0, {size: 110, anchor: 'middle'}));
    s += chalkText(T('pyth'), 570, 520, {size: 56, disp: false, p: prog(t, tw2 - .2, .6)});
    s += place(760, FLOOR + idle(t, 2, 2), .6 * pop(t, b.start, .4), figure(HIP, {...(t > tw2 ? POSE.staunen : POSE.denken), expr: t > tw2 ? 'staunen' : 'denken', blink: blinkAt(t, 4)}));
    return s;
  },
  bruch(t, b) {
    let s = chalkText(T('bruch'), X0, TITLE_Y, {size: 88, p: prog(t, b.start, .6)});
    const tk = kw('bruch', 'kein'), ts = kw('bruch', 'suchst');
    ['v1', 'v2', 'v3'].forEach((k, i) => {
      const a = b.start + .2 + i * .45;
      s += chalkText(T(k), X0, 460 + i * 76, {size: 56, disp: false, p: prog(t, a, .4)});
      s += chalkCross(X0 + tw(T(k), 56, false) + 50, 442 + i * 76, 20, prog(t, a + .35, .25));
    });
    s += chalkText(T('ziel'), X0, 700, {size: 56, disp: false, p: prog(t, b.start + 1.6, .5)});
    s += chalkUnderline(X0, X0 + tw(T('ziel'), 56, false), 716, prog(t, b.start + 2, .3));
    if (t > tk - .1) s += G(`translate(${CX} 850) scale(${pop(t, tk - .1, .4)}) rotate(-4)`, chalkText(T('kein'), 0, 0, {size: 96, anchor: 'middle'}));
    const sweat = t > ts - .2;
    s += place(760, FLOOR + idle(t, 2, 2), .55 * pop(t, b.start, .4), figure(HIP, {...(sweat ? POSE.staunen : POSE.denken), expr: sweat ? 'verwirrt' : 'denken', blink: blinkAt(t, 5), schweiss: sweat, tilt: sweat ? Math.sin(t * 6) * 5 : 0}));
    // fliegende Bruchstriche
    [['?/?', 260, 1080], ['a/b', 420, 1180]].forEach(([q, x, y], i) => {
      const sc = pop(t, ts - .2 + i * .2, .35);
      if (sc > 0) s += G(`translate(${x} ${y + idle(t + i, 3, 8)}) scale(${sc}) rotate(${Math.sin(t * 4 + i) * 10})`, chalkText(q, 0, 0, {size: 64, anchor: 'middle', color: K.gh}));
    });
    return s;
  },
  hippasos(t, b) {
    let s = chalkText(T('wer'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .5)});
    const tn = kw('hippasos', 'niemand'), th = kw('hippasos', 'name');
    if (t > tn - .1) s += chalkText('?', 840, 620, {size: 160, p: prog(t, tn - .1, .3), ex: `transform="rotate(${12 + Math.sin(t * 4) * 6} 840 620)"`});
    // Kreide-Umriss vor dem Namen
    if (t < th) {
      const pu = prog(t, b.start + .1, .8);
      s += chalkLine(`M${CX + 80},880 A80,80 0 1 0 ${CX + 80},881`, pu, 9) + chalkLine(`M${CX - 130},1240 Q${CX - 120},990 ${CX},980 Q${CX + 120},990 ${CX + 130},1240`, pu, 9);
      s += chalkText('?', CX, 920, {size: 96, anchor: 'middle', p: prog(t, b.start + .6, .3)});
    }
    s += place(CX, FLOOR + idle(t, 2, 2), .75 * pop(t, th - .1, .45), figure(HIP, {...POSE.staunen, expr: 'lachen', blink: blinkAt(t, 6)}));
    s += chalkText(T('name'), CX, 500, {size: 64, anchor: 'middle', p: prog(t, th, .7)});
    s += chalkText(T('unsicher'), CX, 570, {size: 34, disp: false, anchor: 'middle', color: K.gh, p: prog(t, th + .3, .4)});
    return s;
  },
  legende(t, b) {
    let s = chalkText(T('sage'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .6)});
    const tm = kw('legende', 'meer'), tg = kw('legende', 'goetter'), tsec = kw('legende', 'geheimnis');
    const storm = prog(t, tm - .2, .8);
    s += bootMitFigur(t, 380, 1145 + idle(t, 2.6, 6 + 10 * storm), 1, {...(t > tg ? POSE.staunen : POSE.stehen), expr: t > tg ? 'staunen' : 'freundlich', blink: blinkAt(t, 7), schweiss: t > tg}, Math.sin(t * 2.2) * (4 + 8 * storm));
    s += wellen(1200, t, prog(t, b.start, .6), 12 + 14 * storm, 120) + wellen(1245, t + 1.3, prog(t, b.start + .15, .6), 10 + 10 * storm, 100);
    if (t > tg - .1) {
      s += G(`translate(730 ${640 + idle(t, 1.5, 6)}) scale(${pop(t, tg - .1, .4)})`, wolke(1), RIM);
      const fl = ((t - tg) % 1.1) < .35;
      if (fl) s += G(`translate(730 760) rotate(10)`, blitz(1.1), RIM);
      s += chalkText(T('strafe'), X0, 430, {size: 56, disp: false, p: prog(t, tg, .6)});
    }
    const tsc = Math.min(tsec, tg + .9) - .2;
    if (t > tsc) {
      s += G(`translate(${X0 + 120} ${560 + idle(t, 2, 6)}) scale(${.55 * pop(t, tsc, .4)}) rotate(-6)`, schriftrolle(1), RIM);
      s += chalkText(T('geheimnis'), X0 + 240, 580, {size: 44, disp: false, p: prog(t, tsc + .2, .5)});
    }
    return s;
  },
  bord(t, b) {
    let s = chalkText(T('bordT'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .6)});
    const tb = kw('bord', 'bord'), tsp = kw('bord', 'spaet');
    const happy = t > Math.min(tsp, tb + 1.3) + .3;
    s += bootMitFigur(t, 330, 1150 + idle(t, 2.2, 6), 1, {...(happy ? POSE.zeigen : POSE.stehen), expr: happy ? 'zwinkern' : 'verwirrt', blink: blinkAt(t, 8)}, Math.sin(t * 1.8) * 4);
    s += wellen(1205, t, prog(t, b.start, .6), 14) + wellen(1245, t + 1, prog(t, b.start + .15, .6), 12);
    // gedachter Wurf über Bord (gestrichelte Kreide-Bahn) + Platsch
    s += chalkLine('M430,880 Q680,620 800,1140', prog(t, tb - .2, .6), 7);
    s += chalkLine('M778,1120 L800,1146 L826,1118', prog(t, tb + .35, .2), 7);
    if (t > tb + .4) for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .45, r = 30 + 40 * prog(t, tb + .4, .4); s += drop(800 + r * Math.cos(a), 1150 + r * Math.sin(a), 1.6 * (1 - prog(t, tb + 1.1, .5))); }
    const tl = Math.min(tsp, tb + 1.3);
    if (t > tl - .1) {
      s += chalkCross(640, 760, 60, prog(t, tl - .1, .35));
      s += chalkText(T('spaet'), X0, 430, {size: 44, disp: false, p: prog(t, tl, .6)});
      const st = pop(t, tl + .3, .3);
      if (st > 0) s += G(`translate(690 560) scale(${st}) rotate(-8)`, chalkText(T('legende'), 0, 0, {size: 80, anchor: 'middle'}));
      s += chalkUnderline(540, 850, 600, prog(t, tl + .5, .3));
    }
    return s;
  },
  funfact(t, b) {
    const ti = kw('funfact', 'irr'), tm = kw('funfact', 'mehr');
    let s = chalkText(T('fun'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .4)});
    if (t > ti - .1) s += G(`translate(${CX} 510) scale(${pop(t, ti - .1, .4)}) rotate(-3)`, chalkText(T('irr'), 0, 0, {size: 120, anchor: 'middle'}));
    s += chalkText(T('beispiele'), CX, 620, {size: 56, disp: false, anchor: 'middle', p: prog(t, ti + .4, .6)});
    // Zahlenstrahl 0–2
    const L = 110, Rr = 860, Y = 860, u = (Rr - L) / 2;
    s += chalkLine(`M${L - 20},${Y} L${Rr + 30},${Y}`, prog(t, b.start + .1, .6), 8);
    [0, 1, 2].forEach(i => { s += chalkLine(`M${L + i * u},${Y - 22} L${L + i * u},${Y + 22}`, prog(t, b.start + .4 + i * .1, .2), 8) + chalkText(String(i), L + i * u, Y + 80, {size: 56, disp: false, anchor: 'middle', p: prog(t, b.start + .5 + i * .1, .3)}); });
    // Brüche: einzelne Punkte
    [1 / 2, 1 / 3, 2 / 3, 1 / 4, 3 / 4, 3 / 2, 5 / 4, 7 / 4, 4 / 3].forEach((q, i) => { if (prog(t, b.start + .7 + i * .08, .1) > 0) s += `<circle cx="${(L + q * u).toFixed(1)}" cy="${Y - 46}" r="9" fill="${K.weiss}"/>`; });
    // Irrationale: dichtes Kreide-Band
    if (t > tm - .1) {
      s += chalkLine(`M${L},${Y + 140} L${Rr},${Y + 140}`, prog(t, tm - .1, .8), 34, K.gh);
      s += chalkText(T('mehr'), CX, Y + 230, {size: 44, disp: false, anchor: 'middle', p: prog(t, tm, .5)});
    }
    s += chalkText('√2', L + 1.41421 * u, Y - 80, {size: 56, disp: false, anchor: 'middle', p: prog(t, ti + .2, .4)});
    return s;
  },
};

// Soundeffekte: add(zeitpunkt, name, lautstärke). Namen: siehe pipeline/sfx.py (LIB)
function CUES(add) {
  add(0.0, 'pop', .7); add(0.05, 'chalk'); add(.1, 'water', .5); add(kw('hook', 'zahl') - .1, 'boing', .8);
  add(B.ort.start, 'chalk'); add(B.ort.start - .1, 'pop', .6); add(kw('ort', 'motto') - .1, 'ding', .9); add(kw('ort', 'motto') + .3, 'sparkle', .6);
  add(B.glaube.start, 'chalk'); add(kw('glaube', 'drei'), 'pop', .7); add(kw('glaube', 'fuenf'), 'pop', .7);
  add(B.quadrat.start, 'chalk'); add(kw('quadrat', 'diag') - .2, 'zip', .6); add(kw('quadrat', 'wurzel') - .1, 'gasp', .7);
  add(B.bruch.start, 'chalk'); add(B.bruch.start + .55, 'buzz', .5); add(kw('bruch', 'kein') - .1, 'stamp', .9); add(kw('bruch', 'suchst'), 'hmm', .6);
  add(B.hippasos.start, 'chalk'); add(kw('hippasos', 'niemand'), 'hmm', .5); add(kw('hippasos', 'name') - .1, 'pop', .8);
  add(B.legende.start, 'water', .6); add(kw('legende', 'goetter') - .1, 'thud', .8); add(kw('legende', 'geheimnis'), 'whoosh', .6);
  add(kw('bord', 'bord') - .2, 'whoosh', .7); add(kw('bord', 'bord') + .4, 'splash', .8); add(Math.min(kw('bord', 'spaet'), kw('bord', 'bord') + 1.3) + .3, 'stamp', .9);
  add(B.funfact.start, 'chalk'); add(kw('funfact', 'irr') - .1, 'sparkle', .9); add(kw('funfact', 'mehr') - .1, 'trickle', .6);
}

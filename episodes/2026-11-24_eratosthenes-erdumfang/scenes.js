// Folge: Eratosthenes misst den Erdumfang – Szenen (eine Funktion pro Beat-ID aus episode.json)
// Jede Szene bekommt die globale Zeit t (s) und ihren Beat b {start,end,text}. Rückgabe: SVG-String.

// Figur (Alexandria, 3. Jh. v. Chr.): Eratosthenes als Karikatur
const ERA = {kleidung: 'toga', farbe: K.creme, schaerpe: K.orange, haar: 'kurz', haarFarbe: K.haarGrau, bart: 'kurz', bartFarbe: K.haarGrau};
// Requisiten
function sonne(s = 1) {
  let r = '';
  for (let i = 0; i < 10; i++) { const a = Math.PI * 2 * i / 10; r += `<path d="M${(66 * Math.cos(a)).toFixed(1)},${(66 * Math.sin(a)).toFixed(1)} L${(94 * Math.cos(a)).toFixed(1)},${(94 * Math.sin(a)).toFixed(1)}" stroke="${K.orange}" stroke-width="10" stroke-linecap="round"/>`; }
  return G(`scale(${s})`, r + C(0, 0, 52, K.gelb));
}
const stab = h => R(-8, -h, 16, h, 6, K.holz, 4);       // senkrechter Stab, Fuss bei 0,0
const erdball = (s = 1) => G(`scale(${s})`, C(0, 0, 60, K.wasser) +
  P('M-40,-26 q18,-20 36,-8 q8,14 -6,22 q-16,6 -22,-4 q-12,-2 -8,-10 Z', K.gruen, 4) +
  P('M8,12 q24,-10 36,4 q-4,22 -22,26 q-16,-6 -14,-30 Z', K.gruen, 4));
const mirror = (x, inner) => G(`translate(${x} 0) scale(-1 1) translate(${-x} 0)`, inner);
const kreis = (cx, cy, r, p, w = 9) => chalkLine(`M${cx},${cy - r} A${r},${r} 0 1 1 ${cx},${cy + r} A${r},${r} 0 1 1 ${cx},${cy - r}`, p, w);

// Erd-Querschnitt mit Syene (oben) und Alexandria (28° weiter, übertrieben gezeichnet)
const EX = CX, EY = 1010, ER = 230, DA = 28;
const pt = (deg, r = ER) => [EX + r * Math.cos(deg * Math.PI / 180), EY + r * Math.sin(deg * Math.PI / 180)];
const SY = pt(-90), AL = pt(-90 - DA);
function erdDiagramm(t, o) {
  let s = kreis(EX, EY, ER, o.pCircle);
  s += chalkText(T('erde'), EX, EY + 150, {size: 44, disp: false, anchor: 'middle', p: o.pCircle});
  // Stäbe radial
  [[-90, SY], [-90 - DA, AL]].forEach(([d, q]) => { const e = pt(d, ER + 44); s += chalkLine(`M${q[0].toFixed(1)},${q[1].toFixed(1)} L${e[0].toFixed(1)},${e[1].toFixed(1)}`, o.pCircle, 12); });
  s += chalkText(T('stadt1'), SY[0] + 34, SY[1] - 14, {size: 44, disp: false, p: o.pLabels});
  s += chalkText(T('stadt2'), 290, 885, {size: 44, disp: false, anchor: 'end', p: o.pLabels});
  // parallele Sonnenstrahlen von oben
  [AL[0], EX, EX + 160, EX + 215].forEach((x, i) => {
    const y = EY - Math.sqrt(ER * ER - (x - EX) * (x - EX)) - (Math.abs(x - EX) < 1 || Math.abs(x - AL[0]) < 1 ? 50 : 8);
    s += chalkArrow(x, 560, x, y, prog(o.tRays === undefined ? -99 : t, (o.tRays || 0) + i * .12, .4), 7);
  });
  if (o.pRadii > 0) {
    s += chalkLine(`M${EX},${EY} L${SY[0]},${SY[1]} M${EX},${EY} L${AL[0].toFixed(1)},${AL[1].toFixed(1)}`, o.pRadii, 7);
    const a1 = pt(-90, 70), a2 = pt(-90 - DA, 70);
    s += chalkLine(`M${a1[0]},${a1[1]} A70,70 0 0 0 ${a2[0].toFixed(1)},${a2[1].toFixed(1)}`, clamp(o.pRadii * 2 - 1), 7);
    // gleicher Winkel am Stab in Alexandria
    const v = pt(-90 - DA, ER + 44), up = [AL[0], AL[1] - 60];
    const b1 = [AL[0] + (v[0] - AL[0]) * 60 / 44, AL[1] + (v[1] - AL[1]) * 60 / 44];
    s += chalkLine(`M${up[0].toFixed(1)},${up[1].toFixed(1)} A60,60 0 0 0 ${b1[0].toFixed(1)},${b1[1].toFixed(1)}`, clamp(o.pRadii * 2 - 1), 6);
  }
  return s;
}

const SCENES = {
  hook(t, b) {
    let s = '';
    wrap(T('hook'), 88, true, 840).forEach((l, i) => s += chalkText(l, X0, TITLE_Y + i * 92, {size: 88, p: t < .05 ? 1 : prog(t, .05 + i * .3, .4)}));
    const ts = kw('hook', 'stock'), tsh = kw('hook', 'schatten');
    s += G(`translate(170 ${820 + idle(t, 2, 6)}) scale(${.85 * pop(t, .25, .45)}) rotate(${t * 20})`, sonne(1), RIM);
    s += G(`translate(430 ${FLOOR}) scale(1 ${pop(t, ts - .1, .4)})`, stab(200), RIM);
    // Strahl über die Stabspitze bis zum Schattenende
    s += chalkLine('M227,873 L645,1262', prog(t, tsh - .2, .5), 5);
    s += chalkLine(`M430,${FLOOR} L645,${FLOOR}`, prog(t, tsh, .5), 16, K.gh);
    s += place(800, FLOOR + idle(t, 2, 2), .62 * pop(t, .5, .45), figure(ERA, {...(t > tsh ? POSE.staunen : POSE.denken), expr: t > tsh ? 'staunen' : 'denken', blink: blinkAt(t, 1), tilt: Math.sin(t * 2) * 4}));
    return s;
  },
  ort(t, b) {
    let s = chalkText(T('ort'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .7)});
    const tb = kw('ort', 'bibliothek');
    s += place(250, FLOOR + idle(t, 2, 2), .9 * pop(t, b.start - .1), figure(ERA, {...(t > tb ? POSE.zeigenSeite : POSE.geben), expr: t > tb ? 'lachen' : 'freundlich', blink: blinkAt(t, 2), lProp: t > tb ? '' : schriftrolle(.42)}));
    s += chalkText(T('name'), 250, 660, {size: 56, disp: false, anchor: 'middle', p: prog(t, b.start + .3, .5)});
    // Regal
    const pr = prog(t, b.start + .2, .8);
    s += chalkLine('M560,1240 L560,800 L900,800 L900,1240 M560,945 L900,945 M560,1090 L900,1090 M560,1240 L900,1240', pr, 8);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const k = r * 4 + c, sc = pop(t, tb - .3 + k * .04, .3);
      if (sc > 0) s += G(`translate(${603 + c * 85} ${905 + r * 145}) scale(${.36 * sc})`, schriftrolle(1), RIM);
    }
    s += chalkText(T('biblio'), 730, 760, {size: 56, disp: false, anchor: 'middle', p: prog(t, tb - .4, .4)});
    return s;
  },
  syene(t, b) {
    let s = chalkText(T('syene'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .7)});
    s += chalkText(T('mittag'), X0, 420, {size: 44, disp: false, p: prog(t, b.start + .5, .6)});
    const tst = kw('syene', 'stab'), tk = kw('syene', 'kein');
    s += G(`translate(300 ${640 + idle(t, 2, 5)}) scale(${pop(t, b.start, .45)}) rotate(${t * 20})`, sonne(1), RIM);
    s += chalkArrow(300, 750, 300, 940, prog(t, tst - .1, .5), 8);
    s += G(`translate(300 ${FLOOR}) scale(1 ${pop(t, tst - .2, .4)})`, stab(300), RIM);
    s += chalkLine(`M150,${FLOOR} L450,${FLOOR}`, prog(t, b.start + .2, .5), 6);
    if (t > tk) {
      s += G(`translate(680 1000) scale(${pop(t, tk, .35)}) rotate(-4)`, chalkText(T('kein'), 0, 0, {size: 64, anchor: 'middle'}));
      s += chalkCheck(640, 1090, prog(t, tk + .4, .3), 1.4);
    }
    return s;
  },
  alex(t, b) {
    let s = chalkText(T('alex'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .6)});
    const tsc = kw('alex', 'schon'), tf = kw('alex', 'fuenfzigstel');
    s += G(`translate(130 ${650 + idle(t, 2, 5)}) scale(${.85 * pop(t, b.start, .45)}) rotate(${t * 20})`, sonne(1), RIM);
    s += G(`translate(380 ${FLOOR}) scale(1 ${pop(t, b.start + .2, .4)})`, stab(330), RIM);
    s += chalkLine('M190,718 L672,1262', prog(t, tsc - .3, .5), 5);
    s += chalkLine(`M380,${FLOOR} L672,${FLOOR}`, prog(t, tsc, .5), 16, K.gh);
    s += chalkText(T('schatten'), 526, 1236, {size: 44, disp: false, anchor: 'middle', p: prog(t, tsc + .3, .5)});
    // Winkel an der Stabspitze (zwischen Senkrechter und Strahl)
    s += chalkLine('M380,932 L380,820', prog(t, tf - .4, .3), 5);
    s += chalkLine('M380,842 A90,90 0 0 0 320,865', prog(t, tf - .1, .4), 7);
    if (t > tf) {
      s += G(`translate(${CX} 470) scale(${pop(t, tf, .35)})`, chalkText(T('winkel'), 0, 0, {size: 64, anchor: 'middle'}));
      s += chalkText(T('skizze'), CX, 540, {size: 34, disp: false, anchor: 'middle', color: K.gh, p: prog(t, tf + .5, .5)});
    }
    s += mirror(790, place(790, FLOOR + idle(t, 2, 2), .6 * pop(t, b.start + .3, .4), figure(ERA, {...(t > tsc ? POSE.zeigenSeite : POSE.stehen), expr: t > tsc ? 'staunen' : 'freundlich', blink: blinkAt(t, 3)})));
    return s;
  },
  trick(t, b) {
    let s = chalkText(T('parallel'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .6)});
    const tp = kw('trick', 'parallel'), te = kw('trick', 'erdumfang');
    s += erdDiagramm(t, {pCircle: prog(t, b.start, .8), pLabels: prog(t, b.start + .4, .6), tRays: tp - .3, pRadii: prog(t, te, .8)});
    if (t > te) s += G(`translate(${EX} 1090) scale(${pop(t, te + .4, .35)})`, chalkText(T('fuenfzig'), 0, 0, {size: 56, disp: false, anchor: 'middle'}));
    return s;
  },
  distanz(t, b) {
    let s = chalkText(T('stadt1') + ' → ' + T('stadt2'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .6)});
    const ts = kw('distanz', 'stadien');
    s += erdDiagramm(t, {pCircle: 1, pLabels: 1, tRays: -99, pRadii: 1});
    s += chalkText(T('fuenfzig'), EX, 1090, {size: 56, disp: false, anchor: 'middle'});
    // Weg auf dem Bogen: Schritte (Kreidepunkte) und dicker Bogen
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const q = pt(-90 - DA * i / n, ER + 18);
      if (prog(t, b.start + .2 + i * .12, .1) > 0) s += `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="6" fill="${K.weiss}"/>`;
    }
    s += chalkLine(`M${SY[0]},${SY[1]} A${ER},${ER} 0 0 0 ${AL[0].toFixed(1)},${AL[1].toFixed(1)}`, prog(t, ts - .3, .5), 18);
    if (t > ts) s += G(`translate(${CX} 480) scale(${pop(t, ts, .35)}) rotate(-3)`, chalkText(T('weg'), 0, 0, {size: 88, anchor: 'middle'}));
    return s;
  },
  rechnung(t, b) {
    const tm = kw('rechnung', 'mal'), ts = kw('rechnung', 'summe'), tr = kw('rechnung', 'rund');
    let s = chalkText(T('rechnung1'), CX, 560, {size: 96, anchor: 'middle', p: prog(t, b.start, Math.max(.4, tm - b.start + .5))});
    if (t > ts - .1) {
      s += G(`translate(${CX} 720) scale(${pop(t, ts - .1, .4)})`, chalkText(T('rechnung2'), 0, 0, {size: 88, anchor: 'middle'}));
      s += chalkUnderline(150, 830, 755, prog(t, ts + .4, .3));
    }
    s += kreis(290, 1030, 150, prog(t, tr - .2, 1.0), 10);
    const eb = pop(t, tr + .6, .4);
    if (eb > 0) s += G(`translate(290 ${1030 + idle(t, 3, 5)}) rotate(${t * 15}) scale(${1.6 * eb})`, erdball(1), RIM);
    const happy = t > ts;
    s += place(730, FLOOR - (happy ? Math.abs(Math.sin(t * 9)) * 18 : 0), .62 * pop(t, b.start - .1), figure(ERA, {...(happy ? POSE.staunen : POSE.denken), expr: happy ? 'lachen' : 'denken', blink: blinkAt(t, 4)}));
    return s;
  },
  genau(t, b) {
    const tu = kw('genau', 'umstritten'), te = kw('genau', 'echt');
    let s = chalkText(T('stadion'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .6)});
    s += chalkText(T('laenge'), X0, 420, {size: 44, disp: false, p: prog(t, tu, .6)});
    if (t > tu) s += chalkText('?', 820, 520, {size: 160, p: prog(t, tu + .1, .3), ex: `transform="rotate(${12 + Math.sin(t * 4) * 5} 820 520)"`});
    s += chalkText(T('ergebnis'), X0, 680, {size: 64, p: prog(t, tu + .9, .8)});
    if (t > te - .1) {
      s += G(`translate(${X0} 810) scale(${pop(t, te - .1, .35)})`, chalkText(T('echt'), 0, 0, {size: 64}));
      s += chalkCheck(660, 790, prog(t, te + .3, .3), 1.2);
    }
    s += place(740, FLOOR + idle(t, 2, 2), .62 * pop(t, b.start - .1), figure(ERA, {...(t > te ? POSE.zeigen : POSE.denken), expr: t > te ? 'zwinkern' : 'verwirrt', blink: blinkAt(t, 5)}));
    const eb = pop(t, te + .2, .4);
    if (eb > 0) s += G(`translate(280 ${1080 + idle(t, 3, 6)}) rotate(${t * 15}) scale(${1.3 * eb})`, erdball(1), RIM);
    return s;
  },
  funfact(t, b) {
    const tb = kw('funfact', 'beta'), tf = kw('funfact', 'fast'), te = kw('funfact', 'erde');
    let s = chalkText(T('fun'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .4)});
    if (t > tb - .1) s += G(`translate(${CX} 500) scale(${pop(t, tb - .1, .4)}) rotate(-4)`, chalkText('β ' + T('beta'), 0, 0, {size: 120, anchor: 'middle'}));
    s += chalkText(T('fast'), CX, 600, {size: 44, disp: false, anchor: 'middle', p: prog(t, tf - .2, .8)});
    // Siegertreppchen (Kreide): 2 – 1 – 3, Unterkante über der Quellenzeile
    const pp = prog(t, b.start + .2, .8);
    s += chalkLine('M150,1205 L150,1085 L370,1085 L370,995 L610,995 L610,1130 L830,1130 L830,1205 Z M370,1205 L370,1085 M610,1205 L610,1130', pp, 8);
    s += chalkText('2', 260, 1180, {size: 64, anchor: 'middle', p: prog(t, b.start + .7, .3)});
    s += chalkText('1', 490, 1120, {size: 64, anchor: 'middle', p: prog(t, b.start + .8, .3)});
    s += chalkText('3', 720, 1190, {size: 56, anchor: 'middle', p: prog(t, b.start + .9, .3)});
    const happy = t > te;
    s += place(260, 1085 - (happy ? Math.abs(Math.sin(t * 9)) * 16 : 0), .5 * pop(t, b.start, .4), figure(ERA, {...(happy ? POSE.staunen : POSE.stehen), expr: happy ? 'lachen' : 'zwinkern', blink: blinkAt(t, 6)}));
    const eb = pop(t, te, .45);
    if (eb > 0) s += G(`translate(490 ${930 + idle(t, 3, 5) - (1 - Math.min(1, (t - te) / .45)) * 120}) rotate(${t * 15}) scale(${1.05 * eb})`, erdball(1), RIM);
    return s;
  },
};

// Soundeffekte: add(zeitpunkt, name, lautstärke). Namen: siehe pipeline/sfx.py (LIB)
function CUES(add) {
  add(0.0, 'pop', .7); add(0.05, 'chalk'); add(.25, 'sparkle', .6); add(kw('hook', 'stock') - .1, 'thud', .7); add(kw('hook', 'schatten'), 'whoosh', .7);
  add(B.ort.start, 'chalk'); add(B.ort.start - .1, 'pop', .6); add(kw('ort', 'bibliothek'), 'plop', .8);
  add(B.syene.start, 'chalk'); add(B.syene.start, 'sparkle', .5); add(kw('syene', 'stab') - .2, 'thud', .6); add(kw('syene', 'kein'), 'ding', .9);
  add(B.alex.start, 'chalk'); add(kw('alex', 'schon'), 'whoosh', .7); add(kw('alex', 'fuenfzigstel'), 'pop', .8);
  add(B.trick.start, 'chalk'); add(kw('trick', 'parallel') - .3, 'zip', .6); add(kw('trick', 'erdumfang'), 'chalk', .8); add(kw('trick', 'erdumfang') + .4, 'ding', .7);
  add(B.distanz.start + .2, 'trickle', .5); add(kw('distanz', 'stadien'), 'stamp', .8);
  add(B.rechnung.start, 'chalk'); add(kw('rechnung', 'summe') - .1, 'coin', 1); add(kw('rechnung', 'rund') - .2, 'chalk', .8); add(kw('rechnung', 'rund') + .6, 'pop', .7);
  add(B.genau.start, 'chalk'); add(kw('genau', 'umstritten'), 'hmm', .6); add(kw('genau', 'echt') - .1, 'ding', 1);
  add(B.funfact.start, 'chalk'); add(kw('funfact', 'beta') - .1, 'boing', .7); add(kw('funfact', 'erde'), 'sparkle', .9);
}

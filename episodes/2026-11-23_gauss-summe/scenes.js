// Folge: Der kleine Gauss und die Summe – Szenen (eine Funktion pro Beat-ID aus episode.json)
// Jede Szene bekommt die globale Zeit t (s) und ihren Beat b {start,end,text}. Rückgabe: SVG-String.

// Figuren (Braunschweig, 18. Jh.): Schulbub Gauss und Lehrer Büttner – Karikaturen
const GAUSS = {kleidung: 'anzug', farbe: K.braun, hose: K.gd, haar: 'kurz', haarFarbe: K.haarBraun};
const BUETTNER = {kleidung: 'anzug', farbe: K.gruen, hose: K.braun, haar: 'kurz', haarFarbe: K.haarGrau};
// Schiefertafel des Schülers (ohne Gestell). inner in Tafelkoordinaten (-112..112 × -72..72)
const slate = (s = 1, inner = '') => G(`scale(${s})`, R(-130, -90, 260, 180, 14, K.holz) + R(-112, -72, 224, 144, 6, K.gd, 4) + inner);
const scribble = (x, y, w, sw = 6) => { let d = `M${x},${y}`; for (let i = 0; i < w / 20; i++) d += ` q5,${i % 2 ? 14 : -14} 10,0 t10,0`; return `<path d="${d}" fill="none" stroke="${K.weiss}" stroke-width="${sw}" stroke-linecap="round" opacity=".9"/>`; };
const stock = G('rotate(-25)', R(-6, -170, 12, 210, 6, K.braun, 4));
// Zahlenreihe 1 2 3 … 98 99 100 mit Paar-Bögen
const ROW = [['1', 110], ['2', 210], ['3', 310], ['…', 492], ['98', 670], ['99', 770], ['100', 874]];
const ROW_Y = 760;
function zahlenreihe(t, a) {
  return ROW.map((n, i) => chalkText(n[0], n[1], ROW_Y, {size: 72, anchor: 'middle', p: prog(t, a + i * .12, .2)})).join('');
}
function bogen(k, p) { // k = 0: 1–100, 1: 2–99, 2: 3–98
  const xa = ROW[k][1], xb = ROW[6 - k][1], H = [480, 340, 200][k], y0 = ROW_Y + 40;
  return chalkLine(`M${xa},${y0} Q${CX},${y0 + H} ${xb},${y0}`, p, 7) +
    chalkText('101', CX, y0 + H / 2 + 44, {size: 44, disp: false, anchor: 'middle', p: clamp(p * 2 - 1)});
}

const SCENES = {
  hook(t, b) {
    let s = '';
    wrap(T('hook'), 88, true, 840).forEach((l, i) => s += chalkText(l, X0, TITLE_Y + i * 92, {size: 88, p: t < .05 ? 1 : prog(t, .05 + i * .3, .4)}));
    s += chalkText('1 + 2 + 3 + … + 100', 420, 760, {size: 72, anchor: 'middle', p: prog(t, .3, 1.2)});
    s += G(`translate(420 900) scale(${pop(t, 1.5, .4)}) rotate(${Math.sin(t * 5) * 4})`, chalkText('= ?', 0, 40, {size: 120, anchor: 'middle'}));
    s += place(790, FLOOR + idle(t, 2, 2), .7 * pop(t, -.42, .45), figure(GAUSS, {...POSE.denken, expr: t > 1.6 ? 'staunen' : 'denken', blink: blinkAt(t, 1), tilt: Math.sin(t * 2) * 4}));
    return s;
  },
  schule(t, b) {
    let s = chalkText(T('ort'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .7)});
    const ta = kw('schule', 'aufgabe');
    s += place(260, FLOOR + idle(t, 2, 2), .95 * pop(t, b.start - .1), figure(BUETTNER, {...(t > ta ? POSE.zeigen : POSE.stehen), expr: t > ta ? 'freundlich' : 'denken', blink: blinkAt(t, 2)}));
    s += chalkText(T('lehrer'), 260, 640, {size: 44, disp: false, anchor: 'middle', p: prog(t, b.start + .3, .5)});
    const inner = chalkText('1 + 2 + 3 + 4 + …', -100, -14, {size: 34, disp: false, p: prog(t, ta, .8)}) +
      chalkText('… + … + … = ?', -100, 36, {size: 34, disp: false, p: prog(t, ta + .7, .8)});
    s += G(`translate(690 ${FLOOR - 240}) scale(${1.6 * pop(t, b.start + .2, .4)})`, tafel(1, inner), RIM);
    return s;
  },
  gauss(t, b) {
    const tt = kw('gauss', 'tafel'), tl = kw('gauss', 'ligget');
    let s = '';
    s += place(270, FLOOR + idle(t, 2, 2), .75 * pop(t, b.start - .1), figure(GAUSS, {...(t < tt ? POSE.geben : POSE.stehen), expr: t < tt ? 'freundlich' : 'lachen', blink: blinkAt(t, 3), lProp: t < tt ? slate(.32, scribble(-50, 0, 90, 8)) : ''}));
    s += chalkText(T('gauss'), 270, 790, {size: 44, disp: false, anchor: 'middle', p: prog(t, b.start + .2, .6)});
    // Tisch (Kreide)
    s += chalkLine('M590,1110 L900,1110 M620,1110 L620,1262 M870,1110 L870,1262', prog(t, b.start + .3, .6), 9);
    const fp = prog(t, tt, .5);
    if (fp > 0) {
      const x = lerp(410, 745, easeInOut(fp)), y = lerp(1000, 1088, fp) - Math.sin(fp * Math.PI) * 220;
      const sy = fp < 1 ? 1 : .35 + .65 * Math.exp(-(t - tt - .5) * 30);
      s += G(`translate(${x} ${y}) rotate(${(1 - fp) * -200}) scale(.62 ${.62 * sy})`, slate(1, scribble(-50, 0, 90, 8)), RIM);
      if (fp >= 1) s += chalkLine('M640,1060 l-30,-24 M850,1060 l30,-24 M745,1040 l0,-40', prog(t, tt + .5, .2), 7);
    }
    if (t > tl - .1) {
      s += `<g transform="translate(${CX} ${TITLE_Y}) scale(${pop(t, tl - .1, .35)}) rotate(-4)">` + chalkText(T('ligget'), 0, 30, {size: 120, anchor: 'middle'}) + '</g>';
      s += chalkText(T('daliegt'), CX, 470, {size: 44, disp: false, anchor: 'middle', p: prog(t, tl + .6, .5)});
    }
    return s;
  },
  warten(t, b) {
    const ta = kw('warten', 'anderen');
    let s = chalkText(T('warten'), X0, TITLE_Y, {size: 64, p: prog(t, ta - .3, .6)});
    const run = '1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 + 11 + 12 + 13 + 14 + 15 + 16 + 17 + 18 + 19 + 20 + …';
    s += chalkBlock(run, X0, 440, {size: 44, disp: false, maxW: 840, p: prog(t, ta, b.end - ta)});
    const x = CX + Math.sin((t - b.start) * 1.3) * 230;
    const face = Math.cos((t - b.start) * 1.3) >= 0 ? 1 : -1;
    s += G(`translate(${x} 0) scale(${face} 1) translate(${-x} 0)`, place(x, FLOOR - Math.abs(Math.sin(t * 5)) * 8, .95 * pop(t, b.start - .1), figure(BUETTNER, {...POSE.stehen, expr: 'denken', blink: blinkAt(t, 4), rProp: stock})));
    return s;
  },
  richtig(t, b) {
    const tr = kw('richtig', 'richtig');
    let s = '';
    const lots = [-52, -22, 8, 38].map((y, i) => scribble(-96, y, 180 - (i % 2) * 40, 5)).join('');
    s += G(`translate(270 1000) scale(${1.35 * pop(t, b.start, .4)})`, slate(1, lots), RIM);
    s += G(`translate(700 1000) scale(${1.35 * pop(t, b.start + .25, .4)})`, slate(1, scribble(-50, 0, 90, 9)), RIM);
    s += chalkText(LANG === 'de' ? 'die anderen' : 'the others', 270, 850, {size: 44, disp: false, anchor: 'middle', p: prog(t, b.start + .4, .4)});
    s += chalkText(T('eine'), 700, 850, {size: 44, disp: false, anchor: 'middle', p: prog(t, b.start + .9, .5)});
    if (t > tr) {
      s += `<g transform="translate(${CX} ${TITLE_Y + 30}) scale(${pop(t, tr - .05, .35)})">` + chalkText(T('richtig'), 0, 30, {size: 120, anchor: 'middle'}) + '</g>';
      s += chalkCheck(640, 1010, prog(t, tr, .3), 1.8);
      s += chalkCross(270, 1000, 110, prog(t, tr + .3, .4));
    }
    return s;
  },
  trick(t, b) {
    let s = chalkText(T('meist'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .8)});
    s += zahlenreihe(t, b.start + .3);
    const tk = kw('trick', 'trick');
    s += bogen(0, prog(t, tk, .9));
    if (t > tk) s += G(`translate(${CX} 520) scale(${pop(t, tk + .3, .35)})`, chalkText('1 + 100 = 101', 0, 30, {size: 88, anchor: 'middle'}));
    return s;
  },
  paare(t, b) {
    let s = chalkText(T('meist'), X0, TITLE_Y, {size: 64});
    s += zahlenreihe(t, -99) + bogen(0, 1);
    const t2 = kw('paare', 'zwei'), t3 = kw('paare', 'drei'), t5 = kw('paare', 'fuenfzig');
    s += bogen(1, prog(t, t2, .7)) + bogen(2, prog(t, t3, .7));
    const lbl = t < t3 ? '2 + 99 = 101' : '3 + 98 = 101';
    if (t > t2 && t < t5) s += G(`translate(${CX} 520) scale(${pop(t, t < t3 ? t2 : t3, .3)})`, chalkText(lbl, 0, 30, {size: 88, anchor: 'middle'}));
    if (t > t5) {
      s += G(`translate(${CX} 520) scale(${pop(t, t5, .4)}) rotate(-3)`, chalkText(T('paare'), 0, 30, {size: 120, anchor: 'middle'}));
    }
    return s;
  },
  ergebnis(t, b) {
    const tm = kw('ergebnis', 'mal'), ts = kw('ergebnis', 'summe');
    let s = chalkText('50 × 101', CX, 560, {size: 96, anchor: 'middle', p: prog(t, b.start, Math.max(.4, tm - b.start + .3))});
    if (t > ts - .1) {
      s += G(`translate(${CX} 720) scale(${pop(t, ts - .1, .4)})`, chalkText('= 5050', 0, 40, {size: 120, anchor: 'middle'}));
      s += chalkUnderline(300, 690, 800, prog(t, ts + .3, .3));
    }
    const happy = t > ts;
    s += place(CX, FLOOR - (happy ? Math.abs(Math.sin(t * 9)) * 22 : 0), .72 * pop(t, b.start - .1), figure(GAUSS, {...(happy ? POSE.staunen : POSE.denken), expr: happy ? 'lachen' : 'denken', blink: blinkAt(t, 5)}));
    const bk = pop(t, ts + .1, .35);
    if (bk > 0) s += G(`translate(760 ${930 + idle(t, 5, 6)}) rotate(15) scale(${1.1 * bk})`, bulb(1), RIM);
    return s;
  },
  funfact(t, b) {
    const tk = kw('funfact', 'keine'), tsp = kw('funfact', 'spaeter');
    let s = chalkText(T('fun'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .4)});
    s += chalkText(T('alt'), X0, 440, {size: 56, disp: false, p: prog(t, b.start + .3, .7)});
    s += G(`translate(290 ${790 + idle(t, 2, 4)}) scale(${1.25 * pop(t, b.start + .2, .4)})`, schriftrolle(1), RIM);
    s += chalkText(T('keine'), X0, 510, {size: 56, disp: false, p: prog(t, tk, .7)});
    if (t > tk) s += chalkText('?', 560, 820, {size: 180, p: prog(t, tk + .2, .3), ex: 'transform="rotate(12 560 820)"'});
    s += chalkArrow(290, 900, 290, 1000, prog(t, tsp - .3, .3), 8);
    s += chalkText('1 + 2 + … + 100', 290, 1070, {size: 56, anchor: 'middle', p: prog(t, tsp, .5)});
    s += chalkText(T('spaeter'), X0, 1160, {size: 44, disp: false, p: prog(t, tsp + .4, .6)});
    return s;
  },
};

// Soundeffekte: add(zeitpunkt, name, lautstärke). Namen: siehe pipeline/sfx.py (LIB)
function CUES(add) {
  add(0.0, 'pop', .7); add(0.05, 'chalk'); add(0.3, 'chalk', .7); add(1.5, 'boing', .6);
  add(B.schule.start - .1, 'pop', .7); add(B.schule.start, 'chalk'); add(B.schule.start + .2, 'thud', .6); add(kw('schule', 'aufgabe'), 'chalk', .8);
  add(B.gauss.start - .1, 'pop', .7); add(kw('gauss', 'tafel'), 'whoosh', .8); add(kw('gauss', 'tafel') + .5, 'thud', 1); add(kw('gauss', 'ligget') - .1, 'stamp', .8);
  add(B.warten.start, 'creak', .5); add(kw('warten', 'anderen'), 'chalk'); add(kw('warten', 'anderen') + 1.2, 'hmm', .5);
  add(B.richtig.start, 'pop', .6); add(B.richtig.start + .25, 'pop', .6); add(kw('richtig', 'richtig'), 'ding', 1); add(kw('richtig', 'richtig') + .5, 'buzz', .4);
  add(B.trick.start, 'chalk'); add(kw('trick', 'trick'), 'chalk', .8); add(kw('trick', 'trick') + .3, 'pop', .7);
  add(kw('paare', 'zwei'), 'chalk', .8); add(kw('paare', 'drei'), 'chalk', .8); add(kw('paare', 'fuenfzig'), 'sparkle', .9);
  add(B.ergebnis.start, 'chalk'); add(kw('ergebnis', 'summe') - .1, 'coin', 1); add(kw('ergebnis', 'summe') + .1, 'ding', .8);
  add(B.funfact.start, 'chalk'); add(B.funfact.start + .2, 'pop', .6); add(kw('funfact', 'keine') + .2, 'hmm', .6); add(kw('funfact', 'spaeter'), 'chalk');
}

// Folge: Ramanujans Brief an Hardy und die Taxi-Zahl 1729 – Szenen (eine Funktion pro Beat-ID aus episode.json)
// Jede Szene bekommt die globale Zeit t (s) und ihren Beat b {start,end,text}. Rückgabe: SVG-String.

// Figuren (Anfang 20. Jh.) als Karikaturen
const RAMA = {kleidung: 'anzug', farbe: K.creme, hose: K.gd, haar: 'kurz', haarFarbe: K.haarDunkel};
const HARDY = {kleidung: 'anzug', farbe: K.blau, krawatte: K.rot, haar: 'kurz', haarFarbe: K.haarBraun};
const LITTLE = {kleidung: 'anzug', farbe: K.gruen, krawatte: K.senf, haar: 'kurz', haarFarbe: K.haarDunkel};
const HAUT_R = K.holz;   // dunklerer Hautton für Ramanujan (aus den K-Tokens)
const tone = svg => svg.split(K.haut).join(HAUT_R);
const rama = pose => tone(figure(RAMA, pose));
const ramaHead = o => tone(head({...RAMA, ...o}));

// ---------- Requisiten ----------
// Taxi um 1918 (Räder unten bei y=0, x -200..200, ca. 300 hoch). plate = Nummer auf dem Schild
function taxi(plate = '1729', o = {}) {
  const sp = o.spin || 0;
  const wheel = x => C(x, -42, 42, K.gd) + C(x, -42, 17, K.metall, 4) + LN(`M${x - 30 * Math.cos(sp)},${-42 - 30 * Math.sin(sp)} L${x + 30 * Math.cos(sp)},${-42 + 30 * Math.sin(sp)}`, 4);
  let s = '';
  s += P('M-150,-150 L-140,-270 L110,-270 L130,-150 Z', K.gd);                        // Kabine
  s += R(-128, -252, 104, 86, 8, K.wasser, 4) + R(-6, -252, 104, 86, 8, K.wasser, 4);  // Fenster
  s += R(-46, -304, 92, 34, 8, K.gelb, 4) + `<text x="0" y="-278" ${FD} font-size="26" text-anchor="middle" fill="#111111">TAXI</text>`;
  s += P('M-205,-60 L-205,-140 Q-200,-158 -180,-160 L150,-160 Q190,-158 205,-120 L210,-60 Z', K.rot);   // Karosserie
  s += P('M-205,-60 L210,-60 L210,-44 L-205,-44 Z', K.gd, 4);
  s += C(206, -128, 13, K.gelb, 4);                                                    // Scheinwerfer
  s += LN('M-40,-150 L-40,-64', 4) + C(-24, -110, 5, '#111111', 0);                    // Tür
  s += R(40, -132, 128, 56, 6, K.weiss, 4) + `<text x="104" y="-90" ${FD} font-size="44" text-anchor="middle" fill="#111111">${plate}</text>`;
  s += wheel(-130) + wheel(130);
  return s;
}
const placeTaxi = (x, y, s, o = {}) => s <= 0 ? '' : G(`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`, taxi(o.plate || '1729', o), RIM);
// Briefumschlag, Mitte 0,0
function umschlag(s = 1) {
  return G(`scale(${s})`, R(-80, -50, 160, 100, 6, K.creme) + LN('M-80,-50 L0,8 L80,-50', 4) + R(44, -42, 26, 30, 3, K.rot, 3));
}
// Briefbogen mit Formel-Gekritzel, Mitte 0,0 (ca. 300 × 380). p = 0..1 Zeilen
function briefbogen(p = 1) {
  let s = R(-150, -190, 300, 380, 6, K.weiss);
  const lines = ['∑ ……  =  ……', '1 + …  =  ∞ ?', 'π ≈ ……', '∫ ……  dx', '√ …… + ……', '……  =  ……'];
  lines.forEach((l, i) => { if (p * lines.length > i) s += `<text x="-120" y="${-130 + i * 56}" ${FD} font-size="34" fill="#111111">${l}</text>`; });
  return s;
}
// Dampfschiff (Wasserlinie bei y≈40)
function schiff(t) {
  let s = P('M-130,0 L130,0 L104,50 L-104,50 Z', K.rot);
  s += R(-80, -44, 160, 44, 6, K.creme, 4) + C(-46, -22, 8, K.wasser, 3.5) + C(-8, -22, 8, K.wasser, 3.5) + C(30, -22, 8, K.wasser, 3.5);
  s += R(36, -112, 30, 70, 4, K.gelb, 4) + R(36, -112, 30, 14, 3, K.gd, 3.5);
  const k = (t * .8) % 1;
  s += cloud([[60 + k * 40, -136 - k * 50, 18 + k * 8], [84 + k * 30, -160 - k * 40, 14]], K.weiss, 8);
  return s;
}
// Kontobuch (Hafenamt), Mitte 0,0
function kontobuch(s = 1) {
  let r = R(-150, -100, 300, 200, 10, K.braun) + R(-138, -90, 276, 180, 6, K.creme, 4) + LN('M0,-90 L0,90', 5);
  for (let i = 0; i < 4; i++) r += `<text x="-70" y="${-46 + i * 40}" ${FD} font-size="30" text-anchor="middle" fill="#111111">${['412', '87', '1 905', '2 404'][i]}</text>` + `<text x="70" y="${-46 + i * 40}" ${FD} font-size="30" text-anchor="middle" fill="#111111">${['39', '1 260', '77', '1 376'][i]}</text>`;
  return G(`scale(${s})`, r);
}
// Bett mit Ramanujan (Boden-Mitte bei 0,0, x -270..270). o: {expr, blink, schweiss, tilt}
function bett(o = {}) {
  let s = R(-270, -330, 34, 330, 10, K.holz) + R(236, -200, 34, 200, 10, K.holz);       // Kopf-/Fussteil
  s += R(-250, -140, 500, 70, 12, K.holz) + R(-236, -40, 22, 40, 6, K.holz, 4) + R(214, -40, 22, 40, 6, K.holz, 4);
  s += E(-150, -170, 82, 40, K.weiss);                                                   // Kissen
  s += G(`translate(${-150 - 200 * .6} ${-238 - 165 * .6}) scale(.6) rotate(${o.tilt || 0} 200 165)`, ramaHead({expr: o.expr, blink: o.blink, schweiss: o.schweiss}));
  s += P('M-220,-178 Q-80,-196 60,-188 Q170,-182 250,-160 L250,-90 Q0,-70 -232,-92 Z', K.blau);   // Decke
  s += LN('M-160,-170 Q-60,-182 40,-176', 4);
  return s;
}
const placeBett = (x, y, s, o = {}) => s <= 0 ? '' : G(`translate(${x} ${y}) scale(${s.toFixed(3)})`, bett(o), RIM);
// Kopfposition im Bett (für Glühbirne usw.)
const bettKopf = (x, y, s) => [x - 150 * s, y - 238 * s];

const SCENES = {
  hook(t, b) {
    let s = '';
    wrap(T('hook'), 88, true, 840).forEach((l, i) => s += chalkText(l, X0, TITLE_Y + i * 92, {size: 88, p: t < .05 ? 1 : prog(t, .05 + i * .3, .4)}));
    const tt = kw('hook', 'taxi'), tz = kw('hook', 'zahl');
    const k = easeOut(prog(t, 0, 1.1));
    s += placeTaxi(lerp(-260, CX, k), 1240 + (k < 1 ? Math.abs(Math.sin(t * 18)) * 3 : 0), 1.3, {spin: t * 9 * (1 - k * .9)});
    if (t > tz - .15) s += G(`translate(${CX} ${790 + idle(t, 2.4, 6)}) scale(${pop(t, tz - .15, .45)}) rotate(-4)`, chalkText('1729', 0, 0, {size: 150, anchor: 'middle'}));
    const tq = Math.min(tz + .3, b.end - .7);
    [[150, 700, -12], [850, 760, 10]].forEach(([x, y, r], i) => {
      if (t > tq + i * .15) s += G(`translate(${x} ${y + idle(t + i, 3, 8)}) scale(${pop(t, tq + i * .15, .35)}) rotate(${r + Math.sin(t * 4 + i) * 6})`, chalkText('?', 0, 0, {size: 120, anchor: 'middle'}));
    });
    return s;
  },
  ort(t, b) {
    let s = chalkText(T('ort'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .7)});
    const tsr = kw('ort', 'srini'), th = kw('ort', 'hafen'), ta = kw('ort', 'allein');
    s += chalkText(T('name'), X0, TITLE_Y + 76, {size: 56, disp: false, p: prog(t, tsr - .1, .7)});
    s += chalkText(T('selbst'), X0, TITLE_Y + 146, {size: 44, disp: false, color: K.gh, p: prog(t, ta - .4, .6)});
    s += place(250, FLOOR + idle(t, 2, 2), .7 * pop(t, b.start, .45), rama({...(t > ta - .2 ? POSE.denken : t > th ? POSE.zeigenSeite : POSE.stehen), expr: t > ta - .2 ? 'denken' : 'freundlich', blink: blinkAt(t, 1)}));
    // Hafenamt: Kontobuch + Schiffchen
    if (t > th - .3) {
      s += G(`translate(690 ${720 + idle(t, 1.7, 4)}) scale(${pop(t, th - .3, .4)}) rotate(-5)`, kontobuch(.95), RIM);
      s += chalkText(T('hafen'), 690, 610, {size: 44, disp: false, anchor: 'middle', p: prog(t, th - .1, .4)});
      s += G(`translate(${700 + Math.sin(t * .9) * 30} ${1110 + Math.sin(t * 2.4) * 6}) scale(${.8 * pop(t, th, .4)}) rotate(${Math.sin(t * 2.4) * 3})`, schiff(t), RIM);
      s += chalkLine('M520,1160 q40,-14 80,0 t80,0 t80,0 t80,0 t80,0', prog(t, th, .6), 7);
    }
    // Formel-Gedanken um den Kopf
    const sym = [['M-34,-26 L34,-26 M-16,-26 L-20,30 M14,-26 L14,26 Q16,32 28,26', 110, 780], ['M-40,0 C-40,-30 0,-30 0,0 C0,30 40,30 40,0 C40,-30 0,-30 0,0 C0,30 -40,30 -40,0', 410, 760],
                 ['M-40,0 L-28,-8 L-12,30 L10,-40 L50,-40', 90, 950], ['M30,-36 L-30,-36 L6,0 L-30,36 L30,36', 430, 920]];
    sym.forEach(([d, x, y], i) => {
      const a = ta - .3 + i * .15; if (t < a) return;
      const yy = y + idle(t + i, 2.6, 7);
      s += chalkLine(d.replace(/(-?[\d.]+),(-?[\d.]+)/g, (m, u, v) => `${(+u + x).toFixed(1)},${(+v + yy).toFixed(1)}`), prog(t, a, .35), 8);
    });
    return s;
  },
  brief(t, b) {
    let s = chalkText(T('brief'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .7)});
    const tb = kw('brief', 'brief'), tc = kw('brief', 'cambridge'), th = kw('brief', 'hardy'), tf = kw('brief', 'formeln'), tbw = kw('brief', 'beweise');
    const mx = 230, my = 640, cx = 820, cy = 560;
    s += `<circle cx="${mx}" cy="${my}" r="${(15 * pop(t, b.start + .1, .3)).toFixed(1)}" fill="${K.weiss}"/>`;
    s += chalkText(T('madras'), mx, my - 34, {size: 44, disp: false, anchor: 'middle', p: prog(t, b.start + .2, .4)});
    s += chalkLine(`M${mx + 20},${my - 10} Q${(mx + cx) / 2},${my - 200} ${cx - 20},${cy - 10}`, prog(t, Math.min(th, tc) - .8, .9), 7);
    if (t > Math.min(th, tc) - .3) {
      s += `<circle cx="${cx}" cy="${cy}" r="${(15 * pop(t, Math.min(th, tc) - .3, .3)).toFixed(1)}" fill="${K.weiss}"/>`;
      s += chalkText(T('cambridge'), cx + 20, cy - 48, {size: 44, disp: false, anchor: 'end', p: prog(t, Math.min(th, tc) - .2, .4)});
      s += chalkText(T('an'), cx + 10, cy + 56, {size: 34, disp: false, anchor: 'end', color: K.gh, p: prog(t, th - .1, .5)});
    }
    // Umschlag fliegt den Bogen entlang
    const k = easeInOut(prog(t, tb - .2, Math.max(.6, tf - tb - .2)));
    if (t > tb - .2 && t < tf + .1) {
      const u = k, x = (1 - u) * (1 - u) * mx + 2 * u * (1 - u) * (mx + cx) / 2 + u * u * cx, y = (1 - u) * (1 - u) * my + 2 * u * (1 - u) * (my - 200) + u * u * cy;
      s += G(`translate(${x.toFixed(1)} ${(y - 30).toFixed(1)}) rotate(${Math.sin(t * 5) * 8}) scale(${.7 * pop(t, tb - .2, .3)})`, umschlag(1), RIM);
    }
    // Briefbogen mit Formeln
    if (t > tf - .1) s += G(`translate(620 ${960 + idle(t, 1.5, 4)}) rotate(4) scale(${.78 * pop(t, tf - .1, .4)})`, briefbogen(prog(t, tf, Math.max(.5, tbw - tf))), RIM);
    const tb2 = Math.min(tbw - .5, b.end - 1.3);
    if (t > tb2) {
      s += chalkText(T('beweise'), 620, 1230, {size: 56, disp: false, anchor: 'middle', p: prog(t, tb2, .35)});
      s += chalkCross(620, 1212, 46, prog(t, tb2 + .5, .35));
    }
    s += place(200, FLOOR + idle(t, 2, 2), .5 * pop(t, b.start, .4), rama({...(t > tb - .2 && t < tf ? POSE.zeigen : POSE.stehen), expr: t > tb2 + .5 ? 'zwinkern' : 'freundlich', blink: blinkAt(t, 2)}));
    return s;
  },
  pruefen(t, b) {
    let s = chalkText(T('pruefen'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .6)});
    const tp = kw('pruefen', 'pruef'), tl = kw('pruefen', 'little'), tw = kw('pruefen', 'weder'), twi = kw('pruefen', 'wider');
    // drei Formel-Zeilen (Gekritzel), zwei bekommen Haken, die dritte ein Fragezeichen
    const rows = [470, 570, 670];
    rows.forEach((y, i) => {
      s += chalkLine(`M150,${y} q30,-26 60,0 t60,0 t60,0 M360,${y - 12} L410,${y - 12} M360,${y + 8} L410,${y + 8} M440,${y} q30,-26 60,0 t60,0`, prog(t, b.start + .1 + i * .25, .5), 7);
    });
    s += chalkCheck(640, 470, prog(t, tp, .3));
    s += chalkCheck(640, 570, prog(t, tl, .3));
    if (t > tw - .1) s += G(`translate(690 ${716 + idle(t, 4, 6)}) scale(${pop(t, tw - .1, .4)}) rotate(${Math.sin(t * 5) * 10})`, chalkText('?', 0, 0, {size: 110, anchor: 'middle'}));
    if (t > tw + .3) s += G(`translate(800 ${700 + idle(t + 1, 4, 6)}) scale(${pop(t, tw + .3, .4)}) rotate(${12 + Math.sin(t * 5 + 1) * 10})`, chalkText('?', 0, 0, {size: 90, anchor: 'middle'}));
    s += chalkText(T('unklar'), CX, 800, {size: 44, disp: false, anchor: 'middle', p: prog(t, Math.min(twi - .3, tw + .3), .6)});
    s += chalkText(T('hardy'), 230, 860, {size: 34, disp: false, anchor: 'middle', color: K.gh, p: prog(t, b.start + .3, .4)});
    s += chalkText(T('little'), 760, 860, {size: 34, disp: false, anchor: 'middle', color: K.gh, p: prog(t, tl - .1, .4)});
    s += place(230, FLOOR + idle(t, 2, 2), .6 * pop(t, b.start, .4), figure(HARDY, {...(t > tw ? POSE.denken : POSE.zeigen), expr: t > tw ? 'verwirrt' : 'freundlich', blink: blinkAt(t, 3)}));
    s += place(760, FLOOR + idle(t + 1, 2, 2), .6 * pop(t, tl - .2, .4), figure(LITTLE, {...(t > tw + .2 ? POSE.staunen : POSE.stehen), expr: t > tw + .2 ? 'staunen' : 'freundlich', blink: blinkAt(t, 4)}));
    return s;
  },
  reise(t, b) {
    let s = chalkText(T('reise'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .6)});
    const tl = kw('reise', 'laedt'), tr = tl + .3;
    const ix = 170, iy = 1080, ex = 760, ey = 620;
    s += `<circle cx="${ix}" cy="${iy}" r="${(15 * pop(t, b.start + .1, .3)).toFixed(1)}" fill="${K.weiss}"/>`;
    s += chalkText(T('indien'), ix, iy + 70, {size: 44, disp: false, anchor: 'middle', p: prog(t, b.start + .2, .4)});
    s += `<circle cx="${ex}" cy="${ey}" r="${(15 * pop(t, b.start + .2, .3)).toFixed(1)}" fill="${K.weiss}"/>`;
    s += chalkText(T('england'), ex, ey - 34, {size: 44, disp: false, anchor: 'middle', p: prog(t, b.start + .3, .4)});
    s += chalkLine(`M${ix + 20},${iy - 20} Q${ix + 120},${ey + 40} ${ex - 24},${ey + 6}`, prog(t, tr - .4, .8), 7);
    // Schiff fährt
    const k = .8 * easeInOut(prog(t, tr - .2, Math.max(1, b.end - tr - .3)));
    const u = k, qx = ix + 120, qy = ey + 40;
    const x = (1 - u) * (1 - u) * (ix + 20) + 2 * u * (1 - u) * qx + u * u * (ex - 24), y = (1 - u) * (1 - u) * (iy - 20) + 2 * u * (1 - u) * qy + u * u * (ey + 6);
    s += G(`translate(${x.toFixed(1)} ${(y + 40 + Math.sin(t * 2.6) * 5).toFixed(1)}) scale(${.6 * pop(t, b.start + .2, .4)}) rotate(${Math.sin(t * 2.6) * 3})`, schiff(t), RIM);
    // Hardy mit Einladung
    s += place(780, FLOOR + idle(t, 2, 2), .56 * pop(t, b.start, .4), figure(HARDY, {...(t > tl - .2 ? POSE.geben : POSE.stehen), lProp: t > tl - .2 ? G('translate(-30 -10) scale(.45) rotate(-10)', umschlag(1)) : '', expr: t > tr ? 'lachen' : 'freundlich', blink: blinkAt(t, 5)}));
    return s;
  },
  krank(t, b) {
    let s = chalkText(T('krank'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .6)});
    const tk = kw('krank', 'krank'), tb = kw('krank', 'besucht');
    s += placeBett(330, 1250, .95 * pop(t, b.start, .45), {expr: t > tb + .3 ? 'freundlich' : 'denken', blink: blinkAt(t, 6), schweiss: t > tk, tilt: t > tk && t < tb ? -6 : 0});
    // Fiebermesser
    if (t > tk) s += G(`translate(470 ${880 + idle(t, 3, 5)}) scale(${pop(t, tk, .35)}) rotate(20)`, R(-10, -70, 20, 110, 10, K.weiss, 4) + C(0, 44, 16, K.rot, 4) + R(-4, -20, 8, 60, 4, K.rot, 0), RIM);
    // Hardy kommt herein
    if (t > tb - .3) {
      const k = easeOut(prog(t, tb - .3, .8));
      s += place(lerp(1150, 790, k), FLOOR - (k < 1 ? Math.abs(Math.sin(t * 12)) * 8 : idle(t, 2, 2)), .62, figure(HARDY, {...(k < 1 ? POSE.stehen : POSE.zeigenSeite), lH: 'offen', expr: 'freundlich', blink: blinkAt(t, 7)}));
    }
    return s;
  },
  taxi(t, b) {
    const tt = kw('taxi', 'taxi2'), tn = kw('taxi', 'nummer'), td = kw('taxi', 'dull');
    let s = chalkText(T('taxi'), X0, TITLE_Y, {size: 64, p: prog(t, tn - .3, .7)});
    const k = easeOut(prog(t, tt - .4, .9));
    s += placeTaxi(lerp(1250, 680, k), 1240, .95, {spin: (1 - k) * t * 9});
    if (t > tn) {
      s += G(`translate(680 ${780 + idle(t, 2.4, 5)}) scale(${pop(t, tn, .4)})`, chalkText('1729', 0, 0, {size: 120, anchor: 'middle'}));
      s += chalkArrow(740, 840, 780, 1060, prog(t, tn + .2, .4));
    }
    s += chalkText(T('dull'), X0, 450, {size: 56, disp: false, p: prog(t, td - .2, .7)});
    // Zzz beim „langweilig“
    ['z', 'z', 'Z'].forEach((c, i) => {
      const a = td + .1 + i * .2; if (t < a) return;
      s += G(`translate(${350 + i * 40} ${820 - i * 50 + idle(t + i, 2, 6)}) scale(${pop(t, a, .3)})`, chalkText(c, 0, 0, {size: 50 + i * 14, anchor: 'middle'}));
    });
    s += place(220, FLOOR + idle(t, 2, 2), .64 * pop(t, b.start, .4), figure(HARDY, {...(t > td ? POSE.denken : t > tn ? POSE.zeigenSeite : POSE.stehen), expr: t > td ? 'denken' : 'freundlich', tilt: t > td ? -6 : 0, blink: blinkAt(t, 8)}));
    return s;
  },
  antwort(t, b) {
    const tn = kw('antwort', 'nein'), ti = kw('antwort', 'interessant'), tk = kw('antwort', 'kleinste'), tz = kw('antwort', 'zwei'), tc = kw('antwort', 'kubik');
    let s = '';
    if (t > tn - .2) s += G(`translate(${X0} ${TITLE_Y}) scale(${Math.min(1.08, pop(t, tn - .2, .4))})`, chalkText(T('antwort'), 0, 0, {size: 64}));
    s += chalkText(T('a1'), X0, 450, {size: 44, disp: false, p: prog(t, tk - .3, .5)});
    s += chalkText(T('a2'), X0, 515, {size: 44, disp: false, p: prog(t, Math.min(tc, tz) - .6, .8)});
    s += chalkText(T('a3'), X0, 600, {size: 64, p: prog(t, Math.max(tc, tz) - .3, .6)});
    if (t > Math.max(tc, tz) + .3) s += chalkUnderline(X0, X0 + tw(T('a3'), 64, true), 625, prog(t, Math.max(tc, tz) + .3, .4));
    s += placeBett(300, 1250, .85, {expr: t > ti ? 'lachen' : t > tn ? 'staunen' : 'denken', blink: blinkAt(t, 9), tilt: t > tn ? 6 : 0});
    const [hx, hy] = bettKopf(300, 1250, .85);
    if (t > tn - .1) s += G(`translate(${hx + 10} ${hy - 150 + idle(t, 3, 5)}) scale(${.9 * pop(t, tn - .1, .4)})`, bulb(1), RIM);
    s += G(`translate(560 ${830 + idle(t, 2.2, 5)}) scale(${pop(t, ti, .4)}) rotate(-6)`, chalkText('1729', 0, 0, {size: 96, anchor: 'middle'}));
    s += place(810, FLOOR + idle(t, 2, 2), .56 * pop(t, b.start, .4), figure(HARDY, {...(t > tk ? POSE.staunen : POSE.stehen), expr: t > tk ? 'staunen' : 'freundlich', blink: blinkAt(t, 10)}));
    return s;
  },
  rechnung(t, b) {
    let s = chalkText(T('rechnung'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .5)});
    const t1 = kw('rechnung', 'c1'), t12 = kw('rechnung', 'c12'), t9 = kw('rechnung', 'c9'), t10 = kw('rechnung', 'c10');
    s += chalkText('1³ + 12³', 100, 480, {size: 88, p: prog(t, t1 - .2, Math.max(.6, t12 - t1 + .4))});
    s += chalkText('= 1 + 1728', 120, 550, {size: 44, disp: false, color: K.gh, p: prog(t, t12 + .15, .4)});
    s += chalkText('9³ + 10³', 100, 680, {size: 88, p: prog(t, t9 - .2, Math.max(.6, t10 - t9 + .4))});
    s += chalkText('= 729 + 1000', 120, 750, {size: 44, disp: false, color: K.gh, p: prog(t, Math.min(t10 + .15, t9 + .5), .4)});
    const te = Math.min(b.end - .9, t10 + .8);
    s += chalkLine('M520,450 Q580,460 600,560', prog(t, te - .2, .3), 7) + chalkLine('M520,660 Q580,650 600,580', prog(t, te - .2, .3), 7);
    if (t > te) s += G(`translate(770 ${590 + idle(t, 2.4, 5)}) scale(${pop(t, te, .45)}) rotate(-3)`, chalkText('= 1729', 0, 0, {size: 100, anchor: 'middle'}));
    if (t > te + .2) s += chalkCheck(880, 640, prog(t, te + .2, .3));
    // Würfel im Massstab (Kantenlänge × 13)
    const lab = (x, y, txt) => `<text x="${x}" y="${y}" ${FD} font-size="40" text-anchor="middle" fill="#111111">${txt}</text>`;
    const W = (x, side, col, a, label, ly) => {
      const k = pop(t, a, .4); if (k <= 0) return '';
      const d = side * .38;
      return G(`translate(${x} 1240) scale(${k.toFixed(3)})`, cube(side, col) + (label && side > 60 ? lab(-d / 2, -side / 2 + 14, label) : ''), RIM);
    };
    s += W(110, 13, K.gelb, t1 - .1);
    if (t > t1) s += chalkText('1³', 104, 1190, {size: 34, disp: false, anchor: 'middle', p: prog(t, t1, .3)});
    s += W(290, 156, K.gelb, t12 - .1, '12³');
    s += W(570, 117, K.blau, t9 - .1, '9³');
    s += W(790, 130, K.blau, t10 - .1, '10³');
    return s;
  },
  funfact(t, b) {
    let s = chalkText(T('fun'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .4)});
    const tz = Math.min(kw('funfact', 'taxizahl'), b.start + .8);
    s += chalkText(T('taxizahlen'), X0, 470, {size: 88, p: prog(t, tz - .4, .6)});
    if (t > tz + .2) s += chalkUnderline(X0, X0 + tw(T('taxizahlen'), 88, true), 500, prog(t, tz + .2, .4));
    s += chalkText('Ta(2) = 1729', X0, 620, {size: 64, p: prog(t, tz + .5, .5)});
    s += chalkText(T('ta3'), X0, 700, {size: 34, disp: false, color: K.gh, p: prog(t, tz + .8, .45)});
    // Taxi fährt vorbei und bleibt stehen
    const k = easeOut(prog(t, b.start - .2, 1.1));
    s += placeTaxi(lerp(-300, 560, k), 1175, .9, {spin: (1 - k) * t * 9});
    if (t > b.start + 1) s += G(`translate(240 ${880 + idle(t, 2.4, 6)}) scale(${pop(t, b.start + 1, .4)})`, bulb(.9), RIM);
    return s;
  },
};

// Soundeffekte: add(zeitpunkt, name, lautstärke). Namen: siehe pipeline/sfx.py (LIB)
function CUES(add) {
  add(0.0, 'whoosh', .6); add(0.05, 'chalk'); add(.9, 'boing', .4); add(kw('hook', 'zahl') - .15, 'stamp', .8); add(kw('hook', 'zahl') + .3, 'hmm', .5);
  add(B.ort.start, 'chalk'); add(kw('ort', 'hafen') - .3, 'pop', .6); add(kw('ort', 'hafen'), 'water', .4); add(kw('ort', 'allein') - .3, 'sparkle', .7);
  add(B.brief.start, 'chalk'); add(kw('brief', 'brief') - .2, 'whoosh', .6); add(kw('brief', 'formeln') - .1, 'pop', .7); add(Math.min(kw('brief', 'beweise') - .5, B.brief.end - 1.3) + .5, 'buzz', .5);
  add(B.pruefen.start, 'chalk'); add(kw('pruefen', 'pruef'), 'ding', .6); add(kw('pruefen', 'little'), 'ding', .6); add(kw('pruefen', 'weder') - .1, 'hmm', .7);
  add(B.reise.start, 'chalk'); add(kw('reise', 'laedt') - .2, 'pop', .6); add(kw('reise', 'laedt') + .1, 'water', .5);
  add(B.krank.start, 'chalk'); add(kw('krank', 'krank'), 'plop', .5); add(kw('krank', 'besucht') - .3, 'creak', .5);
  add(kw('taxi', 'taxi2') - .4, 'zip', .5); add(kw('taxi', 'nummer'), 'stamp', .7); add(kw('taxi', 'dull') + .1, 'hmm', .6);
  add(kw('antwort', 'nein') - .2, 'boing', .7); add(kw('antwort', 'interessant'), 'sparkle', .7); add(kw('antwort', 'kleinste') - .3, 'chalk'); add(kw('antwort', 'kubik') + .2, 'gasp', .5);
  add(B.rechnung.start, 'chalk'); add(kw('rechnung', 'c12') - .1, 'thud', .6); add(kw('rechnung', 'c10') - .1, 'thud', .6); add(Math.min(B.rechnung.end - .9, kw('rechnung', 'c10') + .8), 'ding', .9);
  add(B.funfact.start - .2, 'zip', .5); add(Math.min(kw('funfact', 'taxizahl'), B.funfact.start + .8) - .4, 'chalk'); add(B.funfact.start + 1, 'sparkle', .7);
}

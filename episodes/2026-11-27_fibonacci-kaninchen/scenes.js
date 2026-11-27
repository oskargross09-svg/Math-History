// Folge: Fibonacci und die Kaninchen-Aufgabe (Liber Abaci, 1202) – Szenen (eine Funktion pro Beat-ID aus episode.json)
// Jede Szene bekommt die globale Zeit t (s) und ihren Beat b {start,end,text}. Rückgabe: SVG-String.

// Figuren (Mittelalter) als Karikaturen
const FIBO = FIG.fibonacci;
const MANN = {kleidung: 'gewand', farbe: K.braun, guertel: K.senf, haar: 'kurz', haarFarbe: K.haarBraun, bart: 'voll', bartFarbe: K.haarBraun};

// ---------- Kaninchen (Füsse bei 0,0, schaut nach rechts, ca. 150 breit × 170 hoch) ----------
function hase(col, o = {}) {
  const ear = o.ear || 0;
  let s = '';
  s += G(`rotate(${-14 + ear} 34 -100)`, E(34, -138, 12, 40, col) + E(34, -134, 5, 26, K.zunge, 3));
  s += G(`rotate(${10 - ear} 52 -100)`, E(52, -138, 12, 40, col) + E(52, -134, 5, 26, K.zunge, 3));
  s += C(-52, -46, 15, K.weiss);                       // Schwanz
  s += E(0, -42, 54, 40, col);                          // Körper
  s += E(-14, -6, 32, 11, col);                         // Hinterpfote
  s += E(40, -7, 15, 9, col);                           // Vorderpfote
  s += C(44, -82, 32, col);                             // Kopf
  s += o.blink ? LN('M50,-88 Q56,-84 62,-88', 4) : C(56, -88, 6, '#111111', 0) + C(58, -90, 2, '#ffffff', 0);
  s += C(76, -78, 6, K.zunge, 3);                       // Nase
  s += LN('M72,-68 Q68,-62 62,-66', 3.5);               // Mund
  s += E(46, -68, 9, 5, K.zunge, 0, 'opacity=".55"');   // Wange
  return s;
}
// ein Kaninchen platzieren: x,y = Füsse, s = Skalierung, dir = 1 (rechts) / -1 (links), hop = Sprunghöhe
function placeHase(x, y, s, col, dir = 1, o = {}) {
  if (s <= 0) return '';
  return G(`translate(${x} ${(y - (o.hop || 0)).toFixed(1)}) scale(${(s * dir).toFixed(3)} ${s.toFixed(3)})`, hase(col, o), RIM);
}
// ein Paar (zwei Kaninchen, einander zugewandt) mit Herz
function paar(x, y, s, t, seed = 0, herz = true) {
  if (s <= 0) return '';
  const h1 = Math.max(0, Math.sin(t * 6 + seed)) * 10 * s, h2 = Math.max(0, Math.sin(t * 6 + seed + 2)) * 10 * s;
  let r = placeHase(x - 62 * s, y, s, K.creme, 1, {hop: h1, blink: blinkAt(t, seed), ear: Math.sin(t * 3 + seed) * 5});
  r += placeHase(x + 62 * s, y, s, K.braun, -1, {hop: h2, blink: blinkAt(t, seed + 1), ear: Math.sin(t * 3 + seed + 1) * 5});
  if (herz) r += G(`translate(${x} ${y - 200 * s + idle(t, 3, 5)}) scale(${s})`, P('M0,18 Q-30,-4 -22,-18 Q-12,-30 0,-16 Q12,-30 22,-18 Q30,-4 0,18 Z', K.rot, 4), RIM);
  return r;
}
// kleines Paar-Symbol für Raster (zwei Köpfe)
function paarIcon(x, y, s) {
  if (s <= 0) return '';
  const kopf = (dx, col, dir) => G(`translate(${dx} 0) scale(${dir} 1)`, E(-6, -56, 8, 24, col, 4) + E(8, -56, 8, 24, col, 4) + C(0, -18, 22, col, 4) + C(8, -22, 4, '#111111', 0) + C(20, -16, 4, K.zunge, 2.5));
  return G(`translate(${x} ${y}) scale(${s.toFixed(3)})`, kopf(-26, K.creme, 1) + kopf(26, K.braun, -1), RIM);
}
// Buch (Kodex), Mitte 0,0, ca. 300 × 220
function codex(s = 1, inner = '') {
  return G(`scale(${s})`, R(-150, -110, 300, 220, 12, K.rot) + R(-136, -100, 272, 200, 8, K.pergament, 4) + LN('M0,-100 L0,100', 5) +
    LN('M-118,-60 L-20,-60 M-118,-30 L-30,-30 M-118,0 L-24,0 M-118,30 L-40,30 M20,-60 L118,-60 M20,-30 L110,-30 M20,0 L118,0 M20,30 L96,30', 3.5) + inner);
}
// Steinmauer-Segment (x1..x2 waagrecht oder senkrecht), p = 0..1 Aufbau
function mauer(x, y, w, h, p) {
  if (p <= 0) return '';
  const ww = w >= h ? w * p : w, hh = h > w ? h * p : h;
  let s = R(x, y, ww, hh, 4, K.metall, 4.5);
  if (w >= h) for (let i = 1; i * 46 < ww - 6; i++) s += LN(`M${x + i * 46},${y + 3} L${x + i * 46},${y + hh - 3}`, 3);
  else for (let i = 1; i * 46 < hh - 6; i++) s += LN(`M${x + 3},${y + i * 46} L${x + ww - 3},${y + i * 46}`, 3);
  return `<g ${RIM}>${s}</g>`;
}

const SCENES = {
  hook(t, b) {
    let s = '';
    wrap(T('hook'), 88, true, 840).forEach((l, i) => s += chalkText(l, X0, TITLE_Y + i * 92, {size: 88, p: t < .05 ? 1 : prog(t, .05 + i * .3, .4)}));
    const tk = kw('hook', 'kaninchen'), tp = kw('hook', 'paar'), tj = kw('hook', 'jahr');
    s += paar(CX, 1180, .95 * pop(t, 0, .4), t, 0, t > tp);
    // beim „Jahr“: viele kleine Paare ploppen auf
    const spots = [[150, 760], [820, 800], [260, 930], [720, 960], [120, 1080], [870, 1110], [380, 760], [610, 760]];
    spots.forEach(([x, y], i) => s += paarIcon(x, y + idle(t + i, 2.2, 6), .9 * pop(t, tp + .05 + i * .07, .3)));
    if (t > tj - .1) s += G(`translate(${CX} ${960 + idle(t, 3, 8)}) scale(${pop(t, tj - .1, .4)}) rotate(${8 + Math.sin(t * 4) * 6})`, chalkText('?', 0, 0, {size: 160, anchor: 'middle'}));
    return s;
  },
  ort(t, b) {
    let s = chalkText(T('ort'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .7)});
    const tl = kw('ort', 'leonardo'), tf = kw('ort', 'fibonacci'), ta = kw('ort', 'afrika'), tz = kw('ort', 'ziffern');
    s += chalkText(T('name'), X0, TITLE_Y + 76, {size: 56, disp: false, p: prog(t, tf - .2, .6)});
    s += place(230, FLOOR + idle(t, 2, 2), .74 * pop(t, b.start, .45), figure(FIBO, {...(t > tz ? POSE.zeigen : t > tl ? POSE.stehen : POSE.denken), expr: t > tz ? 'staunen' : 'freundlich', blink: blinkAt(t, 1)}));
    // kleine Karte: Pisa oben, Bugia (Nordafrika) unten, Seeweg
    const px = 640, py = 590, bx = 600, by = 900;
    s += `<circle cx="${px}" cy="${py}" r="${(16 * pop(t, b.start + .2, .3)).toFixed(1)}" fill="${K.weiss}"/>`;
    s += chalkText(T('pisa'), px + 34, py + 16, {size: 44, disp: false, p: prog(t, b.start + .3, .4)});
    s += chalkLine(`M${px},${py + 24} Q${px + 160},${(py + by) / 2} ${bx + 10},${by - 26}`, prog(t, ta - .6, .8), 7);
    if (t > ta - .1) {
      s += `<circle cx="${bx}" cy="${by}" r="${(16 * pop(t, ta - .1, .3)).toFixed(1)}" fill="${K.weiss}"/>`;
      s += chalkText(T('bugia'), bx + 34, by + 16, {size: 44, disp: false, p: prog(t, ta, .4)});
      s += chalkText(T('afrika'), bx - 20, by + 70, {size: 34, disp: false, color: K.gh, p: prog(t, ta + .2, .5)});
      // Schiffchen auf dem Seeweg
      const k = easeInOut(prog(t, ta - .4, 1.2)), sx = lerp(px + 20, bx + 60, k) + Math.sin(k * Math.PI) * 120, sy = lerp(py + 40, by - 40, k);
      s += G(`translate(${sx.toFixed(1)} ${sy.toFixed(1)}) rotate(${Math.sin(t * 4) * 5}) scale(.7)`, P('M-40,0 L40,0 L28,20 L-28,20 Z', K.holz, 4) + P('M0,-4 L0,-56 L30,-10 Z', K.weiss, 4) + LN('M0,-4 L0,-56', 4), RIM);
    }
    // Ziffern 1–9, 0
    const dig = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    dig.forEach((d, i) => {
      const k = pop(t, tz - .3 + i * .08, .3); if (k <= 0) return;
      const x = 520 + (i % 5) * 80, y = 1080 + Math.floor(i / 5) * 90;
      s += G(`translate(${x} ${y + idle(t + i, 2.5, 4)}) scale(${k})`, chalkText(d, 0, 0, {size: 72, anchor: 'middle'}));
    });
    s += chalkText(T('ziffern'), 680, 1230, {size: 34, disp: false, anchor: 'middle', color: K.gh, p: prog(t, tz - .1, .4)});
    return s;
  },
  buch(t, b) {
    let s = chalkText(T('buch'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .7)});
    const tli = kw('buch', 'liber'), tb = kw('buch', 'buch'), te = kw('buch', 'europa');
    s += chalkText(T('untertitel'), X0, TITLE_Y + 76, {size: 44, disp: false, p: prog(t, tb - .1, .6)});
    // Buch klappt auf
    const open = pop(t, Math.min(tli - .3, b.start + .4), .45);
    if (open > 0) s += G(`translate(330 ${780 + idle(t, 1.6, 5)}) rotate(${-4 + Math.sin(t * 1.4) * 2})`, G(`scale(${open.toFixed(3)} ${Math.min(1, open).toFixed(3)})`, codex(1.05,
      `<text x="-68" y="74" ${FD} font-size="40" text-anchor="middle" fill="#111111">1 2 3</text><text x="68" y="74" ${FD} font-size="40" text-anchor="middle" fill="#111111">5 8 13</text>`
    )), RIM);
    // römisch → indisch-arabisch
    s += chalkText('MCCII', 700, 680, {size: 88, anchor: 'middle', p: prog(t, b.start + .3, .6)});
    if (t > te - .5) s += chalkCross(700, 650, 90, prog(t, te - .5, .4));
    s += chalkArrow(700, 720, 700, 830, prog(t, te - .2, .4));
    if (t > te) s += G(`translate(700 ${920 + idle(t, 2.5, 5)}) scale(${pop(t, te, .4)})`, chalkText('1202', 0, 0, {size: 100, anchor: 'middle'}));
    s += chalkText(T('europa'), 700, 990, {size: 44, disp: false, anchor: 'middle', p: prog(t, te - .1, .35)});
    s += place(800, FLOOR + idle(t, 2, 2), .42 * pop(t, b.start + .1, .4), figure(FIBO, {...(t > te ? POSE.staunen : POSE.zeigen), expr: t > te ? 'lachen' : 'freundlich', blink: blinkAt(t, 2)}));
    return s;
  },
  aufgabe(t, b) {
    let s = chalkText(T('aufgabe'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .6)});
    const ta = kw('aufgabe', 'aufgabe'), tk = kw('aufgabe', 'kpaar'), tm = kw('aufgabe', 'mauern');
    // Schriftrolle mit der Aufgabe oben rechts
    s += G(`translate(760 ${330 + idle(t, 1.8, 4)}) scale(${.55 * pop(t, ta - .1, .4)}) rotate(6)`, schriftrolle(1), RIM);
    // Gehege (Draufsicht-Andeutung): hintere Mauer, Seiten, vordere Mauer
    const gx = 440, gy = 780, gw = 460, gh = 440;
    s += mauer(gx, gy, gw, 34, prog(t, tm - .5, .3));
    s += mauer(gx, gy, 34, gh, prog(t, tm - .3, .3));
    s += mauer(gx + gw - 34, gy, 34, gh, prog(t, tm - .3, .3));
    // Kaninchenpaar fällt hinein
    const kp = pop(t, tk - .2, .45), drop = (1 - easeOut(prog(t, tk - .2, .5))) * 220;
    s += paar(gx + gw / 2, gy + gh - 40 - drop, .7 * kp, t, 3, t > tm);
    s += mauer(gx, gy + gh - 34, gw, 34, prog(t, tm - .1, .3));
    s += chalkText(T('mauer'), gx + gw / 2, gy - 30, {size: 44, disp: false, anchor: 'middle', p: prog(t, tm - .3, .4)});
    s += place(230, FLOOR + idle(t, 2, 2), .72 * pop(t, b.start, .45), figure(MANN, {...(t > tk - .3 && t < tm + .6 ? POSE.zeigenSeite : POSE.stehen), expr: t > tm + .6 ? 'zwinkern' : 'freundlich', blink: blinkAt(t, 3)}));
    return s;
  },
  regel(t, b) {
    let s = chalkText(T('regel'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .5)});
    const tmo = kw('regel', 'monat'), tn = kw('regel', 'neues'), tj = kw('regel', 'jungen'), tz = kw('regel', 'zweiten'), tse = kw('regel', 'selbst');
    s += chalkText(T('r1'), X0, 440, {size: 44, disp: false, p: prog(t, tmo - .2, .6)});
    s += chalkText(T('r2'), X0, 510, {size: 44, disp: false, p: prog(t, tj - .1, .6)});
    // Eltern-Paar links
    s += paar(250, 1180, .85 * pop(t, b.start, .4), t, 0, true);
    // Pfeil + Kalenderblatt „Monat 1“
    s += chalkArrow(420, 1000, 560, 1000, prog(t, tn - .4, .4));
    const cal = (x, y, n, k) => k <= 0 ? '' : G(`translate(${x} ${y}) scale(${k})`, R(-46, -50, 92, 100, 8, K.weiss) + R(-46, -50, 92, 26, 8, K.rot) + `<text x="0" y="34" ${FD} font-size="52" text-anchor="middle" fill="#111111">${n}</text>`, RIM);
    s += cal(490, 880, '1', pop(t, tmo - .2, .35));
    // Junges Paar rechts: klein → wächst ab dem zweiten Monat
    const grow = .45 + .3 * easeInOut(prog(t, tz - .1, .7));
    s += paar(720, 1200, grow * pop(t, tn - .1, .4), t, 4, t > tse - .2);
    if (t > tz - .2) s += cal(720, 700, '2', pop(t, tz - .2, .35));
    if (t > tse) s += chalkCheck(800, 640, prog(t, tse, .3));
    return s;
  },
  zaehlen(t, b) {
    let s = chalkText(T('zaehlen'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .5)});
    const keys = ['n1', 'n2', 'n3', 'n5', 'n8', 'n13'], vals = [1, 2, 3, 5, 8, 13];
    const ts = keys.map(k => kw('zaehlen', k));
    // Zahlenreihe
    vals.forEach((v, i) => {
      const k = pop(t, ts[i] - .1, .35); if (k <= 0) return;
      s += G(`translate(${110 + i * 118} 500) scale(${k})`, chalkText(String(v), 0, 0, {size: 88, anchor: 'middle'}));
      if (i < vals.length - 1 && t > ts[i + 1] - .1) s += chalkText(',', 150 + i * 118, 500, {size: 64});
    });
    // aktuelle Anzahl als Raster von Paar-Symbolen (5 Spalten)
    let n = 0; ts.forEach((a, i) => { if (t > a - .1) n = vals[i]; });
    let prev = 0; ts.forEach((a, i) => { if (t > a - .1 && i > 0) prev = vals[i - 1]; });
    const cur = ts.findIndex((a, i) => t > a - .1 && (i === ts.length - 1 || t <= ts[i + 1] - .1));
    for (let j = 0; j < n; j++) {
      const born = j < prev ? -10 : ts[cur] - .1 + (j - prev) * .05;
      const x = 120 + (j % 5) * 125, y = 720 + Math.floor(j / 5) * 175;
      s += paarIcon(x, y + idle(t + j, 2.4, 4), .95 * (j < prev ? 1 : pop(t, born, .3)));
    }
    s += place(820, FLOOR + idle(t, 2, 2), .46 * pop(t, b.start, .4), figure(FIBO, {...(t > ts[5] ? POSE.staunen : POSE.zeigen), expr: t > ts[5] ? 'staunen' : 'freundlich', blink: blinkAt(t, 4)}));
    return s;
  },
  summe(t, b) {
    let s = chalkText(T('summe'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .6)});
    const tsu = kw('summe', 'summe'), td = kw('summe', 'davor'), tj = kw('summe', 'einjahr'), tz = kw('summe', 'zahl');
    // die ganze Folge wird geschrieben
    const row1 = '1 · 2 · 3 · 5 · 8 · 13 · 21 · 34 ·', row2 = '55 · 89 · 144 · 233 · 377';
    const span = Math.max(1, tj - b.start - .2);
    s += chalkText(row1, X0, 440, {size: 56, disp: false, p: prog(t, b.start + .1, span * .55)});
    s += chalkText(row2, X0, 510, {size: 56, disp: false, p: prog(t, b.start + .1 + span * .55, span * .45)});
    // Beispiel 3 + 5 = 8 mit Bögen
    const pe = prog(t, tsu - .2, .5);
    s += chalkText('3', 330, 720, {size: 96, anchor: 'middle', p: pe}) + chalkText('+', 420, 720, {size: 96, anchor: 'middle', p: prog(t, tsu, .3)});
    s += chalkText('5', 510, 720, {size: 96, anchor: 'middle', p: pe});
    s += chalkText('= 8', 650, 720, {size: 96, anchor: 'middle', p: prog(t, td - .1, .4)});
    s += chalkLine('M330,620 Q420,560 510,620', prog(t, td - .3, .4), 7);
    if (t > td) s += chalkUnderline(280, 720, 760, prog(t, td, .4));
    // nach einem Jahr: 377
    const t3 = tj + .15;
    if (t > t3) {
      s += G(`translate(600 ${960 + idle(t, 2.5, 5)}) scale(${pop(t, t3, .45)}) rotate(-4)`, chalkText('377', 0, 0, {size: 120, anchor: 'middle'}));
      s += chalkText(T('paare'), 600, 1040, {size: 56, disp: false, anchor: 'middle', p: prog(t, t3 + .3, .3)});
      [[420, 1240], [520, 1250], [640, 1240], [760, 1250], [870, 1235]].forEach(([x, y], i) => s += paarIcon(x, y - Math.abs(Math.sin(t * 6 + i)) * 10, .7 * pop(t, t3 + .1 + i * .08, .3)));
    }
    s += chalkText(T('jahr'), 600, 860, {size: 44, disp: false, anchor: 'middle', p: prog(t, tj - .2, .4)});
    s += place(190, FLOOR + idle(t, 2, 2), .56 * pop(t, b.start, .4), figure(FIBO, {...(t > t3 ? POSE.staunen : t > tsu ? POSE.zeigen : POSE.denken), expr: t > t3 ? 'lachen' : t > tsu ? 'zwinkern' : 'denken', blink: blinkAt(t, 5)}));
    return s;
  },
  funfact(t, b) {
    let s = chalkText(T('fun'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .4)});
    const ti = kw('funfact', 'indisch'), tf = kw('funfact', 'frueher'), tv = kw('funfact', 'vers');
    s += chalkText(T('indien'), X0, 420, {size: 44, disp: false, p: prog(t, ti - .1, .6)});
    // Palmblatt-Manuskript
    s += G(`translate(740 ${560 + idle(t, 1.6, 4)}) scale(${.6 * pop(t, b.start + .1, .4)}) rotate(-6)`, schriftrolle(1), RIM);
    // Silbenmuster: kurz = Punkt (1 Schlag), lang = Strich (2 Schläge); alle Muster mit 4 Schlägen = 5
    s += chalkText(T('silben'), X0, 560, {size: 34, disp: false, color: K.gh, p: prog(t, tf - .3, .5)});
    const pats = [[1, 1, 1, 1], [2, 1, 1], [1, 2, 1], [1, 1, 2], [2, 2]];
    pats.forEach((pt, i) => {
      const a = tv - 1.2 + i * .3; if (t < a) return;
      let x = 110; const y = 650 + i * 100;
      pt.forEach((u, j) => {
        const pp = prog(t, a + j * .08, .2);
        if (u === 1) s += `<circle cx="${x}" cy="${y}" r="${(18 * pp).toFixed(1)}" fill="${K.weiss}"/>`, x += 70;
        else s += chalkLine(`M${x - 18},${y} L${x + 88},${y}`, pp, 26), x += 140;
      });
    });
    if (t > tv + .2) {
      s += G(`translate(690 ${880 + idle(t, 2.5, 5)}) scale(${pop(t, tv + .2, .4)})`, chalkText('= 5', 0, 0, {size: 120, anchor: 'middle'}));
      s += chalkText(T('verse'), 690, 960, {size: 34, disp: false, anchor: 'middle', p: prog(t, tv + .4, .5)});
    }
    s += paar(740, 1190, .5 * pop(t, b.start, .4), t, 7, true);
    return s;
  },
};

// Soundeffekte: add(zeitpunkt, name, lautstärke). Namen: siehe pipeline/sfx.py (LIB)
function CUES(add) {
  add(0.0, 'pop', .7); add(0.05, 'chalk'); add(kw('hook', 'paar'), 'boing', .6);
  for (let i = 0; i < 8; i += 2) add(kw('hook', 'paar') + .1 + i * .1, 'plop', .5); add(kw('hook', 'jahr') - .1, 'boing', .5);
  add(B.ort.start, 'chalk'); add(kw('ort', 'afrika') - .4, 'water', .4); add(kw('ort', 'ziffern') - .3, 'sparkle', .7);
  add(B.buch.start, 'chalk'); add(kw('buch', 'liber') - .3, 'creak', .5); add(kw('buch', 'europa') - .5, 'zip', .5); add(kw('buch', 'europa'), 'ding', .7);
  add(B.aufgabe.start, 'chalk'); add(kw('aufgabe', 'kpaar') - .2, 'whoosh', .5); add(kw('aufgabe', 'kpaar') + .25, 'thud', .5); add(kw('aufgabe', 'mauern') - .2, 'stamp', .6);
  add(B.regel.start, 'chalk'); add(kw('regel', 'neues') - .1, 'pop', .7); add(kw('regel', 'zweiten') - .1, 'boing', .6); add(kw('regel', 'selbst'), 'ding', .6);
  ['n1', 'n2', 'n3', 'n5', 'n8', 'n13'].forEach((k, i) => add(kw('zaehlen', k) - .1, 'plop', .45 + i * .06));
  add(B.summe.start, 'chalk'); add(kw('summe', 'davor') - .1, 'ding', .7); add(kw('summe', 'einjahr') + .15, 'stamp', .9); add(kw('summe', 'einjahr') + .5, 'gasp', .5);
  add(B.funfact.start, 'chalk'); add(kw('funfact', 'vers') - 1.2, 'pop', .5); add(kw('funfact', 'vers') + .2, 'sparkle', .8);
}

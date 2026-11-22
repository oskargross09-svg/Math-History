// Folge: Archimedes und die Krone – Szenen (eine Funktion pro Beat-ID aus episode.json)
// Jede Szene bekommt die globale Zeit t (s) und ihren Beat b {start,end,text}. Rückgabe: SVG-String.
const SCENES = {
  hook(t, b) {
    let s = '';
    wrap(T('hook'), 88, true, 840).forEach((l, i) => s += chalkText(l, X0, TITLE_Y + i * 92, {size: 88, p: t < .05 ? 1 : prog(t, .05 + i * .3, .4)}));
    const k = pop(t, -.42, .45);
    const spr = [[40, 360], [60, 316], [352, 352], [334, 304], [24, 404], [378, 400]].map((p, i) => drop(p[0], p[1] - Math.abs(Math.sin(t * 5 + i)) * 26, 1)).join('');
    s += placeTub(CX, 1272, 1.45 * k, tubScene({rS: 125 + Math.sin(t * 9) * 8, rE: 30, expr: 'staunen', spritzer: spr, tilt: Math.sin(t * 6) * 4}));
    s += chalkText('?', 860, 820, {size: 140, p: prog(t, 1.2, .3), ex: 'transform="rotate(12 860 820)"'});
    return s;
  },
  koenig(t, b) {
    let s = chalkText(T('ort'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .7)});
    const tg = kw('koenig', 'gold'), tk = kw('koenig', 'krone');
    s += place(300, FLOOR + idle(t, 2, 2), .95 * pop(t, b.start - .1), figure(FIG.hieron, {...POSE.geben, blink: blinkAt(t, 1), lProp: t < tg - .1 ? goldbar(.9) : ''}));
    s += chalkText(T('hiero'), 300, 680, {size: 44, disp: false, anchor: 'middle', p: prog(t, b.start + .3, .4)});
    const happy = t > tk;
    s += place(720, FLOOR + idle(t + 1, 2, 2), .95 * pop(t, tg - .5), figure(FIG.handwerker, {...(happy ? POSE.staunen : POSE.stehen), expr: happy ? 'lachen' : 'staunen', blink: blinkAt(t, 2)}));
    s += chalkText(T('schmied'), 720, 680, {size: 44, disp: false, anchor: 'middle', p: prog(t, tg - .2, .4)});
    const fp = prog(t, tg - .1, .6);
    if (fp > 0 && t < tk) s += G(`translate(${lerp(430, 720, easeInOut(fp))} ${lerp(830, 760, fp) - Math.sin(fp * Math.PI) * 200}) rotate(${fp * 360})`, goldbar(.9), RIM);
    if (t >= tk) {
      s += chalkLine('M640,760 l-30,-30 M800,760 l30,-30 M720,700 l0,-44 M660,820 l-40,10 M780,820 l40,10', prog(t, tk, .25), 7);
      s += G(`translate(720 ${790 + idle(t, 3, 6)}) scale(${pop(t, tk, .4)})`, crown(1.05), RIM);
    }
    return s;
  },
  waage(t, b) {
    let s = chalkText(T('echt'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .6)});
    const td = kw('waage', 'doch');
    const settle = prog(t, b.start, 2.2);
    let ang = settle === 0 ? 14 : Math.exp(-settle * 4) * Math.cos(settle * 16) * 14;
    if (t > td) ang = Math.sin((t - td) * 7) * 3 * Math.exp(-(t - td) * 1.2);
    s += balance(CX, 1250, 860, 260, ang, G('translate(0 -10)', crown(.75)), G('translate(0 -2)', goldbar(.9)));
    const te = b.start + .9;
    s += chalkText(T('gewicht'), 420, 690, {size: 56, disp: false, anchor: 'end', p: prog(t, te, .4)});
    s += chalkCheck(450, 668, prog(t, te + .35, .25));
    if (t > td) {
      const a = ang * Math.PI / 180, ax = CX - 260 * Math.cos(a), ay = 860 - 260 * Math.sin(a);
      s += G(`translate(${ax + 60} ${ay + 30}) scale(${pop(t, td, .35)})`, lump(.8, K.silber), RIM);
      s += chalkText('?', 160, 760, {size: 160, p: prog(t, td + .1, .3), ex: 'transform="rotate(-10 160 760)"'});
      s += chalkText(T('silber'), 700, 690, {size: 56, disp: false, p: prog(t, td + .3, .5)});
    }
    return s;
  },
  auftrag(t, b) {
    let s = chalkText(T('auftrag'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .5)});
    const to = kw('auftrag', 'ohne');
    s += chalkText(T('ohne'), X0, 420, {size: 56, disp: false, p: prog(t, to, .8)});
    s += place(320, FLOOR + idle(t, 2, 2), pop(t, b.start - .1), figure(FIG.archimedes, {...POSE.denken, expr: 'denken', blink: blinkAt(t, 3), tilt: Math.sin(t * 1.3) * 3}));
    s += chalkLine('M640,1262 L640,1040 L820,1040 L820,1262 M620,1040 L840,1040 M630,1262 L830,1262', prog(t, b.start, .6), 8);
    s += G(`translate(730 ${1005 + idle(t, 2.4, 4)}) scale(${pop(t, b.start + .3)})`, crown(1.0), RIM);
    if (t > to) {
      s += chalkLine('M700,560 L840,700', prog(t, to + .2, .3), 9) + chalkLine('M670,592 L740,522 L770,552 L700,622 Z', prog(t, to + .2, .3), 9);
      s += chalkCross(765, 615, 115, prog(t, to + .6, .35));
    }
    return s;
  },
  bad(t, b) {
    let s = chalkText(T('sage'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .6)});
    const tt = kw('bad', 'tiefer'), tw2 = kw('bad', 'mehrw');
    const sink = easeInOut(prog(t, tt - .2, 1.6)) * 34, spill = prog(t, tt + .2, 2.6);
    let spr = '';
    if (spill > 0) for (let i = 0; i < 8; i++) { const ph = ((t - tt) * 1.4 + i / 8) % 1, sd = i % 2 ? 1 : -1; spr += drop(200 + sd * (184 + ph * 26), 432 + ph * ph * 160, .8); }
    if (spill > 0) s += `<g ${RIM}>${E(CX - 290, 1276, 70 * spill, 12 * spill, K.wasser, 4)}${E(CX + 290, 1276, 70 * spill, 12 * spill, K.wasser, 4)}</g>`;
    s += placeTub(CX, 1268, 1.5, tubScene({rS: 98, rE: -62, hand: 'faust', headDy: sink, expr: t > tw2 ? 'staunen' : 'freundlich', blink: blinkAt(t, 4), spritzer: spr, tilt: Math.sin(t * 1.4) * 3}));
    s += chalkArrow(150, 760, 150, 905, prog(t, tt, .4));
    s += chalkLine('M860,960 Q920,900 900,820 M870,840 L900,815 L925,848', prog(t, tw2, .4), 9);
    return s;
  },
  heureka(t, b) {
    const tn = kw('heureka', 'nackt'), tl = kw('heureka', 'los');
    let s = `<g transform="translate(${CX} 345) scale(${pop(t, b.start, .4)}) rotate(${Math.sin(t * 10) * 2 * (1 - prog(t, b.start + 1, 1))})">` + chalkText(T('heureka'), 0, 40, {size: 120, anchor: 'middle'}) + '</g>';
    s += chalkText(T('gefunden'), CX, 460, {size: 44, disp: false, anchor: 'middle', p: prog(t, b.start + .5, .6)});
    const gone = easeIn(prog(t, tl, .45));
    const spr = [[40, 360], [60, 316], [352, 352], [334, 304], [24, 404], [378, 400], [120, 300], [290, 290]].map((p, i) => {
      const ph = ((t - b.start) * 2.2 + i * .37) % 1; return drop(p[0] + (p[0] < 200 ? -1 : 1) * ph * 40, p[1] - Math.sin(ph * Math.PI) * 70 + ph * 60, 1.1);
    }).join('');
    const bk = pop(t, b.start + .2, .35);
    const bl = bk > 0 ? G(`translate(300 ${150 + idle(t, 5, 5)}) rotate(18) scale(${.9 * bk})`, bulb(1)) : '';
    s += placeTub(CX, 1268, 1.5, tubScene({rS: 125 + Math.sin(t * 12) * 10, rE: 30, expr: t > b.start + .6 ? 'lachen' : 'staunen', spritzer: spr, tilt: Math.sin(t * 8) * 5, goneX: gone * 520, goneY: -gone * 760, bulb: bl}));
    if (t > tl) {
      s += chalkLine('M560,820 L900,560 M520,900 L880,640 M600,960 L930,720', prog(t, tl + .1, .25), 8);
      s += chalkText(T('nackt'), 820, 1010, {size: 56, disp: false, anchor: 'middle', p: prog(t, tn, .4), ex: 'transform="rotate(-8 820 1010)"'});
    }
    return s;
  },
  dichte(t, b) {
    let s = chalkText(T('formel'), CX, TITLE_Y, {size: 64, anchor: 'middle', p: prog(t, b.start, .9)});
    const tg = kw('dichte', 'gleich'), tv = kw('dichte', 'vol');
    const side = 170, side2 = side * Math.cbrt(19.3 / 10.5);
    const pulse = t > tv ? 1 + Math.sin(prog(t, tv, .5) * Math.PI) * .08 : 1;
    s += G(`translate(290 1110) scale(${pop(t, b.start + .2)})`, cube(side, K.gelb), RIM);
    s += G(`translate(700 1110) scale(${pop(t, b.start + .45) * pulse})`, cube(side2, K.silber), RIM);
    s += chalkText(T('gold'), 290, 1180, {size: 56, disp: false, anchor: 'middle', p: prog(t, b.start + .4, .3)});
    s += chalkText(T('silberW'), 700, 1180, {size: 56, disp: false, anchor: 'middle', p: prog(t, b.start + .6, .3)});
    s += chalkText(T('g1'), 290, 1236, {size: 34, disp: false, anchor: 'middle', color: K.gh, p: prog(t, b.start + .8, .3)});
    s += chalkText(T('g2'), 700, 1236, {size: 34, disp: false, anchor: 'middle', color: K.gh, p: prog(t, b.start + 1.0, .3)});
    s += chalkText(T('kg'), 290, 800, {size: 64, anchor: 'middle', p: prog(t, tg, .3)});
    s += chalkText('=', CX, 800, {size: 64, anchor: 'middle', p: prog(t, tg + .2, .2)});
    s += chalkText(T('kg'), 700, 800, {size: 64, anchor: 'middle', p: prog(t, tg + .35, .3)});
    if (t > tv) {
      s += chalkLine('M570,880 L880,880 M590,862 L570,880 L590,898 M860,862 L880,880 L860,898', prog(t, tv, .35), 8);
      s += chalkText(T('mehrV'), 725, 560, {size: 44, disp: false, anchor: 'middle', p: prog(t, tv + .2, .5)});
      s += chalkArrow(725, 580, 725, 645, prog(t, tv + .5, .25), 7);
    }
    return s;
  },
  versuch(t, b) {
    let s = chalkText(T('test'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .5)});
    const t1 = b.start + .35, t2 = kw('versuch', 'mehr') - .2;
    const vessel = (cx, tIn, prop, amt, label) => {
      const top = 920, bot = 1180, w = 120, dp = prog(t, tIn, .45);
      let v = `<g ${RIM}><path d="M${cx - w},${top} L${cx + w},${top} L${cx + w - 10},${bot} L${cx - w + 10},${bot} Z" fill="${K.wasser}" stroke="#111111" stroke-width="5" stroke-linejoin="round"/>`;
      if (dp > 0) v += G(`translate(${cx} ${dp < 1 ? lerp(640, 1110, easeIn(dp)) : 1110})`, prop);
      const sp = prog(t, tIn + .45, 1.6);
      if (sp > 0) {
        for (let i = 0; i < 6; i++) { const ph = (sp * 3 + i / 6) % 1; if (sp < 1 || ph < .2) v += drop(cx + (i % 2 ? 1 : -1) * (w + 8 + ph * 18), top + ph * ph * 240, .8); }
        const pa = Math.min(1, sp * 1.4) * amt;
        v += E(cx - w - 30, 1268, 46 * pa + 1, 9 * pa + 1, K.wasser, 4) + E(cx + w + 30, 1268, 46 * pa + 1, 9 * pa + 1, K.wasser, 4);
      }
      v += '</g>' + chalkLine(`M${cx - w - 14},${top - 30} L${cx - w},${bot + 12} L${cx + w},${bot + 12} L${cx + w + 14},${top - 30}`, prog(t, b.start, .5), 9);
      return v + chalkText(label, cx, 870, {size: 56, disp: false, anchor: 'middle', p: prog(t, b.start + .3, .3)});
    };
    s += vessel(290, t1, lump(1.1), .55, T('gold'));
    s += vessel(700, t2, crown(.62), 1.25, T('krone'));
    s += chalkText('<', CX, 1290, {size: 88, anchor: 'middle', p: prog(t, t2 + 1.3, .25)});
    s += chalkText(T('mehrW'), CX, 500, {size: 64, anchor: 'middle', p: prog(t, t2 + 1.4, .6)});
    return s;
  },
  erwischt(t, b) {
    const tf = kw('erwischt', 'flog');
    let s = '';
    const k = pop(t, tf - .15, .3);
    if (k > 0) {
      const shake = t < tf + .4 ? Math.sin(t * 60) * 6 * (1 - prog(t, tf, .4)) : 0;
      s += `<g transform="translate(${CX + shake} 400) rotate(-6) scale(${lerp(1.6, 1, clamp(k))})" opacity="${clamp(k)}">` + chalkText(T('erwischt'), 0, 40, {size: 120, anchor: 'middle'}) + '</g>';
      s += chalkUnderline(180, 820, 470, prog(t, tf + .1, .3));
    }
    s += place(290, FLOOR + idle(t, 2, 2), .95 * pop(t, b.start - .1), figure(FIG.hieron, {...POSE.zeigenSeite, expr: t > tf ? 'lachen' : 'denken', blink: blinkAt(t, 5), rProp: G('translate(0 10)', crown(.45))}));
    const caught = t > tf;
    s += place(730, FLOOR + (caught ? Math.abs(Math.sin(t * 14)) * -10 : 0), .9 * pop(t, b.start), figure(FIG.handwerker, {...(caught ? POSE.staunen : POSE.stehen), expr: caught ? 'staunen' : 'zwinkern', schweiss: caught, tilt: caught ? Math.sin(t * 20) * 3 : 0}));
    return s;
  },
  funfact(t, b) {
    let s = chalkText(T('fun'), X0, TITLE_Y, {size: 64, p: prog(t, b.start, .4)});
    s += chalkText(T('galilei'), X0, 410, {size: 44, disp: false, p: prog(t, b.start + .5, .9)});
    const ang = 7 * easeInOut(prog(t, b.start + 1.6, 1.2));
    const bx = CX, by = 640, half = 250, a = ang * Math.PI / 180;
    const lx = bx - half * Math.cos(a), ly = by - half * Math.sin(a), rx = bx + half * Math.cos(a), ry = by + half * Math.sin(a);
    const dp = prog(t, b.start + .2, .8);
    s += chalkLine(`M${bx},${by} L${bx - 50},${by + 110} L${bx + 50},${by + 110} Z M${bx - 90},${by + 110} L${bx + 90},${by + 110}`, dp, 8);
    s += chalkLine(`M${lx},${ly} L${rx},${ry}`, dp, 10);
    s += chalkLine(`M${lx},${ly} L${lx},${ly + 390}`, dp, 5) + chalkLine(`M${rx},${ry} L${rx},${ry + 390}`, dp, 5);
    s += `<g ${RIM}><path d="M${bx - 360},980 L${bx - 140},980 L${bx - 150},1140 L${bx - 350},1140 Z" fill="${K.wasser}" stroke="#111111" stroke-width="5" stroke-linejoin="round"/>` +
      `<path d="M${bx + 140},980 L${bx + 360},980 L${bx + 350},1140 L${bx + 150},1140 Z" fill="${K.wasser}" stroke="#111111" stroke-width="5" stroke-linejoin="round"/>` +
      G(`translate(${lx} ${ly + 420})`, crown(.62)) + G(`translate(${rx} ${ry + 420})`, lump(1.05)) + '</g>';
    s += chalkText(T('krone'), bx - 250, 1196, {size: 44, disp: false, anchor: 'middle', p: prog(t, b.start + .6, .3)});
    s += chalkText(T('gold'), bx + 250, 1196, {size: 44, disp: false, anchor: 'middle', p: prog(t, b.start + .7, .3)});
    return s;
  },
};

// Soundeffekte: add(zeitpunkt, name, lautstärke). Namen: siehe pipeline/sfx.py (LIB)
function CUES(add) {
  add(0.0, 'splash', .8); add(0.05, 'whoosh', .6); add(0.15, 'chalk'); add(1.2, 'pop', .6);
  add(B.koenig.start - .1, 'pop', .7); add(B.koenig.start, 'chalk'); add(kw('koenig', 'gold') - .5, 'pop', .7);
  add(kw('koenig', 'gold') - .1, 'whoosh', .5); add(kw('koenig', 'gold') + .45, 'coin', .9); add(kw('koenig', 'krone'), 'sparkle', .9);
  add(B.waage.start, 'creak', .8); add(B.waage.start + .9, 'chalk'); add(B.waage.start + 1.25, 'ding', .5);
  add(kw('waage', 'doch'), 'pop', .7); add(kw('waage', 'doch') + .1, 'hmm', .6);
  add(B.auftrag.start, 'chalk'); add(B.auftrag.start + .3, 'sparkle', .5); add(kw('auftrag', 'ohne'), 'chalk'); add(kw('auftrag', 'ohne') + .6, 'buzz', .5);
  add(B.bad.start, 'chalk'); add(B.bad.start + .1, 'water', .7); add(kw('bad', 'tiefer') + .2, 'trickle', 1); add(kw('bad', 'mehrw'), 'chalk', .7);
  add(B.heureka.start, 'splash', 1); add(B.heureka.start + .2, 'ding', 1); add(kw('heureka', 'los'), 'zip', 1); add(kw('heureka', 'nackt'), 'chalk', .7);
  add(B.dichte.start, 'chalk'); add(B.dichte.start + .2, 'thud', .7); add(B.dichte.start + .45, 'thud', .7); add(kw('dichte', 'gleich'), 'chalk');
  add(kw('dichte', 'vol'), 'boing', .7);
  add(B.versuch.start, 'chalk'); add(B.versuch.start + .8, 'plop', 1); add(kw('versuch', 'mehr') + .25, 'splash', .9); add(kw('versuch', 'mehr') + 1.1, 'chalk');
  add(kw('erwischt', 'flog') - .15, 'stamp', 1); add(kw('erwischt', 'flog') + .05, 'gasp', .7);
  add(B.funfact.start, 'chalk'); add(B.funfact.start + 1.6, 'creak', .6); add(B.funfact.start + 1.7, 'water', .4);
}

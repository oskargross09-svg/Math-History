"""Prozedurale Soundeffekte (keine Fremd-Samples, lizenzfrei) und Mix mit dem Voice Over.
Verfügbare Effekte (Namen für CUES in scenes.js): siehe LIB unten."""
import json, sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(7)

def t_(d): return np.arange(int(d * SR)) / SR
def env(d, a=.005, r=None, curve=4):
    t = t_(d); e = np.minimum(1, t / max(a, 1e-4))
    return e * np.exp(-curve * t / (r or d))
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def sweep(f0, f1, d, kind='exp'):
    t = t_(d); f = f0 * (f1 / f0) ** (t / d) if kind == 'exp' else f0 + (f1 - f0) * t / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR)
def norm(x, g=1.0): return x / (np.max(np.abs(x)) + 1e-9) * g

def whoosh():
    d = .55; n = rng.standard_normal(int(d * SR)); t = t_(d)
    out = np.zeros_like(n)
    for i, (lo, hi) in enumerate([(300, 900), (700, 1800), (1500, 3500)]):
        out += bp(n, lo, hi) * np.sin(np.pi * np.clip((t - i * .05) / .45, 0, 1)) ** 2
    return norm(out, .8)
def chalk():
    d = .55; n = hp(rng.standard_normal(int(d * SR)), 2500); t = t_(d)
    strokes = (np.sin(2 * np.pi * 7 * t + 1.3) > -.2).astype(float)
    strokes = lp(strokes, 40)
    gr = (rng.random(len(t)) < .02) * rng.standard_normal(len(t)) * 3
    return norm((n + hp(gr, 1500)) * strokes * np.sin(np.pi * t / d) ** .5, .35)
def pop():
    d = .12; return norm(sweep(900, 220, d) * env(d, .002, .06) + hp(rng.standard_normal(int(d * SR)), 3000) * env(d, .001, .01) * .3, .8)
def splash():
    d = 1.1; n = rng.standard_normal(int(d * SR)); e = env(d, .01, .35)
    x = bp(n, 400, 6000) * e
    for _ in range(14):
        st = rng.uniform(.05, .8); f = rng.uniform(500, 1400); dd = .06
        s = int(st * SR); b = sweep(f, f * 1.8, dd) * env(dd, .002, .03); x[s:s + len(b)] += b * .5
    return norm(x, .9)
def coin():
    d = .9; t = t_(d); x = np.zeros_like(t)
    for st in (0, .11):
        tt = np.clip(t - st, 0, None); m = (t >= st)
        for f, a in [(2093, 1), (3349, .6), (5274, .4), (6650, .25)]:
            x += m * a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * 7)
    return norm(x, .6)
def sparkle():
    d = 1.0; x = np.zeros(int(d * SR))
    for i, f in enumerate([1568, 1976, 2349, 3136, 3951]):
        s = int(i * .07 * SR); dd = .5; b = np.sin(2 * np.pi * f * t_(dd)) * env(dd, .002, .25); x[s:s + len(b)] += b
    return norm(x, .45)
def creak():
    d = .7; t = t_(d); f = 95 + 25 * np.sin(2 * np.pi * 3 * t) + 40 * t
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    pulses = (np.sin(2 * np.pi * 38 * t) > .6).astype(float)
    return norm(bp(saw * (.4 + pulses), 300, 2500) * np.sin(np.pi * t / d), .5)
def ding():
    d = 1.6; t = t_(d)
    return norm(sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, a, k in [(1318.5, 1, 2.5), (2637, .3, 4), (3956, .15, 6), (1975, .2, 3)]) * env(d, .003, 2, 1), .55)
def hmm():
    d = .9; x = np.zeros(int(d * SR))
    for st, f, dd in [(0, 196, .22), (.3, 185, .5)]:
        tt = t_(dd); tri = 2 * np.abs(2 * ((f * tt) % 1) - 1) - 1
        b = lp(tri, 1200) * env(dd, .01, dd * .9, 2); s = int(st * SR); x[s:s + len(b)] += b
    return norm(x, .5)
def buzz():
    d = .4; t = t_(d); sq = np.sign(np.sin(2 * np.pi * 110 * t)) + .5 * np.sign(np.sin(2 * np.pi * 116 * t))
    return norm(lp(sq, 1800) * env(d, .005, .3, 2), .35)
def water():
    d = 1.4; x = lp(rng.standard_normal(int(d * SR)), 900) * np.sin(np.pi * t_(d) / d) * .4
    for _ in range(10):
        st = rng.uniform(0, 1.2); f = rng.uniform(400, 900); dd = .05; s = int(st * SR)
        b = sweep(f, f * 2, dd) * env(dd, .002, .03); x[s:s + len(b)] += b * .5
    return norm(x, .5)
def trickle():
    d = 2.8; x = lp(rng.standard_normal(int(d * SR)), 2500) * .15 * np.sin(np.pi * t_(d) / d)
    for _ in range(40):
        st = rng.uniform(0, 2.6); f = rng.uniform(700, 1600); dd = .04; s = int(st * SR)
        b = sweep(f, f * 1.6, dd) * env(dd, .002, .025); x[s:s + len(b)] += b * rng.uniform(.3, .7)
    return norm(x, .55)
def zip_():
    d = .45; return norm((sweep(400, 2400, d) + .4 * bp(rng.standard_normal(int(d * SR)), 1500, 5000)) * env(d, .01, .4, 1.5), .5)
def thud():
    d = .3; return norm(sweep(140, 55, d) * env(d, .002, .15) + lp(rng.standard_normal(int(d * SR)), 300) * env(d, .001, .03) * .5, .8)
def boing():
    d = .6; t = t_(d); f = 220 + 90 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4) + 60 * t
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, .005, .45, 2.5), .55)
def plop():
    d = .22; return norm(sweep(250, 900, d) * env(d, .003, .12) + .3 * lp(rng.standard_normal(int(d * SR)), 1200) * env(d, .001, .05), .7)
def stamp():
    d = .5; return norm(sweep(110, 45, d) * env(d, .002, .18) + bp(rng.standard_normal(int(d * SR)), 200, 3000) * env(d, .001, .05) * .9, .95)
def gasp():
    d = .5; return norm(sweep(1400, 500, d) * env(d, .01, .4, 2), .4)
def chime():
    d = 2.2; x = np.zeros(int(d * SR))
    for i, f in enumerate([523.25, 659.25, 783.99, 1046.5]):
        tt = t_(1.6); b = (np.sin(2 * np.pi * f * tt) + .3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 2.5) * np.minimum(1, tt / .004)
        s = int(i * .13 * SR); x[s:s + len(b)] += b
    return norm(x, .5)

LIB = {'whoosh': whoosh, 'chalk': chalk, 'pop': pop, 'splash': splash, 'coin': coin, 'sparkle': sparkle, 'creak': creak,
       'ding': ding, 'hmm': hmm, 'buzz': buzz, 'water': water, 'trickle': trickle, 'zip': zip_, 'thud': thud, 'boing': boing,
       'plop': plop, 'stamp': stamp, 'gasp': gasp, 'chime': chime}

def mix(vo_path, cues, dur, out_path):
    vo, sr = sf.read(vo_path); assert sr == SR
    if vo.ndim > 1: vo = vo.mean(axis=1)
    n = int(dur * SR); fx = np.zeros(n); cache = {}
    for c in cues:
        if c['n'] not in LIB: raise SystemExit(f"Unbekannter Soundeffekt: {c['n']} (erlaubt: {', '.join(LIB)})")
        if c['n'] not in cache: cache[c['n']] = LIB[c['n']]()
        snd = cache[c['n']] * c['g']; s = int(max(0, c['t']) * SR); e = min(n, s + len(snd))
        if s < n: fx[s:e] += snd[:e - s]
    voice = np.zeros(n); voice[:min(n, len(vo))] = vo[:n]
    venv = lp(np.abs(voice), 8, 1); duck = 1 - .45 * np.clip(venv / (np.max(venv) * .3 + 1e-9), 0, 1)
    m = voice + fx * .42 * duck
    sf.write(out_path, (m / (np.max(np.abs(m)) + 1e-9) * .95).astype(np.float32), SR)

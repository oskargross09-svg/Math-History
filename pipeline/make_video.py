"""Episode → fertiges Short (MP4) für eine Sprache.

    python3 pipeline/make_video.py episodes/<datum>_<slug> [--lang de|en] [--stills]

--stills  nur Stimme + Standbilder (build/<name>/sheet_<lang>.jpg) zum Prüfen, kein Video
Ausgabe:  build/<name>/<name>_<lang>.mp4

Schritte: Stimme (sherpa-onnx: DE Piper „Thorsten“, EN Kokoro „am_michael“) pro Beat → Timing →
Szenen (lib.js + episodes/<name>/scenes.js) per Chrome rendern → Soundeffekte (CUES) mischen → MP4.
"""
import argparse, glob, json, os, subprocess, sys, time
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "pipeline"))
import sfx  # noqa: E402

M = os.environ.get("MK_MODELS", os.path.expanduser("~/.cache/mathe-kanaele"))
SR, FPS, LEAD, GAP = 48000, 30, 0.35, 0.30


def log(*a): print(*a, flush=True)


def tts_engine(lang):
    import sherpa_onnx
    if lang == "de":
        d = f"{M}/vits-piper-de_DE-thorsten-high/"
        cfg = sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=glob.glob(d + "*.onnx")[0], tokens=d + "tokens.txt", data_dir=d + "espeak-ng-data"), num_threads=2)
        return sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=cfg)), 0, 1.0
    d = f"{M}/kokoro-en-v0_19/"
    cfg = sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
        model=d + "model.onnx", voices=d + "voices.bin", tokens=d + "tokens.txt", data_dir=d + "espeak-ng-data"), num_threads=2)
    return sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=cfg)), 6, 1.05


def trim(a, sr, thr=0.01):
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0: return a
    return a[max(0, idx[0] - int(.02 * sr)): min(len(a), idx[-1] + int(.06 * sr))]


def voice(ep, lang, out):
    from scipy.signal import resample_poly
    from math import gcd
    tts, sid, speed = tts_engine(lang)
    say = ep.get("say", {}).get(lang, {})
    parts, t, timing = [np.zeros(int(LEAD * SR), np.float32)], LEAD, []
    for b in ep["beats"]:
        text = b[lang]; spoken = b.get("tts", {}).get(lang, text)
        for k, v in say.items(): spoken = spoken.replace(k, v)
        au = tts.generate(spoken, sid=sid, speed=speed)
        a = trim(np.array(au.samples, np.float32), au.sample_rate)
        g = gcd(au.sample_rate, SR); a = resample_poly(a, SR // g, au.sample_rate // g).astype(np.float32)
        d = len(a) / SR
        timing.append({"id": b["id"], "start": round(t, 3), "end": round(t + d, 3), "text": text})
        parts += [a, np.zeros(int(GAP * SR), np.float32)]; t += d + GAP
    vo = np.concatenate(parts); vo = vo / (np.max(np.abs(vo)) + 1e-9) * .9
    sf.write(f"{out}/vo_{lang}.wav", vo, SR)
    tm = {"total": round(t, 3), "beats": timing}
    json.dump(tm, open(f"{out}/timing_{lang}.json", "w"), ensure_ascii=False, indent=1)
    words = sum(len(b[lang].split()) for b in ep["beats"])
    log(f"Stimme {lang}: {t:.1f} s, {words} Wörter")
    if t < 28 or t > 52: log(f"WARNING: Sprechdauer {t:.1f} s – Ziel 30–50 s (Text kürzen/verlängern)")
    return tm


def browser(p):
    args = ["--allow-file-access-from-files", "--disable-web-security"]
    for exe in ["/usr/bin/google-chrome", None]:
        try:
            return p.chromium.launch(executable_path=exe, args=args) if exe and os.path.exists(exe) else p.chromium.launch(args=args)
        except Exception as e:  # noqa
            err = e
    raise err


def render(epdir, ep, lang, tm, out, stills):
    from playwright.sync_api import sync_playwright
    name = os.path.basename(epdir.rstrip("/"))
    vb, inner = open(f"{ROOT}/pipeline/assets/logo_{lang}.txt").read().split("\n", 1)
    cfg = {"lang": lang, "timing": tm, "ep": ep, "logo": {"vb": vb, "inner": inner}}
    tpl = open(f"{ROOT}/pipeline/template/page.html").read().replace("EPISODE_SCENES", "file://" + os.path.abspath(f"{epdir}/scenes.js"))
    page_path = f"{ROOT}/pipeline/template/_page_{name}_{lang}.html"
    open(page_path, "w").write(tpl)
    errors = []
    with sync_playwright() as p:
        br = browser(p)
        pg = br.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        warns = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.on("console", lambda m: (errors if m.type == "error" else warns).append(m.text) if m.type in ("error", "warning") else None)
        pg.add_init_script("window.CFG = " + json.dumps(cfg) + ";")
        pg.goto("file://" + page_path)
        pg.wait_for_function("window.READY === true", timeout=15000)
        pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
        dur = pg.evaluate("window.DURATION")
        cues = pg.evaluate("window.CUES_LIST()")
        if stills:
            from PIL import Image
            ts = [0.0] + [round((b["start"] + b["end"]) / 2, 2) for b in tm["beats"]] + [round(tm["beats"][-1]["end"] - .3, 2), round(dur - .3, 2)]
            ims = []
            for t in ts:
                pg.evaluate(f"window.RENDER({t})")
                pg.screenshot(path=f"{out}/still_{lang}_{t:06.2f}.png"); ims.append(Image.open(f"{out}/still_{lang}_{t:06.2f}.png").resize((360, 640)))
            cols = 6; rows = (len(ims) + cols - 1) // cols
            sheet = Image.new("RGB", (cols * 360, rows * 640), "#222")
            for i, im in enumerate(ims): sheet.paste(im, ((i % cols) * 360, (i // cols) * 640))
            sheet.save(f"{out}/sheet_{lang}.jpg", quality=85)
            log(f"Standbilder: {out}/sheet_{lang}.jpg  (Zeiten: {ts})")
        else:
            n = int(round(dur * FPS)); tmp = f"{out}/video_{lang}.tmp.mp4"
            ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-",
                                   "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-r", str(FPS), tmp], stdin=subprocess.PIPE)
            t0 = time.time()
            for i in range(n):
                pg.evaluate(f"window.RENDER({i / FPS})")
                ff.stdin.write(pg.screenshot(type="jpeg", quality=92))
                if i % 300 == 0: log(f"  Frame {i}/{n} ({time.time() - t0:.0f} s)")
            ff.stdin.close()
            if ff.wait() != 0: raise SystemExit("ERROR: ffmpeg (Video) fehlgeschlagen")
            os.replace(tmp, f"{out}/video_{lang}.mp4")
        br.close()
    os.remove(page_path)
    for w in sorted(set(warns)): log("WARNING: " + w)
    for e in errors: log("ERROR: " + e)
    if errors: raise SystemExit("ERROR: Fehler in scenes.js/episode.json – siehe oben")
    return dur, cues


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode"); ap.add_argument("--lang"); ap.add_argument("--stills", action="store_true")
    a = ap.parse_args()
    epdir = a.episode.rstrip("/")
    lang = a.lang or json.load(open(f"{ROOT}/channel.json"))["lang"]
    ep = json.load(open(f"{epdir}/episode.json"))
    name = os.path.basename(epdir)
    out = f"{ROOT}/build/{name}"; os.makedirs(out, exist_ok=True)
    # Prüfungen
    for b in ep["beats"]:
        if not b.get(lang): raise SystemExit(f"ERROR: Beat {b['id']} ohne Text für {lang}")
    for k in ("text", "meta"):
        if lang not in ep.get(k, {}): raise SystemExit(f"ERROR: episode.json: {k}.{lang} fehlt")
    tm = voice(ep, lang, out)
    dur, cues = render(epdir, ep, lang, tm, out, a.stills)
    if a.stills: return
    sfx.mix(f"{out}/vo_{lang}.wav", cues, dur, f"{out}/mix_{lang}.wav")
    final = f"{out}/{name}_{lang}.mp4"
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{out}/video_{lang}.mp4", "-i", f"{out}/mix_{lang}.wav", "-map", "0:v", "-map", "1:a",
                        "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-shortest", final + ".tmp.mp4"])
    if r.returncode: raise SystemExit("ERROR: ffmpeg (Mix) fehlgeschlagen")
    os.replace(final + ".tmp.mp4", final)
    log(f"FERTIG: {final} ({dur:.1f} s)")


if __name__ == "__main__":
    main()

"""Folge rendern und an den GitHub-Workflow übergeben, der sie auf YouTube hochlädt.

    python3 pipeline/publish.py episodes/<datum>_<slug> [--now] [--draft] [--no-render] [--video datei.mp4]

1. rendert build/<name>/<name>_<lang>.mp4 (ausser --no-render / --video)
2. legt das MP4 auf den Branch `media` (main bleibt klein)
3. schreibt videos/<name>.json (Titel, Beschreibung, Tags, publishAt) und pusht main
   -> .github/workflows/publish.yml lädt es hoch; YouTube veröffentlicht es selbst zur Sendezeit (channel.json → publish_time)
4. wartet auf das Ergebnis im Branch `bot-logs` und gibt RESULT: OK / FAILED / UNKNOWN aus

--now    sofort öffentlich (bei weniger als 10 Minuten bis zur Sendezeit automatisch)
--draft  nur „nicht gelistet“ hochladen (Test)
--video  ein bereits fertiges MP4 verwenden
"""
import datetime as dt, json, os, shutil, subprocess, sys, time
from zoneinfo import ZoneInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TZ = ZoneInfo("Europe/Zurich")
BOT = "-c user.name=mathe-kanal-bot -c user.email=bot@users.noreply.github.com"


def sh(cmd, cwd=ROOT, check=True):
    r = subprocess.run(cmd, cwd=cwd, shell=True, text=True, capture_output=True)
    if check and r.returncode:
        raise SystemExit(f"Befehl fehlgeschlagen: {cmd}\n{r.stdout}\n{r.stderr}")
    return r.stdout.strip()


def push_media(mp4, name):
    wt = "/tmp/mk-media"
    sh(f"rm -rf {wt}"); sh("git worktree prune")
    if sh("git ls-remote --heads origin media"):
        sh("git fetch -q --depth 1 origin media")
        sh(f"git worktree add -f {wt} FETCH_HEAD -B media-local")
    else:
        sh(f"git worktree add -f --detach {wt}")
        sh("git checkout -q --orphan media-local && git rm -rqf . && git clean -fdq", cwd=wt)
    os.makedirs(f"{wt}/videos", exist_ok=True)
    sh(f"cp {mp4} {wt}/videos/{name}.mp4")
    sh(f"git add videos/{name}.mp4 && git {BOT} commit -qm 'media {name}' && git push -q origin HEAD:media", cwd=wt)
    sh(f"git worktree remove --force {wt}")


def wait_result(name, run, timeout=480):
    t0 = time.time()
    while time.time() - t0 < timeout:
        time.sleep(15)
        if subprocess.run("git fetch -q --depth 1 origin bot-logs", cwd=ROOT, shell=True, capture_output=True).returncode:
            continue
        r = subprocess.run(f"git show FETCH_HEAD:logs/{name}.txt", cwd=ROOT, shell=True, text=True, capture_output=True)
        if r.returncode == 0 and run in r.stdout:
            return r.stdout
    return None


def main():
    epdir = sys.argv[1].rstrip("/")
    now, draft = "--now" in sys.argv, "--draft" in sys.argv
    given = sys.argv[sys.argv.index("--video") + 1] if "--video" in sys.argv else None
    ch = json.load(open(f"{ROOT}/channel.json")); lang = ch["lang"]
    ep = json.load(open(f"{epdir}/episode.json"))
    name = os.path.basename(epdir)
    mp4 = f"{ROOT}/build/{name}/{name}_{lang}.mp4"
    if given:
        os.makedirs(os.path.dirname(mp4), exist_ok=True); shutil.copy(given, mp4)
    elif "--no-render" not in sys.argv:
        r = subprocess.run([sys.executable, f"{ROOT}/pipeline/make_video.py", epdir, "--lang", lang])
        if r.returncode: raise SystemExit("RESULT: FAILED (Rendern)")
    if not os.path.exists(mp4): raise SystemExit(f"RESULT: FAILED (fehlt: {mp4})")

    hh, mm = map(int, ch["publish_time"].split(":"))
    due = dt.datetime.combine(dt.date.fromisoformat(ep["date"]), dt.time(hh, mm), TZ).astimezone(dt.timezone.utc)
    publish_at = None if (now or draft or due - dt.datetime.now(dt.timezone.utc) < dt.timedelta(minutes=10)) \
        else due.strftime("%Y-%m-%dT%H:%M:%SZ")
    run = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%S")
    meta = ep["meta"][lang]
    tags = meta.get("tags", [])
    hashtags = " ".join("#" + t.replace(" ", "") for t in (ch["hashtags"] + tags[:2]))
    quellen = "\n".join("· " + q for q in ep.get("quellen", []))
    desc = meta["description"].strip() + "\n\n" + ch["footer"] + ("\n\n" + ch["sources_label"] + "\n" + quellen if quellen else "") + "\n\n" + hashtags
    job = {"video": f"videos/{name}.mp4", "title": meta["title"][:100], "description": desc[:4900],
           "tags": tags + ch["tags"], "privacy": "unlisted" if draft else "public", "publishAt": publish_at, "run": run}

    sh("git pull -q --rebase origin main")
    push_media(mp4, name)
    os.makedirs(f"{ROOT}/videos", exist_ok=True)
    json.dump(job, open(f"{ROOT}/videos/{name}.json", "w"), ensure_ascii=False, indent=1)
    sh(f"git add episodes/{name} videos/{name}.json && git {BOT} commit -qm 'Folge {name}' && git push -q origin HEAD:main")
    print(f"Übergeben: videos/{name}.json · Veröffentlichung: {publish_at or 'sofort'}", flush=True)

    res = wait_result(name, run)
    if res is None:
        print("RESULT: UNKNOWN (keine Rückmeldung vom Workflow innerhalb von 8 Minuten)"); sys.exit(2)
    print(res)
    if "VIDEO_ID=" in res and "rc=0" in res:
        print("RESULT: OK")
    else:
        print("RESULT: FAILED"); sys.exit(1)


if __name__ == "__main__":
    main()

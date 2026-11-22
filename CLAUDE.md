# Geschichte der Mathematik (DE) · Math History (EN) – Produktions-Runbook

Zwei YouTube-Shorts-Kanäle mit **demselben Video in zwei Sprachen**: jeden Tag eine wahre Geschichte aus der Mathematik,
erzählt mit Kreide auf schwarzer Tafel und farbigen Chibi-Figuren. Verspielt, neugierig, witzig – aber die Fakten stimmen.
Look und Regeln: Design System https://claude.ai/code/artifact/cebb52f8-9993-406c-9a61-3673a0d21b0d – alles Nötige ist in
`pipeline/template/lib.js` umgesetzt. Beispiel-Folge: `episodes/2026-11-22_archimedes-krone/`.

Welcher Kanal dieses Repo ist, steht in `channel.json` (`lang`, `role`):
- **DE-Repo `oskargross09-svg/geschichte-der-mathematik` (role: leader)** – wählt das Thema, recherchiert, schreibt die Folge in BEIDEN Sprachen, veröffentlicht DE (17:00 Uhr).
- **EN-Repo `oskargross09-svg/math-history` (role: follower)** – übernimmt die Folge des Tages aus dem DE-Repo, prüft das Englische, veröffentlicht EN (22:00 Uhr).

Ein geplanter Lauf produziert EINE Folge von Anfang bis Ende, ohne jemanden zu fragen.

## 1. Einrichten (2–3 min)
```
cd <repo> && bash pipeline/setup.sh
```
Datum = heutiges Datum in **Europe/Zurich**. Gibt es schon `videos/<datum>_*.json`, ist die Folge fertig: aufhören.

## 2a. Leader (DE): Thema und Recherche
- Thema: oberste offene Zeile in `themen.md`. Ist die Liste leer, selbst ein Thema wählen, das noch nicht in `episodes/` oder `themen.md` vorkommt.
- Recherche im Web (mehrere Suchen, WebFetch für die Quellen): Wer, wann, wo, was genau passiert ist. Primärquellen und seriöse
  Darstellungen (MacTutor St Andrews, Britannica, Universitäten, Museen); jede Zahl/Jahreszahl doppelt prüfen.
- **Legenden als Legenden kennzeichnen** („Der Sage nach …“ / „Legend says …“), unsichere Jahre mit „um“ / „c.“. Witz aus der Situation, nie erfundene Fakten.
- 2–4 Quellen notieren (für `quellen` und die Quellenzeile im Video).

## 2b. Follower (EN): Folge übernehmen
```
git clone --depth 1 https://github.com/oskargross09-svg/geschichte-der-mathematik /tmp/de
ls /tmp/de/episodes/ | grep <datum>
cp -r /tmp/de/episodes/<datum>_<slug> episodes/
```
Gibt es heute noch keine Folge im DE-Repo: nimm die neueste DE-Folge, die hier noch fehlt. Gibt es keine solche:
selbst eine Folge nach 2a–3 schreiben (Thema = oberste offene Zeile in `/tmp/de/themen.md`), nur EN veröffentlichen.
Danach den englischen Text lesen und nur verbessern, wenn etwas falsch oder holprig ist (Fakten nicht ändern).

## 3. Folge schreiben (Leader) – `episodes/<datum>_<slug>/`
### episode.json (Vorlage: Beispiel-Folge kopieren)
```jsonc
{
 "slug": "archimedes-krone", "date": "2026-11-22", "thema": "…",
 "beats": [ {"id": "hook", "de": "Gesprochener Satz.", "en": "Spoken sentence."}, … ],   // 8–11 Beats, ids frei wählbar
 "say": {"de": {"hiess": "hieß"}, "en": {}},          // Aussprache-Ersetzungen nur für die Stimme (Untertitel unverändert)
 "text": {"de": {"hook": "…", "quelle": "Quellen: …", "kw": {…}, …}, "en": {…}},   // alle Kreide-Texte der Szenen, je Sprache gleiche Schlüssel
 "meta": {"de": {"title": "…", "description": "…", "tags": [6–8]}, "en": {…}},
 "quellen": ["Autor, Werk", …]
}
```
- **Länge:** DE 95–120 Wörter (≈ 38–45 s), EN ähnlich. Erster Beat = Hook als Frage oder Ausruf („Warum rannte Archimedes nackt durch Syrakus?“), `text.<lang>.hook` = derselbe Satz.
- Letzter Beat: Pointe oder „Übrigens …“/„Fun fact …“. `text.<lang>.quelle` erscheint dort automatisch (eine Zeile, ≤ 75 Zeichen).
- Deutsch: Du-Form, kurze Sätze, Schweizer Rechtschreibung (ss statt ß – in `say` für die Aussprache korrigieren, z. B. „hiess“→„hieß“, „gross“→„groß“, „Strasse“→„Straße“).
  Zahlen, die die Stimme falsch lesen könnte, im Beat als Wörter oder per `say` ersetzen. Englisch: natürlich, nicht wörtlich übersetzt.
- `kw`: Stichwörter, die WÖRTLICH im Beat-Text der jeweiligen Sprache vorkommen – damit wird eine Animation genau beim Wort ausgelöst (`kw('beat', 'key')`).
- `meta.title` ≤ 70 Zeichen, neugierig machend, keine Clickbait-Lügen. `description` 2–3 Sätze.

### scenes.js – eine Funktion pro Beat-ID + CUES
```js
const SCENES = { hook(t, b) { return '…svg…'; }, … };   // t = globale Zeit (s), b = {start, end, text}
function CUES(add) { add(zeit, 'pop', 0.7); … }         // Soundeffekte
```
Vorlage ist die Beispiel-Folge – Aufbau übernehmen, Inhalte neu. API (`pipeline/template/lib.js`):
- Layout 1080 × 1920: Titel oben bei `TITLE_Y` (330), Bühne y 560–1270 (Boden `FLOOR` = 1262), x zwischen `X0` 64 und `X1` 920, Mitte `CX` 492.
  **Unter y 1290 nichts zeichnen** (Untertitel + Plattform-UI), rechts von 920 nichts Wichtiges.
- Text: `chalkText(txt, x, y, {size, disp, anchor, color, p})`, `chalkBlock(txt, x, y, {size, maxW, p})`. Grössen: 120 Hook-Wort/Ausruf, 88 Titel, 64 Zwischentitel/Ort+Jahr, 56/44 Beschriftung (`disp:false`), 34 Notiz, 28 Quelle (`color: K.gh`). Nie farbige Schrift.
- Kreide: `chalkLine(d, p, w)`, `chalkArrow(x1,y1,x2,y2,p)`, `chalkCheck(x,y,p)`, `chalkCross(x,y,r,p)`, `chalkUnderline(x1,x2,y,p)` – Formeln/Skizzen live zeichnen.
- Figuren: `place(x, FLOOR, scale, figure(FIG.x, {...POSE.y, expr, blink: blinkAt(t, n), tilt, lProp, rProp}))`.
  `FIG`: archimedes, pythagoras, hieron, handwerker, euklid, hypatia, fibonacci, noether, gelehrterNeuzeit – eigene Figur: Objekt mit
  `kleidung` toga|gewand|kleid|anzug, `farbe`, `schaerpe`, `schuerze`, `guertel`, `krawatte`, `haar` locken|kurz|glatze|dutt|lang|keins, `haarFarbe`,
  `bart` voll|gross|kurz, `bartFarbe`, `kopf` lorbeer|diadem|zipfel, `brille`. Farben nur aus `K` (figur-Tokens), max. 3 Kleidungsfarben, Epoche beachten.
  `POSE`: stehen, zeigen, zeigenSeite, geben, staunen, denken, halten. `expr`: freundlich, staunen, denken, lachen, verwirrt, zwinkern.
  **Max. 2 Figuren pro Szene.** Figuren sind Karikaturen – keine Fotos/Gemälde echter Personen.
- Requisiten (immer mit `RIM`): `crown, goldbar, lump, bulb (Idee!), cube, drop, dreieck, kreide, schriftrolle, zirkel, tafel(s, innerSvg), balance(...)`;
  Archimedes in der Wanne: `placeTub(x, y, s, tubScene({...}))` (nackt nur in der Wanne).
- Animation: `prog(t,a,d)`, `pop(t,a,d)`, `easeInOut`, `idle(t)`, `kw(beatId, key)`, `B.<beatId>.start/.end`, Texte über `T('schlüssel')`.
- Jede Szene: in den ersten 0,5 s etwas erscheint (pop/Kreide), beim Schlüsselwort passiert etwas Sichtbares. Bewegung statt Standbild.
- Soundeffekte (`pipeline/sfx.py`): whoosh, chalk, pop, splash, coin, sparkle, creak, ding, hmm, buzz, water, trickle, zip, thud, boing, plop, stamp, gasp, chime.
  Pro Szene 1–3 Effekte; Kreide-Schreiben mit `chalk`. Keine Musik. Abspann-Ton kommt automatisch.

## 4. Prüfen (Pflicht)
```
python3 pipeline/make_video.py episodes/<name> --lang de --stills
python3 pipeline/make_video.py episodes/<name> --lang en --stills
```
Alle ERROR beheben, WARNING (Dauer, Stichwort nicht im Text) ernst nehmen. Dann **`build/<name>/sheet_de.jpg` und `sheet_en.jpg` ansehen** (Read-Tool):
nichts überlappt oder ist abgeschnitten, nichts unter den Untertiteln, Texte passen in die Breite, Figuren vollständig, jede Szene zeigt, was gesagt wird,
Fakten/Zahlen stimmen mit der Recherche. Korrigieren und wiederholen. Follower prüft nur `--lang en`.

## 5. Veröffentlichen
```
python3 pipeline/publish.py episodes/<name>
```
Rendert das MP4 (~2–3 min), legt es auf den Branch `media`, pusht `episodes/<name>` + `videos/<name>.json`; `.github/workflows/publish.yml`
lädt es hoch, YouTube veröffentlicht es zur Sendezeit aus `channel.json` (bei < 10 min sofort). Das Skript wartet auf das Ergebnis.
- `RESULT: OK` → Leader: in `themen.md` die Zeile mit `[x]` und Datum abhaken, committen und pushen (`git pull --rebase` vorher). Fertig, Abschluss in 2 Zeilen (Thema + Sendezeit).
- `RESULT: FAILED` / `UNKNOWN` → einmal wiederholen (`--no-render`, wenn das MP4 schon da ist). Klappt es dann nicht, dem Nutzer eine
  Push-Benachrichtigung (PushNotification-Tool) auf Deutsch senden: was fehlgeschlagen ist (Log in Branch `bot-logs`) und dass die Folge fehlt.

Nie etwas anderes veröffentlichen, nie Videos löschen, nie Workflows oder Secrets während eines geplanten Laufs ändern.

## Repo-Übersicht
- `pipeline/make_video.py` – Folge → MP4 (Stimme sherpa-onnx: DE Piper „Thorsten“, EN Kokoro „am_michael“; Rendering mit Chrome; Mix)
- `pipeline/template/` – `lib.js` (Figuren, Requisiten, Kreide, Untertitel, Abspann), `page.html` · `pipeline/fonts/` Kalam + Patrick Hand (OFL) · `pipeline/assets/` Wortmarken
- `pipeline/sfx.py` – Soundeffekte per Code · `pipeline/publish.py` – Übergabe an GitHub · `upload_youtube.py` – YouTube Data API
  (Secrets `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN` – Token pro Kanal, siehe `tools/get_refresh_token.py`)
- `episodes/` – eine Folge pro Tag · `videos/` – Upload-Aufträge (lösen `publish.yml` aus) · `themen.md` – Themenliste (im DE-Repo massgebend)
- Branch `media` – MP4-Dateien (wöchentlich aufgeräumt) · Branch `bot-logs` – Ergebnisse des Upload-Workflows

# Geschichte der Mathematik · Math History

Automatische Produktion der YouTube Shorts: jeden Tag eine wahre Geschichte aus der Mathematik – auf Deutsch (**Geschichte der Mathematik**, 17:00 Uhr) und Englisch (**Math History**, 22:00 Uhr), mit Kreide auf schwarzer Tafel und farbigen Chibi-Figuren.

Ablauf: Ein geplanter Claude-Lauf recherchiert im DE-Repo, schreibt `episodes/<datum>_<slug>/` (Text in beiden Sprachen + Szenen), rendert und übergibt mit `pipeline/publish.py`. Ein zweiter Lauf im EN-Repo übernimmt die Folge und veröffentlicht die englische Fassung. `.github/workflows/publish.yml` lädt per YouTube Data API hoch.

Themen: `themen.md` im DE-Repo (einfach Zeilen ergänzen). Details: `CLAUDE.md`.

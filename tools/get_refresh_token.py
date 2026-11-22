"""Einmalig auf dem eigenen Computer ausführen, um den YouTube-Refresh-Token für DIESEN Kanal zu holen.

    pip install google-auth-oauthlib
    CLIENT_ID=… CLIENT_SECRET=… python3 tools/get_refresh_token.py

Im Browser mit dem Google-Konto anmelden und beim Kanal-Auswahlschritt den richtigen Kanal wählen
(„Geschichte der Mathematik“ bzw. „Math History“). Den ausgegebenen Token als GitHub-Secret
YOUTUBE_REFRESH_TOKEN in diesem Repo speichern (Settings → Secrets and variables → Actions),
dazu CLIENT_ID und CLIENT_SECRET (dieselben wie bei den anderen Kanälen).
"""
import os
from google_auth_oauthlib.flow import InstalledAppFlow

flow = InstalledAppFlow.from_client_config(
    {"installed": {"client_id": os.environ["CLIENT_ID"], "client_secret": os.environ["CLIENT_SECRET"],
                   "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://oauth2.googleapis.com/token",
                   "redirect_uris": ["http://localhost"]}},
    scopes=["https://www.googleapis.com/auth/youtube.upload"])
creds = flow.run_local_server(port=0, prompt="consent", access_type="offline")
print("\nYOUTUBE_REFRESH_TOKEN =", creds.refresh_token)

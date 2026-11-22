#!/usr/bin/env bash
# Einmalige Einrichtung pro (frischer) Maschine: Python-Pakete, Browser, Stimmen (~420 MB, gecacht in $MK_MODELS).
set -e
PIP="pip install -q --break-system-packages"
$PIP "sherpa-onnx==1.12.40" soundfile playwright numpy scipy pillow 2>/dev/null || pip install -q "sherpa-onnx==1.12.40" soundfile playwright numpy scipy pillow
# Browser: vorhandenes Chrome reicht, sonst Playwright-Chromium
if ! command -v google-chrome >/dev/null; then python3 -m playwright install chromium >/dev/null 2>&1 || python3 -m playwright install --with-deps chromium; fi
M="${MK_MODELS:-$HOME/.cache/mathe-kanaele}"; mkdir -p "$M"
REL=https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models
for m in vits-piper-de_DE-thorsten-high kokoro-en-v0_19; do
  if [ ! -s "$M/$m/tokens.txt" ]; then curl -sSfL "$REL/$m.tar.bz2" | tar xj -C "$M"; fi
done
command -v ffmpeg >/dev/null || (sudo apt-get install -y -qq ffmpeg || apt-get install -y -qq ffmpeg)
python3 -c "import sherpa_onnx, soundfile, playwright, numpy, scipy, PIL" && echo "setup ok"

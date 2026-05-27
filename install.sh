#!/usr/bin/env bash
# Install chordid.amxd (plus its JS dependencies) into Live's User Library.
# Run from the chordid/ dir:
#   bash install.sh [--launch]
#
# --launch also opens Ableton Live 12 after installing.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="$HOME/Music/Ableton/User Library/Presets/MIDI Effects/Max MIDI Effect"
LIVE_APP="/Applications/Ableton Live 12 Suite.app"

LAUNCH=0
for arg in "$@"; do
  case "$arg" in
    --launch) LAUNCH=1 ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done

if [ ! -f "$HERE/chordid.amxd" ]; then
  echo "missing chordid.amxd; running build-amxd.py" >&2
  python3 "$HERE/build-amxd.py"
fi

mkdir -p "$DEST"
cp "$HERE/chordid.amxd"         "$DEST/"
cp "$HERE/chord-engine.js"      "$DEST/"
cp "$HERE/keyboard-display.js"  "$DEST/"

echo "installed:"
echo "  $DEST/chordid.amxd"
echo "  $DEST/chord-engine.js"
echo "  $DEST/keyboard-display.js"

if [ "$LAUNCH" -eq 1 ]; then
  if [ ! -d "$LIVE_APP" ]; then
    echo "Live not found at $LIVE_APP" >&2
    exit 3
  fi
  open -a "$LIVE_APP"
  osascript -e 'tell application "Live" to activate' || true
  echo
  echo "Live is opening. To test the device:"
  echo "  1. New Live Set (Cmd+N)."
  echo "  2. Categories > MIDI Effects > Max MIDI Effect > chordid → drag onto a MIDI track."
  echo "  3. Add an instrument after chordid. Arm the track. Play a note."
fi

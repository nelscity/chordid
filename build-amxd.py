#!/usr/bin/env python3
"""
Wrap chordid.maxpat into an .amxd container.

Real .amxd layout (verified against Live 12 factory devices, little-endian):

    'ampf' <version:u32 LE = 4> <devtype:4 bytes>
    'meta' <size:u32 LE = 4> <flags:u32 LE>
    'ptch' <size:u32 LE> <maxpat JSON bytes>

Device type tags (4 ASCII bytes, written as-is, not endian-swapped):
    b'aaaa' = audio effect
    b'mmmm' = MIDI effect
    b'iiii' = instrument
    b'natt' = Live 12 MIDI Transformation (Max-native)
    b'nagg' = Live 12 MIDI Generator (Max-native)

The meta flags byte appears to be 0 for factory devices and 7 for user-saved
devices coming out of Max for Live. We write 0 here; Max will rewrite it on
first save if it cares.

This produces an unfrozen device. To bundle chord-engine.js and keyboard-display.js
into the .amxd itself, open it in Max for Live and use Edit > Freeze Device.
Otherwise keep the .js files next to the .amxd (install.sh does this for you).
"""

import struct
import sys
from pathlib import Path

HERE = Path(__file__).parent
MAXPAT = HERE / "chordid.maxpat"
OUT = HERE / "chordid.amxd"


def build_amxd(maxpat_text: str, device_type: bytes = b"mmmm") -> bytes:
    if len(device_type) != 4:
        raise ValueError("device_type must be 4 bytes")
    ptch_body = maxpat_text.encode("utf-8")

    out = bytearray()
    out += b"ampf"
    out += struct.pack("<I", 4)
    out += device_type

    out += b"meta"
    out += struct.pack("<I", 4)
    out += struct.pack("<I", 0)

    out += b"ptch"
    out += struct.pack("<I", len(ptch_body))
    out += ptch_body

    return bytes(out)


def main() -> int:
    if not MAXPAT.exists():
        print(f"missing {MAXPAT}", file=sys.stderr)
        return 1
    maxpat_text = MAXPAT.read_text(encoding="utf-8")
    out_bytes = build_amxd(maxpat_text)
    OUT.write_bytes(out_bytes)
    print(f"wrote {OUT} ({len(out_bytes)} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

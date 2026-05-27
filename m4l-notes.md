# Max for Live device notes

Reference notes on Max for Live conventions, sourced from Cycling '74 docs and direct inspection of Live 12 factory devices.

## `live.thisdevice` is the gate

Every M4L device should have a `live.thisdevice` at top level. It sends an init bang when Live has fully loaded the device and the Live API is ready to query. **Wait for this bang before any `live.path` / `live.object` calls**, otherwise you get `Live API is not initialized`. A short `delay 200` after the bang smooths over occasional race conditions.

## MIDI flow

- `midiin` and `midiout` are the device's MIDI ports. They auto-connect to the host track's MIDI inside an `.amxd`.
- `notein` and `noteout` work too. They handle just note messages with pitch, velocity, channel.
- `midiparse` splits raw bytes into note / ctl / bend / pgm / touch / poly / ch outlets.
- `midiformat` reassembles parsed messages into raw bytes for `midiout`.
- `midiselect` does inline filtering.

`noteout` is convenient for note-only output: simpler than building status bytes manually. Inlets are pitch (left), velocity, channel. **Right-to-left ordering** matters: channel and velocity must be set before pitch arrives, since pitch on the leftmost inlet is what fires the note. `unpack 0 0 0` from a JS list does this automatically (rightmost outlet fires first).

For multi-channel output, building raw status bytes in JS and emitting straight to `midiout` is simpler than driving `midiformat`'s sticky-channel state machine:

```js
function sendMidi(pitch, velocity, channel) {
  const status = (velocity > 0 ? 0x90 : 0x80) | ((channel - 1) & 0x0f);
  outlet(0, status, pitch, velocity);
}
```

**M4L sandbox**: a MIDI Effect device has exactly one MIDI in and one MIDI out, both bound to the host track. Extra `midiin` / `midiout` objects in the patcher just see the same track MIDI. You cannot bind one to a specific external port like a hardware controller.

## Device sizing

M4L MIDI effect devices fit naturally at ~340–720 px wide. Past 720 they start to push other devices off-screen in Live's chain view. At the patcher root:

```json
"openinpresentation": 1,
"default_fontname": "Arial Bold",
"default_fontsize": 10.0
```

`default_fontsize 10` is the M4L convention. Not Arial 12 (Max's default outside M4L).

## live.text button styling

The pill-button look used throughout Live's UI:

```json
{
  "maxclass": "live.text",
  "text": "off label",
  "texton": "on label",
  "mode": 1,
  "bgcolor":   [0.674, 0.674, 0.674, 0.0],
  "bgoncolor": [0.874, 0.874, 0.874, 0.0],
  "fontname": "Avenir Medium",
  "presentation_rect": [x, y, w, h]
}
```

**`texton`, not `activetext`.** The active state of a `live.text mode 1` toggle is set via `texton`. There is no `activetext` attribute; Max silently ignores unrecognized keys and renders a default placeholder character (showed up as a yellow "B" in my case while debugging).

`mode 0` is button mode (fires `1` then `0` on click), which is wrong for stateful toggles. Use `mode 1` for toggles.

## live.menu sizing

`live.menu` has its own rendering height that ignores `presentation_rect.h` by default. To get menus that line up with `live.text` buttons:

```json
{
  "maxclass": "live.menu",
  "appearance": 1,
  "fontsize": 9.0,
  "presentation_rect": [x, y, w, 20.0]
}
```

`appearance: 1` is the compact dropdown style.

## Comment widget needs `set` prefix

A `comment` displays its `text` attribute. To update its text at runtime, send it `set <new text>`, **not** just the bare text. Plumb a `prepend set` upstream.

## kslider (built-in piano widget)

`kslider @mode <0|1>` — **0 = monophonic, 1 = polyphonic**. Default is 0. For a chord visualizer, always use `mode 1`.

Other attributes:
- `range` — number of pitches displayed (49 = 4 octaves + 1)
- `offset` — MIDI note of leftmost key (36 = C2)
- `selectioncolor` — RGBA float of highlight color

Input format on inlet 0: list `[pitch, velocity]`. Velocity 0 unhighlights the note in poly mode.

## jsui for custom drawing

When `kslider`'s look is insufficient (hollow keys, voicing brackets, custom indicators), use a `jsui` object pointing at an external `.js` file. Skeleton:

```js
inlets = 1;
outlets = 0;
autowatch = 1;
mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

function paint() {
  var w = box.rect[2] - box.rect[0];
  var h = box.rect[3] - box.rect[1];
  with (mgraphics) {
    set_source_rgba(r, g, b, a);
    rectangle(x, y, w, h);
    fill();
  }
}

function note(pitch, velocity) { /* ... */ mgraphics.redraw(); }
function onresize(w, h) { mgraphics.redraw(); }
```

Gotcha for piano-keyboard rendering: make black-key fill **opaque** (alpha 1.0), otherwise white-key outlines bleed through.

## v8 / js inlets and outlets

Either declare in JS:

```js
inlets = 1;
outlets = 4;
autowatch = 1;
```

Or pass numeric args after the filename: `js myfile.js 2 3` = **2 outlets, then 3 inlets**. The argument order is `[outlets] [inlets]` — reversed from how most APIs put them. Without either declaration, you get 1/1 by default and most outlet calls go nowhere.

Message dispatch is by name: a message `foo a b` calls `function foo(a, b)` if defined, `function anything(args)` otherwise. A bare list `[a, b]` calls `function list(a, b)`.

## Parameter scoping

Every UI element exposed to Live (and to Push / Move) needs:

```json
{
  "parameter_enable": 1,
  "varname": "my_thing",
  "saved_attribute_attributes": {
    "valueof": {
      "parameter_longname": "My Thing",
      "parameter_shortname": "my",
      "parameter_type": 2,
      "parameter_initial": [0],
      "parameter_initial_enable": 1,
      "parameter_enum": ["off", "on"]
    }
  }
}
```

- `parameter_type`: 0=float, 1=int, 2=enum (uses `parameter_enum` for labels)
- `parameter_invisible: 2` hides the parameter from Live's automation lane while still saving its value in the device preset.

## Info View tooltips

`_parameter_info` inside `saved_attribute_attributes.valueof` does not work in current Live 12. Live reads the Info View text from a different attribute at the box level:

```json
{
  "maxclass": "live.dial",
  "annotation": "Description shown in Live's Info View.",
  "annotation_name": "Title override (defaults to parameter_longname)"
}
```

The Info View has to be visible (`View > Info View`, Cmd+? on Mac).

## .amxd container format

Verified against Live 12 factory devices. All sizes little-endian.

```
'ampf' <version:u32 LE = 4> <devtype:4 bytes>
'meta' <size:u32 LE = 4> <flags:u32 LE>
'ptch' <size:u32 LE> <patcher body>
```

Device tags (4 ASCII bytes):
- `aaaa` audio effect
- `mmmm` MIDI effect
- `iiii` instrument
- `natt` Live 12 native MIDI Transformation
- `nagg` Live 12 native MIDI Generator

Two patcher body formats:
- **Factory devices**: ptch body is raw JSON.
- **User-saved devices** (Max wrote them): ptch body is a `mx@c` chunk (4-byte tag + 4-byte BE size for total chunk size, including the 8-byte header) followed by 8 bytes of metadata, then JSON. Skip `total` bytes from the start of the body to reach JSON.

After the JSON there may be trailing binary (frozen file data: jsui sources, samples); parse only the first balanced top-level `{...}` and preserve the trailing bytes on write.

## Live API navigation

Three objects:

- `live.path` — resolves a string path to a Live object id.
- `live.object` — operates on an id (get/set properties, call methods).
- `live.observer` — subscribes to a Live property. Bangs the new value on outlet 0 each time the property changes.

Useful path forms:

```
path live_app
path live_set
path this_device
path live_set view selected_track view selected_device
path live_app control_surfaces 0
```

Messages to `live.object`:

- `get <propname>` — get a property
- `set <propname> <value>` — set a property
- `call <method> [args]` — call a method
- `gettype` — class name of the object
- `getpath` — full path of the current id
- `getinfo` — dump properties and methods

`getproperty <propname>` is **not** the right message in Live 12; use `get <propname>`. Old Max docs say `getproperty` works, but Live errors with `live.object: doesn't understand "getproperty"`.

Order of operations: `live.object` needs its id set (via `live.path` output) **before** you send queries. Use `t l l` to sequence: rightmost outlet (id) fires first, leftmost (query) fires second.

`live.thisdevice`'s init bang is the right trigger for one-time API setup. Add a `delay 200` between it and the first `live.path` to smooth over race conditions.

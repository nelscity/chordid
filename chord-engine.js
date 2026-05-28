// chord-engine.js
// Ported from BespokeSynth ChordKeyboard.cpp (PR #2058, commit 82b8a27).
// Runs inside Max's [v8] object.
//
// Inlets (all dispatched by message name):
//   note pitch velocity            (input MIDI note from midiparse, prepended with "note")
//   list pitch velocity            (bare list from midiparse outlet 0)
//   param name value               (UI parameter changes)
//   tick                           (transport quantize tick)
//   arp_tick                       (arp clock tick from maxpat-side metro)
//   panic                          (flush held notes)
//   bang                           (re-emit display + state)
//
// Outlets:
//   0  list of [status, pitch, velocity]  -> midiout for chord
//   1  ["chord_display", "Cmaj7"]         -> comment widget
//   2  ["state", json]                    -> move-bridge
//   3  pitch + velocity ints             -> kslider visualizer
//   4  ["arp_run", 0|1]                   -> maxpat metro start/stop

inlets = 1;
outlets = 5;
autowatch = 1;

const PITCHES_PER_OCTAVE = 12;

const PlayOptions = Object.freeze({
  ChordAndBass: 0,
  ChordOnly: 1,
  BassOnly: 2,
  ChordOnPress: 3,
  ImmediateChord: 4,
  ImmediateChordOnly: 5,
});

const ChordStyle = Object.freeze({
  Closed: 0,
  SpreadThird: 1,
  SpreadSeventh: 2,
  SpreadThirdAndSeventh: 3,
  DoubledRoot: 4,
  DoubledRootAndThird: 5,
  Doubled: 6,
});

const Quantize = Object.freeze({
  None: 0,
  N32: 1,
  N16: 2,
  N8: 3,
  N4: 4,
});

const ArpType = Object.freeze({
  Off: 0,
  Up: 1,
  Down: 2,
  UpDown: 3,
  DownUp: 4,
  UpAndDown: 5,
  DownAndUp: 6,
  Converge: 7,
  Diverge: 8,
  RandomOnce: 9,
  Random: 10,
});

// Arp rates in fractions of a quarter note (a "beat").
// Matches the parameter_enum order in the maxpat: 1/32, 1/16T, 1/16, 1/8T, 1/8, 1/4T, 1/4, 1/2.
const ARP_RATE_BEATS = [0.125, 1.0 / 6.0, 0.25, 1.0 / 3.0, 0.5, 2.0 / 3.0, 1.0, 2.0];

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const CHORD_CHANNEL = 1;
const BASS_CHANNEL = 2;

const state = {
  scaleMode: false,
  quantizeInterval: Quantize.None,
  dim: false,
  minor: false,
  major: false,
  sus: false,
  six: false,
  min7: false,
  maj7: false,
  nine: false,
  playOptions: PlayOptions.ChordAndBass,
  latchKey: false,
  voicing: 41,
  bassVoicing: 41,
  velocityOverride: -1,
  chordStyle: ChordStyle.Closed,

  scaleRoot: 0,
  scalePitches: [0, 2, 4, 5, 7, 9, 11],

  inputPitch: -1,           // full MIDI pitch of the key the user actually pressed
  inputPitchWrapped: -1,
  heldKeys: [],             // full MIDI pitches in press order; top = current input. Only tracks while latchKey is off.
  lastInputVelocity: 100,
  lastKeyPressTime: -1,
  outputNotes: new Array(128).fill(false),
  bassOutputPitch: -1,
  latchChord: false,
  lastPlayedChord: null,
  pendingReplay: false,

  strumMs: 0,                  // signed: -200..+200 ms between successive notes; 0 = no strum
  pendingStrumTasks: [],       // Max Task objects for in-flight strum note-ons
  arpType: ArpType.Off,
  arpRateIdx: 4,               // index into ARP_RATE_BEATS (default 1/8)
  arpStep: 0,
  arpSequence: [],
  arpCurrentNote: -1,          // pitch currently sounding from the arp; -1 = none
  arpRunning: false,           // mirrors the metro's run state
  currentArpPitches: [],       // chord pitches the arp is cycling through
  bpm: 120,                    // Live transport tempo, fed in by maxpat live.observer
};

function snapshotChordSettings() {
  return {
    dim: state.dim, minor: state.minor, major: state.major, sus: state.sus,
    six: state.six, min7: state.min7, maj7: state.maj7, nine: state.nine,
    playOptions: state.playOptions,
  };
}

function getActiveChordSettings() {
  if (
    state.playOptions === PlayOptions.ChordOnPress ||
    state.playOptions === PlayOptions.ImmediateChord ||
    state.playOptions === PlayOptions.ImmediateChordOnly ||
    state.arpType !== ArpType.Off ||
    state.inputPitchWrapped === -1 ||
    state.lastPlayedChord === null
  ) {
    return snapshotChordSettings();
  }
  return state.lastPlayedChord;
}

function isChordButtonPressed(s) { return s.dim || s.minor || s.major || s.sus; }

function shouldPlayBass(s) {
  return s.playOptions === PlayOptions.ChordAndBass ||
         s.playOptions === PlayOptions.BassOnly ||
         s.playOptions === PlayOptions.ChordOnPress ||
         s.playOptions === PlayOptions.ImmediateChord;
}

function shouldPlayChord(s) {
  if (s.playOptions === PlayOptions.ChordOnPress) return isChordButtonPressed(s);
  return s.playOptions === PlayOptions.ChordAndBass ||
         s.playOptions === PlayOptions.ChordOnly ||
         s.playOptions === PlayOptions.ImmediateChord ||
         s.playOptions === PlayOptions.ImmediateChordOnly;
}

function adjustForVoicing(pitch, voicing) {
  return ((pitch + PITCHES_PER_OCTAVE - (voicing % PITCHES_PER_OCTAVE)) % PITCHES_PER_OCTAVE) + voicing;
}

function isInScale(pitch) {
  const rel = ((pitch - state.scaleRoot) % PITCHES_PER_OCTAVE + PITCHES_PER_OCTAVE) % PITCHES_PER_OCTAVE;
  return state.scalePitches.indexOf(rel) !== -1;
}

function makeDiatonic(pitch) {
  if (isInScale(pitch)) return pitch;
  for (let off = 1; off < PITCHES_PER_OCTAVE; ++off) {
    if (isInScale(pitch + off)) return pitch + off;
    if (isInScale(pitch - off)) return pitch - off;
  }
  return pitch;
}

function getChordPitches(forPitch) {
  const s = getActiveChordSettings();
  const chordPitches = [forPitch];
  let thirdIndex = -1;
  let seventhIndex = -1;

  if (state.scaleMode && !isChordButtonPressed(s)) {
    chordPitches.push(forPitch + 4);
    thirdIndex = chordPitches.length - 1;
    chordPitches.push(forPitch + 7);
  }
  if (s.dim)   { chordPitches.push(forPitch + 3); thirdIndex = chordPitches.length - 1; chordPitches.push(forPitch + 6); }
  if (s.minor) { chordPitches.push(forPitch + 3); thirdIndex = chordPitches.length - 1; chordPitches.push(forPitch + 7); }
  if (s.major) { chordPitches.push(forPitch + 4); thirdIndex = chordPitches.length - 1; chordPitches.push(forPitch + 7); }
  if (s.sus)   { chordPitches.push(forPitch + 5); chordPitches.push(forPitch + 7); }
  if (s.six)   { chordPitches.push(forPitch + 9); }
  if (s.min7)  { chordPitches.push(forPitch + 10); seventhIndex = chordPitches.length - 1; }
  if (s.maj7)  { chordPitches.push(forPitch + 11); seventhIndex = chordPitches.length - 1; }
  if (s.nine)  { chordPitches.push(forPitch + 14); }

  for (let i = 0; i < chordPitches.length; ++i) {
    chordPitches[i] = adjustForVoicing(chordPitches[i], state.voicing);
  }

  const numOriginalPitches = chordPitches.length;
  for (let i = 0; i < numOriginalPitches; ++i) {
    if (i === thirdIndex && (state.chordStyle === ChordStyle.SpreadThird || state.chordStyle === ChordStyle.SpreadThirdAndSeventh)) {
      chordPitches[i] += PITCHES_PER_OCTAVE;
    }
    if (i === seventhIndex && (state.chordStyle === ChordStyle.SpreadSeventh || state.chordStyle === ChordStyle.SpreadThirdAndSeventh)) {
      chordPitches[i] += PITCHES_PER_OCTAVE;
    }
    if ((i === 0 && state.chordStyle === ChordStyle.DoubledRoot) ||
        ((i === 0 || i === thirdIndex) && state.chordStyle === ChordStyle.DoubledRootAndThird) ||
        state.chordStyle === ChordStyle.Doubled) {
      chordPitches.push(chordPitches[i] + PITCHES_PER_OCTAVE);
    }
  }

  const out = [];
  for (let pitch of chordPitches) {
    if (state.scaleMode && !isChordButtonPressed(s)) pitch = makeDiatonic(pitch);
    if (out.indexOf(pitch) === -1) out.push(pitch);
  }
  out.sort((a, b) => a - b);
  return out;
}

function getChordDisplayString() {
  const s = getActiveChordSettings();
  let chord = "";
  if (s.dim) chord += "dim";
  if (s.minor) chord += "m";
  if (s.sus) chord += "sus";
  if (state.scaleMode && state.inputPitchWrapped !== -1 && !isChordButtonPressed(s)) {
    if (!isInScale(state.inputPitchWrapped + 7)) chord += "dim";
    else if (isInScale(state.inputPitchWrapped + 3)) chord += "m";
  }
  if (s.six) chord += "6";
  if (s.min7) chord += "7";
  if (s.maj7) chord += "M7";
  if (s.nine) chord += "9";
  if (state.inputPitchWrapped !== -1) return NOTE_NAMES[state.inputPitchWrapped] + chord;
  return chord;
}

function sendMidi(pitch, velocity, channel) {
  const status = (velocity > 0 ? 0x90 : 0x80) | ((channel - 1) & 0x0f);
  outlet(0, status, pitch, velocity);
  if (channel === CHORD_CHANNEL) outlet(3, pitch, velocity);
}

function cancelPendingStrum() {
  for (let i = 0; i < state.pendingStrumTasks.length; ++i) {
    try { state.pendingStrumTasks[i].cancel(); } catch (e) {}
  }
  state.pendingStrumTasks = [];
}

function strumNoteOn(pitch, velocity, delayMs) {
  if (delayMs <= 0) {
    sendMidi(pitch, velocity, CHORD_CHANNEL);
    state.outputNotes[pitch] = true;
    return;
  }
  const task = new Task(function () {
    sendMidi(pitch, velocity, CHORD_CHANNEL);
    state.outputNotes[pitch] = true;
    const idx = state.pendingStrumTasks.indexOf(task);
    if (idx !== -1) state.pendingStrumTasks.splice(idx, 1);
  }, this);
  task.schedule(delayMs);
  state.pendingStrumTasks.push(task);
}

function computeArpSequence(pitches, arpType) {
  const n = pitches.length;
  if (n === 0) return [];
  switch (arpType) {
    case ArpType.Up: return pitches.slice();
    case ArpType.Down: return pitches.slice().reverse();
    case ArpType.UpDown: {
      if (n === 1) return pitches.slice();
      const seq = pitches.slice();
      for (let i = n - 2; i >= 1; --i) seq.push(pitches[i]);
      return seq;
    }
    case ArpType.DownUp: {
      if (n === 1) return pitches.slice();
      const seq = pitches.slice().reverse();
      for (let i = 1; i < n - 1; ++i) seq.push(pitches[i]);
      return seq;
    }
    case ArpType.UpAndDown: {
      const seq = pitches.slice();
      for (let i = n - 1; i >= 0; --i) seq.push(pitches[i]);
      return seq;
    }
    case ArpType.DownAndUp: {
      const seq = pitches.slice().reverse();
      for (let i = 0; i < n; ++i) seq.push(pitches[i]);
      return seq;
    }
    case ArpType.Converge: {
      const seq = [];
      let lo = 0, hi = n - 1;
      while (lo <= hi) {
        seq.push(pitches[lo]);
        if (hi !== lo) seq.push(pitches[hi]);
        lo++; hi--;
      }
      return seq;
    }
    case ArpType.Diverge: {
      const seq = [];
      const mid = Math.floor((n - 1) / 2);
      seq.push(pitches[mid]);
      for (let d = 1; d <= n; ++d) {
        if (mid - d >= 0) seq.push(pitches[mid - d]);
        if (mid + d < n && (mid + d) !== (mid - d)) seq.push(pitches[mid + d]);
      }
      return seq;
    }
    case ArpType.RandomOnce: {
      const seq = pitches.slice();
      for (let i = seq.length - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = seq[i]; seq[i] = seq[j]; seq[j] = t;
      }
      return seq;
    }
    case ArpType.Random: return pitches.slice();
    default: return [];
  }
}

function setArpRunning(running) {
  if (running === state.arpRunning) return;
  state.arpRunning = running;
  outlet(4, "arp_run", running ? 1 : 0);
  if (!running) {
    if (state.arpCurrentNote !== -1) {
      sendMidi(state.arpCurrentNote, 0, CHORD_CHANNEL);
      state.arpCurrentNote = -1;
    }
    state.arpStep = 0;
  }
}

function recomputeArpInterval() {
  if (state.bpm <= 0) return;
  const beats = ARP_RATE_BEATS[state.arpRateIdx] || 0.5;
  const ms = (60000.0 / state.bpm) * beats;
  outlet(4, "arp_interval", ms);
}

function emitDisplay() { outlet(1, "chord_display", getChordDisplayString()); }

function emitState() {
  const s = getActiveChordSettings();
  outlet(2, "state", JSON.stringify({
    dim: s.dim, minor: s.minor, major: s.major, sus: s.sus,
    six: s.six, min7: s.min7, maj7: s.maj7, nine: s.nine,
    latchChord: state.latchChord, latchKey: state.latchKey,
    scaleMode: state.scaleMode,
    inputPitchWrapped: state.inputPitchWrapped,
    scaleRoot: state.scaleRoot,
    scalePitches: state.scalePitches,
  }));
}

function pendingTransportSensitive() { return state.quantizeInterval !== Quantize.None; }

function pushHeld(pitch) {
  const i = state.heldKeys.indexOf(pitch);
  if (i !== -1) state.heldKeys.splice(i, 1);
  state.heldKeys.push(pitch);
}

function removeHeld(pitch) {
  const i = state.heldKeys.indexOf(pitch);
  if (i !== -1) state.heldKeys.splice(i, 1);
}

function topHeld() {
  return state.heldKeys.length > 0 ? state.heldKeys[state.heldKeys.length - 1] : -1;
}

function handleNote(pitch, velocity) {
  if (pitch < 0 || pitch > 127) return;
  let forceReplay = false;
  const now = Date.now();
  let noteOn;
  if (state.latchKey) {
    if (velocity <= 0) { scheduleOrUpdate(forceReplay); return; }
    noteOn = (pitch % 12) !== state.inputPitchWrapped;
  } else {
    noteOn = velocity > 0;
  }
  if (noteOn) {
    if (state.latchKey || state.quantizeInterval !== Quantize.None) forceReplay = true;
    if (!state.latchKey) pushHeld(pitch);
    state.inputPitch = pitch;
    state.inputPitchWrapped = pitch % 12;
    outlet(3, "input_pitch", pitch);
    if (velocity > 0) state.lastInputVelocity = velocity;
    state.lastKeyPressTime = now;
    state.lastPlayedChord = snapshotChordSettings();
  } else if (state.latchKey) {
    // Latch-mode unlatch: a re-press of the currently latched pitch class
    // arrives here (noteOn evaluated false above). Velocity-zero events are
    // already early-returned in the latch branch.
    if (pitch % 12 === state.inputPitchWrapped) {
      state.inputPitch = -1;
      state.inputPitchWrapped = -1;
      outlet(3, "input_pitch", -1);
    }
  } else {
    // Pop this key off the held stack. If it was the top, fall back to the
    // next-most-recent held key so a sustained C5 keeps the chord sounding
    // after a brief C6 (or any other overlapping key) is released.
    removeHeld(pitch);
    const newTop = topHeld();
    if (newTop !== state.inputPitch) {
      state.inputPitch = newTop;
      state.inputPitchWrapped = newTop === -1 ? -1 : newTop % 12;
      outlet(3, "input_pitch", state.inputPitch);
      // Refresh the locked chord snapshot for the falling-back key so the
      // chord buttons toggled mid-hold actually take effect on the next note.
      if (newTop !== -1) state.lastPlayedChord = snapshotChordSettings();
    }
  }
  scheduleOrUpdate(forceReplay);
}

function scheduleOrUpdate(forceReplay) {
  if (pendingTransportSensitive()) {
    state.pendingReplay = state.pendingReplay || forceReplay;
    // Display and Move state still need to follow input + button changes
    // even while MIDI emission is deferred to the next transport tick;
    // otherwise the chord name lags a beat behind the user's input.
    emitDisplay();
    emitState();
    return;
  }
  updateOutputNotes(forceReplay);
}

function updateOutputNotes(forceReplay) {
  const s = getActiveChordSettings();
  let chordPitches = [];
  let bassPitch = -1;
  if (state.inputPitchWrapped !== -1) {
    if (shouldPlayChord(s)) chordPitches = getChordPitches(state.inputPitchWrapped);
    if (shouldPlayBass(s)) bassPitch = adjustForVoicing(state.inputPitchWrapped, state.bassVoicing);
  }

  const arpActive = state.arpType !== ArpType.Off && chordPitches.length > 0;
  state.currentArpPitches = chordPitches.slice();

  if (arpActive) {
    // Suppress normal chord emission; the arp tick owns channel-1 output.
    for (let i = 0; i < 128; ++i) {
      if (state.outputNotes[i]) sendMidi(i, 0, CHORD_CHANNEL);
    }
    state.outputNotes = new Array(128).fill(false);
    cancelPendingStrum();

    // Don't release arpCurrentNote here on chord/voicing change — the next arp
    // tick releases it before firing the next note. Releasing it now would
    // silence the arp during a rapid dial twist (each tick of the dial fires
    // updateOutputNotes; if we released on every one, no note would sound
    // between dial events).
    state.arpSequence = computeArpSequence(chordPitches, state.arpType);
    if (forceReplay) state.arpStep = 0;
    setArpRunning(true);
  } else {
    setArpRunning(false);
    cancelPendingStrum();

    const newOutput = new Array(128).fill(false);
    for (const p of chordPitches) if (p >= 0 && p < 128) newOutput[p] = true;

    const newOnPitches = [];
    for (let i = 0; i < 128; ++i) {
      if (newOutput[i] && (!state.outputNotes[i] || forceReplay)) {
        newOnPitches.push(i);
      } else if (!newOutput[i] && state.outputNotes[i]) {
        sendMidi(i, 0, CHORD_CHANNEL);
        state.outputNotes[i] = false;
      }
    }

    const velocity = state.velocityOverride !== -1 ? state.velocityOverride : (state.lastInputVelocity || 100);
    const strumMs = state.strumMs | 0;
    const n = newOnPitches.length;
    if (strumMs > 0) {
      for (let k = 0; k < n; ++k) strumNoteOn(newOnPitches[k], velocity, k * strumMs);
    } else if (strumMs < 0) {
      const gap = -strumMs;
      for (let k = 0; k < n; ++k) strumNoteOn(newOnPitches[n - 1 - k], velocity, k * gap);
    } else {
      for (let k = 0; k < n; ++k) strumNoteOn(newOnPitches[k], velocity, 0);
    }

    // Don't bulk-set state.outputNotes = newOutput — pending strum note-ons
    // would be marked "on" before they fire, and a chord update mid-strum
    // would cancel them while the comparison treats them as already sounding,
    // so they would never play. Note-offs above explicitly clear the bit;
    // strum tasks set their bit when they actually fire.
  }

  if (bassPitch !== state.bassOutputPitch) {
    if (state.bassOutputPitch !== -1) sendMidi(state.bassOutputPitch, 0, BASS_CHANNEL);
    if (bassPitch !== -1) {
      const v = state.velocityOverride !== -1 ? state.velocityOverride : (state.lastInputVelocity || 100);
      sendMidi(bassPitch, v, BASS_CHANNEL);
    }
  }

  state.bassOutputPitch = bassPitch;
  state.pendingReplay = false;
  emitDisplay();
  emitState();
}

// ===== Max message handlers =====

function note(pitch, velocity) { handleNote(pitch | 0, velocity | 0); }
function list(pitch, velocity) { handleNote(pitch | 0, velocity | 0); }

function param(name, value) {
  switch (String(name)) {
    case "quantize": state.quantizeInterval = value | 0; break;
    case "dim": state.dim = !!value; break;
    case "minor": state.minor = !!value; break;
    case "major": state.major = !!value; break;
    case "sus": state.sus = !!value; break;
    case "six": state.six = !!value; break;
    case "min7": state.min7 = !!value; break;
    case "maj7": state.maj7 = !!value; break;
    case "nine": state.nine = !!value; break;
    case "play_options": state.playOptions = value | 0; break;
    case "latch_key":
      state.latchKey = !!value;
      // Clear the held-key stack either way: it doesn't represent reality
      // across a latch toggle (latch-on ignores MIDI key-ups, so the stack
      // would go stale; latch-off should start fresh).
      state.heldKeys = [];
      if (!state.latchKey) {
        state.inputPitch = -1;
        state.inputPitchWrapped = -1;
        outlet(3, "input_pitch", -1);
        // Release any chord notes the previously-latched key was sounding.
        scheduleOrUpdate(false);
        return;
      }
      break;
    case "latch_chord": state.latchChord = !!value; break;
    case "voicing": state.voicing = value | 0; outlet(3, "voicing", state.voicing); break;
    case "voicing_delta":
      state.voicing = Math.max(0, Math.min(115, state.voicing + (value | 0)));
      outlet(3, "voicing", state.voicing);
      break;
    case "bass_voicing": state.bassVoicing = value | 0; outlet(3, "bass_voicing", state.bassVoicing); break;
    case "velocity_override": state.velocityOverride = value | 0; break;
    case "chord_style": state.chordStyle = value | 0; break;
    case "scale_mode": state.scaleMode = !!value; outlet(3, "scale_mode", state.scaleMode ? 1 : 0); break;
    case "scale_root": state.scaleRoot = (value | 0) % 12; outlet(3, "scale_root", state.scaleRoot); break;
    case "strum_ms": state.strumMs = value | 0; return;
    case "arp_type": state.arpType = value | 0; break;
    case "arp_rate": state.arpRateIdx = value | 0; recomputeArpInterval(); return;
    case "bpm": state.bpm = +value || 120; recomputeArpInterval(); return;
    default: return;
  }
  if (state.playOptions === PlayOptions.ImmediateChord || state.playOptions === PlayOptions.ImmediateChordOnly) {
    scheduleOrUpdate(true);
  } else if (state.inputPitchWrapped !== -1) {
    scheduleOrUpdate(false);
  } else {
    emitDisplay();
    emitState();
  }
}

function scale_pitches() {
  const arr = [];
  for (let i = 0; i < arguments.length; ++i) arr.push(arguments[i] | 0);
  state.scalePitches = arr;
  outlet(3, "scale_pitches", arr);
  emitState();
}

function tick() { updateOutputNotes(state.pendingReplay); }

function arp_tick() {
  if (state.arpType === ArpType.Off) return;
  const pitches = state.currentArpPitches;
  if (!pitches || pitches.length === 0) return;

  if (state.arpCurrentNote !== -1) {
    sendMidi(state.arpCurrentNote, 0, CHORD_CHANNEL);
    state.arpCurrentNote = -1;
  }

  let pitch;
  if (state.arpType === ArpType.Random) {
    pitch = pitches[Math.floor(Math.random() * pitches.length)];
  } else {
    const seq = state.arpSequence;
    if (!seq || seq.length === 0) return;
    pitch = seq[state.arpStep % seq.length];
    state.arpStep = (state.arpStep + 1) % seq.length;
  }

  const velocity = state.velocityOverride !== -1 ? state.velocityOverride : (state.lastInputVelocity || 100);
  sendMidi(pitch, velocity, CHORD_CHANNEL);
  state.arpCurrentNote = pitch;
}

function panic() {
  cancelPendingStrum();
  setArpRunning(false);
  for (let i = 0; i < 128; ++i) {
    if (state.outputNotes[i]) sendMidi(i, 0, CHORD_CHANNEL);
  }
  if (state.bassOutputPitch !== -1) sendMidi(state.bassOutputPitch, 0, BASS_CHANNEL);
  state.outputNotes = new Array(128).fill(false);
  state.bassOutputPitch = -1;
  state.inputPitch = -1;
  state.inputPitchWrapped = -1;
  state.heldKeys = [];
  state.currentArpPitches = [];
  emitDisplay();
  emitState();
}

function bang() { emitDisplay(); emitState(); }

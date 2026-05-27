// chord-engine.js
// Ported from BespokeSynth ChordKeyboard.cpp (PR #2058, commit 82b8a27).
// Runs inside Max's [v8] object.
//
// Inlets (all dispatched by message name):
//   note pitch velocity            (input MIDI note from midiparse, prepended with "note")
//   list pitch velocity            (bare list from midiparse outlet 0)
//   param name value               (UI parameter changes)
//   tick                           (transport quantize tick)
//   panic                          (flush held notes)
//   bang                           (re-emit display + state)
//
// Outlets:
//   0  list of [status, pitch, velocity]  -> midiout for chord
//   1  ["chord_display", "Cmaj7"]         -> comment widget
//   2  ["state", json]                    -> move-bridge
//   3  pitch + velocity ints             -> kslider visualizer

inlets = 1;
outlets = 4;
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
  lastInputVelocity: 100,
  lastKeyPressTime: -1,
  outputNotes: new Array(128).fill(false),
  bassOutputPitch: -1,
  latchChord: false,
  lastPlayedChord: null,
  pendingReplay: false,
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
    state.inputPitch = pitch;
    state.inputPitchWrapped = pitch % 12;
    outlet(3, "input_pitch", pitch);
    if (velocity > 0) state.lastInputVelocity = velocity;
    state.lastKeyPressTime = now;
    state.lastPlayedChord = snapshotChordSettings();
  } else {
    if (pitch % 12 === state.inputPitchWrapped) {
      state.inputPitch = -1;
      state.inputPitchWrapped = -1;
      outlet(3, "input_pitch", -1);
    } else if (state.inputPitchWrapped !== -1 && state.quantizeInterval === Quantize.None) {
      // 100 ms grace window: when two keys overlap during fast chord changes,
      // turn off only the shared chord pitches so the new chord's notes don't
      // get orphaned by the departing key's release.
      if (now < state.lastKeyPressTime + 100) {
        const cur = getChordPitches(state.inputPitchWrapped);
        const prev = getChordPitches(pitch % 12);
        for (const p of cur) {
          if (prev.indexOf(p) !== -1) {
            sendMidi(p, 0, CHORD_CHANNEL);
            state.outputNotes[p] = false;
          }
        }
      }
    }
  }
  scheduleOrUpdate(forceReplay);
}

function scheduleOrUpdate(forceReplay) {
  if (pendingTransportSensitive()) {
    state.pendingReplay = state.pendingReplay || forceReplay;
    return;
  }
  updateOutputNotes(forceReplay);
}

function updateOutputNotes(forceReplay) {
  const s = getActiveChordSettings();
  const newOutput = new Array(128).fill(false);
  let chordPitches = [];
  let bassPitch = -1;
  if (state.inputPitchWrapped !== -1) {
    if (shouldPlayChord(s)) chordPitches = getChordPitches(state.inputPitchWrapped);
    if (shouldPlayBass(s)) bassPitch = adjustForVoicing(state.inputPitchWrapped, state.bassVoicing);
  }
  for (const p of chordPitches) if (p >= 0 && p < 127) newOutput[p] = true;

  for (let i = 0; i < 128; ++i) {
    if (newOutput[i] && (!state.outputNotes[i] || forceReplay)) {
      let v = state.lastInputVelocity || 100;
      if (state.velocityOverride !== -1) v = state.velocityOverride;
      sendMidi(i, v, CHORD_CHANNEL);
    } else if (!newOutput[i] && state.outputNotes[i]) {
      sendMidi(i, 0, CHORD_CHANNEL);
    }
  }

  if (bassPitch !== state.bassOutputPitch) {
    if (state.bassOutputPitch !== -1) sendMidi(state.bassOutputPitch, 0, BASS_CHANNEL);
    if (bassPitch !== -1) {
      let v = state.lastInputVelocity || 100;
      if (state.velocityOverride !== -1) v = state.velocityOverride;
      sendMidi(bassPitch, v, BASS_CHANNEL);
    }
  }

  state.outputNotes = newOutput;
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
      if (!state.latchKey) {
        state.inputPitch = -1;
        state.inputPitchWrapped = -1;
        outlet(3, "input_pitch", -1);
      }
      break;
    case "latch_chord": state.latchChord = !!value; break;
    case "voicing": state.voicing = value | 0; outlet(3, "voicing", state.voicing); break;
    case "voicing_delta": state.voicing = Math.max(0, Math.min(115, state.voicing + (value | 0))); break;
    case "bass_voicing": state.bassVoicing = value | 0; outlet(3, "bass_voicing", state.bassVoicing); break;
    case "velocity_override": state.velocityOverride = value | 0; break;
    case "chord_style": state.chordStyle = value | 0; break;
    case "scale_mode": state.scaleMode = !!value; outlet(3, "scale_mode", state.scaleMode ? 1 : 0); break;
    case "scale_root": state.scaleRoot = (value | 0) % 12; outlet(3, "scale_root", state.scaleRoot); break;
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

function panic() {
  for (let i = 0; i < 128; ++i) {
    if (state.outputNotes[i]) sendMidi(i, 0, CHORD_CHANNEL);
  }
  if (state.bassOutputPitch !== -1) sendMidi(state.bassOutputPitch, 0, BASS_CHANNEL);
  state.outputNotes = new Array(128).fill(false);
  state.bassOutputPitch = -1;
  state.inputPitchWrapped = -1;
  emitDisplay();
  emitState();
}

function bang() { emitDisplay(); emitState(); }

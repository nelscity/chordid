// keyboard-display.js
// JSUI custom piano renderer. Mirrors BespokeSynth's KeyboardDisplay plus
// chordid's input-root indicator:
//   - All keys drawn hollow (outline only)
//   - Active chord notes filled with iftah yellow
//   - Input pitch (the key you actually pressed) marked with a small circle
//     so it's distinguishable from auto-generated chord tones
//   - In-scale keys outlined in a tinted color when scale mode is on
//   - Voicing range shown as a white bounding box (one octave from voicing)
//   - Bass voicing range shown as a blue line at the bottom
//
// Messages:
//   note <pitch> <velocity>     velocity > 0 highlights, 0 un-highlights
//   input_pitch <p>             which pitch to mark with the input circle (-1 = none)
//   voicing <n>                 move the voicing bounding box
//   bass_voicing <n>            move the bass voicing line
//   range_start <n>             leftmost displayed MIDI pitch (default 36)
//   num_keys <n>                number of pitches displayed (default 49)
//   scale_mode <0|1>            highlight in-scale keys when 1
//   scale_root <0..11>          0=C, 1=C#, ..., 11=B
//   scale_pitches <list>        e.g. 0 2 4 5 7 9 11 (major)
//   clear                       un-highlight all notes
//   bang                        redraw

inlets = 1;
outlets = 0;
autowatch = 1;

mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

// State
var _rangeStart = 36;
var _numKeys = 49;
var _voicing = 41;
var _bassVoicing = 41;
var _activeNotes = {};
var _inputPitch = -1;
var _scaleMode = 0;
var _scaleRoot = 0;
var _scalePitches = [0, 2, 4, 5, 7, 9, 11];

// Iftah yellow (same RGBA Slippery Slope uses for its eye line)
var COLOR_ACTIVE         = [1.0, 0.72549, 0.003922, 1.0];
var COLOR_INPUT_OUTLINE  = [0.05, 0.05, 0.05, 1.0];  // dark ring of the input-pitch dot
var COLOR_INPUT_FILL     = [0.98, 0.98, 0.98, 1.0];  // light fill of the input-pitch dot
var COLOR_IN_SCALE_BLACK = [0.40, 0.32, 0.05, 1.0];  // dim yellow tint on in-scale black keys
var COLOR_WHITE_OUTLINE  = [0.55, 0.55, 0.55, 1.0];
var COLOR_WHITE_FILL     = [0.85, 0.85, 0.85, 1.0];
var COLOR_BLACK_OUTLINE  = [0.05, 0.05, 0.05, 1.0];
var COLOR_BLACK_FILL     = [0.12, 0.12, 0.12, 1.0];
var COLOR_IN_SCALE_TINT  = [0.95, 0.85, 0.40, 0.35];  // soft yellow tint on in-scale white keys
var COLOR_VOICING_BOX    = [1.0, 1.0, 1.0, 0.95];
var COLOR_BASS_LINE      = [0.30, 0.55, 1.0, 1.0];
var COLOR_BG             = [0.0, 0.0, 0.0, 0.0];

function isBlackKey(pitch) {
    var k = ((pitch % 12) + 12) % 12;
    return k === 1 || k === 3 || k === 6 || k === 8 || k === 10;
}

function countWhiteKeysBefore(pitch) {
    var n = 0;
    for (var p = _rangeStart; p < pitch; p++) {
        if (!isBlackKey(p)) n++;
    }
    return n;
}

function totalWhiteKeys() {
    var n = 0;
    for (var i = 0; i < _numKeys; i++) {
        if (!isBlackKey(_rangeStart + i)) n++;
    }
    return n;
}

function whiteKeyX(pitch, whiteW) {
    return countWhiteKeysBefore(pitch) * whiteW;
}

function blackKeyX(pitch, whiteW, blackW) {
    // Black keys sit between two whites; anchor at the right edge of the
    // preceding white key, then shift left by half the black-key width.
    return countWhiteKeysBefore(pitch) * whiteW - blackW / 2;
}

function pitchToX(pitch, whiteW, blackW) {
    return isBlackKey(pitch) ? blackKeyX(pitch, whiteW, blackW) : whiteKeyX(pitch, whiteW);
}

function pitchToRightX(pitch, whiteW, blackW) {
    if (isBlackKey(pitch)) {
        return blackKeyX(pitch, whiteW, blackW) + blackW;
    }
    return whiteKeyX(pitch, whiteW) + whiteW;
}

function paint() {
    var width = box.rect[2] - box.rect[0];
    var height = box.rect[3] - box.rect[1];
    var totalW = totalWhiteKeys();
    if (totalW <= 0) return;
    var whiteW = width / totalW;
    var whiteH = height;
    var blackW = whiteW * 0.62;
    var blackH = height * 0.62;

    with (mgraphics) {
        // Background (transparent — leaves device's own bg)
        set_source_rgba(COLOR_BG[0], COLOR_BG[1], COLOR_BG[2], COLOR_BG[3]);
        rectangle(0, 0, width, height);
        fill();

        // Pass 1: white keys
        set_line_width(1);
        for (var i = 0; i < _numKeys; i++) {
            var pitch = _rangeStart + i;
            if (isBlackKey(pitch)) continue;
            var x = whiteKeyX(pitch, whiteW);
            var active = _activeNotes[pitch];

            // Hollow fill when inactive, yellow fill when active.
            if (active) {
                set_source_rgba(COLOR_ACTIVE[0], COLOR_ACTIVE[1], COLOR_ACTIVE[2], COLOR_ACTIVE[3]);
                rectangle(x, 0, whiteW, whiteH);
                fill();
            } else if (_scaleMode && isInScale(pitch)) {
                // Soft yellow tint on in-scale (but inactive) white keys
                set_source_rgba(COLOR_IN_SCALE_TINT[0], COLOR_IN_SCALE_TINT[1], COLOR_IN_SCALE_TINT[2], COLOR_IN_SCALE_TINT[3]);
                rectangle(x, 0, whiteW, whiteH);
                fill();
            }
            set_source_rgba(COLOR_WHITE_OUTLINE[0], COLOR_WHITE_OUTLINE[1], COLOR_WHITE_OUTLINE[2], COLOR_WHITE_OUTLINE[3]);
            rectangle(x, 0, whiteW, whiteH);
            stroke();
        }

        // Pass 2: black keys (drawn on top so they overlay the white outlines)
        for (var j = 0; j < _numKeys; j++) {
            var pitch2 = _rangeStart + j;
            if (!isBlackKey(pitch2)) continue;
            var x2 = blackKeyX(pitch2, whiteW, blackW);
            var active2 = _activeNotes[pitch2];

            if (active2) {
                set_source_rgba(COLOR_ACTIVE[0], COLOR_ACTIVE[1], COLOR_ACTIVE[2], COLOR_ACTIVE[3]);
            } else if (_scaleMode && isInScale(pitch2)) {
                set_source_rgba(COLOR_IN_SCALE_BLACK[0], COLOR_IN_SCALE_BLACK[1], COLOR_IN_SCALE_BLACK[2], COLOR_IN_SCALE_BLACK[3]);
            } else {
                set_source_rgba(COLOR_BLACK_FILL[0], COLOR_BLACK_FILL[1], COLOR_BLACK_FILL[2], COLOR_BLACK_FILL[3]);
            }
            rectangle(x2, 0, blackW, blackH);
            fill();
            set_source_rgba(COLOR_BLACK_OUTLINE[0], COLOR_BLACK_OUTLINE[1], COLOR_BLACK_OUTLINE[2], COLOR_BLACK_OUTLINE[3]);
            rectangle(x2, 0, blackW, blackH);
            stroke();
        }

        // Voicing bounding box (BespokeSynth: white rect from voicing to voicing+12)
        var vMinPitch = _voicing;
        var vMaxPitch = _voicing + 12;
        if (vMaxPitch >= _rangeStart && vMinPitch <= _rangeStart + _numKeys) {
            var vL = Math.max(0, pitchToX(Math.max(vMinPitch, _rangeStart), whiteW, blackW));
            var vR = Math.min(width, pitchToRightX(Math.min(vMaxPitch, _rangeStart + _numKeys - 1), whiteW, blackW));
            if (vR > vL) {
                set_source_rgba(COLOR_VOICING_BOX[0], COLOR_VOICING_BOX[1], COLOR_VOICING_BOX[2], COLOR_VOICING_BOX[3]);
                set_line_width(1.5);
                rectangle(vL, 0.5, vR - vL, height - 1);
                stroke();
            }
        }

        // Bass voicing line at bottom (BespokeSynth: thick blue line below the keyboard)
        var bMinPitch = _bassVoicing;
        var bMaxPitch = _bassVoicing + 12;
        if (bMaxPitch >= _rangeStart && bMinPitch <= _rangeStart + _numKeys) {
            var bL = Math.max(0, pitchToX(Math.max(bMinPitch, _rangeStart), whiteW, blackW));
            var bR = Math.min(width, pitchToRightX(Math.min(bMaxPitch, _rangeStart + _numKeys - 1), whiteW, blackW));
            if (bR > bL) {
                set_source_rgba(COLOR_BASS_LINE[0], COLOR_BASS_LINE[1], COLOR_BASS_LINE[2], COLOR_BASS_LINE[3]);
                set_line_width(2.5);
                move_to(bL, height - 1.25);
                line_to(bR, height - 1.25);
                stroke();
            }
        }

        // Input pitch indicator: a high-contrast dot on the key the user actually
        // pressed, so it stands out from the auto-generated chord tones AND is
        // visible on white, black, and yellow-active key backgrounds.
        // Draw two layers: a dark outline ring, then a light fill inside.
        if (_inputPitch >= 0 && _inputPitch >= _rangeStart && _inputPitch < _rangeStart + _numKeys) {
            var ipBlack = isBlackKey(_inputPitch);
            var ipX = pitchToX(_inputPitch, whiteW, blackW);
            var ipW = ipBlack ? blackW : whiteW;
            var ipH = ipBlack ? blackH : whiteH;
            var cx = ipX + ipW / 2;
            // Circle sits in the lower part of the key for visual clarity
            var cy = (ipBlack ? blackH * 0.78 : whiteH * 0.82);
            var r = Math.min(ipW, ipH) * 0.22;
            // Outer dark ring stays legible on white + yellow keys;
            // inner light fill stays legible on black keys.
            set_source_rgba(COLOR_INPUT_OUTLINE[0], COLOR_INPUT_OUTLINE[1], COLOR_INPUT_OUTLINE[2], COLOR_INPUT_OUTLINE[3]);
            set_line_width(2);
            ellipse(cx - r, cy - r, r * 2, r * 2);
            stroke();
            set_source_rgba(COLOR_INPUT_FILL[0], COLOR_INPUT_FILL[1], COLOR_INPUT_FILL[2], COLOR_INPUT_FILL[3]);
            var ri = r * 0.65;
            ellipse(cx - ri, cy - ri, ri * 2, ri * 2);
            fill();
        }
    }
}

// ===== Message handlers =====

function note(pitch, velocity) {
    pitch = pitch | 0;
    velocity = velocity | 0;
    if (pitch < 0 || pitch > 127) return;
    if (velocity > 0) {
        _activeNotes[pitch] = velocity;
    } else if (_activeNotes[pitch] !== undefined) {
        delete _activeNotes[pitch];
    }
    mgraphics.redraw();
}

function voicing(v) {
    _voicing = v | 0;
    mgraphics.redraw();
}

function bass_voicing(v) {
    _bassVoicing = v | 0;
    mgraphics.redraw();
}

function range_start(v) {
    _rangeStart = v | 0;
    mgraphics.redraw();
}

function num_keys(v) {
    _numKeys = v | 0;
    mgraphics.redraw();
}

function clear() {
    _activeNotes = {};
    _inputPitch = -1;
    mgraphics.redraw();
}

function input_pitch(p) {
    _inputPitch = p | 0;
    mgraphics.redraw();
}

function scale_mode(v) {
    _scaleMode = v ? 1 : 0;
    mgraphics.redraw();
}

function scale_root(v) {
    _scaleRoot = ((v | 0) % 12 + 12) % 12;
    mgraphics.redraw();
}

function scale_pitches() {
    var arr = [];
    for (var i = 0; i < arguments.length; ++i) arr.push(arguments[i] | 0);
    _scalePitches = arr;
    mgraphics.redraw();
}

function isInScale(pitch) {
    var rel = ((pitch - _scaleRoot) % 12 + 12) % 12;
    return _scalePitches.indexOf(rel) !== -1;
}

function list() {
    // Accept bare [pitch, velocity] list (matches what the engine outputs without a prefix).
    if (arguments.length >= 2) note(arguments[0], arguments[1]);
}

function bang() {
    mgraphics.redraw();
}

function onresize(w, h) {
    mgraphics.redraw();
}

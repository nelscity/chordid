{
  "patcher": {
    "fileversion": 1,
    "appversion": {
      "major": 8,
      "minor": 6,
      "revision": 0,
      "architecture": "x64",
      "modernui": 1
    },
    "classnamespace": "box",
    "rect": [
      100.0,
      100.0,
      900.0,
      700.0
    ],
    "openrect": [
      0.0,
      0.0,
      720.0,
      174.0
    ],
    "bglocked": 0,
    "openinpresentation": 1,
    "default_fontsize": 10.0,
    "default_fontface": 0,
    "default_fontname": "Arial Bold",
    "gridonopen": 1,
    "gridsize": [
      8.0,
      8.0
    ],
    "statusbarvisible": 2,
    "toolbarvisible": 1,
    "devicewidth": 720.0,
    "boxes": [
      {
        "box": {
          "id": "obj-thisdevice",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 3,
          "outlettype": [
            "",
            "bang",
            "int"
          ],
          "patching_rect": [
            20.0,
            20.0,
            100.0,
            22.0
          ],
          "text": "live.thisdevice"
        }
      },
      {
        "box": {
          "id": "obj-midi-in",
          "maxclass": "newobj",
          "numinlets": 0,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            20.0,
            60.0,
            50.0,
            22.0
          ],
          "text": "midiin"
        }
      },
      {
        "box": {
          "id": "obj-midi-parse",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 8,
          "outlettype": [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
          ],
          "patching_rect": [
            20.0,
            90.0,
            120.0,
            22.0
          ],
          "text": "midiparse"
        }
      },
      {
        "box": {
          "id": "obj-note-prep-in",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            20.0,
            120.0,
            100.0,
            22.0
          ],
          "text": "prepend note"
        }
      },
      {
        "box": {
          "id": "obj-engine",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 5,
          "outlettype": [
            "",
            "",
            "",
            "",
            ""
          ],
          "patching_rect": [
            20.0,
            160.0,
            200.0,
            22.0
          ],
          "text": "v8 chord-engine.js"
        }
      },
      {
        "box": {
          "id": "obj-midi-out",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 0,
          "patching_rect": [
            20.0,
            200.0,
            60.0,
            22.0
          ],
          "text": "midiout"
        }
      },
      {
        "box": {
          "id": "obj-display-route",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            ""
          ],
          "patching_rect": [
            250.0,
            200.0,
            140.0,
            22.0
          ],
          "text": "route chord_display"
        }
      },
      {
        "box": {
          "id": "obj-display-set",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            250.0,
            225.0,
            80.0,
            22.0
          ],
          "text": "prepend set"
        }
      },
      {
        "box": {
          "id": "obj-display-text",
          "maxclass": "comment",
          "numinlets": 1,
          "numoutlets": 0,
          "patching_rect": [
            250.0,
            255.0,
            200.0,
            30.0
          ],
          "presentation": 1,
          "presentation_rect": [
            432.0,
            4.0,
            276.0,
            40.0
          ],
          "text": "(chord)",
          "fontsize": 28.0,
          "fontface": 1,
          "fontname": "Arial Bold"
        }
      },
      {
        "box": {
          "id": "obj-keyboard",
          "maxclass": "jsui",
          "numinlets": 1,
          "numoutlets": 0,
          "filename": "keyboard-display.js",
          "patching_rect": [
            670.0,
            240.0,
            480.0,
            50.0
          ],
          "presentation": 1,
          "presentation_rect": [
            12.0,
            106.0,
            696.0,
            60.0
          ],
          "border": 0,
          "varname": "keyboard_display"
        }
      },
      {
        "box": {
          "id": "obj-scale-mode",
          "maxclass": "live.text",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "off",
                "scale"
              ],
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "scale_mode",
              "parameter_shortname": "scale",
              "parameter_type": 2,
              "parameter_order": 6,
              "_parameter_info": "Key Mode. Builds chords from the current scale automatically. Chord-type buttons override this while held."
            }
          },
          "varname": "scale_mode",
          "text": "\u266d#",
          "mode": 1,
          "patching_rect": [
            20.0,
            400.0,
            40.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            12.0,
            4.0,
            32.0,
            20.0
          ],
          "bgcolor": [
            0.78,
            0.65,
            0.96,
            0.18
          ],
          "bgoncolor": [
            0.78,
            0.65,
            0.96,
            1.0
          ],
          "fontname": "Avenir Medium",
          "fontsize": 11.0,
          "texton": "\u266d#",
          "annotation": "Key Mode. Auto-builds chords from the current scale. Chord-type buttons override this when held.",
          "annotation_name": "scale mode"
        }
      },
      {
        "box": {
          "id": "obj-scale-mode-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            20.0,
            425.0,
            160.0,
            22.0
          ],
          "text": "prepend param scale_mode"
        }
      },
      {
        "box": {
          "id": "obj-dim",
          "maxclass": "live.text",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "off",
                "dim"
              ],
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "dim",
              "parameter_shortname": "dim",
              "parameter_type": 2,
              "parameter_order": 10,
              "_parameter_info": "Diminished triad: root + b3 + b5."
            }
          },
          "varname": "dim",
          "text": "dim",
          "mode": 1,
          "patching_rect": [
            70.0,
            400.0,
            32.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            12.0,
            28.0,
            72.0,
            20.0
          ],
          "bgcolor": [
            0.674,
            0.674,
            0.674,
            0.0
          ],
          "bgoncolor": [
            0.874,
            0.874,
            0.874,
            0.0
          ],
          "fontname": "Avenir Medium",
          "fontsize": 10.0,
          "texton": "dim",
          "annotation": "Diminished triad: root + b3 + b5.",
          "annotation_name": "dim"
        }
      },
      {
        "box": {
          "id": "obj-dim-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            70.0,
            425.0,
            120.0,
            22.0
          ],
          "text": "prepend param dim"
        }
      },
      {
        "box": {
          "id": "obj-minor",
          "maxclass": "live.text",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "off",
                "min"
              ],
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "minor",
              "parameter_shortname": "min",
              "parameter_type": 2,
              "parameter_order": 11,
              "_parameter_info": "Minor triad: root + b3 + 5."
            }
          },
          "varname": "minor",
          "text": "min",
          "mode": 1,
          "patching_rect": [
            105.0,
            400.0,
            32.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            92.0,
            28.0,
            72.0,
            20.0
          ],
          "bgcolor": [
            0.674,
            0.674,
            0.674,
            0.0
          ],
          "bgoncolor": [
            0.874,
            0.874,
            0.874,
            0.0
          ],
          "fontname": "Avenir Medium",
          "fontsize": 10.0,
          "texton": "min",
          "annotation": "Minor triad: root + b3 + 5.",
          "annotation_name": "minor"
        }
      },
      {
        "box": {
          "id": "obj-minor-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            105.0,
            425.0,
            120.0,
            22.0
          ],
          "text": "prepend param minor"
        }
      },
      {
        "box": {
          "id": "obj-major",
          "maxclass": "live.text",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "off",
                "maj"
              ],
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "major",
              "parameter_shortname": "maj",
              "parameter_type": 2,
              "parameter_order": 12,
              "_parameter_info": "Major triad: root + 3 + 5."
            }
          },
          "varname": "major",
          "text": "maj",
          "mode": 1,
          "patching_rect": [
            140.0,
            400.0,
            32.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            172.0,
            28.0,
            72.0,
            20.0
          ],
          "bgcolor": [
            0.674,
            0.674,
            0.674,
            0.0
          ],
          "bgoncolor": [
            0.874,
            0.874,
            0.874,
            0.0
          ],
          "fontname": "Avenir Medium",
          "fontsize": 10.0,
          "texton": "maj",
          "annotation": "Major triad: root + 3 + 5.",
          "annotation_name": "major"
        }
      },
      {
        "box": {
          "id": "obj-major-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            140.0,
            425.0,
            120.0,
            22.0
          ],
          "text": "prepend param major"
        }
      },
      {
        "box": {
          "id": "obj-sus",
          "maxclass": "live.text",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "off",
                "sus"
              ],
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "sus",
              "parameter_shortname": "sus",
              "parameter_type": 2,
              "parameter_order": 13,
              "_parameter_info": "Suspended chord: root + 4 + 5. Replaces the 3rd."
            }
          },
          "varname": "sus",
          "text": "sus",
          "mode": 1,
          "patching_rect": [
            175.0,
            400.0,
            32.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            252.0,
            28.0,
            72.0,
            20.0
          ],
          "bgcolor": [
            0.674,
            0.674,
            0.674,
            0.0
          ],
          "bgoncolor": [
            0.874,
            0.874,
            0.874,
            0.0
          ],
          "fontname": "Avenir Medium",
          "fontsize": 10.0,
          "texton": "sus",
          "annotation": "Suspended chord: root + 4 + 5. Replaces the 3rd.",
          "annotation_name": "sus"
        }
      },
      {
        "box": {
          "id": "obj-sus-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            175.0,
            425.0,
            120.0,
            22.0
          ],
          "text": "prepend param sus"
        }
      },
      {
        "box": {
          "id": "obj-six",
          "maxclass": "live.text",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "off",
                "6"
              ],
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "six",
              "parameter_shortname": "6",
              "parameter_type": 2,
              "parameter_order": 14,
              "_parameter_info": "Adds a 6th on top of the triad. Stacks with other extensions."
            }
          },
          "varname": "six",
          "text": "6",
          "mode": 1,
          "patching_rect": [
            220.0,
            400.0,
            24.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            12.0,
            52.0,
            72.0,
            20.0
          ],
          "bgcolor": [
            0.674,
            0.674,
            0.674,
            0.0
          ],
          "bgoncolor": [
            0.874,
            0.874,
            0.874,
            0.0
          ],
          "fontname": "Avenir Medium",
          "fontsize": 10.0,
          "texton": "6",
          "annotation": "Adds a 6th on top of the triad.",
          "annotation_name": "six"
        }
      },
      {
        "box": {
          "id": "obj-six-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            220.0,
            425.0,
            120.0,
            22.0
          ],
          "text": "prepend param six"
        }
      },
      {
        "box": {
          "id": "obj-min7",
          "maxclass": "live.text",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "off",
                "m7"
              ],
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "min7",
              "parameter_shortname": "m7",
              "parameter_type": 2,
              "parameter_order": 15,
              "_parameter_info": "Adds a flat-7 (minor 7th) on top of the triad."
            }
          },
          "varname": "min7",
          "text": "m7",
          "mode": 1,
          "patching_rect": [
            248.0,
            400.0,
            28.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            92.0,
            52.0,
            72.0,
            20.0
          ],
          "bgcolor": [
            0.674,
            0.674,
            0.674,
            0.0
          ],
          "bgoncolor": [
            0.874,
            0.874,
            0.874,
            0.0
          ],
          "fontname": "Avenir Medium",
          "fontsize": 10.0,
          "texton": "m7",
          "annotation": "Adds a flat-7 (minor 7th) on top of the triad.",
          "annotation_name": "min7"
        }
      },
      {
        "box": {
          "id": "obj-min7-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            248.0,
            425.0,
            120.0,
            22.0
          ],
          "text": "prepend param min7"
        }
      },
      {
        "box": {
          "id": "obj-maj7",
          "maxclass": "live.text",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "off",
                "M7"
              ],
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "maj7",
              "parameter_shortname": "M7",
              "parameter_type": 2,
              "parameter_order": 16,
              "_parameter_info": "Adds a natural 7 (major 7th) on top of the triad."
            }
          },
          "varname": "maj7",
          "text": "M7",
          "mode": 1,
          "patching_rect": [
            280.0,
            400.0,
            28.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            172.0,
            52.0,
            72.0,
            20.0
          ],
          "bgcolor": [
            0.674,
            0.674,
            0.674,
            0.0
          ],
          "bgoncolor": [
            0.874,
            0.874,
            0.874,
            0.0
          ],
          "fontname": "Avenir Medium",
          "fontsize": 10.0,
          "texton": "M7",
          "annotation": "Adds a natural 7 (major 7th) on top of the triad.",
          "annotation_name": "maj7"
        }
      },
      {
        "box": {
          "id": "obj-maj7-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            280.0,
            425.0,
            120.0,
            22.0
          ],
          "text": "prepend param maj7"
        }
      },
      {
        "box": {
          "id": "obj-nine",
          "maxclass": "live.text",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "off",
                "9"
              ],
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "nine",
              "parameter_shortname": "9",
              "parameter_type": 2,
              "parameter_order": 17,
              "_parameter_info": "Adds the 9 (octave + 2nd) on top of the triad."
            }
          },
          "varname": "nine",
          "text": "9",
          "mode": 1,
          "patching_rect": [
            312.0,
            400.0,
            24.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            252.0,
            52.0,
            72.0,
            20.0
          ],
          "bgcolor": [
            0.674,
            0.674,
            0.674,
            0.0
          ],
          "bgoncolor": [
            0.874,
            0.874,
            0.874,
            0.0
          ],
          "fontname": "Avenir Medium",
          "fontsize": 10.0,
          "texton": "9",
          "annotation": "Adds the 9th (octave + 2nd) on top of the triad.",
          "annotation_name": "nine"
        }
      },
      {
        "box": {
          "id": "obj-nine-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            312.0,
            425.0,
            120.0,
            22.0
          ],
          "text": "prepend param nine"
        }
      },
      {
        "box": {
          "id": "obj-latch-key",
          "maxclass": "live.text",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "off",
                "latch key"
              ],
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "latch_key",
              "parameter_shortname": "latch key",
              "parameter_type": 2,
              "parameter_order": 8,
              "_parameter_info": "Held input notes act as toggles: press once to latch, again to release."
            }
          },
          "varname": "latch_key",
          "text": "latch key",
          "mode": 1,
          "patching_rect": [
            340.0,
            400.0,
            56.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            120.0,
            76.0,
            72.0,
            20.0
          ],
          "bgcolor": [
            0.674,
            0.674,
            0.674,
            0.0
          ],
          "bgoncolor": [
            0.874,
            0.874,
            0.874,
            0.0
          ],
          "fontname": "Avenir Medium",
          "fontsize": 10.0,
          "texton": "latch key",
          "annotation": "Held input notes act as toggles. Press once to latch, again to release.",
          "annotation_name": "latch key"
        }
      },
      {
        "box": {
          "id": "obj-latch-key-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            340.0,
            425.0,
            140.0,
            22.0
          ],
          "text": "prepend param latch_key"
        }
      },
      {
        "box": {
          "id": "obj-quantize",
          "maxclass": "live.menu",
          "numinlets": 1,
          "numoutlets": 3,
          "outlettype": [
            "",
            "",
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "none",
                "32n",
                "16n",
                "8n",
                "4n"
              ],
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "quantize",
              "parameter_shortname": "quant",
              "parameter_type": 2,
              "parameter_order": 7,
              "_parameter_info": "Snap chord output to a beat division. none = play immediately."
            }
          },
          "varname": "quantize",
          "patching_rect": [
            20.0,
            460.0,
            80.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            76.0,
            4.0,
            72.0,
            20.0
          ],
          "annotation": "Snap chord output to a beat division. none = play immediately.",
          "annotation_name": "quantize",
          "fontsize": 9.0,
          "appearance": 1
        }
      },
      {
        "box": {
          "id": "obj-quantize-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            20.0,
            485.0,
            140.0,
            22.0
          ],
          "text": "prepend param quantize"
        }
      },
      {
        "box": {
          "id": "obj-play-opts",
          "maxclass": "live.menu",
          "numinlets": 1,
          "numoutlets": 3,
          "outlettype": [
            "",
            "",
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "chord+bass",
                "chord only",
                "bass only",
                "chord on press",
                "immediate",
                "immediate (chord only)"
              ],
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "play_options",
              "parameter_shortname": "play",
              "parameter_type": 2,
              "parameter_order": 5,
              "_parameter_info": "How the chord plays. chord+bass = both; immediate = re-trigger on any param change."
            }
          },
          "varname": "play_options",
          "patching_rect": [
            110.0,
            460.0,
            130.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            12.0,
            76.0,
            100.0,
            20.0
          ],
          "annotation": "How the chord plays: chord+bass, chord only, bass only, on press, or immediate retrigger.",
          "annotation_name": "play options",
          "fontsize": 9.0,
          "appearance": 1
        }
      },
      {
        "box": {
          "id": "obj-play-opts-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            110.0,
            485.0,
            160.0,
            22.0
          ],
          "text": "prepend param play_options"
        }
      },
      {
        "box": {
          "id": "obj-chord-style",
          "maxclass": "live.menu",
          "numinlets": 1,
          "numoutlets": 3,
          "outlettype": [
            "",
            "",
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "closed",
                "spread 3",
                "spread 7",
                "spread 3&7",
                "doubled 1",
                "doubled 1&3",
                "doubled"
              ],
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "chord_style",
              "parameter_shortname": "style",
              "parameter_type": 2,
              "parameter_order": 4,
              "_parameter_info": "Voicing style: closed / spread / doubled root / doubled all."
            }
          },
          "varname": "chord_style",
          "patching_rect": [
            250.0,
            460.0,
            110.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            284.0,
            76.0,
            120.0,
            20.0
          ],
          "annotation": "Voicing style: closed, spread (3 or 7 up an octave), doubled root, or doubled all.",
          "annotation_name": "chord style",
          "fontsize": 9.0,
          "appearance": 1
        }
      },
      {
        "box": {
          "id": "obj-chord-style-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            250.0,
            485.0,
            160.0,
            22.0
          ],
          "text": "prepend param chord_style"
        }
      },
      {
        "box": {
          "id": "obj-voicing-label",
          "maxclass": "comment",
          "numinlets": 1,
          "numoutlets": 0,
          "patching_rect": [
            370.0,
            510.0,
            50.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            0.0,
            -200.0,
            1.0,
            1.0
          ],
          "text": "voic",
          "fontsize": 10.0
        }
      },
      {
        "box": {
          "id": "obj-voicing",
          "maxclass": "live.dial",
          "numinlets": 1,
          "numoutlets": 3,
          "outlettype": [
            "",
            "",
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_initial": [
                41
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "voicing",
              "parameter_range": [
                0,
                115
              ],
              "parameter_shortname": "voic",
              "parameter_type": 1,
              "parameter_unitstyle": 0,
              "parameter_order": 1,
              "_parameter_info": "Chord voicing root (MIDI note). All chord pitches fold into the octave starting here."
            }
          },
          "varname": "voicing",
          "patching_rect": [
            370.0,
            460.0,
            50.0,
            56.0
          ],
          "presentation": 1,
          "presentation_rect": [
            440.0,
            48.0,
            56.0,
            48.0
          ],
          "annotation": "Chord voicing root (MIDI note). All chord pitches fold into the octave starting here.",
          "annotation_name": "voicing"
        }
      },
      {
        "box": {
          "id": "obj-voicing-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            370.0,
            485.0,
            140.0,
            22.0
          ],
          "text": "prepend param voicing"
        }
      },
      {
        "box": {
          "id": "obj-bass-voicing-label",
          "maxclass": "comment",
          "numinlets": 1,
          "numoutlets": 0,
          "patching_rect": [
            430.0,
            510.0,
            50.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            0.0,
            -200.0,
            1.0,
            1.0
          ],
          "text": "bass",
          "fontsize": 10.0
        }
      },
      {
        "box": {
          "id": "obj-bass-voicing",
          "maxclass": "live.dial",
          "numinlets": 1,
          "numoutlets": 3,
          "outlettype": [
            "",
            "",
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_initial": [
                41
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "bass_voicing",
              "parameter_range": [
                0,
                115
              ],
              "parameter_shortname": "bass v",
              "parameter_type": 1,
              "parameter_unitstyle": 0,
              "parameter_order": 2,
              "_parameter_info": "Bass octave root. The bass output plays the chord root folded into this octave."
            }
          },
          "varname": "bass_voicing",
          "patching_rect": [
            430.0,
            460.0,
            50.0,
            56.0
          ],
          "presentation": 1,
          "presentation_rect": [
            528.0,
            48.0,
            56.0,
            48.0
          ],
          "annotation": "Bass octave root. Bass output plays the chord root folded into this octave.",
          "annotation_name": "bass voicing"
        }
      },
      {
        "box": {
          "id": "obj-bass-voicing-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            430.0,
            485.0,
            160.0,
            22.0
          ],
          "text": "prepend param bass_voicing"
        }
      },
      {
        "box": {
          "id": "obj-vel-label",
          "maxclass": "comment",
          "numinlets": 1,
          "numoutlets": 0,
          "patching_rect": [
            490.0,
            510.0,
            50.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            0.0,
            -200.0,
            1.0,
            1.0
          ],
          "text": "vel",
          "fontsize": 10.0
        }
      },
      {
        "box": {
          "id": "obj-vel-override",
          "maxclass": "live.dial",
          "numinlets": 1,
          "numoutlets": 3,
          "outlettype": [
            "",
            "",
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_initial": [
                -1
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "velocity_override",
              "parameter_range": [
                -1,
                127
              ],
              "parameter_shortname": "vel",
              "parameter_type": 1,
              "parameter_unitstyle": 0,
              "parameter_order": 3,
              "_parameter_info": "-1 = use input velocity. 0-127 fixes all output notes to this velocity."
            }
          },
          "varname": "velocity_override",
          "patching_rect": [
            490.0,
            460.0,
            50.0,
            56.0
          ],
          "presentation": 1,
          "presentation_rect": [
            616.0,
            48.0,
            56.0,
            48.0
          ],
          "annotation": "-1 uses the input velocity. 0-127 fixes all output notes to this constant.",
          "annotation_name": "velocity override"
        }
      },
      {
        "box": {
          "id": "obj-vel-override-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            490.0,
            485.0,
            180.0,
            22.0
          ],
          "text": "prepend param velocity_override"
        }
      },
      {
        "box": {
          "id": "obj-sep-line",
          "maxclass": "live.line",
          "numinlets": 1,
          "numoutlets": 0,
          "patching_rect": [
            20.0,
            600.0,
            696.0,
            1.0
          ],
          "presentation": 1,
          "presentation_rect": [
            12.0,
            102.0,
            696.0,
            1.0
          ],
          "varname": "sep_line",
          "orientation": 1
        }
      },
      {
        "box": {
          "id": "obj-latch-chord",
          "maxclass": "live.text",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "off",
                "latch chord"
              ],
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "latch_chord",
              "parameter_shortname": "latch ch",
              "parameter_type": 2,
              "parameter_order": 9,
              "_parameter_info": "Chord-type buttons act as toggles instead of momentary. Lets you stack modifiers without holding."
            }
          },
          "varname": "latch_chord",
          "text": "latch chord",
          "mode": 1,
          "bgcolor": [
            0.674,
            0.674,
            0.674,
            0.0
          ],
          "bgoncolor": [
            0.874,
            0.874,
            0.874,
            0.0
          ],
          "fontname": "Avenir Medium",
          "fontsize": 10.0,
          "patching_rect": [
            605.0,
            460.0,
            70.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            200.0,
            76.0,
            76.0,
            20.0
          ],
          "texton": "latch chord",
          "annotation": "Chord-type buttons toggle instead of being momentary. Stack modifiers without holding.",
          "annotation_name": "latch chord"
        }
      },
      {
        "box": {
          "id": "obj-latch-chord-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            605.0,
            485.0,
            160.0,
            22.0
          ],
          "text": "prepend param latch_chord"
        }
      },
      {
        "box": {
          "id": "obj-voicing-keyboard-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            370.0,
            556.0,
            140.0,
            22.0
          ],
          "text": "prepend voicing"
        }
      },
      {
        "box": {
          "id": "obj-bass-voicing-keyboard-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            430.0,
            556.0,
            140.0,
            22.0
          ],
          "text": "prepend bass_voicing"
        }
      },
      {
        "box": {
          "id": "obj-strum-dial",
          "maxclass": "live.dial",
          "numinlets": 1,
          "numoutlets": 3,
          "outlettype": [
            "",
            "",
            ""
          ],
          "dial_bipolar": 1,
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "strum_ms",
              "parameter_range": [
                -200,
                200
              ],
              "parameter_shortname": "strum",
              "parameter_type": 1,
              "parameter_unitstyle": 0,
              "parameter_order": 12
            }
          },
          "varname": "strum_ms",
          "patching_rect": [
            20.0,
            700.0,
            56.0,
            48.0
          ],
          "presentation": 1,
          "presentation_rect": [
            372.0,
            28.0,
            56.0,
            44.0
          ],
          "annotation": "Strum: ms between successive chord notes. Positive = up (low to high), negative = down (high to low), 0 = block.",
          "annotation_name": "strum"
        }
      },
      {
        "box": {
          "id": "obj-strum-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            20.0,
            760.0,
            160.0,
            22.0
          ],
          "text": "prepend param strum_ms"
        }
      },
      {
        "box": {
          "id": "obj-arp-type",
          "maxclass": "live.menu",
          "numinlets": 1,
          "numoutlets": 3,
          "outlettype": [
            "",
            "",
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "Off",
                "Up",
                "Down",
                "UpDown",
                "DownUp",
                "Up & Down",
                "Down & Up",
                "Converge",
                "Diverge",
                "Random Once",
                "Random"
              ],
              "parameter_initial": [
                0
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "arp_type",
              "parameter_shortname": "arp",
              "parameter_type": 2,
              "parameter_order": 13
            }
          },
          "varname": "arp_type",
          "patching_rect": [
            90.0,
            700.0,
            130.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            156.0,
            4.0,
            124.0,
            20.0
          ],
          "annotation": "Arpeggiator pattern. Off plays the chord as a block; other modes cycle through chord notes.",
          "annotation_name": "arp",
          "fontsize": 9.0,
          "appearance": 1
        }
      },
      {
        "box": {
          "id": "obj-arp-type-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            90.0,
            730.0,
            160.0,
            22.0
          ],
          "text": "prepend param arp_type"
        }
      },
      {
        "box": {
          "id": "obj-arp-rate",
          "maxclass": "live.menu",
          "numinlets": 1,
          "numoutlets": 3,
          "outlettype": [
            "",
            "",
            ""
          ],
          "parameter_enable": 1,
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_enum": [
                "1/32",
                "1/16T",
                "1/16",
                "1/8T",
                "1/8",
                "1/4T",
                "1/4",
                "1/2"
              ],
              "parameter_initial": [
                4
              ],
              "parameter_initial_enable": 1,
              "parameter_longname": "arp_rate",
              "parameter_shortname": "rate",
              "parameter_type": 2,
              "parameter_order": 14
            }
          },
          "varname": "arp_rate",
          "patching_rect": [
            260.0,
            700.0,
            110.0,
            18.0
          ],
          "presentation": 1,
          "presentation_rect": [
            288.0,
            4.0,
            72.0,
            20.0
          ],
          "annotation": "Arp step rate, synced to Live transport tempo.",
          "annotation_name": "arp rate",
          "fontsize": 9.0,
          "appearance": 1
        }
      },
      {
        "box": {
          "id": "obj-arp-rate-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            260.0,
            730.0,
            160.0,
            22.0
          ],
          "text": "prepend param arp_rate"
        }
      },
      {
        "box": {
          "id": "obj-arp-out-route",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 3,
          "outlettype": [
            "",
            "",
            ""
          ],
          "patching_rect": [
            400.0,
            700.0,
            220.0,
            22.0
          ],
          "text": "route arp_run arp_interval"
        }
      },
      {
        "box": {
          "id": "obj-arp-metro",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            "bang"
          ],
          "patching_rect": [
            400.0,
            760.0,
            100.0,
            22.0
          ],
          "text": "metro 250."
        }
      },
      {
        "box": {
          "id": "obj-arp-tick-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            400.0,
            800.0,
            140.0,
            22.0
          ],
          "text": "prepend arp_tick"
        }
      },
      {
        "box": {
          "id": "obj-arp-init-delay",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            "bang"
          ],
          "patching_rect": [
            180.0,
            60.0,
            70.0,
            22.0
          ],
          "text": "delay 200"
        }
      },
      {
        "box": {
          "id": "obj-arp-path",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            ""
          ],
          "patching_rect": [
            180.0,
            90.0,
            140.0,
            22.0
          ],
          "text": "live.path live_set"
        }
      },
      {
        "box": {
          "id": "obj-arp-bpm-obs",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            ""
          ],
          "patching_rect": [
            180.0,
            120.0,
            180.0,
            22.0
          ],
          "text": "live.observer tempo"
        }
      },
      {
        "box": {
          "id": "obj-arp-bpm-prep",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            180.0,
            150.0,
            160.0,
            22.0
          ],
          "text": "prepend param bpm"
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": [
            "obj-midi-in",
            0
          ],
          "destination": [
            "obj-midi-parse",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-midi-parse",
            0
          ],
          "destination": [
            "obj-note-prep-in",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-note-prep-in",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-engine",
            0
          ],
          "destination": [
            "obj-midi-out",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-engine",
            1
          ],
          "destination": [
            "obj-display-route",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-display-route",
            0
          ],
          "destination": [
            "obj-display-set",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-display-set",
            0
          ],
          "destination": [
            "obj-display-text",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-engine",
            3
          ],
          "destination": [
            "obj-keyboard",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-scale-mode",
            0
          ],
          "destination": [
            "obj-scale-mode-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-scale-mode-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-dim",
            0
          ],
          "destination": [
            "obj-dim-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-dim-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-minor",
            0
          ],
          "destination": [
            "obj-minor-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-minor-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-major",
            0
          ],
          "destination": [
            "obj-major-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-major-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-sus",
            0
          ],
          "destination": [
            "obj-sus-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-sus-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-six",
            0
          ],
          "destination": [
            "obj-six-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-six-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-min7",
            0
          ],
          "destination": [
            "obj-min7-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-min7-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-maj7",
            0
          ],
          "destination": [
            "obj-maj7-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-maj7-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-nine",
            0
          ],
          "destination": [
            "obj-nine-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-nine-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-latch-key",
            0
          ],
          "destination": [
            "obj-latch-key-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-latch-key-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-quantize",
            0
          ],
          "destination": [
            "obj-quantize-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-quantize-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-play-opts",
            0
          ],
          "destination": [
            "obj-play-opts-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-play-opts-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-chord-style",
            0
          ],
          "destination": [
            "obj-chord-style-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-chord-style-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-voicing",
            0
          ],
          "destination": [
            "obj-voicing-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-voicing-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-bass-voicing",
            0
          ],
          "destination": [
            "obj-bass-voicing-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-bass-voicing-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-vel-override",
            0
          ],
          "destination": [
            "obj-vel-override-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-vel-override-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-latch-chord",
            0
          ],
          "destination": [
            "obj-latch-chord-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-latch-chord-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-voicing",
            0
          ],
          "destination": [
            "obj-voicing-keyboard-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-voicing-keyboard-prep",
            0
          ],
          "destination": [
            "obj-keyboard",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-bass-voicing",
            0
          ],
          "destination": [
            "obj-bass-voicing-keyboard-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-bass-voicing-keyboard-prep",
            0
          ],
          "destination": [
            "obj-keyboard",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-strum-dial",
            0
          ],
          "destination": [
            "obj-strum-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-strum-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-arp-type",
            0
          ],
          "destination": [
            "obj-arp-type-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-arp-type-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-arp-rate",
            0
          ],
          "destination": [
            "obj-arp-rate-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-arp-rate-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-engine",
            4
          ],
          "destination": [
            "obj-arp-out-route",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-arp-out-route",
            0
          ],
          "destination": [
            "obj-arp-metro",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-arp-out-route",
            1
          ],
          "destination": [
            "obj-arp-metro",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-arp-metro",
            0
          ],
          "destination": [
            "obj-arp-tick-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-arp-tick-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-thisdevice",
            1
          ],
          "destination": [
            "obj-arp-init-delay",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-arp-init-delay",
            0
          ],
          "destination": [
            "obj-arp-path",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-arp-path",
            0
          ],
          "destination": [
            "obj-arp-bpm-obs",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-arp-bpm-obs",
            0
          ],
          "destination": [
            "obj-arp-bpm-prep",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-arp-bpm-prep",
            0
          ],
          "destination": [
            "obj-engine",
            0
          ]
        }
      }
    ]
  }
}
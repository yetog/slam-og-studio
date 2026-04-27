# SLAM OG Studio - Development Plan

> Hybrid approach: WebDAW minimal UI + openDAW features + Eleven Labs AI

---

## Vision

Build a web-based DAW that combines:
1. **Clean, minimal UI** (WebDAW foundation)
2. **Pro-grade audio features** (borrowed from openDAW)
3. **AI-assisted workflow** (music generation, mixing suggestions, project management)

---

## Phase 1: Foundation Setup (Core Infrastructure)

### 1.1 Fork & Rebrand WebDAW
- [ ] Fork webdaw as `slam-og-studio` or custom name
- [ ] Replace Blueprint.js branding with custom theme
- [ ] Update package.json, README, license attribution
- [ ] Set up as new app in portfolio (`apps/slam-og-studio/`, port 3021)

### 1.2 Upgrade Build System
- [ ] Migrate from Create React App to Vite (faster builds, better HMR)
- [ ] Add path aliases for cleaner imports
- [ ] Configure for audio worklet support (cross-origin isolation)

### 1.3 Project Structure
```
apps/slam-og-studio/
├── src/
│   ├── core/           # Audio engine (from webdaw)
│   ├── dsp/            # DSP utilities (from openDAW lib-dsp)
│   ├── instruments/    # Synths & samplers (ported from openDAW)
│   ├── effects/        # Audio effects (ported from openDAW)
│   ├── midi/           # MIDI processing
│   ├── ai/             # AI integration layer
│   │   ├── generator/  # Music generation
│   │   ├── analyzer/   # Audio analysis
│   │   ├── assistant/  # Project management AI
│   │   └── mixer/      # Mixing suggestions
│   ├── ui/             # React components
│   └── hooks/          # Custom React hooks
├── public/
│   └── worklets/       # AudioWorklet processors
└── package.json
```

---

## Phase 2: Port Essential Features from openDAW

### 2.1 DSP Library (Priority: High)
Extract and adapt `@opendaw/lib-dsp`:
- [ ] FFT analysis
- [ ] RMS/peak detection
- [ ] Oscillators (sine, saw, square, triangle)
- [ ] Filters (biquad cascades)
- [ ] Envelope generators (ADSR)
- [ ] LFO modulators

### 2.2 Instruments (Priority: High)
Port these synthesizers:
- [ ] **Vaporisateur** → Subtractive synth (dual OSC, filter, ADSR, LFO)
- [ ] **Playfield** → Drum machine (16-pad grid)
- [ ] **Nano** → Simple sampler
- [ ] **Tape** → Advanced sampler with time-stretch (complex, phase 3)

### 2.3 Audio Effects (Priority: Medium)
Port essential effects:
- [ ] **Delay** (stereo, tempo-sync, cross-feedback)
- [ ] **Reverb** (Dattorro algorithm)
- [ ] **Revamp EQ** (7-band parametric + analyzer)
- [ ] **Compressor** (with lookahead)
- [ ] **Limiter/Maximizer**
- [ ] **Stereo Tool** (width, M/S)

### 2.4 MIDI Effects (Priority: Medium)
- [ ] **Arpeggiator** (chord patterns)
- [ ] **Pitch** (transpose)
- [ ] **Velocity** (curve mapping)

---

## Phase 3: UI Customization

### 3.1 Theme System
- [ ] Create dark/light theme toggle
- [ ] Custom color palette (your brand colors)
- [ ] Replace Blueprint.js icons with custom set (or Lucide/Radix)

### 3.2 Layout Improvements
- [ ] Collapsible panels (browser, mixer)
- [ ] Resizable track height
- [ ] Dockable windows
- [ ] Full-screen arrangement view

### 3.3 Essential UI Components
- [ ] **Piano Roll** (implement the stub from webdaw)
- [ ] **Drum Grid** (step sequencer)
- [ ] **Automation Editor** (curve drawing)
- [ ] **Waveform Display** (with zoom/scroll)
- [ ] **Spectrum Analyzer** (real-time FFT)

---

## Phase 4: AI Integration (Core Innovation)

### 4.1 Music Generation Assistant

**Capabilities:**
- Generate MIDI patterns (melodies, chord progressions, drum patterns)
- Suggest arrangements based on genre
- Create variations of existing patterns
- Fill in missing parts

**Implementation:**
```typescript
// src/ai/generator/MusicGenerator.ts
interface GenerationRequest {
  type: 'melody' | 'chords' | 'drums' | 'bassline';
  key: string;
  scale: string;
  tempo: number;
  bars: number;
  style?: string;
  context?: MidiRegion[]; // Existing regions for context
}

interface GenerationResponse {
  midi: MidiData[];
  confidence: number;
  alternatives?: MidiData[][];
}
```

**AI Backend: Eleven Labs + Hybrid**

| Component | Provider | Use Case |
|-----------|----------|----------|
| Music Generation | Eleven Labs | Melody, drums, arrangement ideas |
| AI Chatbot/Assistant | Eleven Labs | Voice interaction, creative guidance |
| Mix Analysis | Local DSP | FFT, RMS, LUFS - no API needed |
| Creative Suggestions | Claude API | Complex analysis, text-based advice |
| Stem Separation | ONNX (Demucs) | Pre-trained model, runs locally |

### 4.2 Mixing & Mastering Suggestions

**Analysis Features:**
- Frequency spectrum analysis (identify muddiness, harshness)
- Stereo field analysis (mono compatibility, width issues)
- Dynamic range analysis (over-compression, loudness)
- Level balancing suggestions

**Suggestion Types:**
```typescript
interface MixSuggestion {
  track: string;
  category: 'eq' | 'dynamics' | 'stereo' | 'level' | 'panning';
  issue: string;
  suggestion: string;
  severity: 'info' | 'warning' | 'critical';
  autoFix?: EffectSettings; // One-click fix
}
```

**Example Suggestions:**
- "Bass and kick are fighting at 80Hz - try cutting 3dB at 80Hz on the bass"
- "Vocals are getting lost - try boosting 2-4kHz presence"
- "Mix is very narrow - add stereo width to pads"
- "Master is peaking at -0.1dB - add 2dB headroom"

### 4.3 Project Management AI (Song Builder)

**Workflow Assistant:**
- Track progress through song sections (intro, verse, chorus, etc.)
- Checklist generation based on genre
- Reminder system for common tasks
- Time estimation for completion

**Structure:**
```typescript
interface SongProject {
  title: string;
  genre: string;
  targetDuration: number;
  sections: SongSection[];
  checklist: TaskItem[];
  currentPhase: 'writing' | 'arranging' | 'mixing' | 'mastering';
}

interface SongSection {
  name: string; // "Verse 1", "Chorus", etc.
  status: 'todo' | 'draft' | 'complete';
  startBar: number;
  endBar: number;
  notes: string[];
}

interface TaskItem {
  task: string;
  category: 'arrangement' | 'sound-design' | 'mixing' | 'mastering';
  status: 'pending' | 'in_progress' | 'done' | 'skipped';
  aiGenerated: boolean;
}
```

**Smart Checklist Example (EDM Track):**
- [ ] Create main drop synth
- [ ] Build drum pattern (kick, snare, hats)
- [ ] Write chord progression
- [ ] Design bass sound
- [ ] Add FX (risers, impacts, sweeps)
- [ ] Arrange intro → buildup → drop structure
- [ ] Mix levels (kick at -6dB reference)
- [ ] Add sidechain compression
- [ ] Master chain (EQ → Compression → Limiting)
- [ ] Check loudness (-14 LUFS for streaming)

---

## Phase 5: Advanced Features

### 5.1 AI-Powered Tools
- [ ] **Stem Separation** - Separate vocals, drums, bass, other
- [ ] **Vocal Tuning** - Auto-tune with pitch correction
- [ ] **Transient Detection** - For time-stretching (port from openDAW Tape)
- [ ] **Audio-to-MIDI** - Convert audio recordings to MIDI notes

### 5.2 Collaboration
- [ ] Cloud project storage (IONOS S3)
- [ ] Project sharing links
- [ ] Real-time collaboration (WebRTC/Yjs - reference openDAW p2p)

### 5.3 Export & Integration
- [ ] WAV/MP3/FLAC export
- [ ] MIDI export
- [ ] Stem export
- [ ] Integration with your music page (/music)

---

## Technical Architecture

### Audio Pipeline
```
[MIDI Input] → [MIDI Effects] → [Instrument] → [Audio Effects] → [Mixer Bus] → [Master] → [Output]
                                      ↓                               ↓
                              [AI Analyzer] ←─────────────────────────┘
                                      ↓
                              [Mix Suggestions UI]
```

### AI Integration Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│  AI Assistant UI  │  Generator Panel  │  Mix Analysis Panel │
└────────┬──────────┴────────┬──────────┴──────────┬──────────┘
         │                   │                      │
         ▼                   ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Integration Layer                      │
│  (src/ai/)                                                   │
│  - Context aggregation                                       │
│  - Request formatting                                        │
│  - Response parsing                                          │
└────────┬──────────────────┬──────────────────────┬──────────┘
         │                  │                       │
         ▼                  ▼                       ▼
┌────────────────┐ ┌────────────────┐ ┌─────────────────────┐
│ Local Inference│ │  Anthropic API │ │  Audio Analysis     │
│ (ONNX.js)      │ │  (Claude)      │ │  (Web Audio API)    │
│ - MIDI gen     │ │  - Creative    │ │  - FFT              │
│ - Simple tasks │ │  - Complex     │ │  - Peak detection   │
└────────────────┘ └────────────────┘ └─────────────────────┘
```

---

## File Extraction Guide

### From WebDAW (Keep As-Is)
```
src/core/Engine.ts        → Core playback engine
src/core/Project.ts       → Project data model
src/core/AudioTrack.ts    → Audio track handling
src/core/AudioFile.ts     → Audio buffer management
src/core/Events.ts        → Event system
src/core/Common.ts        → Time/location types
src/ui/Project.tsx        → Main workspace
src/ui/Arrangement.tsx    → Timeline view
src/ui/Transport.tsx      → Play/stop controls
src/ui/Mixer.tsx          → Mixer panel
src/ui/Browser.tsx        → File browser
```

### From openDAW (Port/Adapt)
```
lib/dsp/                  → DSP utilities (FFT, filters, envelopes)
core-processors/devices/instruments/vaporisateur/ → Subtractive synth
core-processors/devices/instruments/playfield/    → Drum machine
core-processors/devices/audio-effects/delay/      → Delay effect
core-processors/devices/audio-effects/reverb/     → Reverb effect
core-processors/devices/audio-effects/revamp/     → Parametric EQ
core-processors/devices/audio-effects/compressor/ → Compressor
core-processors/devices/midi-effects/arpeggio/    → Arpeggiator
```

---

## Milestones

### MVP (Minimum Viable Product)
- [ ] WebDAW fork running with custom branding
- [ ] 1 working synth (Vaporisateur or simplified version)
- [ ] 3 effects (Delay, Reverb, EQ)
- [ ] Basic piano roll
- [ ] AI chat integration for creative suggestions
- [ ] Project save/load

### Version 1.0
- [ ] Full synth suite (3+ instruments)
- [ ] Full effect suite (8+ effects)
- [ ] AI mixing suggestions with auto-fix
- [ ] Project management checklist
- [ ] Audio export

### Version 2.0
- [ ] AI music generation
- [ ] Stem separation
- [ ] Collaboration features
- [ ] Cloud sync

---

## Estimated Complexity

| Component | Complexity | Notes |
|-----------|------------|-------|
| Fork & rebrand | Low | 1-2 days |
| Vite migration | Low | 1 day |
| Port DSP library | Medium | 3-5 days |
| Port 1 synth | Medium-High | 5-7 days |
| Port effects | Medium | 3-5 days |
| Piano roll | High | 7-10 days |
| AI chat integration | Medium | 3-5 days |
| Mix analyzer | Medium-High | 5-7 days |
| Project management | Medium | 3-5 days |

---

## Next Steps

1. **Decision**: Which name/branding for the DAW?
2. **Decision**: API-first AI (Anthropic) or local inference (ONNX)?
3. **Action**: Fork webdaw and set up in apps/
4. **Action**: Create custom theme colors
5. **Action**: Begin DSP library port

---

## Resources

### Repositories
- WebDAW: `/var/www/zaylegend/apps/daw-research/webdaw/`
- openDAW: `/var/www/zaylegend/apps/daw-research/openDAW/`

### Key Reference Files
- WebDAW Architecture: `webdaw/src/core/Engine.ts`
- openDAW Synth Example: `openDAW/packages/studio/core-processors/src/devices/instruments/vaporisateur/`
- openDAW DSP: `openDAW/packages/lib/dsp/src/`

### Documentation
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- AudioWorklet: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet
- WAM 2.0: https://github.com/nicholasareed/WebAudioModule


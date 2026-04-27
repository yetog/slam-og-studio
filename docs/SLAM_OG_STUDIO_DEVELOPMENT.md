# SLAM OG Studio - Step-by-Step Development Plan

> Web-based AI-powered DAW with hybrid intelligence
> Version: 1.0 | Started: 2026-04-27

---

## Project Overview

**Name**: SLAM OG Studio
**Base**: WebDAW (minimal UI framework)
**Features**: openDAW DSP/instruments + AI assistance
**AI Backend**: Hybrid (Eleven Labs + Local ONNX + Claude API)
**Port**: 3021 (when deployed)

---

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
### Phase 2: Audio Engine (Weeks 3-5)
### Phase 3: Instruments & Effects (Weeks 6-8)
### Phase 4: UI Polish (Weeks 9-10)
### Phase 5: AI Integration (Weeks 11-14)
### Phase 6: Polish & Deploy (Weeks 15-16)

---

# PHASE 1: FOUNDATION

## Step 1.1: Fork & Setup Repository

**Tasks:**
- [ ] Create new directory: `/var/www/zaylegend/apps/slam-og-studio/`
- [ ] Copy WebDAW source files (excluding .git)
- [ ] Initialize new git repository
- [ ] Update package.json with new name/description
- [ ] Remove Blueprint.js branding references
- [ ] Create initial commit

**Commands:**
```bash
mkdir -p /var/www/zaylegend/apps/slam-og-studio
cp -r /var/www/zaylegend/apps/daw-research/webdaw/* /var/www/zaylegend/apps/slam-og-studio/
rm -rf /var/www/zaylegend/apps/slam-og-studio/.git
cd /var/www/zaylegend/apps/slam-og-studio
git init
```

**TEST CHECKPOINT 1.1:**
- [ ] `npm install` completes without errors
- [ ] `npm start` launches dev server
- [ ] App loads in browser at localhost:3000
- [ ] Console has no critical errors

---

## Step 1.2: Migrate to Vite

**Tasks:**
- [ ] Remove react-scripts dependencies
- [ ] Install Vite + React plugin + SWC
- [ ] Create vite.config.ts
- [ ] Update package.json scripts
- [ ] Move index.html to root
- [ ] Update import paths if needed

**Files to create:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: '/slam-og-studio/',
  server: {
    port: 3021,
    headers: {
      // Required for AudioWorklet
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

**TEST CHECKPOINT 1.2:**
- [ ] `npm run dev` starts Vite server on port 3021
- [ ] Hot reload works (edit a component, see changes)
- [ ] `npm run build` produces dist/ folder
- [ ] Built app loads without errors

---

## Step 1.3: Rebranding & Theme Setup

**Tasks:**
- [ ] Update app title to "SLAM OG Studio"
- [ ] Create custom color palette (CSS variables)
- [ ] Replace Blueprint.js colors with custom theme
- [ ] Update favicon and logo
- [ ] Create dark/light theme toggle (optional)

**Theme Variables:**
```css
/* src/theme.css */
:root {
  /* SLAM OG Studio Colors */
  --slam-bg-primary: #0a0a0f;
  --slam-bg-secondary: #12121a;
  --slam-bg-tertiary: #1a1a25;
  --slam-accent: #ff6b35;        /* Orange accent */
  --slam-accent-hover: #ff8555;
  --slam-text-primary: #ffffff;
  --slam-text-secondary: #a0a0b0;
  --slam-border: #2a2a35;
  --slam-success: #4ade80;
  --slam-warning: #fbbf24;
  --slam-error: #f87171;

  /* Track colors */
  --track-audio: #3b82f6;
  --track-midi: #a855f7;
  --track-drum: #f97316;
}
```

**TEST CHECKPOINT 1.3:**
- [ ] App displays "SLAM OG Studio" in header
- [ ] Custom colors are applied throughout UI
- [ ] No Blueprint.js blue (#137CBD) visible
- [ ] New favicon appears in browser tab

---

## Step 1.4: Project Structure Setup

**Tasks:**
- [ ] Create organized directory structure
- [ ] Set up path aliases in tsconfig
- [ ] Create placeholder files for each module
- [ ] Set up ESLint + Prettier config

**Directory Structure:**
```
src/
├── core/           # Audio engine (from WebDAW)
├── dsp/            # DSP utilities (to port from openDAW)
├── instruments/    # Synthesizers (to port from openDAW)
├── effects/        # Audio effects (to port from openDAW)
├── midi/           # MIDI processing
├── ai/             # AI integration layer
│   ├── analyzer/   # Audio analysis
│   ├── generator/  # Music generation
│   ├── assistant/  # Project management AI
│   └── mixer/      # Mixing suggestions
├── ui/             # React components
│   ├── components/ # Reusable UI elements
│   ├── panels/     # Major UI sections
│   └── hooks/      # Custom React hooks
├── hooks/          # Global React hooks
├── store/          # State management (optional)
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

**TEST CHECKPOINT 1.4:**
- [ ] Path aliases work: `import { Engine } from '@/core'`
- [ ] ESLint runs without config errors
- [ ] TypeScript compiles all files
- [ ] No import resolution errors

---

# PHASE 2: AUDIO ENGINE

## Step 2.1: Verify Core Engine Works

**Tasks:**
- [ ] Test existing Engine.ts functionality
- [ ] Test Project.ts save/load
- [ ] Test AudioTrack playback
- [ ] Test Metronome click
- [ ] Document any bugs/issues found

**Test Script:**
```typescript
// src/tests/engine.test.ts
import { Engine } from '../core/Engine'
import { Project } from '../core/Project'

// Manual test checklist:
// 1. Create new project
// 2. Add audio track
// 3. Import audio file
// 4. Press play - audio should play
// 5. Press stop - audio should stop
// 6. Toggle metronome - should hear clicks
// 7. Adjust BPM - metronome timing should change
// 8. Save project to JSON
// 9. Load project from JSON
// 10. Verify state restored correctly
```

**TEST CHECKPOINT 2.1:**
- [ ] Can create new project
- [ ] Can import audio file (drag & drop or browse)
- [ ] Play/Stop/Pause work correctly
- [ ] Metronome plays in time with BPM
- [ ] Project saves to JSON
- [ ] Project loads from JSON correctly

---

## Step 2.2: Port DSP Utilities from openDAW

**Files to port:** (from `/apps/daw-research/openDAW/packages/lib/dsp/src/`)

**Priority 1 - Essential:**
- [ ] FFT.ts - Fast Fourier Transform for spectrum analysis
- [ ] RMS.ts - Root Mean Square for level metering
- [ ] Oscillator.ts - Sine, saw, square, triangle
- [ ] BiquadFilter.ts - Low/high pass, bandpass, notch
- [ ] ADSR.ts - Attack/Decay/Sustain/Release envelope

**Priority 2 - Nice to have:**
- [ ] Pitch detection
- [ ] Zero-crossing detection
- [ ] Convolution utilities

**Adaptation Notes:**
- openDAW uses custom JSX, we use React
- Strip out any openDAW-specific dependencies
- Keep pure DSP functions framework-agnostic

**TEST CHECKPOINT 2.2:**
- [ ] FFT produces correct frequency bins
- [ ] RMS calculates correct dB levels
- [ ] Oscillators generate expected waveforms
- [ ] Filters have correct frequency response
- [ ] ADSR envelope shapes audio correctly

---

## Step 2.3: Implement AudioWorklet Support

**Tasks:**
- [ ] Create AudioWorklet processor base class
- [ ] Set up worklet registration in Engine
- [ ] Create simple passthrough processor for testing
- [ ] Verify cross-origin isolation working

**Files:**
```typescript
// public/worklets/base-processor.js
class BaseProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0]
    const output = outputs[0]
    for (let channel = 0; channel < output.length; channel++) {
      output[channel].set(input[channel] || new Float32Array(128))
    }
    return true
  }
}
registerProcessor('base-processor', BaseProcessor)
```

**TEST CHECKPOINT 2.3:**
- [ ] AudioWorklet loads without errors
- [ ] Audio passes through worklet unchanged
- [ ] No audio glitches or dropouts
- [ ] SharedArrayBuffer available (for later)

---

# PHASE 3: INSTRUMENTS & EFFECTS

## Step 3.1: Port Simple Sampler (Nano)

**Source:** `openDAW/packages/studio/core-processors/src/devices/instruments/nano/`

**Tasks:**
- [ ] Create Sampler class with load/play methods
- [ ] Support pitch control
- [ ] Create SamplerUI component
- [ ] Add to instrument registry

**TEST CHECKPOINT 3.1:**
- [ ] Can load WAV/MP3 sample
- [ ] Pressing key triggers sample playback
- [ ] Pitch control works (higher/lower notes)
- [ ] Multiple samples can play simultaneously

---

## Step 3.2: Port Basic Synthesizer

**Source:** `openDAW/packages/studio/core-processors/src/devices/instruments/vaporisateur/`
**Alternative:** Start with WebDAW's Analog.ts stub

**Tasks:**
- [ ] Implement oscillator section (sine, saw, square, triangle)
- [ ] Implement filter (lowpass with cutoff + resonance)
- [ ] Implement ADSR envelope for amplitude
- [ ] Create basic synth UI (knobs for parameters)

**Simplified First Version:**
```typescript
interface SimpleSynthParams {
  oscillatorType: 'sine' | 'sawtooth' | 'square' | 'triangle'
  filterCutoff: number    // 20Hz - 20kHz
  filterResonance: number // 0 - 1
  attack: number          // 0 - 2s
  decay: number           // 0 - 2s
  sustain: number         // 0 - 1
  release: number         // 0 - 4s
  volume: number          // 0 - 1
}
```

**TEST CHECKPOINT 3.2:**
- [ ] Oscillator produces sound when key pressed
- [ ] Can switch between waveform types
- [ ] Filter changes tone (cutoff sweeps)
- [ ] ADSR shapes the amplitude envelope
- [ ] No audio clicks at note start/end

---

## Step 3.3: Port Essential Effects

**Port in order:**

### 3.3.1: Delay
- [ ] Stereo delay with feedback
- [ ] Tempo sync option
- [ ] Mix control

### 3.3.2: Reverb
- [ ] Convolution reverb (use IR samples) OR
- [ ] Algorithmic reverb (FreeVerb port)
- [ ] Size, damping, mix controls

### 3.3.3: EQ
- [ ] 3-band parametric (Low, Mid, High)
- [ ] Frequency, gain, Q for each band
- [ ] Simple UI with curve visualization

### 3.3.4: Compressor
- [ ] Threshold, ratio, attack, release
- [ ] Gain reduction meter

**TEST CHECKPOINT 3.3:**
- [ ] Delay creates distinct echoes
- [ ] Reverb adds space to audio
- [ ] EQ visibly changes spectrum
- [ ] Compressor reduces dynamic range
- [ ] All effects have working UI controls

---

## Step 3.4: Create Drum Machine

**Source:** `openDAW/packages/studio/core-processors/src/devices/instruments/playfield/`

**Tasks:**
- [ ] 16-step sequencer grid UI
- [ ] 8 pad/sample slots
- [ ] Load samples per pad
- [ ] Velocity control per step
- [ ] Pattern save/load

**TEST CHECKPOINT 3.4:**
- [ ] Can load different drum samples
- [ ] Step sequencer plays pattern in time
- [ ] Velocity affects sample volume
- [ ] Pattern saves with project

---

# PHASE 4: UI POLISH

## Step 4.1: Implement Piano Roll

**Based on:** WebDAW's PianoRoll.tsx stub

**Tasks:**
- [ ] Note display grid (vertical = pitch, horizontal = time)
- [ ] Note add/delete/resize with mouse
- [ ] Velocity editing per note
- [ ] Quantize to grid
- [ ] Zoom horizontal/vertical
- [ ] Scroll to follow playback

**TEST CHECKPOINT 4.1:**
- [ ] Can draw notes on grid
- [ ] Notes play at correct pitch and time
- [ ] Can select and delete notes
- [ ] Can resize note duration
- [ ] Velocity changes note volume

---

## Step 4.2: Implement Mixer Panel

**Enhance:** WebDAW's Mixer.tsx

**Tasks:**
- [ ] Channel strip per track (fader, pan, mute, solo)
- [ ] VU meter per channel
- [ ] Master fader
- [ ] Send/return for effects bus
- [ ] Track color indicators

**TEST CHECKPOINT 4.2:**
- [ ] Faders control volume
- [ ] Pan controls stereo position
- [ ] Mute/solo work correctly
- [ ] VU meters respond to audio
- [ ] Master fader affects overall output

---

## Step 4.3: Waveform Display

**Tasks:**
- [ ] Draw waveform from AudioBuffer
- [ ] Support zoom (more detail when zoomed in)
- [ ] Highlight playback position
- [ ] Region selection for editing

**TEST CHECKPOINT 4.3:**
- [ ] Waveform displays correctly
- [ ] Zoom in shows more detail
- [ ] Playhead moves during playback
- [ ] Can select region visually

---

# PHASE 5: AI INTEGRATION

## Step 5.1: Audio Analysis Engine

**This is your foundation for AI suggestions - no training needed!**

**Tasks:**
- [ ] Implement spectrum analyzer (use ported FFT)
- [ ] Implement RMS/peak metering
- [ ] Implement loudness measurement (LUFS)
- [ ] Frequency band analysis (low/mid/high balance)
- [ ] Stereo correlation meter

**Implementation:**
```typescript
// src/ai/analyzer/AudioAnalyzer.ts
interface TrackAnalysis {
  peakLevel: number          // dB
  rmsLevel: number           // dB
  lufs: number               // Integrated loudness
  frequencyBalance: {
    low: number              // < 250Hz (dB relative)
    mid: number              // 250Hz - 4kHz
    high: number             // > 4kHz
  }
  stereoWidth: number        // 0 = mono, 1 = full stereo
  dynamics: number           // Peak to RMS ratio
  clipping: boolean          // Any samples > 0dB
}

class AudioAnalyzer {
  analyzeMix(masterBuffer: AudioBuffer): MixAnalysis
  analyzeTrack(trackBuffer: AudioBuffer): TrackAnalysis
  compareToReference(mix: AudioBuffer, reference: AudioBuffer): ComparisonResult
}
```

**TEST CHECKPOINT 5.1:**
- [ ] Spectrum analyzer shows real-time frequency content
- [ ] Peak/RMS meters update in real-time
- [ ] LUFS measures integrated loudness correctly
- [ ] Analysis results are accurate (verify against known signals)

---

## Step 5.2: Rule-Based Mix Suggestions

**No ML needed - just audio engineering knowledge!**

**Tasks:**
- [ ] Define mixing rules/thresholds
- [ ] Generate suggestions from analysis
- [ ] Create suggestion UI component
- [ ] Implement one-click auto-fix actions

**Rules to implement:**
```typescript
// src/ai/mixer/MixRules.ts
const MIX_RULES = [
  {
    id: 'kick-bass-clash',
    check: (analysis) => {
      const lowEnergy = analysis.frequencyBands['40-80Hz']
      const kickTrack = analysis.tracks.find(t => t.name.includes('kick'))
      const bassTrack = analysis.tracks.find(t => t.name.includes('bass'))
      if (kickTrack && bassTrack && lowEnergy > -6) {
        return {
          issue: 'Kick and bass are competing at 40-80Hz',
          suggestion: 'Try cutting 3dB at 60Hz on the bass or add sidechain compression',
          severity: 'warning',
          autoFix: { action: 'eq', track: 'bass', band: '60Hz', gain: -3 }
        }
      }
    }
  },
  {
    id: 'harsh-frequencies',
    check: (analysis) => {
      if (analysis.frequencyBalance['2-4kHz'] > +3) {
        return {
          issue: 'Mix is harsh in the 2-4kHz range',
          suggestion: 'Cut 2-3dB in the 2-4kHz range on bright instruments',
          severity: 'info'
        }
      }
    }
  },
  {
    id: 'too-loud',
    check: (analysis) => {
      if (analysis.peakLevel > -0.5) {
        return {
          issue: 'Mix is peaking too high, risk of clipping',
          suggestion: 'Reduce master fader by 2-3dB',
          severity: 'critical',
          autoFix: { action: 'gain', track: 'master', amount: -3 }
        }
      }
    }
  },
  {
    id: 'mono-compatibility',
    check: (analysis) => {
      if (analysis.monoCorrelation < 0.5) {
        return {
          issue: 'Mix may have phase issues in mono',
          suggestion: 'Check stereo-widened elements for mono compatibility',
          severity: 'warning'
        }
      }
    }
  },
  // Add 20+ more rules...
]
```

**TEST CHECKPOINT 5.2:**
- [ ] Suggestions appear based on analysis
- [ ] One-click auto-fix applies changes
- [ ] Suggestions update when mix changes
- [ ] No false positives on well-mixed audio

---

## Step 5.3: Claude AI Integration

**For creative suggestions and intelligent guidance**

**Tasks:**
- [ ] Set up API client for Claude
- [ ] Create prompt templates for different tasks
- [ ] Implement chat interface in UI
- [ ] Handle streaming responses

**Use Cases:**
```typescript
// src/ai/assistant/ClaudeAssistant.ts
class ClaudeAssistant {
  // Mix analysis interpretation
  async interpretAnalysis(analysis: MixAnalysis): Promise<string> {
    return await this.query(`
      I'm working on a mix with these characteristics:
      - Peak level: ${analysis.peakLevel}dB
      - LUFS: ${analysis.lufs}
      - Low/Mid/High balance: ${analysis.frequencyBalance}

      The genre is ${analysis.genre || 'unknown'}.
      What mixing advice would you give?
    `)
  }

  // Creative suggestions
  async suggestArrangement(context: ProjectContext): Promise<string> {
    return await this.query(`
      I have a ${context.genre} track with:
      - ${context.sections.join(', ')}
      - Current length: ${context.duration}

      Suggest arrangement improvements or missing elements.
    `)
  }

  // Project management
  async generateChecklist(genre: string): Promise<TaskItem[]> {
    const response = await this.query(`
      Generate a production checklist for a ${genre} track.
      Include: arrangement, sound design, mixing, mastering tasks.
      Format as JSON array.
    `)
    return JSON.parse(response)
  }
}
```

**TEST CHECKPOINT 5.3:**
- [ ] Claude API connection works
- [ ] Streaming responses display in UI
- [ ] Context from project is used in prompts
- [ ] Suggestions are relevant and helpful

---

## Step 5.4: Project Management AI

**Tasks:**
- [ ] Song section tracking (intro, verse, chorus, etc.)
- [ ] Auto-generated checklist based on genre
- [ ] Progress percentage calculation
- [ ] Reminders/suggestions for next steps

**UI:**
```typescript
// src/ui/panels/ProjectAssistant.tsx
interface SongSection {
  id: string
  name: string
  status: 'empty' | 'draft' | 'complete'
  startBar: number
  endBar: number
}

interface ProjectAssistantState {
  phase: 'writing' | 'arranging' | 'mixing' | 'mastering'
  sections: SongSection[]
  checklist: TaskItem[]
  progress: number // 0-100%
  nextSteps: string[]
}
```

**TEST CHECKPOINT 5.4:**
- [ ] Can define song sections
- [ ] Checklist generates based on genre
- [ ] Progress updates as tasks complete
- [ ] AI suggests next steps

---

## Step 5.5: Local ONNX Models (Optional Advanced)

**For stem separation, pitch detection - no training, use pre-trained**

**Tasks:**
- [ ] Set up ONNX.js runtime
- [ ] Load pre-trained stem separation model (Demucs)
- [ ] Load pre-trained pitch detection model
- [ ] Create UI for these features

**Pre-trained models to use:**
- **Demucs** (Facebook/Meta) - Stem separation
- **CREPE** - Pitch detection
- **Whisper** (OpenAI) - Audio transcription

**TEST CHECKPOINT 5.5:**
- [ ] ONNX runtime loads in browser
- [ ] Stem separation produces 4 stems
- [ ] Pitch detection identifies notes
- [ ] Processing happens in Web Worker (no UI freeze)

---

# PHASE 6: POLISH & DEPLOY

## Step 6.1: Testing & Bug Fixes

**Tasks:**
- [ ] Test all features end-to-end
- [ ] Fix any remaining bugs
- [ ] Performance optimization
- [ ] Memory leak checks

**Performance Targets:**
- Audio latency: < 20ms
- UI frame rate: 60fps during playback
- Project load time: < 3 seconds
- Build size: < 5MB

**TEST CHECKPOINT 6.1:**
- [ ] No crashes during normal use
- [ ] Audio plays without glitches
- [ ] UI remains responsive
- [ ] Memory usage stays stable

---

## Step 6.2: Documentation

**Tasks:**
- [ ] README.md with setup instructions
- [ ] User guide (basic operations)
- [ ] Keyboard shortcuts reference
- [ ] API documentation (if applicable)

---

## Step 6.3: Deployment

**Tasks:**
- [ ] Add to portfolio's nginx config
- [ ] Configure vite.config.ts base path
- [ ] Build production bundle
- [ ] Add to api/routes/apps.py registries
- [ ] Test deployed version

**Nginx config:**
```nginx
location /slam-og-studio {
    alias /var/www/zaylegend/apps/slam-og-studio/dist;
    try_files $uri $uri/ /slam-og-studio/index.html;
}
```

**TEST CHECKPOINT 6.3:**
- [ ] App accessible at zaylegend.com/slam-og-studio
- [ ] All features work in production
- [ ] No console errors
- [ ] Dashboard shows app as healthy

---

# TESTING METHODOLOGY

## After Each Step

1. **Run the app**: `npm run dev`
2. **Check console**: No errors or warnings
3. **Test the feature**: Follow test checkpoint items
4. **Document issues**: Note any bugs in TODO
5. **Commit**: `git add . && git commit -m "Step X.X: description"`

## Test Audio Files

Keep a set of test files in `public/test-audio/`:
- `sine-440hz.wav` - Pure sine wave for testing
- `drums.wav` - Drum loop for timing tests
- `full-mix.wav` - Complete mix for analysis tests
- `reference.wav` - Professional track for comparison

## Browser Testing

- Chrome (primary - best Web Audio support)
- Firefox (secondary)
- Safari (if issues, may need polyfills)

---

# QUICK START COMMANDS

```bash
# Setup (Phase 1)
cd /var/www/zaylegend/apps
cp -r daw-research/webdaw slam-og-studio
cd slam-og-studio
rm -rf .git && git init
npm install

# Development
npm run dev           # Start dev server
npm run build         # Production build
npm run lint          # Check for issues

# Testing
npm run test          # Run unit tests (when added)

# Deploy
npm run build
sudo nginx -s reload
```

---

# RESOURCES

## Reference Code
- WebDAW: `/var/www/zaylegend/apps/daw-research/webdaw/`
- openDAW: `/var/www/zaylegend/apps/daw-research/openDAW/`

## Documentation
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet)
- [Anthropic API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [ONNX.js](https://github.com/nicholasareed/onnxruntime-web)

## AI/ML Resources
- [Demucs (Meta)](https://github.com/facebookresearch/demucs) - Stem separation
- [CREPE](https://github.com/marl/crepe) - Pitch detection
- [Music Information Retrieval](https://musicinformationretrieval.com/)

---

# NOTES

## What We're NOT Doing (For Now)

- ❌ Training custom ML models from scratch
- ❌ Building a full Suno-style generation system
- ❌ Mobile/tablet support (desktop first)
- ❌ Multi-user collaboration (single user focus)

## What We ARE Doing

- ✅ Using pre-trained models where helpful
- ✅ Rule-based analysis for mixing suggestions
- ✅ Claude API for creative guidance
- ✅ Solid DAW fundamentals first, AI second

---

*Last updated: 2026-04-27*

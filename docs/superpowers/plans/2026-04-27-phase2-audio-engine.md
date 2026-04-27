# Phase 2: Audio Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Get audio playing end-to-end in the browser, implement live BPM control, and build the five DSP utility classes that instruments and effects will build on.

**Architecture:** Phase 2A fixes the engine's blocking stubs (adjustBpm, mute/solo), adds a test audio project, and registers an AudioWorklet processor. Phase 2B adds five pure-TypeScript DSP modules in `src/dsp/` (Oscillator, ADSR, BiquadFilter, RMS, FFT) and a second worklet that wires them together. All DSP modules are framework-free and unit-tested in isolation.

**Tech Stack:** TypeScript 5, Vite 5, Web Audio API, AudioWorklet, Vitest 1

---

## File Map

### New files
```
vitest.config.ts
scripts/generate-test-audio.mjs
public/test-audio/sine-440hz.wav          (generated)
public/test-audio/drums-placeholder.wav   (generated)
public/worklets/base-processor.js
public/worklets/dsp-processor.js
src/dsp/Oscillator.ts
src/dsp/ADSR.ts
src/dsp/BiquadFilter.ts
src/dsp/RMS.ts
src/dsp/FFT.ts
src/__tests__/core/Project.test.ts
src/__tests__/core/Engine.test.ts
src/__tests__/dsp/Oscillator.test.ts
src/__tests__/dsp/ADSR.test.ts
src/__tests__/dsp/BiquadFilter.test.ts
src/__tests__/dsp/RMS.test.ts
src/__tests__/dsp/FFT.test.ts
```

### Modified files
```
package.json                              — add vitest, test scripts, generate-test-audio script
vite.config.ts                            — add @dsp alias
src/core/Project.ts                       — add updateBpm()
src/core/Engine.ts                        — implement adjustBpm(), fix handleTrackEvent mute/solo
public/templates/default-project.json    — point to test-audio/ files
```

---

## Task 1: Set Up Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`
- Modify: `vite.config.ts`

- [ ] **Step 1: Install Vitest**

```bash
cd slam-og-studio
npm install --save-dev vitest jsdom @vitest/ui
```

Expected: vitest and jsdom appear in `package.json` devDependencies.

- [ ] **Step 2: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@dsp': path.resolve(__dirname, './src/dsp'),
      '@effects': path.resolve(__dirname, './src/effects'),
      '@instruments': path.resolve(__dirname, './src/instruments'),
    },
  },
})
```

- [ ] **Step 3: Add test scripts to package.json**

In the `"scripts"` block, add after the existing entries:

```json
"test": "vitest",
"test:run": "vitest run",
"test:ui": "vitest --ui"
```

- [ ] **Step 4: Add @dsp alias to vite.config.ts**

In the `resolve.alias` block, add:

```typescript
'@dsp': path.resolve(__dirname, './src/dsp'),
```

Full alias block after edit:
```typescript
alias: {
  '@': path.resolve(__dirname, './src'),
  '@core': path.resolve(__dirname, './src/core'),
  '@dsp': path.resolve(__dirname, './src/dsp'),
  '@ui': path.resolve(__dirname, './src/ui'),
  '@effects': path.resolve(__dirname, './src/effects'),
  '@instruments': path.resolve(__dirname, './src/instruments'),
},
```

- [ ] **Step 5: Verify test runner starts**

```bash
npx vitest run
```

Expected output: `No test files found` (or similar — no errors).

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts package.json package-lock.json vite.config.ts
git commit -m "chore: add Vitest test runner with jsdom environment"
```

---

## Task 2: Project.updateBpm()

**Files:**
- Modify: `src/core/Project.ts`
- Create: `src/__tests__/core/Project.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/core/Project.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { Project } from '@core/Project'
import { Location } from '@core/Common'

describe('Project.updateBpm', () => {
  it('recalculates locationToTime after BPM change', () => {
    const project = new Project('Test', 120)
    const bar2 = new Location(2, 1, 1)

    // At 120 BPM, 4/4: beatTime = 0.5s, bar = 4 beats = 2s
    expect(project.locationToTime.convertLocation(bar2)).toBeCloseTo(2.0)

    project.updateBpm(60)

    // At 60 BPM: beatTime = 1s, bar = 4 beats = 4s
    expect(project.locationToTime.convertLocation(bar2)).toBeCloseTo(4.0)
  })

  it('updates project.bpm field', () => {
    const project = new Project('Test', 120)
    project.updateBpm(90)
    expect(project.bpm).toBe(90)
  })

  it('round-trips time conversion after BPM change', () => {
    const project = new Project('Test', 120)
    project.updateBpm(140)
    const loc = new Location(3, 2, 1)
    const time = project.locationToTime.convertLocation(loc)
    const back = project.locationToTime.convertTime(time)
    expect(back.bar).toBe(loc.bar)
    expect(back.beat).toBe(loc.beat)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/core/Project.test.ts
```

Expected: FAIL — `project.updateBpm is not a function`

- [ ] **Step 3: Add updateBpm to Project.ts**

In `src/core/Project.ts`, after the `get locationToTime()` getter, add:

```typescript
public updateBpm(bpm: number): void {
  this.bpm = bpm;
  this._locationToTime = this.createLocationToTime();
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/core/Project.test.ts
```

Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/core/Project.ts src/__tests__/core/Project.test.ts
git commit -m "feat: add Project.updateBpm() to recalculate tempo converter"
```

---

## Task 3: Engine.adjustBpm()

**Files:**
- Modify: `src/core/Engine.ts`
- Create: `src/__tests__/core/Engine.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/core/Engine.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { Engine } from '@core/Engine'
import { Project } from '@core/Project'
import { Location, Duration, TimeSignature } from '@core/Common'
import { TransportEvent, TransportEventType } from '@core/Events'

function makeMockContext(currentTime = 0) {
  return {
    sampleRate: 44100,
    currentTime,
    state: 'running',
    audioWorklet: { addModule: vi.fn().mockResolvedValue(undefined) },
  } as unknown as AudioContext
}

describe('Engine.adjustBpm', () => {
  it('updates project BPM and recalculates locator times', () => {
    const ctx = makeMockContext()
    const project = new Project('Test', 120, new TimeSignature(4, 4))
    project.loopStart = new Location(1, 1, 1)
    project.loopEnd = new Location(5, 1, 1)
    project.end = new Location(9, 1, 1)
    const engine = new Engine(ctx, { bufferSize: 128, sampleRate: 44100 }, project)

    // Manually set the locators on the engine as start() would
    engine.loopStart = new Location(1, 1, 1)
    engine.loopEnd = new Location(5, 1, 1)
    engine.end = new Location(9, 1, 1)

    // Fire BPM change via transport event — TransportEvent(type, location?, bpm?, looping?)
    engine.handleTransportEvent(
      new TransportEvent(TransportEventType.BpmChanged, undefined, 60),
    )

    expect(project.bpm).toBe(60)
    // At 60 BPM, 4/4: 8 bars = 8 * 4 * 1s = 32s
    // _endTime = end - 1 tick ≈ 32s
    expect((engine as any)._endTime).toBeGreaterThan(0)
    // _loopStartTime is bar 1 = 0
    expect((engine as any)._loopStartTime).toBeCloseTo(0)
  })

  it('does not throw (regression guard against original stub)', () => {
    const ctx = makeMockContext()
    const project = new Project('Test', 120)
    const engine = new Engine(ctx, { bufferSize: 128, sampleRate: 44100 }, project)

    expect(() => {
      engine.handleTransportEvent(
        new TransportEvent(TransportEventType.BpmChanged, undefined, 90),
      )
    }).not.toThrow()
  })
})
```

- [ ] **Step 2: Verify Engine.adjustBpm receives the bpm value**

In `src/core/Engine.ts`, confirm `handleTransportEvent` calls `this.adjustBpm(event.bpm!)` for the `BpmChanged` case. `TransportEvent` signature is `(type, location?, bpm?, looping?)` — `event.bpm` is the correct accessor.

- [ ] **Step 3: Run test to verify it fails**

```bash
npx vitest run src/__tests__/core/Engine.test.ts
```

Expected: FAIL — `Method not implemented.`

- [ ] **Step 4: Implement adjustBpm in Engine.ts**

Replace the stub at `src/core/Engine.ts` (the `private adjustBpm` method):

```typescript
private adjustBpm(bpm: number): void {
  this._project.updateBpm(bpm);
  const converter = this._project.locationToTime;

  this._loopStartTime = converter.convertLocation(this.loopStart);
  this._loopEndTime = converter.convertLocation(
    this.loopEnd.sub(new Duration(0, 0, 1), this._project.timeSignature),
  );
  this._endTime = converter.convertLocation(
    this.end.sub(new Duration(0, 0, 1), this._project.timeSignature),
  );

  if (this._playing) {
    const newCurrentTime = converter.convertLocation(this._project.current);
    this.currentTime = newCurrentTime;
    this._timeOffset = this.context.currentTime - newCurrentTime;
  }
}
```

Also change the return type from `never` to `void`:
```typescript
private adjustBpm(bpm: number): void {
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npx vitest run src/__tests__/core/Engine.test.ts
```

Expected: PASS — 2 tests passing.

- [ ] **Step 6: Commit**

```bash
git add src/core/Engine.ts src/__tests__/core/Engine.test.ts
git commit -m "feat: implement Engine.adjustBpm() with live tempo recalculation"
```

---

## Task 4: Engine Mute/Solo

**Files:**
- Modify: `src/core/Engine.ts`
- Modify: `src/__tests__/core/Engine.test.ts`

- [ ] **Step 1: Read AbstractTrack to confirm `enabled` and `soloed` are defined**

Open `src/core/Track.ts` and verify `AbstractTrack` exposes `muted: boolean`, `soloed: boolean`, and `enabled: boolean`. If `enabled` is only on `AudioTrack`, note which type the test should use.

- [ ] **Step 2: Write the failing test**

Add to `src/__tests__/core/Engine.test.ts`:

```typescript
import { AudioTrack } from '@core/AudioTrack'
import { TrackEvent, TrackEventType } from '@core/Events'

describe('Engine.handleTrackEvent mute/solo', () => {
  it('calls project.updateTrackEnablement when a track is muted', () => {
    const ctx = makeMockContext()
    const project = new Project()
    const spy = vi.spyOn(project, 'updateTrackEnablement')
    const engine = new Engine(ctx, { bufferSize: 128, sampleRate: 44100 }, project)

    const track = new AudioTrack([], [], 'Test', '#aaa', false, false, false)
    engine.handleTrackEvent(new TrackEvent(TrackEventType.Muted, track))

    expect(spy).toHaveBeenCalled()
  })

  it('calls project.updateTrackEnablement when a track is soloed', () => {
    const ctx = makeMockContext()
    const project = new Project()
    const spy = vi.spyOn(project, 'updateTrackEnablement')
    const engine = new Engine(ctx, { bufferSize: 128, sampleRate: 44100 }, project)

    const track = new AudioTrack([], [], 'Test', '#aaa', false, false, false)
    engine.handleTrackEvent(new TrackEvent(TrackEventType.Soloed, track))

    expect(spy).toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx vitest run src/__tests__/core/Engine.test.ts
```

Expected: FAIL — spy not called (cases are empty).

- [ ] **Step 4: Implement mute/solo in Engine.handleTrackEvent**

In `src/core/Engine.ts`, update the `handleTrackEvent` method:

```typescript
public handleTrackEvent(event: TrackEvent): void {
  switch (event.type) {
    case TrackEventType.Added:
      event.track.initializeAudio(this.context);
      break;
    case TrackEventType.Removed:
      event.track.stop();
      event.track.deinitializeAudio();
      break;
    case TrackEventType.Muted:
      this._project.updateTrackEnablement();
      break;
    case TrackEventType.Soloed:
      this._project.updateTrackEnablement();
      break;
    case TrackEventType.DelayChanged:
      // TODO: Phase 3
      break;
    case TrackEventType.EffectsChainChanged:
      // TODO: Phase 3
      break;
  }
}
```

- [ ] **Step 5: Run all tests**

```bash
npx vitest run
```

Expected: PASS — all tests passing.

- [ ] **Step 6: Commit**

```bash
git add src/core/Engine.ts src/__tests__/core/Engine.test.ts
git commit -m "feat: implement mute/solo in Engine.handleTrackEvent"
```

---

## Task 5: AudioWorklet Base Processor

**Files:**
- Create: `public/worklets/base-processor.js`
- Modify: `src/core/Engine.ts`

- [ ] **Step 1: Create base processor worklet**

Create `public/worklets/base-processor.js`:

```javascript
class BaseProcessor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    const input = inputs[0]
    const output = outputs[0]
    for (let ch = 0; ch < output.length; ch++) {
      const src = input[ch]
      if (src) {
        output[ch].set(src)
      } else {
        output[ch].fill(0)
      }
    }
    return true
  }
}

registerProcessor('base-processor', BaseProcessor)
```

- [ ] **Step 2: Wire worklet into Engine.initialize()**

Update `Engine.initialize()` in `src/core/Engine.ts`:

```typescript
public async initialize(onComplete: () => void) {
  const baseUrl = import.meta.env.BASE_URL
  await this.context.audioWorklet.addModule(`${baseUrl}worklets/base-processor.js`)
  this._metronome.prepareInContext(this.context, onComplete)
}
```

- [ ] **Step 3: Verify the Engine test mocking is still correct**

Run tests — `addModule` is already mocked in `makeMockContext()`:

```bash
npx vitest run
```

Expected: PASS — all existing tests still pass.

- [ ] **Step 4: Commit**

```bash
git add public/worklets/base-processor.js src/core/Engine.ts
git commit -m "feat: add AudioWorklet base processor and wire into Engine.initialize()"
```

---

## Task 6: Test Audio Files + Default Project

**Files:**
- Create: `scripts/generate-test-audio.mjs`
- Modify: `package.json`
- Modify: `public/templates/default-project.json`

- [ ] **Step 1: Create the WAV generator script**

Create `scripts/generate-test-audio.mjs`:

```javascript
import { writeFileSync, mkdirSync } from 'fs'

function generateSineWav(frequency, durationSec, sampleRate = 44100) {
  const numSamples = Math.floor(durationSec * sampleRate)
  const dataSize = numSamples * 2
  const buffer = Buffer.alloc(44 + dataSize)

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)           // PCM
  buffer.writeUInt16LE(1, 22)           // mono
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate)
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2)
  }
  return buffer
}

mkdirSync('public/test-audio', { recursive: true })
writeFileSync('public/test-audio/sine-440hz.wav', generateSineWav(440, 4))
writeFileSync('public/test-audio/beat-100hz.wav', generateSineWav(100, 4))
console.log('Generated public/test-audio/sine-440hz.wav (440 Hz, 4s)')
console.log('Generated public/test-audio/beat-100hz.wav (100 Hz, 4s)')
```

- [ ] **Step 2: Add script to package.json**

In the `"scripts"` block:

```json
"generate-test-audio": "node scripts/generate-test-audio.mjs"
```

- [ ] **Step 3: Run the script**

```bash
npm run generate-test-audio
```

Expected:
```
Generated public/test-audio/sine-440hz.wav (440 Hz, 4s)
Generated public/test-audio/beat-100hz.wav (100 Hz, 4s)
```

Verify both files exist in `public/test-audio/`.

- [ ] **Step 4: Update default-project.json**

Replace the contents of `public/templates/default-project.json` with:

```json
{
  "name": "Test Project",
  "bpm": 120,
  "timeSignature": [4, 4],
  "looping": true,
  "current": [1, 1, 1],
  "loopStart": [1, 1, 1],
  "loopEnd": [5, 1, 1],
  "end": [9, 1, 1],
  "tracks": [
    {
      "type": "audio",
      "name": "Melody",
      "color": "#5FD2D6",
      "muted": false,
      "soloed": false,
      "recording": false,
      "audioEffects": [],
      "regions": [
        {
          "name": "Sine 440",
          "color": "#5FD2D6",
          "muted": false,
          "soloed": false,
          "looping": false,
          "audioFile": "test-audio/sine-440hz.wav",
          "startTime": 0,
          "endTime": 0,
          "position": [1, 1, 1],
          "size": [4, 0, 0],
          "length": [4, 0, 0],
          "trim": [0, 0, 0]
        }
      ]
    },
    {
      "type": "audio",
      "name": "Beat",
      "color": "#C9A24A",
      "muted": false,
      "soloed": false,
      "recording": false,
      "audioEffects": [],
      "regions": [
        {
          "name": "Beat 100Hz",
          "color": "#C9A24A",
          "muted": false,
          "soloed": false,
          "looping": false,
          "audioFile": "test-audio/beat-100hz.wav",
          "startTime": 0,
          "endTime": 0,
          "position": [1, 1, 1],
          "size": [4, 0, 0],
          "length": [4, 0, 0],
          "trim": [0, 0, 0]
        }
      ]
    }
  ],
  "audioFiles": [
    { "name": "Sine 440", "url": "test-audio/sine-440hz.wav" },
    { "name": "Beat 100Hz", "url": "test-audio/beat-100hz.wav" }
  ]
}
```

- [ ] **Step 5: Verify the dev server loads the project**

```bash
npm run dev
```

Open `http://localhost:3021/slam-og-studio/` in Chrome. Open DevTools console. Verify:
- No uncaught errors on load
- The two tracks (Melody, Beat) are visible in the arrangement
- Pressing Play produces audio from both tracks
- Pressing Stop silences audio

If audio files fail to load, open the Network tab and check the URL the app tries to fetch. The `AudioFile` class resolves URLs relative to `window.location.href` — adjust the `"url"` paths in `default-project.json` if needed.

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-test-audio.mjs public/test-audio/ public/templates/default-project.json package.json package-lock.json
git commit -m "feat: add test audio files and update default project for Phase 2A verification"
```

---

## Task 7: DSP — Oscillator

**Files:**
- Create: `src/dsp/Oscillator.ts`
- Create: `src/__tests__/dsp/Oscillator.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/dsp/Oscillator.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { Oscillator } from '@dsp/Oscillator'

const SAMPLE_RATE = 44100

describe('Oscillator', () => {
  it('sine: first sample is 0', () => {
    const osc = new Oscillator(SAMPLE_RATE)
    osc.setType('sine')
    osc.setFrequency(440)
    const buf = new Float32Array(1)
    osc.process(buf)
    expect(buf[0]).toBeCloseTo(0, 5)
  })

  it('sine: completes one cycle in sampleRate/freq samples', () => {
    const osc = new Oscillator(SAMPLE_RATE)
    osc.setType('sine')
    osc.setFrequency(440)
    const samplesPerCycle = Math.round(SAMPLE_RATE / 440)
    const buf = new Float32Array(samplesPerCycle)
    osc.process(buf)
    // One cycle later, phase is back near 0 → sin ≈ 0
    expect(buf[samplesPerCycle - 1]).toBeCloseTo(0, 1)
  })

  it('sine: peak amplitude is 1', () => {
    const osc = new Oscillator(SAMPLE_RATE)
    osc.setType('sine')
    osc.setFrequency(440)
    const buf = new Float32Array(SAMPLE_RATE)
    osc.process(buf)
    const max = Math.max(...buf)
    expect(max).toBeCloseTo(1, 2)
  })

  it('square: outputs only +1 and -1', () => {
    const osc = new Oscillator(SAMPLE_RATE)
    osc.setType('square')
    osc.setFrequency(440)
    const buf = new Float32Array(128)
    osc.process(buf)
    for (const s of buf) {
      expect(Math.abs(s)).toBe(1)
    }
  })

  it('sawtooth: monotonically increases within first half-cycle', () => {
    const osc = new Oscillator(SAMPLE_RATE)
    osc.setType('sawtooth')
    osc.setFrequency(440)
    const halfCycle = Math.floor(SAMPLE_RATE / 440 / 2)
    const buf = new Float32Array(halfCycle)
    osc.process(buf)
    for (let i = 1; i < buf.length; i++) {
      expect(buf[i]).toBeGreaterThanOrEqual(buf[i - 1])
    }
  })

  it('reset() resets phase to 0', () => {
    const osc = new Oscillator(SAMPLE_RATE)
    osc.setType('sine')
    osc.setFrequency(440)
    const buf = new Float32Array(100)
    osc.process(buf)
    osc.reset()
    const buf2 = new Float32Array(1)
    osc.process(buf2)
    expect(buf2[0]).toBeCloseTo(0, 5)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/dsp/Oscillator.test.ts
```

Expected: FAIL — `Cannot find module '@dsp/Oscillator'`

- [ ] **Step 3: Implement Oscillator.ts**

Create `src/dsp/Oscillator.ts`:

```typescript
export type WaveType = 'sine' | 'sawtooth' | 'square' | 'triangle'

export class Oscillator {
  private phase = 0
  private phaseIncrement = 0
  private type: WaveType = 'sine'

  constructor(private readonly sampleRate: number) {}

  setFrequency(hz: number): void {
    this.phaseIncrement = (2 * Math.PI * hz) / this.sampleRate
  }

  setType(type: WaveType): void {
    this.type = type
  }

  process(output: Float32Array): void {
    for (let i = 0; i < output.length; i++) {
      output[i] = this.nextSample()
      this.phase += this.phaseIncrement
      if (this.phase >= 2 * Math.PI) {
        this.phase -= 2 * Math.PI
      }
    }
  }

  private nextSample(): number {
    const p = this.phase
    switch (this.type) {
      case 'sine':     return Math.sin(p)
      case 'sawtooth': return (p / Math.PI) - 1
      case 'square':   return p < Math.PI ? 1 : -1
      case 'triangle': return p < Math.PI
        ? (2 * p / Math.PI) - 1
        : 3 - (2 * p / Math.PI)
    }
  }

  reset(): void {
    this.phase = 0
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/dsp/Oscillator.test.ts
```

Expected: PASS — 6 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/dsp/Oscillator.ts src/__tests__/dsp/Oscillator.test.ts
git commit -m "feat: add DSP Oscillator (sine, sawtooth, square, triangle)"
```

---

## Task 8: DSP — ADSR

**Files:**
- Create: `src/dsp/ADSR.ts`
- Create: `src/__tests__/dsp/ADSR.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/dsp/ADSR.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { ADSR } from '@dsp/ADSR'

const SR = 44100

describe('ADSR', () => {
  it('is silent before noteOn', () => {
    const env = new ADSR(SR, { attack: 0.01, decay: 0.01, sustain: 0.5, release: 0.1 })
    const buf = new Float32Array(128)
    env.process(buf)
    expect(buf.every(s => s === 0)).toBe(true)
  })

  it('isActive is false before noteOn', () => {
    const env = new ADSR(SR, { attack: 0.01, decay: 0.01, sustain: 0.5, release: 0.1 })
    expect(env.isActive).toBe(false)
  })

  it('reaches 1.0 after attack completes', () => {
    const attackSec = 0.01
    const env = new ADSR(SR, { attack: attackSec, decay: 0.1, sustain: 0.5, release: 0.1 })
    env.noteOn()
    const attackSamples = Math.ceil(attackSec * SR)
    const buf = new Float32Array(attackSamples + 10)
    env.process(buf)
    expect(buf[attackSamples - 1]).toBeCloseTo(1, 1)
  })

  it('decays to sustain level after attack + decay', () => {
    const sustainLevel = 0.6
    const env = new ADSR(SR, { attack: 0.001, decay: 0.01, sustain: sustainLevel, release: 0.1 })
    env.noteOn()
    const totalSamples = Math.ceil((0.001 + 0.01) * SR) + 100
    const buf = new Float32Array(totalSamples)
    env.process(buf)
    expect(buf[totalSamples - 1]).toBeCloseTo(sustainLevel, 1)
  })

  it('falls to 0 after noteOff + release', () => {
    const env = new ADSR(SR, { attack: 0.001, decay: 0.001, sustain: 0.8, release: 0.01 })
    env.noteOn()
    const preBuf = new Float32Array(Math.ceil(0.005 * SR))
    env.process(preBuf)
    env.noteOff()
    const releaseSamples = Math.ceil(0.01 * SR) + 100
    const buf = new Float32Array(releaseSamples)
    env.process(buf)
    expect(buf[releaseSamples - 1]).toBeCloseTo(0, 2)
  })

  it('isActive becomes false after release completes', () => {
    const env = new ADSR(SR, { attack: 0.001, decay: 0.001, sustain: 0.5, release: 0.01 })
    env.noteOn()
    const preBuf = new Float32Array(Math.ceil(0.003 * SR))
    env.process(preBuf)
    env.noteOff()
    const buf = new Float32Array(Math.ceil(0.02 * SR))
    env.process(buf)
    expect(env.isActive).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/dsp/ADSR.test.ts
```

Expected: FAIL — `Cannot find module '@dsp/ADSR'`

- [ ] **Step 3: Implement ADSR.ts**

Create `src/dsp/ADSR.ts`:

```typescript
export interface ADSRParams {
  attack: number   // seconds
  decay: number    // seconds
  sustain: number  // 0–1 linear gain
  release: number  // seconds
}

type Stage = 'idle' | 'attack' | 'decay' | 'sustain' | 'release'

export class ADSR {
  private stage: Stage = 'idle'
  private level = 0
  private progress = 0
  private releaseStartLevel = 0

  constructor(private readonly sampleRate: number, private params: ADSRParams) {}

  setParams(params: ADSRParams): void {
    this.params = params
  }

  noteOn(): void {
    this.stage = 'attack'
    this.progress = 0
  }

  noteOff(): void {
    if (this.stage !== 'idle') {
      this.releaseStartLevel = this.level
      this.stage = 'release'
      this.progress = 0
    }
  }

  get isActive(): boolean {
    return this.stage !== 'idle'
  }

  process(output: Float32Array): void {
    for (let i = 0; i < output.length; i++) {
      output[i] = this.tick()
    }
  }

  private tick(): number {
    const { attack, decay, sustain, release } = this.params

    switch (this.stage) {
      case 'idle':
        return 0

      case 'attack': {
        const total = Math.max(1, attack * this.sampleRate)
        this.level = this.progress / total
        if (++this.progress >= total) {
          this.level = 1
          this.stage = 'decay'
          this.progress = 0
        }
        return this.level
      }

      case 'decay': {
        const total = Math.max(1, decay * this.sampleRate)
        this.level = 1 - (this.progress / total) * (1 - sustain)
        if (++this.progress >= total) {
          this.level = sustain
          this.stage = 'sustain'
          this.progress = 0
        }
        return this.level
      }

      case 'sustain':
        this.level = sustain
        return sustain

      case 'release': {
        const total = Math.max(1, release * this.sampleRate)
        this.level = this.releaseStartLevel * (1 - this.progress / total)
        if (++this.progress >= total) {
          this.level = 0
          this.stage = 'idle'
        }
        return this.level
      }
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/dsp/ADSR.test.ts
```

Expected: PASS — 6 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/dsp/ADSR.ts src/__tests__/dsp/ADSR.test.ts
git commit -m "feat: add DSP ADSR envelope generator"
```

---

## Task 9: DSP — BiquadFilter

**Files:**
- Create: `src/dsp/BiquadFilter.ts`
- Create: `src/__tests__/dsp/BiquadFilter.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/dsp/BiquadFilter.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { BiquadFilter } from '@dsp/BiquadFilter'

const SR = 44100

function dcSignal(len: number): Float32Array {
  return new Float32Array(len).fill(1)
}

function sineSignal(freq: number, len: number): Float32Array {
  const buf = new Float32Array(len)
  for (let i = 0; i < len; i++) buf[i] = Math.sin(2 * Math.PI * freq * i / SR)
  return buf
}

function rms(buf: Float32Array): number {
  let sum = 0
  for (const s of buf) sum += s * s
  return Math.sqrt(sum / buf.length)
}

describe('BiquadFilter', () => {
  it('lowpass: passes DC signal (attenuates less than 6dB vs passthrough)', () => {
    const filter = new BiquadFilter(SR)
    filter.setType('lowpass')
    filter.setCutoff(10000)
    filter.setQ(0.707)
    const input = dcSignal(1024)
    const output = new Float32Array(1024)
    filter.process(input, output)
    // After settling, output should be close to 1
    const tail = output.slice(512)
    expect(rms(tail)).toBeGreaterThan(0.9)
  })

  it('highpass: attenuates DC (near-zero output after settling)', () => {
    const filter = new BiquadFilter(SR)
    filter.setType('highpass')
    filter.setCutoff(1000)
    filter.setQ(0.707)
    const input = dcSignal(4096)
    const output = new Float32Array(4096)
    filter.process(input, output)
    const tail = output.slice(2048)
    expect(rms(tail)).toBeLessThan(0.01)
  })

  it('lowpass: attenuates high-frequency signal above cutoff', () => {
    const filter = new BiquadFilter(SR)
    filter.setType('lowpass')
    filter.setCutoff(500)
    filter.setQ(0.707)
    const input = sineSignal(5000, 4096)   // 5kHz >> 500Hz cutoff
    const output = new Float32Array(4096)
    filter.process(input, output)
    const inputRms = rms(input.slice(1024))
    const outputRms = rms(output.slice(1024))
    expect(outputRms).toBeLessThan(inputRms * 0.1)
  })

  it('reset() clears filter memory', () => {
    const filter = new BiquadFilter(SR)
    filter.setType('lowpass')
    filter.setCutoff(1000)
    const input = sineSignal(440, 256)
    const out1 = new Float32Array(256)
    filter.process(input, out1)
    filter.reset()
    const out2 = new Float32Array(256)
    filter.process(input, out2)
    // After reset, outputs should match (same starting state)
    expect(out1[0]).toBeCloseTo(out2[0], 5)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/dsp/BiquadFilter.test.ts
```

Expected: FAIL — `Cannot find module '@dsp/BiquadFilter'`

- [ ] **Step 3: Implement BiquadFilter.ts**

Create `src/dsp/BiquadFilter.ts`:

```typescript
export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch'

export class BiquadFilter {
  private b0 = 1; private b1 = 0; private b2 = 0
  private a1 = 0; private a2 = 0
  private x1 = 0; private x2 = 0
  private y1 = 0; private y2 = 0

  private type: FilterType = 'lowpass'
  private cutoff = 1000
  private q = 0.707

  constructor(private readonly sampleRate: number) {
    this.updateCoefficients()
  }

  setType(type: FilterType): void { this.type = type; this.updateCoefficients() }
  setCutoff(hz: number): void { this.cutoff = hz; this.updateCoefficients() }
  setQ(q: number): void { this.q = q; this.updateCoefficients() }

  process(input: Float32Array, output: Float32Array): void {
    for (let i = 0; i < input.length; i++) {
      const x = input[i]
      const y =
        this.b0 * x +
        this.b1 * this.x1 +
        this.b2 * this.x2 -
        this.a1 * this.y1 -
        this.a2 * this.y2
      this.x2 = this.x1; this.x1 = x
      this.y2 = this.y1; this.y1 = y
      output[i] = y
    }
  }

  reset(): void {
    this.x1 = 0; this.x2 = 0
    this.y1 = 0; this.y2 = 0
  }

  private updateCoefficients(): void {
    const w0 = (2 * Math.PI * this.cutoff) / this.sampleRate
    const sinW0 = Math.sin(w0)
    const cosW0 = Math.cos(w0)
    const alpha = sinW0 / (2 * this.q)

    let b0: number, b1: number, b2: number
    let a0: number, a1: number, a2: number

    switch (this.type) {
      case 'lowpass':
        b0 = (1 - cosW0) / 2; b1 = 1 - cosW0;  b2 = (1 - cosW0) / 2
        a0 = 1 + alpha;       a1 = -2 * cosW0;  a2 = 1 - alpha
        break
      case 'highpass':
        b0 = (1 + cosW0) / 2; b1 = -(1 + cosW0); b2 = (1 + cosW0) / 2
        a0 = 1 + alpha;       a1 = -2 * cosW0;   a2 = 1 - alpha
        break
      case 'bandpass':
        b0 = sinW0 / 2; b1 = 0; b2 = -sinW0 / 2
        a0 = 1 + alpha; a1 = -2 * cosW0; a2 = 1 - alpha
        break
      case 'notch':
        b0 = 1; b1 = -2 * cosW0; b2 = 1
        a0 = 1 + alpha; a1 = -2 * cosW0; a2 = 1 - alpha
        break
    }

    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0
    this.a1 = a1 / a0; this.a2 = a2 / a0
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/dsp/BiquadFilter.test.ts
```

Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/dsp/BiquadFilter.ts src/__tests__/dsp/BiquadFilter.test.ts
git commit -m "feat: add DSP BiquadFilter (lowpass, highpass, bandpass, notch)"
```

---

## Task 10: DSP — RMS

**Files:**
- Create: `src/dsp/RMS.ts`
- Create: `src/__tests__/dsp/RMS.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/dsp/RMS.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { RMS } from '@dsp/RMS'

const SR = 44100

describe('RMS', () => {
  it('silence returns -Infinity dB', () => {
    const rms = new RMS(4096)
    const buf = new Float32Array(4096).fill(0)
    expect(rms.process(buf)).toBe(-Infinity)
  })

  it('full-scale sine RMS ≈ -3.01 dB after window fills', () => {
    const windowSize = 4096
    const rms = new RMS(windowSize)
    // Process two full windows to ensure it's settled
    for (let w = 0; w < 2; w++) {
      const buf = new Float32Array(windowSize)
      for (let i = 0; i < windowSize; i++) {
        buf[i] = Math.sin(2 * Math.PI * 440 * i / SR)
      }
      rms.process(buf)
    }
    const buf = new Float32Array(windowSize)
    for (let i = 0; i < windowSize; i++) {
      buf[i] = Math.sin(2 * Math.PI * 440 * i / SR)
    }
    const db = rms.process(buf)
    expect(db).toBeCloseTo(-3.01, 0)
  })

  it('full-scale DC returns 0 dB', () => {
    const rms = new RMS(1024)
    const buf = new Float32Array(1024).fill(1)
    const db = rms.process(buf)
    expect(db).toBeCloseTo(0, 1)
  })

  it('reset() clears the window', () => {
    const rms = new RMS(1024)
    const loud = new Float32Array(1024).fill(1)
    rms.process(loud)
    rms.reset()
    const silence = new Float32Array(1024).fill(0)
    expect(rms.process(silence)).toBe(-Infinity)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/dsp/RMS.test.ts
```

Expected: FAIL — `Cannot find module '@dsp/RMS'`

- [ ] **Step 3: Implement RMS.ts**

Create `src/dsp/RMS.ts`:

```typescript
export class RMS {
  private readonly buffer: Float32Array
  private writePos = 0
  private sumOfSquares = 0

  constructor(private readonly windowSize: number) {
    this.buffer = new Float32Array(windowSize)
  }

  process(input: Float32Array): number {
    for (const sample of input) {
      const old = this.buffer[this.writePos]
      this.sumOfSquares += sample * sample - old * old
      this.buffer[this.writePos] = sample
      this.writePos = (this.writePos + 1) % this.windowSize
    }
    const rms = Math.sqrt(Math.max(0, this.sumOfSquares / this.windowSize))
    return rms < 1e-10 ? -Infinity : 20 * Math.log10(rms)
  }

  reset(): void {
    this.buffer.fill(0)
    this.writePos = 0
    this.sumOfSquares = 0
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/dsp/RMS.test.ts
```

Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/dsp/RMS.ts src/__tests__/dsp/RMS.test.ts
git commit -m "feat: add DSP RMS level meter with rolling window"
```

---

## Task 11: DSP — FFT

**Files:**
- Create: `src/dsp/FFT.ts`
- Create: `src/__tests__/dsp/FFT.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/dsp/FFT.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { FFT } from '@dsp/FFT'

describe('FFT', () => {
  it('throws if size is not a power of 2', () => {
    expect(() => new FFT(100)).toThrow('power of 2')
  })

  it('returns magnitude array of size N/2', () => {
    const fft = new FFT(1024)
    const input = new Float32Array(1024)
    const output = fft.forward(input)
    expect(output.length).toBe(512)
  })

  it('silence produces all-zero magnitudes', () => {
    const fft = new FFT(1024)
    const input = new Float32Array(1024).fill(0)
    const output = fft.forward(input)
    expect(output.every(v => v === 0)).toBe(true)
  })

  it('pure sine at bin k has peak at bin k', () => {
    const N = 1024
    const k = 10  // target bin
    const fft = new FFT(N)
    const input = new Float32Array(N)
    // Synthesise exactly k cycles in N samples → peak at bin k
    for (let i = 0; i < N; i++) {
      input[i] = Math.cos(2 * Math.PI * k * i / N)
    }
    const output = fft.forward(input)
    const peakBin = output.reduce((best, v, i) => (v > output[best] ? i : best), 0)
    expect(peakBin).toBe(k)
  })

  it('throws if input length does not match FFT size', () => {
    const fft = new FFT(1024)
    expect(() => fft.forward(new Float32Array(512))).toThrow('1024')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/dsp/FFT.test.ts
```

Expected: FAIL — `Cannot find module '@dsp/FFT'`

- [ ] **Step 3: Implement FFT.ts**

Create `src/dsp/FFT.ts`:

```typescript
export class FFT {
  private readonly cosTable: Float32Array
  private readonly sinTable: Float32Array

  constructor(private readonly size: number) {
    if (size <= 0 || (size & (size - 1)) !== 0) {
      throw new Error(`FFT size must be a power of 2, got ${size}`)
    }
    this.cosTable = new Float32Array(size / 2)
    this.sinTable = new Float32Array(size / 2)
    for (let i = 0; i < size / 2; i++) {
      this.cosTable[i] = Math.cos((-2 * Math.PI * i) / size)
      this.sinTable[i] = Math.sin((-2 * Math.PI * i) / size)
    }
  }

  forward(input: Float32Array): Float32Array {
    const n = this.size
    if (input.length !== n) {
      throw new Error(`Input must have ${n} samples, got ${input.length}`)
    }

    const real = new Float32Array(input)
    const imag = new Float32Array(n)

    // Bit-reversal permutation
    let j = 0
    for (let i = 1; i < n; i++) {
      let bit = n >> 1
      for (; j & bit; bit >>= 1) j ^= bit
      j ^= bit
      if (i < j) {
        ;[real[i], real[j]] = [real[j], real[i]]
        ;[imag[i], imag[j]] = [imag[j], imag[i]]
      }
    }

    // Cooley-Tukey iterative FFT
    for (let len = 2; len <= n; len <<= 1) {
      const half = len >> 1
      const step = n / len
      for (let i = 0; i < n; i += len) {
        for (let k = 0; k < half; k++) {
          const idx = k * step
          const tr = this.cosTable[idx] * real[i + k + half] - this.sinTable[idx] * imag[i + k + half]
          const ti = this.cosTable[idx] * imag[i + k + half] + this.sinTable[idx] * real[i + k + half]
          real[i + k + half] = real[i + k] - tr
          imag[i + k + half] = imag[i + k] - ti
          real[i + k] += tr
          imag[i + k] += ti
        }
      }
    }

    // Magnitude spectrum — first N/2 bins, normalised by N/2
    const magnitude = new Float32Array(n / 2)
    const norm = n / 2
    for (let i = 0; i < n / 2; i++) {
      magnitude[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]) / norm
    }
    return magnitude
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/dsp/FFT.test.ts
```

Expected: PASS — 5 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/dsp/FFT.ts src/__tests__/dsp/FFT.test.ts
git commit -m "feat: add DSP FFT (Cooley-Tukey, returns magnitude spectrum)"
```

---

## Task 12: DSP AudioWorklet Processor

**Files:**
- Create: `public/worklets/dsp-processor.js`

- [ ] **Step 1: Create the DSP processor worklet**

This worklet runs Oscillator + BiquadFilter in the audio thread. It accepts messages to configure parameters and responds to a `ping` for testing.

Create `public/worklets/dsp-processor.js`:

```javascript
// Oscillator — matches src/dsp/Oscillator.ts
class Oscillator {
  constructor(sampleRate) {
    this.sampleRate = sampleRate
    this.phase = 0
    this.phaseIncrement = 0
    this.type = 'sine'
  }
  setFrequency(hz) { this.phaseIncrement = (2 * Math.PI * hz) / this.sampleRate }
  setType(type) { this.type = type }
  process(output) {
    for (let i = 0; i < output.length; i++) {
      let s
      const p = this.phase
      switch (this.type) {
        case 'sine':     s = Math.sin(p); break
        case 'sawtooth': s = (p / Math.PI) - 1; break
        case 'square':   s = p < Math.PI ? 1 : -1; break
        case 'triangle': s = p < Math.PI ? (2 * p / Math.PI) - 1 : 3 - (2 * p / Math.PI); break
        default:         s = 0
      }
      output[i] = s
      this.phase += this.phaseIncrement
      if (this.phase >= 2 * Math.PI) this.phase -= 2 * Math.PI
    }
  }
}

// BiquadFilter — matches src/dsp/BiquadFilter.ts
class BiquadFilter {
  constructor(sampleRate) {
    this.sampleRate = sampleRate
    this.b0 = 1; this.b1 = 0; this.b2 = 0
    this.a1 = 0; this.a2 = 0
    this.x1 = 0; this.x2 = 0; this.y1 = 0; this.y2 = 0
    this.type = 'lowpass'; this.cutoff = 1000; this.q = 0.707
    this._update()
  }
  setType(t) { this.type = t; this._update() }
  setCutoff(hz) { this.cutoff = hz; this._update() }
  setQ(q) { this.q = q; this._update() }
  process(input, output) {
    for (let i = 0; i < input.length; i++) {
      const x = input[i]
      const y = this.b0*x + this.b1*this.x1 + this.b2*this.x2 - this.a1*this.y1 - this.a2*this.y2
      this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y
      output[i] = y
    }
  }
  _update() {
    const w0 = 2 * Math.PI * this.cutoff / this.sampleRate
    const sin = Math.sin(w0), cos = Math.cos(w0), alpha = sin / (2 * this.q)
    let b0, b1, b2, a0, a1, a2
    switch (this.type) {
      case 'lowpass':  b0=(1-cos)/2; b1=1-cos; b2=(1-cos)/2; a0=1+alpha; a1=-2*cos; a2=1-alpha; break
      case 'highpass': b0=(1+cos)/2; b1=-(1+cos); b2=(1+cos)/2; a0=1+alpha; a1=-2*cos; a2=1-alpha; break
      case 'bandpass': b0=sin/2; b1=0; b2=-sin/2; a0=1+alpha; a1=-2*cos; a2=1-alpha; break
      case 'notch':    b0=1; b1=-2*cos; b2=1; a0=1+alpha; a1=-2*cos; a2=1-alpha; break
      default:         b0=1; b1=0; b2=0; a0=1; a1=0; a2=0
    }
    this.b0=b0/a0; this.b1=b1/a0; this.b2=b2/a0; this.a1=a1/a0; this.a2=a2/a0
  }
}

class DspProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.osc = new Oscillator(sampleRate)
    this.filter = new BiquadFilter(sampleRate)
    this.osc.setFrequency(440)

    this.port.onmessage = (e) => {
      const { type, value } = e.data
      switch (type) {
        case 'ping':
          this.port.postMessage({ type: 'pong' })
          break
        case 'setFrequency':
          this.osc.setFrequency(value)
          break
        case 'setWaveType':
          this.osc.setType(value)
          break
        case 'setFilterCutoff':
          this.filter.setCutoff(value)
          break
        case 'setFilterQ':
          this.filter.setQ(value)
          break
        case 'setFilterType':
          this.filter.setType(value)
          break
      }
    }
  }

  process(inputs, outputs) {
    const output = outputs[0]
    if (!output || !output[0]) return true
    const ch = output[0]
    const osc = new Float32Array(ch.length)
    this.osc.process(osc)
    this.filter.process(osc, ch)
    // Mono to all channels
    for (let c = 1; c < output.length; c++) output[c].set(ch)
    return true
  }
}

registerProcessor('dsp-processor', DspProcessor)
```

- [ ] **Step 2: Verify dsp-processor.js is served correctly**

```bash
npm run dev
```

Open Chrome DevTools console and run:

```javascript
const ctx = new AudioContext()
await ctx.audioWorklet.addModule('/slam-og-studio/worklets/dsp-processor.js')
const node = new AudioWorkletNode(ctx, 'dsp-processor')
node.connect(ctx.destination)

// Test ping/pong
node.port.onmessage = (e) => console.log('Response:', e.data)
node.port.postMessage({ type: 'ping' })
// Expected console output: Response: { type: 'pong' }
```

- [ ] **Step 3: Run full test suite to confirm no regressions**

```bash
npx vitest run
```

Expected: all tests passing.

- [ ] **Step 4: Commit**

```bash
git add public/worklets/dsp-processor.js
git commit -m "feat: add DSP AudioWorklet processor with Oscillator + BiquadFilter"
```

---

## Phase 2 Complete — Verification Checklist

Before declaring Phase 2 done, confirm all of the following:

- [ ] `npx vitest run` — all tests pass with no failures
- [ ] `npm run dev` — app loads at `http://localhost:3021/slam-og-studio/` with no console errors
- [ ] Pressing Play produces audio from both test tracks
- [ ] Changing BPM (via Transport UI) updates tempo without crashing
- [ ] Muting a track silences it; unmuting restores it
- [ ] DevTools console confirms `dsp-processor` responds to `ping` with `pong`
- [ ] `npm run build` — production build completes with no TypeScript errors

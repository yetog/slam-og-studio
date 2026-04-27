# Phase 2: Audio Engine Design

**Date:** 2026-04-27
**Project:** SLAM OG Studio
**Status:** Approved

---

## Overview

Phase 2 gets audio playing end-to-end in the browser, then lays the DSP foundation for instruments and effects. It is split into two sequential sub-phases:

- **Phase 2A** — Engine verification: fix blocking stubs, add test project, prove audio plays
- **Phase 2B** — DSP utilities: five pure-TypeScript modules for instruments and effects to build on

AudioWorklet support spans both — registered during engine init, with a second processor wired to DSP utilities by end of Phase 2B.

---

## Phase 2A: Engine Verification

### 1. `adjustBpm` Implementation

`Engine.ts:539` currently throws `not implemented`. Fix:

- Recalculate the `LocationToTime` converter with the new BPM
- Update `_loopStartTime`, `_loopEndTime`, and `_endTime` to match
- If playing, recompute `_timeOffset = context.currentTime - newCurrentTime` where `newCurrentTime` is the current position converted using the updated tempo, so in-flight audio regions are not rescheduled mid-playback

This is the most complex fix in Phase 2A. BPM change must not interrupt ongoing playback.

### 2. Mute/Solo Stubs

`handleTrackEvent` has empty cases for `Muted`, `Soloed`, `EffectsChainChanged`.

- **Mute:** Set `track.enabled = false/true`. Already implemented on `AudioTrack` — just needs to be called from the event handler.
- **Solo:** Track which tracks are soloed at the project level; mute all non-soloed tracks. A proper solo bus comes in Phase 4 with the Mixer — for now, basic exclusive solo is sufficient.
- **EffectsChain:** Defer to Phase 3 when effects have actual audio nodes.

### 3. Test Project & Audio Files

The engine has no default content to play. Add:

- `public/test-audio/sine-440hz.wav` — pure tone for timing verification
- `public/test-audio/drums.wav` — drum loop for rhythm/loop testing
- Update `public/templates/default-project.json` to reference these files so the app opens with playable content

### 4. AudioWorklet Bootstrap

Register a base worklet in `Engine.initialize()` alongside the existing metronome setup:

```typescript
await context.audioWorklet.addModule('/worklets/base-processor.js')
```

`public/worklets/base-processor.js` — minimal passthrough `AudioWorkletProcessor`, no DSP logic. Proves the worklet pipeline loads. The vite.config cross-origin headers already handle `SharedArrayBuffer`.

### Phase 2A Done When

- `npm run dev` launches, default project loads, pressing Play produces audio
- BPM slider changes tempo without crashing or glitching
- Mute/unmute a track silences and restores it
- AudioWorklet loads without console errors

---

## Phase 2B: DSP Utilities

All five modules live in `src/dsp/`. Pure TypeScript — no `AudioContext`, no React, no side effects. Each exports a class or function only.

### 1. `Oscillator.ts`

Generates waveform samples at a given frequency and sample rate.

```typescript
type WaveType = 'sine' | 'sawtooth' | 'square' | 'triangle'

class Oscillator {
  constructor(sampleRate: number)
  setFrequency(hz: number): void
  setType(type: WaveType): void
  process(output: Float32Array): void  // fills buffer in place
}
```

Used by: Analog synth (Phase 3).

### 2. `ADSR.ts`

Attack/Decay/Sustain/Release envelope generator.

```typescript
interface ADSRParams {
  attack: number   // seconds
  decay: number    // seconds
  sustain: number  // 0–1 linear gain
  release: number  // seconds
}

class ADSR {
  constructor(sampleRate: number, params: ADSRParams)
  noteOn(): void
  noteOff(): void
  process(output: Float32Array): void  // fills with gain multiplier 0–1
  get isActive(): boolean
}
```

Used by: all instruments (Phase 3).

### 3. `BiquadFilter.ts`

Sample-level biquad filter — separate from Web Audio's `BiquadFilterNode`, needed inside AudioWorklets where node-level control isn't available.

```typescript
type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch'

class BiquadFilter {
  constructor(sampleRate: number)
  setType(type: FilterType): void
  setCutoff(hz: number): void
  setQ(q: number): void
  process(input: Float32Array, output: Float32Array): void
}
```

Used by: Analog synth filter section (Phase 3), EQ effect (Phase 3).

### 4. `RMS.ts`

Root Mean Square level measurement over a rolling window.

```typescript
class RMS {
  constructor(windowSize: number)  // samples, e.g. 4096 for ~100ms at 44.1kHz
  process(input: Float32Array): number  // returns dB value
}
```

Used by: Mixer VU meters (Phase 4), AI mix analyzer (Phase 5).

### 5. `FFT.ts`

Fast Fourier Transform for spectrum analysis. Lowest priority in Phase 2B — can be added after the first four are done.

```typescript
class FFT {
  constructor(size: number)  // must be power of 2
  forward(input: Float32Array): Float32Array  // returns magnitude spectrum
}
```

Used by: spectrum analyzer display (Phase 4), AI mix analyzer (Phase 5).

### Phase 2B Done When

- All five modules exist in `src/dsp/` and compile
- `dsp-processor.js` worklet loads the Oscillator + BiquadFilter and responds to a ping message
- No browser dependencies in any DSP file (verifiable by grepping for `AudioContext`, `document`, `window`)

---

## What Is Explicitly Out of Scope for Phase 2

- Implementing effect audio nodes (Delay, Reverb, EQ, Compressor) — Phase 3
- Fleshing out instruments (Analog, Drums) — Phase 3
- Piano Roll, Mixer VU meters, waveform display — Phase 4
- AI integration — Phase 5
- `DelayLine.ts` and `Noise.ts` DSP primitives — added in Phase 3 when effects need them

---

## File Inventory

### New files
```
public/test-audio/sine-440hz.wav
public/test-audio/drums.wav
public/worklets/base-processor.js
public/worklets/dsp-processor.js
src/dsp/Oscillator.ts
src/dsp/ADSR.ts
src/dsp/BiquadFilter.ts
src/dsp/RMS.ts
src/dsp/FFT.ts
```

### Modified files
```
src/core/Engine.ts         — adjustBpm, handleTrackEvent mute/solo, worklet init
public/templates/default-project.json  — reference test audio files
```

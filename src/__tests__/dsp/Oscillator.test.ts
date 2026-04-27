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

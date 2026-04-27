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

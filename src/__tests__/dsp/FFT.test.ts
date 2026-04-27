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

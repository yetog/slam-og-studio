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

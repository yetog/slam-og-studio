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

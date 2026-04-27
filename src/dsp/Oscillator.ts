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

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

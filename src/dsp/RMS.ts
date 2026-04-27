export class RMS {
  private readonly buffer: Float32Array
  private writePos = 0
  private sumOfSquares = 0

  constructor(private readonly windowSize: number) {
    if (windowSize <= 0) throw new RangeError(`windowSize must be > 0, got ${windowSize}`)
    this.buffer = new Float32Array(windowSize)
  }

  process(input: Float32Array): number {
    for (const sample of input) {
      const old = this.buffer[this.writePos]
      this.sumOfSquares += sample * sample - old * old
      this.buffer[this.writePos] = sample
      this.writePos = (this.writePos + 1) % this.windowSize
    }
    // Periodic full recompute every window revolution to bound floating-point drift
    if (this.writePos === 0) {
      this.sumOfSquares = 0
      for (let i = 0; i < this.windowSize; i++) {
        this.sumOfSquares += this.buffer[i] * this.buffer[i]
      }
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

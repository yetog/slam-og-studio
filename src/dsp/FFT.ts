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

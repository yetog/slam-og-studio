export interface ADSRParams {
  attack: number   // seconds
  decay: number    // seconds
  sustain: number  // 0–1 linear gain
  release: number  // seconds
}

type Stage = 'idle' | 'attack' | 'decay' | 'sustain' | 'release'

export class ADSR {
  private stage: Stage = 'idle'
  private level = 0
  private progress = 0
  private releaseStartLevel = 0

  constructor(private readonly sampleRate: number, private params: ADSRParams) {}

  setParams(params: ADSRParams): void {
    this.params = params
  }

  noteOn(): void {
    this.stage = 'attack'
    this.progress = 0
  }

  noteOff(): void {
    if (this.stage !== 'idle') {
      this.releaseStartLevel = this.level
      this.stage = 'release'
      this.progress = 0
    }
  }

  get isActive(): boolean {
    return this.stage !== 'idle'
  }

  process(output: Float32Array): void {
    for (let i = 0; i < output.length; i++) {
      output[i] = this.tick()
    }
  }

  private tick(): number {
    const { attack, decay, sustain, release } = this.params

    switch (this.stage) {
      case 'idle':
        return 0

      case 'attack': {
        const total = Math.max(1, attack * this.sampleRate)
        this.level = this.progress / total
        if (++this.progress >= total) {
          this.level = 1
          this.stage = 'decay'
          this.progress = 0
        }
        return this.level
      }

      case 'decay': {
        const total = Math.max(1, decay * this.sampleRate)
        this.level = 1 - (this.progress / total) * (1 - sustain)
        if (++this.progress >= total) {
          this.level = sustain
          this.stage = 'sustain'
          this.progress = 0
        }
        return this.level
      }

      case 'sustain':
        this.level = sustain
        return sustain

      case 'release': {
        const total = Math.max(1, release * this.sampleRate)
        this.level = this.releaseStartLevel * (1 - this.progress / total)
        if (++this.progress >= total) {
          this.level = 0
          this.stage = 'idle'
        }
        return this.level
      }
    }
  }
}

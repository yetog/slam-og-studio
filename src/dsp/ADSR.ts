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
  private attackStartLevel = 0
  private attackTotal = 1
  private decayTotal = 1
  private releaseTotal = 1

  constructor(private readonly sampleRate: number, private params: ADSRParams) {}

  setParams(params: ADSRParams): void {
    this.params = params
  }

  noteOn(): void {
    this.attackTotal = Math.max(1, this.params.attack * this.sampleRate)
    this.decayTotal  = Math.max(1, this.params.decay  * this.sampleRate)
    this.attackStartLevel = this.level  // capture for smooth retrigger
    this.stage = 'attack'
    this.progress = 0
  }

  noteOff(): void {
    if (this.stage !== 'idle') {
      // Re-triggering noteOff during release restarts release from current level
      this.releaseTotal = Math.max(1, this.params.release * this.sampleRate)
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
    switch (this.stage) {
      case 'idle':
        return 0

      case 'attack': {
        const t = this.progress / this.attackTotal
        this.level = this.attackStartLevel + (1 - this.attackStartLevel) * t
        if (++this.progress >= this.attackTotal) {
          this.level = 1
          this.stage = 'decay'
          this.progress = 0
        }
        return this.level
      }

      case 'decay': {
        const sustain = this.params.sustain
        this.level = 1 - (this.progress / this.decayTotal) * (1 - sustain)
        if (++this.progress >= this.decayTotal) {
          this.level = sustain
          this.stage = 'sustain'
          this.progress = 0
        }
        return this.level
      }

      case 'sustain': {
        const sustain = this.params.sustain
        this.level = sustain
        return sustain
      }

      case 'release': {
        this.level = this.releaseStartLevel * (1 - this.progress / this.releaseTotal)
        if (++this.progress >= this.releaseTotal) {
          this.level = 0
          this.stage = 'idle'
        }
        return this.level
      }
    }
  }
}

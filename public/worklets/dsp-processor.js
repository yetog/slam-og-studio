// Oscillator — matches src/dsp/Oscillator.ts
class Oscillator {
  constructor(sampleRate) {
    this.sampleRate = sampleRate
    this.phase = 0
    this.phaseIncrement = 0
    this.type = 'sine'
  }
  setFrequency(hz) { this.phaseIncrement = (2 * Math.PI * hz) / this.sampleRate }
  setType(type) { this.type = type }
  process(output) {
    for (let i = 0; i < output.length; i++) {
      let s
      const p = this.phase
      switch (this.type) {
        case 'sine':     s = Math.sin(p); break
        case 'sawtooth': s = (p / Math.PI) - 1; break
        case 'square':   s = p < Math.PI ? 1 : -1; break
        case 'triangle': s = p < Math.PI ? (2 * p / Math.PI) - 1 : 3 - (2 * p / Math.PI); break
        default:         s = 0
      }
      output[i] = s
      this.phase += this.phaseIncrement
      if (this.phase >= 2 * Math.PI) this.phase -= 2 * Math.PI
    }
  }
}

// BiquadFilter — matches src/dsp/BiquadFilter.ts
class BiquadFilter {
  constructor(sampleRate) {
    this.sampleRate = sampleRate
    this.b0 = 1; this.b1 = 0; this.b2 = 0
    this.a1 = 0; this.a2 = 0
    this.x1 = 0; this.x2 = 0; this.y1 = 0; this.y2 = 0
    this.type = 'lowpass'; this.cutoff = 1000; this.q = 0.707
    this._update()
  }
  setType(t) { this.type = t; this._update() }
  setCutoff(hz) { this.cutoff = Math.max(1, Math.min(hz, this.sampleRate / 2 - 1)); this._update() }
  setQ(q) { this.q = Math.max(0.0001, q); this._update() }
  process(input, output) {
    for (let i = 0; i < input.length; i++) {
      const x = input[i]
      const y = this.b0*x + this.b1*this.x1 + this.b2*this.x2 - this.a1*this.y1 - this.a2*this.y2
      this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y
      output[i] = y
    }
  }
  _update() {
    const w0 = 2 * Math.PI * this.cutoff / this.sampleRate
    const sin = Math.sin(w0), cos = Math.cos(w0), alpha = sin / (2 * this.q)
    let b0, b1, b2, a0, a1, a2
    switch (this.type) {
      case 'lowpass':  b0=(1-cos)/2; b1=1-cos; b2=(1-cos)/2; a0=1+alpha; a1=-2*cos; a2=1-alpha; break
      case 'highpass': b0=(1+cos)/2; b1=-(1+cos); b2=(1+cos)/2; a0=1+alpha; a1=-2*cos; a2=1-alpha; break
      case 'bandpass': b0=sin/2; b1=0; b2=-sin/2; a0=1+alpha; a1=-2*cos; a2=1-alpha; break
      case 'notch':    b0=1; b1=-2*cos; b2=1; a0=1+alpha; a1=-2*cos; a2=1-alpha; break
      default:         b0=1; b1=0; b2=0; a0=1; a1=0; a2=0
    }
    this.b0=b0/a0; this.b1=b1/a0; this.b2=b2/a0; this.a1=a1/a0; this.a2=a2/a0
  }
}

class DspProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.osc = new Oscillator(sampleRate)
    this.filter = new BiquadFilter(sampleRate)
    this._oscBuf = new Float32Array(128)  // pre-allocated; avoids GC in audio thread
    this.osc.setFrequency(440)

    this.port.onmessage = (e) => {
      const { type, value } = e.data
      switch (type) {
        case 'ping':
          this.port.postMessage({ type: 'pong' })
          break
        case 'setFrequency':
          this.osc.setFrequency(value)
          break
        case 'setWaveType':
          this.osc.setType(value)
          break
        case 'setFilterCutoff':
          this.filter.setCutoff(value)
          break
        case 'setFilterQ':
          this.filter.setQ(value)
          break
        case 'setFilterType':
          this.filter.setType(value)
          break
      }
    }
  }

  process(inputs, outputs) {
    const output = outputs[0]
    if (!output || !output[0]) return true
    const ch = output[0]
    const buf = ch.length <= 128 ? this._oscBuf : new Float32Array(ch.length)
    this.osc.process(buf.subarray(0, ch.length))
    this.filter.process(buf.subarray(0, ch.length), ch)
    // Copy mono output to all channels
    for (let c = 1; c < output.length; c++) output[c].set(ch)
    return true
  }
}

registerProcessor('dsp-processor', DspProcessor)

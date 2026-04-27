class BaseProcessor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    const input = inputs[0]
    const output = outputs[0]
    for (let ch = 0; ch < output.length; ch++) {
      const src = input[ch]
      if (src) {
        output[ch].set(src)
      } else {
        output[ch].fill(0)
      }
    }
    return true
  }
}

registerProcessor('base-processor', BaseProcessor)

import { writeFileSync, mkdirSync } from 'fs'

function generateSineWav(frequency, durationSec, sampleRate = 44100) {
  const numSamples = Math.floor(durationSec * sampleRate)
  const dataSize = numSamples * 2
  const buffer = Buffer.alloc(44 + dataSize)

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)           // PCM
  buffer.writeUInt16LE(1, 22)           // mono
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate)
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2)
  }
  return buffer
}

mkdirSync('public/test-audio', { recursive: true })
writeFileSync('public/test-audio/sine-440hz.wav', generateSineWav(440, 4))
writeFileSync('public/test-audio/beat-100hz.wav', generateSineWav(100, 4))
console.log('Generated public/test-audio/sine-440hz.wav (440 Hz, 4s)')
console.log('Generated public/test-audio/beat-100hz.wav (100 Hz, 4s)')

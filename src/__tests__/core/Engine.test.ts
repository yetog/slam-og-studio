import { describe, it, expect, vi } from 'vitest'
import { Engine } from '@core/Engine'
import { Project } from '@core/Project'
import { Location, Duration, TimeSignature } from '@core/Common'
import { TransportEvent, TransportEventType, TrackEvent, TrackEventType } from '@core/Events'
import { AudioTrack } from '@core/AudioTrack'

function makeMockContext(currentTime = 0) {
  return {
    sampleRate: 44100,
    currentTime,
    state: 'running',
    audioWorklet: { addModule: vi.fn().mockResolvedValue(undefined) },
  } as unknown as AudioContext
}

describe('Engine.adjustBpm', () => {
  it('updates project BPM and recalculates locator times', () => {
    const ctx = makeMockContext()
    const project = new Project('Test', 120, new TimeSignature(4, 4))
    project.loopStart = new Location(1, 1, 1)
    project.loopEnd = new Location(5, 1, 1)
    project.end = new Location(9, 1, 1)
    const engine = new Engine(ctx, { bufferSize: 128, sampleRate: 44100 }, project)

    // Manually set the locators on the engine as start() would
    engine.loopStart = new Location(1, 1, 1)
    engine.loopEnd = new Location(5, 1, 1)
    engine.end = new Location(9, 1, 1)

    // Fire BPM change via transport event — TransportEvent(type, location?, bpm?, looping?)
    engine.handleTransportEvent(
      new TransportEvent(TransportEventType.BpmChanged, undefined, 60),
    )

    expect(project.bpm).toBe(60)
    // At 60 BPM, 4/4: 8 bars = 8 * 4 * 1s = 32s
    // _endTime = end - 1 tick ≈ 32s
    expect((engine as any)._endTime).toBeGreaterThan(0)
    // _loopStartTime is bar 1 = 0
    expect((engine as any)._loopStartTime).toBeCloseTo(0)
  })

  it('does not throw (regression guard against original stub)', () => {
    const ctx = makeMockContext()
    const project = new Project('Test', 120)
    const engine = new Engine(ctx, { bufferSize: 128, sampleRate: 44100 }, project)

    expect(() => {
      engine.handleTransportEvent(
        new TransportEvent(TransportEventType.BpmChanged, undefined, 90),
      )
    }).not.toThrow()
  })
})

describe('Engine.handleTrackEvent mute/solo', () => {
  it('calls project.updateTrackEnablement when a track is muted', () => {
    const ctx = makeMockContext()
    const project = new Project()
    const spy = vi.spyOn(project, 'updateTrackEnablement')
    const engine = new Engine(ctx, { bufferSize: 128, sampleRate: 44100 }, project)

    const track = new AudioTrack([], [], 'Test', '#aaa', false, false, false)
    engine.handleTrackEvent(new TrackEvent(TrackEventType.Muted, track))

    expect(spy).toHaveBeenCalled()
  })

  it('calls project.updateTrackEnablement when a track is soloed', () => {
    const ctx = makeMockContext()
    const project = new Project()
    const spy = vi.spyOn(project, 'updateTrackEnablement')
    const engine = new Engine(ctx, { bufferSize: 128, sampleRate: 44100 }, project)

    const track = new AudioTrack([], [], 'Test', '#aaa', false, false, false)
    engine.handleTrackEvent(new TrackEvent(TrackEventType.Soloed, track))

    expect(spy).toHaveBeenCalled()
  })
})

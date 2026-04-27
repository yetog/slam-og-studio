import { describe, it, expect } from 'vitest'
import { Project } from '@core/Project'
import { Location } from '@core/Common'

describe('Project.updateBpm', () => {
  it('recalculates locationToTime after BPM change', () => {
    const project = new Project('Test', 120)
    const bar2 = new Location(2, 1, 1)

    // At 120 BPM, 4/4: beatTime = 0.5s, bar = 4 beats = 2s
    expect(project.locationToTime.convertLocation(bar2)).toBeCloseTo(2.0)

    project.updateBpm(60)

    // At 60 BPM: beatTime = 1s, bar = 4 beats = 4s
    expect(project.locationToTime.convertLocation(bar2)).toBeCloseTo(4.0)
  })

  it('updates project.bpm field', () => {
    const project = new Project('Test', 120)
    project.updateBpm(90)
    expect(project.bpm).toBe(90)
  })

  it('round-trips time conversion after BPM change', () => {
    const project = new Project('Test', 120)
    project.updateBpm(140)
    const loc = new Location(3, 2, 1)
    const time = project.locationToTime.convertLocation(loc)
    const back = project.locationToTime.convertTime(time)
    expect(back.bar).toBe(loc.bar)
    expect(back.beat).toBe(loc.beat)
  })
})

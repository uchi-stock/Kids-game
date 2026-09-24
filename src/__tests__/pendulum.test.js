import { describe, expect, it } from 'vitest'
import { bobPosition, createPendulumState, smallAnglePeriod, stepPendulum } from '../sim/pendulum.js'

function simulatePeriod(length, mass, initialAngle, dt = 1 / 240, maxSeconds = 10) {
  let state = createPendulumState(initialAngle)
  let t = 0
  let previousAngle = state.angle
  let crossingCount = 0
  let firstCrossingTime = null
  let lastCrossingTime = null

  while (t < maxSeconds) {
    state = stepPendulum(state, { length, mass, dragCoefficient: 0 }, dt)
    t += dt
    // 角度0（鉛直）を横切った回数から半周期を測定する
    if (previousAngle > 0 !== state.angle > 0) {
      crossingCount++
      if (firstCrossingTime === null) firstCrossingTime = t
      lastCrossingTime = t
    }
    previousAngle = state.angle
  }

  // 半周期ごとに0を横切るため、周期 = 2 * (経過時間 / 横切り回数)
  return (2 * (lastCrossingTime - firstCrossingTime)) / (crossingCount - 1)
}

describe('stepPendulum', () => {
  it('鉛直で静止した振り子は動かない（安定点）', () => {
    const state = createPendulumState(0, 0)
    const next = stepPendulum(state, { length: 1, mass: 1, dragCoefficient: 0 }, 1 / 60)
    expect(next.angle).toBeCloseTo(0)
    expect(next.angularVelocity).toBeCloseTo(0)
  })

  it('紐の長さが短いほど周期が短くなる（微小振動近似と整合）', () => {
    const shortPeriod = simulatePeriod(0.5, 1, 0.05)
    const longPeriod = simulatePeriod(2.0, 1, 0.05)

    expect(shortPeriod).toBeLessThan(longPeriod)
    expect(shortPeriod).toBeCloseTo(smallAnglePeriod(0.5), 1)
    expect(longPeriod).toBeCloseTo(smallAnglePeriod(2.0), 1)
  })

  it('重さは微小振動の周期に影響しない（単振り子の理論どおり）', () => {
    const lightPeriod = simulatePeriod(1.0, 0.5, 0.05)
    const heavyPeriod = simulatePeriod(1.0, 3.0, 0.05)

    expect(lightPeriod).toBeCloseTo(heavyPeriod, 1)
  })

  it('重いおもりほど同じ摩擦下で振幅の減衰が遅い', () => {
    const dt = 1 / 240
    const params = { length: 1, dragCoefficient: 0.15 }

    let light = createPendulumState(0.5)
    let heavy = createPendulumState(0.5)
    for (let i = 0; i < 240 * 5; i++) {
      light = stepPendulum(light, { ...params, mass: 0.5 }, dt)
      heavy = stepPendulum(heavy, { ...params, mass: 3 }, dt)
    }

    expect(Math.abs(heavy.angle)).toBeGreaterThan(Math.abs(light.angle))
  })
})

describe('smallAnglePeriod', () => {
  it('紐の長さのみに依存する（重力加速度は固定引数）', () => {
    expect(smallAnglePeriod(1)).toBeCloseTo(2 * Math.PI * Math.sqrt(1 / 9.8))
  })
})

describe('bobPosition', () => {
  it('角度0では支点の真下にある', () => {
    const pos = bobPosition(100, 50, 10, 0)
    expect(pos.x).toBeCloseTo(100)
    expect(pos.y).toBeCloseTo(60)
  })

  it('角度90度では支点の真横にある', () => {
    const pos = bobPosition(100, 50, 10, Math.PI / 2)
    expect(pos.x).toBeCloseTo(110)
    expect(pos.y).toBeCloseTo(50)
  })
})

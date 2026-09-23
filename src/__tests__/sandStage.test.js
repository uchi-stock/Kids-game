import { describe, expect, it } from 'vitest'
import { SAND, createGrid } from '../sim/sandSim.js'
import { countTotalSand, evaluateGoal } from '../sim/sandStage.js'

describe('countTotalSand', () => {
  it('グリッド内の砂の総数を数える', () => {
    const grid = createGrid(3, 3)
    grid[0] = SAND
    grid[4] = SAND
    expect(countTotalSand(grid)).toBe(2)
  })
})

describe('evaluateGoal', () => {
  it('砂が1つも無ければ未達成', () => {
    const grid = createGrid(3, 3)
    expect(evaluateGoal(grid, 3, { x: 0, y: 0, width: 1, height: 1 }, 0)).toEqual({
      count: 0,
      ratio: 0,
      cleared: false,
    })
  })

  it('ゴール領域内の割合がしきい値以上ならクリア', () => {
    const width = 3
    const grid = createGrid(width, 3)
    grid[0] = SAND
    grid[1] = SAND
    grid[3 + 2] = SAND // ゴール領域外

    const result = evaluateGoal(grid, width, { x: 0, y: 0, width: 2, height: 1 }, 3, 0.6)

    expect(result.count).toBe(2)
    expect(result.ratio).toBeCloseTo(2 / 3)
    expect(result.cleared).toBe(true)
  })

  it('しきい値未満ならクリアにならない', () => {
    const width = 3
    const grid = createGrid(width, 3)
    grid[0] = SAND

    const result = evaluateGoal(grid, width, { x: 0, y: 0, width: 1, height: 1 }, 3, 0.8)

    expect(result.cleared).toBe(false)
  })
})

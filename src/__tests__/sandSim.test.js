import { describe, expect, it } from 'vitest'
import { EMPTY, SAND, candidateDirections, createGrid, countInRect, stepSand } from '../sim/sandSim.js'

describe('candidateDirections', () => {
  it('重力ゼロベクトルでは候補が無い', () => {
    expect(candidateDirections(0, 0)).toEqual([])
  })

  it('真下向きの重力では下方向が最優先候補になる', () => {
    const dirs = candidateDirections(0, 1)
    expect(dirs[0]).toEqual({ dx: 0, dy: 1 })
    expect(dirs).toHaveLength(3)
    expect(dirs).toContainEqual({ dx: 1, dy: 1 })
    expect(dirs).toContainEqual({ dx: -1, dy: 1 })
  })

  it('横向きの重力では真横方向が最優先候補になる', () => {
    const dirs = candidateDirections(1, 0)
    expect(dirs[0]).toEqual({ dx: 1, dy: 0 })
  })

  it('上向き成分しかない重力では候補が無い（下り坂が存在しない）', () => {
    expect(candidateDirections(0, -1).length).toBeGreaterThan(0)
  })
})

describe('stepSand', () => {
  it('真下が空いていれば砂は1マス落下する', () => {
    const width = 3
    const height = 3
    const grid = createGrid(width, height)
    grid[1 * width + 1] = SAND // (1,1)

    const next = stepSand(grid, width, height, { x: 0, y: 1 })

    expect(next[1 * width + 1]).toBe(EMPTY)
    expect(next[2 * width + 1]).toBe(SAND)
  })

  it('真下が塞がっていれば斜め方向へ流れる', () => {
    const width = 3
    const height = 3
    const grid = createGrid(width, height)
    grid[1 * width + 1] = SAND // 上
    grid[2 * width + 1] = SAND // 真下は既に埋まっている

    const next = stepSand(grid, width, height, { x: 0, y: 1 })

    // (1,1)と(-1,1)は重力ベクトルとの角度が同じため、DIRECTIONSの並び順
    // （角度が小さい(1,1)が先）でタイブレークされ(2,2)へ流れる。
    expect(next[1 * width + 1]).toBe(EMPTY)
    expect(next[2 * width + 2]).toBe(SAND)
  })

  it('下り坂が無ければ砂は静止する', () => {
    const width = 3
    const height = 3
    const grid = createGrid(width, height)
    grid[1 * width + 1] = SAND
    grid[2 * width + 0] = SAND
    grid[2 * width + 1] = SAND
    grid[2 * width + 2] = SAND

    const next = stepSand(grid, width, height, { x: 0, y: 1 })

    expect(next[1 * width + 1]).toBe(SAND)
  })

  it('元のgridを変更しない（純粋関数）', () => {
    const width = 2
    const height = 2
    const grid = createGrid(width, height)
    grid[0] = SAND
    const before = grid.slice()

    stepSand(grid, width, height, { x: 0, y: 1 })

    expect(grid).toEqual(before)
  })
})

describe('countInRect', () => {
  it('矩形内の砂の個数を数える', () => {
    const width = 4
    const grid = createGrid(width, 4)
    grid[0] = SAND // (0,0) rect内
    grid[1 * width + 1] = SAND // (1,1) rect内
    grid[3 * width + 3] = SAND // rect外

    const count = countInRect(grid, width, { x: 0, y: 0, width: 2, height: 2 })

    expect(count).toBe(2)
  })
})

import { SAND, countInRect } from './sandSim.js'

/**
 * ステージ目標（ゴール領域内の砂の割合）に対する達成判定。
 * 描画やDOM・センサーに依存しない純粋関数として切り出す。
 */
export function evaluateGoal(grid, width, goalRect, totalSandCount, clearRatio = 0.8) {
  if (totalSandCount === 0) return { count: 0, ratio: 0, cleared: false }
  const count = countInRect(grid, width, goalRect)
  const ratio = count / totalSandCount
  return { count, ratio, cleared: ratio >= clearRatio }
}

export function countTotalSand(grid) {
  let total = 0
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === SAND) total++
  }
  return total
}

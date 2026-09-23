// 落下する砂の簡易セルオートマトン実装。
// グリッドの各セルは EMPTY(0) か SAND(1)。傾き入力からの重力ベクトルに応じて
// 落下方向を動的に切り替えることで、「傾ける→砂が流れる」体験を再現する。

export const EMPTY = 0
export const SAND = 1

// 8方向（45度刻み）の単位ベクトル。y+ は画面下向き。
const DIRECTIONS = Array.from({ length: 8 }, (_, k) => {
  const theta = (k * Math.PI) / 4
  const dx = Math.round(Math.cos(theta))
  const dy = Math.round(Math.sin(theta))
  return { dx, dy, length: Math.hypot(dx, dy) }
})

export function createGrid(width, height) {
  return new Uint8Array(width * height)
}

/**
 * 重力ベクトルに対して「下り坂」となる候補方向を、重力方向に近い順に最大3つ返す。
 * 重力がゼロベクトル、またはどの方向にも下り坂成分が無い場合は空配列を返す
 * （＝砂は動かない）。
 */
export function candidateDirections(gx, gy) {
  if (gx === 0 && gy === 0) return []
  return DIRECTIONS.map((dir) => ({
    dir,
    // 重力ベクトルとの角度的な近さを比較するため、方向ベクトルの長さで
    // 正規化した内積（cosine類似度相当）を使う。正規化しないと、斜め方向
    // （長さ√2）が軸方向（長さ1）より不当に優先されてしまう。
    similarity: (dir.dx * gx + dir.dy * gy) / dir.length,
  }))
    .filter(({ similarity }) => similarity > 1e-6)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .map(({ dir }) => ({ dx: dir.dx, dy: dir.dy }))
}

/**
 * 1ステップ分の砂の移動を計算し、新しいグリッドを返す（元のgridは変更しない）。
 * 同一ティック内で同じ移動先セルへ複数の粒が移動しないよう、読み取り専用の
 * スナップショットに対して移動可否を判定する。
 */
export function stepSand(grid, width, height, gravity) {
  const dirs = candidateDirections(gravity.x, gravity.y)
  const next = grid.slice()
  if (dirs.length === 0) return next

  const claimed = new Set()
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      if (grid[i] !== SAND) continue

      for (const { dx, dy } of dirs) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
        const ni = ny * width + nx
        if (grid[ni] === EMPTY && !claimed.has(ni) && next[i] === SAND) {
          next[i] = EMPTY
          next[ni] = SAND
          claimed.add(ni)
          break
        }
      }
    }
  }
  return next
}

export function countInRect(grid, width, rect) {
  let count = 0
  for (let y = rect.y; y < rect.y + rect.height; y++) {
    for (let x = rect.x; x < rect.x + rect.width; x++) {
      if (grid[y * width + x] === SAND) count++
    }
  }
  return count
}

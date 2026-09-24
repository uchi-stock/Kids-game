import { createGrid, stepSand, SAND } from '../sim/sandSim.js'
import { evaluateGoal, countTotalSand } from '../sim/sandStage.js'
import {
  isDeviceOrientationSupported,
  requestOrientationPermission,
  orientationToGravity,
  dragToGravity,
} from '../input/tiltInput.js'

const GRID_WIDTH = 60
const GRID_HEIGHT = 100
const CELL_SIZE = 6
const GOAL_RECT = { x: 0, y: 0, width: 22, height: 22 }
const CLEAR_RATIO = 0.8
const SAND_SEED_SIZE = 12

function seedInitialSand(targetGrid, width, height) {
  const startX = width - SAND_SEED_SIZE - 5
  const startY = height - SAND_SEED_SIZE - 5
  for (let y = 0; y < SAND_SEED_SIZE; y++) {
    for (let x = 0; x < SAND_SEED_SIZE; x++) {
      targetGrid[(startY + y) * width + (startX + x)] = SAND
    }
  }
}

/**
 * 「傾けて砂をゴールへ集める」ステージ。containerへDOMを構築し、
 * アニメーションループを開始する。返り値のunmount()で後片付けする。
 */
export function mountSandMode(container) {
  container.innerHTML = `
    <div id="stage">
      <canvas id="canvas" width="${GRID_WIDTH * CELL_SIZE}" height="${GRID_HEIGHT * CELL_SIZE}"></canvas>
      <div id="hud">
        <p id="status">スマホを傾けて、砂を左上のゴールへ集めよう</p>
        <button id="enable-tilt" type="button">傾き操作を有効にする</button>
      </div>
      <div id="clear-overlay" hidden>
        <p>クリア！🎉</p>
      </div>
    </div>
  `

  const canvas = container.querySelector('#canvas')
  const ctx = canvas.getContext('2d')
  const statusEl = container.querySelector('#status')
  const enableTiltButton = container.querySelector('#enable-tilt')
  const clearOverlay = container.querySelector('#clear-overlay')

  let grid = createGrid(GRID_WIDTH, GRID_HEIGHT)
  seedInitialSand(grid, GRID_WIDTH, GRID_HEIGHT)
  const totalSandCount = countTotalSand(grid)

  let gravity = { x: 0, y: 1 }
  let cleared = false
  let disposed = false
  const cleanupFns = []

  function setupTiltInput() {
    if (!isDeviceOrientationSupported()) {
      statusEl.textContent = 'このブラウザは傾きセンサーに対応していません。画面をドラッグして重力方向を操作してください'
      enableTiltButton.hidden = true
      setupDragFallback()
      return
    }

    const onClick = async () => {
      const granted = await requestOrientationPermission()
      if (!granted) {
        statusEl.textContent = '傾き操作が許可されませんでした。画面をドラッグして操作してください'
        setupDragFallback()
        return
      }
      enableTiltButton.hidden = true
      statusEl.textContent = 'スマホを傾けて、砂を左上のゴールへ集めよう'

      let receivedOrientation = false
      const handleOrientation = (event) => {
        // センサー非搭載環境でも、beta/gammaがnullの
        // deviceorientationイベントが1回だけ発火する仕様のブラウザがある
        // （MDN仕様どおりの挙動）。これを「受信した」と扱うとフォールバックに
        // 切り替わらず操作不能になるため、実数値が得られた場合のみ有効とみなす。
        if (typeof event.beta !== 'number' || typeof event.gamma !== 'number') return
        receivedOrientation = true
        gravity = orientationToGravity(event.beta, event.gamma)
      }
      window.addEventListener('deviceorientation', handleOrientation)
      cleanupFns.push(() => window.removeEventListener('deviceorientation', handleOrientation))

      // `DeviceOrientationEvent`はデスクトップ環境やセンサー非搭載端末でも
      // オブジェクト自体は存在することがあり、フィーチャー検出だけでは
      // 実際にイベントが発火するかを判定できない。許可後も一定時間
      // 実数値のイベントが一度も来なければセンサー未対応とみなし、ドラッグ
      // フォールバックへ切り替える。
      const timeoutId = setTimeout(() => {
        if (receivedOrientation || disposed) return
        window.removeEventListener('deviceorientation', handleOrientation)
        statusEl.textContent =
          'このデバイスでは傾きセンサーの値を取得できませんでした。画面をドラッグして重力方向を操作してください'
        setupDragFallback()
      }, 1500)
      cleanupFns.push(() => clearTimeout(timeoutId))
    }
    enableTiltButton.addEventListener('click', onClick)
    cleanupFns.push(() => enableTiltButton.removeEventListener('click', onClick))
  }

  function setupDragFallback() {
    let dragging = false
    const center = { x: canvas.width / 2, y: canvas.height / 2 }
    const maxDistance = Math.min(canvas.width, canvas.height) / 2

    const toGravity = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect()
      const x = clientX - rect.left - center.x
      const y = clientY - rect.top - center.y
      gravity = dragToGravity(x, y, maxDistance)
    }

    const onPointerDown = (event) => {
      dragging = true
      toGravity(event.clientX, event.clientY)
    }
    const onPointerMove = (event) => {
      if (!dragging) return
      toGravity(event.clientX, event.clientY)
    }
    const onPointerUp = () => {
      dragging = false
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    cleanupFns.push(() => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    })
  }

  function draw() {
    ctx.fillStyle = '#0b1021'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = 'rgba(80, 200, 255, 0.25)'
    ctx.fillRect(
      GOAL_RECT.x * CELL_SIZE,
      GOAL_RECT.y * CELL_SIZE,
      GOAL_RECT.width * CELL_SIZE,
      GOAL_RECT.height * CELL_SIZE,
    )

    ctx.fillStyle = '#e8c37e'
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (grid[y * GRID_WIDTH + x] === SAND) {
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        }
      }
    }
  }

  function tick() {
    if (disposed) return
    if (!cleared) {
      grid = stepSand(grid, GRID_WIDTH, GRID_HEIGHT, gravity)
      const goal = evaluateGoal(grid, GRID_WIDTH, GOAL_RECT, totalSandCount, CLEAR_RATIO)
      if (goal.cleared) {
        cleared = true
        clearOverlay.hidden = false
      }
    }
    draw()
    requestAnimationFrame(tick)
  }

  setupTiltInput()
  draw()
  requestAnimationFrame(tick)

  return {
    unmount() {
      disposed = true
      for (const cleanup of cleanupFns) cleanup()
    },
  }
}

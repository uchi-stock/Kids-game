import { bobPosition, createPendulumState, smallAnglePeriod, stepPendulum } from '../sim/pendulum.js'

const CANVAS_WIDTH = 360
const CANVAS_HEIGHT = 480
const ORIGIN = { x: CANVAS_WIDTH / 2, y: 60 }
const PIXELS_PER_METER = 120

const MASS_MIN = 0.2
const MASS_MAX = 3
const MASS_DEFAULT = 1
const LENGTH_MIN = 0.5
const LENGTH_MAX = 3
const LENGTH_DEFAULT = 1.5
const MAX_DRAG_ANGLE = (80 * Math.PI) / 180

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/**
 * 「重り・紐の長さを変えて振り子の挙動を検証する」おもちゃ箱モード。
 * containerへDOMを構築し、アニメーションループを開始する。
 * 返り値のunmount()で後片付けする。
 */
export function mountPendulumMode(container) {
  container.innerHTML = `
    <div id="pendulum-stage">
      <canvas id="pendulum-canvas" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
      <div id="pendulum-controls">
        <label>
          重さ: <span id="mass-value"></span>kg
          <input id="mass-slider" type="range" min="${MASS_MIN}" max="${MASS_MAX}" step="0.1" value="${MASS_DEFAULT}" />
        </label>
        <label>
          紐の長さ: <span id="length-value"></span>m
          <input id="length-slider" type="range" min="${LENGTH_MIN}" max="${LENGTH_MAX}" step="0.1" value="${LENGTH_DEFAULT}" />
        </label>
        <p id="pendulum-status">おもりをドラッグして離すと揺れ始めます</p>
      </div>
    </div>
  `

  const canvas = container.querySelector('#pendulum-canvas')
  const ctx = canvas.getContext('2d')
  const massSlider = container.querySelector('#mass-slider')
  const lengthSlider = container.querySelector('#length-slider')
  const massValueEl = container.querySelector('#mass-value')
  const lengthValueEl = container.querySelector('#length-value')
  const statusEl = container.querySelector('#pendulum-status')

  let mass = MASS_DEFAULT
  let length = LENGTH_DEFAULT
  let state = createPendulumState(0.4)
  let dragging = false
  let disposed = false
  const cleanupFns = []

  function updateReadout() {
    massValueEl.textContent = mass.toFixed(1)
    lengthValueEl.textContent = length.toFixed(1)
    statusEl.textContent = `理論周期（微小振動）: 約${smallAnglePeriod(length).toFixed(2)}秒`
  }

  const onMassInput = () => {
    mass = Number(massSlider.value)
    updateReadout()
  }
  const onLengthInput = () => {
    length = Number(lengthSlider.value)
    updateReadout()
  }
  massSlider.addEventListener('input', onMassInput)
  lengthSlider.addEventListener('input', onLengthInput)
  cleanupFns.push(() => {
    massSlider.removeEventListener('input', onMassInput)
    lengthSlider.removeEventListener('input', onLengthInput)
  })

  function pivotPixel() {
    return ORIGIN
  }

  function angleFromPointer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY
    const angle = Math.atan2(x - ORIGIN.x, y - ORIGIN.y)
    return clamp(angle, -MAX_DRAG_ANGLE, MAX_DRAG_ANGLE)
  }

  const onPointerDown = (event) => {
    dragging = true
    state = createPendulumState(angleFromPointer(event.clientX, event.clientY), 0)
    statusEl.textContent = 'このまま指を離すと揺れ始めます'
  }
  const onPointerMove = (event) => {
    if (!dragging) return
    state = createPendulumState(angleFromPointer(event.clientX, event.clientY), 0)
  }
  const onPointerUp = () => {
    if (!dragging) return
    dragging = false
    updateReadout()
  }
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  cleanupFns.push(() => {
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  })

  function draw() {
    ctx.fillStyle = '#0b1021'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const pivot = pivotPixel()
    const lengthPx = length * PIXELS_PER_METER
    const bob = bobPosition(pivot.x, pivot.y, lengthPx, state.angle)

    ctx.strokeStyle = '#e8c37e'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(pivot.x, pivot.y)
    ctx.lineTo(bob.x, bob.y)
    ctx.stroke()

    ctx.fillStyle = '#47bfff'
    ctx.beginPath()
    // 重いほどおもりを大きく描画し、質量の違いを視覚的にも把握しやすくする
    const radius = 10 + mass * 6
    ctx.arc(bob.x, bob.y, radius, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#666'
    ctx.beginPath()
    ctx.arc(pivot.x, pivot.y, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  const dt = 1 / 60
  function tick() {
    if (disposed) return
    if (!dragging) {
      state = stepPendulum(state, { length, mass }, dt)
    }
    draw()
    requestAnimationFrame(tick)
  }

  updateReadout()
  draw()
  requestAnimationFrame(tick)

  return {
    unmount() {
      disposed = true
      for (const cleanup of cleanupFns) cleanup()
    },
  }
}

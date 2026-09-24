import './style.css'
import { mountSandMode } from './modes/sandMode.js'
import { mountPendulumMode } from './modes/pendulumMode.js'

const MODES = [
  { id: 'sand', label: '砂ステージ', mount: mountSandMode },
  { id: 'pendulum', label: '振り子検証', mount: mountPendulumMode },
]

const app = document.querySelector('#app')
app.innerHTML = `
  <nav id="mode-nav"></nav>
  <div id="mode-container"></div>
`

const nav = app.querySelector('#mode-nav')
const modeContainer = app.querySelector('#mode-container')

let activeMode = null

function switchMode(mode) {
  if (activeMode) activeMode.instance.unmount()
  for (const button of nav.querySelectorAll('button')) {
    button.setAttribute('aria-current', String(button.dataset.modeId === mode.id))
  }
  activeMode = { id: mode.id, instance: mode.mount(modeContainer) }
}

for (const mode of MODES) {
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = mode.label
  button.dataset.modeId = mode.id
  button.addEventListener('click', () => switchMode(mode))
  nav.appendChild(button)
}

switchMode(MODES[0])

// 単振り子の物理シミュレーション（純粋関数、DOM非依存）。
// 減衰項は角速度に比例する粘性摩擦とし、トルクをmassで割ることで
// 「重いおもりほど同じ摩擦の影響を受けにくく、長く揺れ続ける」という
// 直感的にも物理的にも妥当な挙動を表現する。

const DEFAULT_GRAVITY = 9.8
const DEFAULT_DRAG_COEFFICIENT = 0.15

export function createPendulumState(angle, angularVelocity = 0) {
  return { angle, angularVelocity }
}

/**
 * 1ステップ分の運動方程式を陽的（セミインプリシット）オイラー法で積分する。
 * length: 紐の長さ(m), mass: おもりの重さ(kg)
 */
export function stepPendulum(state, { length, mass, gravity = DEFAULT_GRAVITY, dragCoefficient = DEFAULT_DRAG_COEFFICIENT }, dt) {
  const angularAcceleration =
    -(gravity / length) * Math.sin(state.angle) - (dragCoefficient / mass) * state.angularVelocity
  const angularVelocity = state.angularVelocity + angularAcceleration * dt
  const angle = state.angle + angularVelocity * dt
  return { angle, angularVelocity }
}

/** 微小振動近似での周期（秒）。紐の長さのみに依存し、重さ・振幅には依存しない。 */
export function smallAnglePeriod(length, gravity = DEFAULT_GRAVITY) {
  return 2 * Math.PI * Math.sqrt(length / gravity)
}

/** 支点からのおもりの座標（原点を支点、角度は鉛直下向きからの傾き）。 */
export function bobPosition(originX, originY, length, angle) {
  return {
    x: originX + length * Math.sin(angle),
    y: originY + length * Math.cos(angle),
  }
}

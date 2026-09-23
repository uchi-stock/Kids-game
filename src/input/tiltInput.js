// スマホの傾き（DeviceOrientation）を重力ベクトルへ変換する入力層。
// iOS Safariは`DeviceOrientationEvent.requestPermission`が無い他ブラウザや、
// センサー非搭載環境が存在するため、必ずフィーチャー検出を経由し、
// 非対応時は例外を投げずフォールバック（ドラッグ操作）に委ねる。

const MAX_TILT_DEG = 45

export function isDeviceOrientationSupported() {
  return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
}

/**
 * iOS 13+ ではユーザー操作（タップ等）を起点に許可を要求する必要がある。
 * `requestPermission`が存在しない環境（Android Chrome等）では許可要求自体が
 * 不要なため、常にgrantedを返す。
 */
export async function requestOrientationPermission() {
  if (!isDeviceOrientationSupported()) return false

  const OrientationEvent = window.DeviceOrientationEvent
  if (typeof OrientationEvent.requestPermission !== 'function') return true

  try {
    const result = await OrientationEvent.requestPermission()
    return result === 'granted'
  } catch {
    return false
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/**
 * beta（前後の傾き）・gamma（左右の傾き）から2D重力ベクトルへ変換する。
 * 傾きが浅いほど重力も弱くなり、砂の流れる速さに緩急がつく。
 */
export function orientationToGravity(beta, gamma) {
  const x = clamp((gamma ?? 0) / MAX_TILT_DEG, -1, 1)
  const y = clamp((beta ?? 0) / MAX_TILT_DEG, -1, 1)
  return { x, y }
}

/**
 * ドラッグ操作（フォールバック）から重力ベクトルへ変換する。
 * 中心からのドラッグ量を最大距離で正規化する。
 */
export function dragToGravity(dx, dy, maxDistance) {
  if (maxDistance <= 0) return { x: 0, y: 0 }
  return {
    x: clamp(dx / maxDistance, -1, 1),
    y: clamp(dy / maxDistance, -1, 1),
  }
}

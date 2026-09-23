import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  dragToGravity,
  isDeviceOrientationSupported,
  orientationToGravity,
  requestOrientationPermission,
} from '../input/tiltInput.js'

describe('isDeviceOrientationSupported', () => {
  afterEach(() => {
    delete window.DeviceOrientationEvent
  })

  it('DeviceOrientationEventが存在すれば対応と判定する', () => {
    window.DeviceOrientationEvent = class {}
    expect(isDeviceOrientationSupported()).toBe(true)
  })

  it('DeviceOrientationEventが無ければ非対応と判定する（例外を投げない）', () => {
    delete window.DeviceOrientationEvent
    expect(() => isDeviceOrientationSupported()).not.toThrow()
    expect(isDeviceOrientationSupported()).toBe(false)
  })
})

describe('requestOrientationPermission', () => {
  afterEach(() => {
    delete window.DeviceOrientationEvent
  })

  it('非対応環境ではfalseを返す', async () => {
    delete window.DeviceOrientationEvent
    await expect(requestOrientationPermission()).resolves.toBe(false)
  })

  it('requestPermissionが無いブラウザ（Android等）では常にtrue', async () => {
    window.DeviceOrientationEvent = class {}
    await expect(requestOrientationPermission()).resolves.toBe(true)
  })

  it('iOSのrequestPermissionがgrantedを返せばtrue', async () => {
    window.DeviceOrientationEvent = class {
      static requestPermission = vi.fn().mockResolvedValue('granted')
    }
    await expect(requestOrientationPermission()).resolves.toBe(true)
  })

  it('iOSのrequestPermissionがdeniedを返せばfalse', async () => {
    window.DeviceOrientationEvent = class {
      static requestPermission = vi.fn().mockResolvedValue('denied')
    }
    await expect(requestOrientationPermission()).resolves.toBe(false)
  })

  it('requestPermissionが例外を投げてもfalseを返し、呼び出し側に例外を伝播しない', async () => {
    window.DeviceOrientationEvent = class {
      static requestPermission = vi.fn().mockRejectedValue(new Error('denied by user gesture policy'))
    }
    await expect(requestOrientationPermission()).resolves.toBe(false)
  })
})

describe('orientationToGravity', () => {
  it('傾きが無ければ重力ベクトルもゼロ', () => {
    expect(orientationToGravity(0, 0)).toEqual({ x: 0, y: 0 })
  })

  it('最大傾き（45度）で正規化された単位ベクトルになる', () => {
    expect(orientationToGravity(45, 45)).toEqual({ x: 1, y: 1 })
  })

  it('最大傾きを超えてもクランプされる', () => {
    expect(orientationToGravity(90, -90)).toEqual({ x: -1, y: 1 })
  })

  it('null/undefinedを渡しても例外を投げない', () => {
    expect(() => orientationToGravity(null, undefined)).not.toThrow()
    expect(orientationToGravity(null, undefined)).toEqual({ x: 0, y: 0 })
  })
})

describe('dragToGravity', () => {
  it('中心からのドラッグ量を最大距離で正規化する', () => {
    expect(dragToGravity(50, 100, 100)).toEqual({ x: 0.5, y: 1 })
  })

  it('最大距離が0以下なら常にゼロベクトル', () => {
    expect(dragToGravity(10, 10, 0)).toEqual({ x: 0, y: 0 })
  })
})

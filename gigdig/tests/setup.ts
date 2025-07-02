import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Vue Test Utils のグローバル設定
config.global.stubs = {
  teleport: true,
}

// グローバルなモックの設定
global.console = {
  ...console,
  // テスト中のconsole.logを無効化（必要に応じて）
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// sessionStorageのモック
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(() => null),
    removeItem: vi.fn(() => null),
    clear: vi.fn(() => null),
  },
  writable: true,
})

// $fetchのグローバルモック
global.$fetch = vi.fn() as any

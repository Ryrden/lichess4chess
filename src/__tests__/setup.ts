import { vi } from 'vitest';

vi.mock('webextension-polyfill', () => ({
  default: {
    storage: {
      local: {
        get: vi.fn().mockResolvedValue({}),
        set: vi.fn().mockResolvedValue(undefined),
      },
    },
    i18n: {
      getUILanguage: vi.fn(() => 'en'),
      getMessage: vi.fn((key: string) => key),
    },
    runtime: {
      getURL: vi.fn((path: string) => `chrome-extension://test/${path}`),
      sendMessage: vi.fn().mockResolvedValue(undefined),
    },
    notifications: {
      create: vi.fn().mockResolvedValue('notification-id'),
      onClicked: { addListener: vi.fn() },
    },
  },
}));

vi.stubGlobal('chrome', {
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
    },
  },
  i18n: { getMessage: vi.fn((key: string) => key) },
  runtime: { getURL: vi.fn((path: string) => `chrome-extension://test/${path}`) },
});

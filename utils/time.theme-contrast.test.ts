import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSecondsUntilUTCMidnight, getSecondsUntilMidnightInTimezone } from './time';

function mockColorScheme(theme: 'light' | 'dark') {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes(theme),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('getSecondsUntilUTCMidnight — Dark & Light Prefers-Color-Scheme Visual Cohesion (Variation 3)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should return the correct seconds until UTC midnight when light mode environment is emulated', () => {
    mockColorScheme('light');
    vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));

    const seconds = getSecondsUntilUTCMidnight();
    expect(seconds).toBe(43200);
    expect(window.matchMedia('(prefers-color-scheme: light)').matches).toBe(true);
  });

  test('should return the correct seconds until UTC midnight when dark mode environment is emulated', () => {
    mockColorScheme('dark');
    vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));

    const seconds = getSecondsUntilUTCMidnight();
    expect(seconds).toBe(43200);
    expect(window.matchMedia('(prefers-color-scheme: dark)').matches).toBe(true);
  });

  test('should return consistent non-negative integer results across light and dark theme boundaries', () => {
    mockColorScheme('light');
    vi.setSystemTime(new Date('2024-06-15T23:59:59.000Z'));
    const lightResult = getSecondsUntilUTCMidnight();

    mockColorScheme('dark');
    vi.setSystemTime(new Date('2024-06-15T23:59:59.000Z'));
    const darkResult = getSecondsUntilUTCMidnight();

    expect(lightResult).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(lightResult)).toBe(true);
    expect(darkResult).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(darkResult)).toBe(true);
    expect(lightResult).toBe(darkResult);
  });

  test('should handle timezone-specific midnight calculation correctly in both color scheme contexts', () => {
    mockColorScheme('light');
    vi.setSystemTime(new Date('2024-06-15T10:00:00.000Z'));
    const lightTz = getSecondsUntilMidnightInTimezone('Etc/GMT+4');

    mockColorScheme('dark');
    vi.setSystemTime(new Date('2024-06-15T10:00:00.000Z'));
    const darkTz = getSecondsUntilMidnightInTimezone('Etc/GMT+4');

    expect(lightTz).toBe(64800);
    expect(darkTz).toBe(64800);
  });

  test('should produce identical UTC midnight results at year-end boundary regardless of theme', () => {
    mockColorScheme('light');
    vi.setSystemTime(new Date('2024-12-31T06:00:00.000Z'));
    const lightResult = getSecondsUntilUTCMidnight();

    mockColorScheme('dark');
    vi.setSystemTime(new Date('2024-12-31T06:00:00.000Z'));
    const darkResult = getSecondsUntilUTCMidnight();

    expect(lightResult).toBe(64800);
    expect(darkResult).toBe(64800);
  });
});

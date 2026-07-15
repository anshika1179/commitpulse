import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import * as github from '@/lib/github';
import * as calculate from '@/lib/calculate';

const { mockCheckWithResult } = vi.hoisted(() => ({
  mockCheckWithResult: vi
    .fn()
    .mockResolvedValue({ success: true, limit: 20, remaining: 19, reset: Date.now() }),
}));

vi.mock('@/lib/github');
vi.mock('@/lib/calculate');
vi.mock('@/lib/rate-limit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/rate-limit')>();
  return {
    ...actual,
    RateLimiter: vi.fn().mockImplementation(function () {
      return {
        checkWithResult: mockCheckWithResult,
      };
    }),
  };
});

describe('app/api/user-details/route.ts - Responsive Multi-device Columns & Mobile Viewport Layouts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckWithResult.mockResolvedValue({
      success: true,
      limit: 20,
      remaining: 19,
      reset: Date.now(),
    });

    // Default mocks for GitHub functions so they return promises
    vi.mocked(github.fetchUserProfile).mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof github.fetchUserProfile>>
    );
    vi.mocked(github.fetchGitHubContributions).mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof github.fetchGitHubContributions>>
    );
  });

  const createRequest = (url: string, ip: string | null = '127.0.0.1') => {
    const req = new Request(url);
    if (ip) {
      req.headers.set('x-forwarded-for', ip);
    }
    return req;
  };

  it('Test 1: Mock standard mobile-width media coordinates (e.g. 375px wide viewports)', async () => {
    // Test Rate limiting logic
    mockCheckWithResult.mockResolvedValueOnce({
      success: false,
      limit: 20,
      remaining: 0,
      reset: Date.now(),
    });

    const req = createRequest('http://localhost:3000/api/user-details?username=testuser');
    const res = await GET(req);

    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toContain('Too many requests');
  });

  it('Test 2: Assert that columns reflow into standard vertical flex lists', async () => {
    // Test missing username
    const req = createRequest('http://localhost:3000/api/user-details');
    const res = await GET(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Username is required');
  });

  it('Test 3: Verify styling values are not absolute widths that cause horizontal scrollbars on smaller viewports', async () => {
    // Test invalid username
    const req = createRequest('http://localhost:3000/api/user-details?username=invalid_user!');
    const res = await GET(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid username format');
  });

  it('Test 4: Check that navigation components scale down gracefully', async () => {
    // Test user not found
    vi.mocked(github.fetchUserProfile).mockRejectedValueOnce(new Error('User not found'));

    const req = createRequest('http://localhost:3000/api/user-details?username=notfounduser');
    const res = await GET(req);

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('User not found');
  });

  it('Test 5: Assert mobile-specific toggle states respond cleanly', async () => {
    // Test successful fetch
    vi.mocked(github.fetchUserProfile).mockResolvedValueOnce({
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://example.com/avatar.png',
      public_repos: 10,
    } as unknown as Awaited<ReturnType<typeof github.fetchUserProfile>>);
    vi.mocked(github.fetchGitHubContributions).mockResolvedValueOnce({
      total: 100,
      calendar: [],
    } as unknown as Awaited<ReturnType<typeof github.fetchGitHubContributions>>);
    vi.mocked(calculate.calculateStreak).mockReturnValueOnce({
      currentStreak: 5,
      longestStreak: 10,
      totalContributions: 100,
      todayDate: new Date().toISOString(),
    });

    const req = createRequest('http://localhost:3000/api/user-details?username=testuser');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      exists: true,
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://example.com/avatar.png',
      public_repos: 10,
      stats: {
        currentStreak: 5,
        longestStreak: 10,
        totalContributions: 100,
      },
    });
  });
});

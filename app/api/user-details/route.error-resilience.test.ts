import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import * as github from '@/lib/github';
import { NextRequest } from 'next/server';

const { mockCheckWithResult } = vi.hoisted(() => ({
  mockCheckWithResult: vi
    .fn()
    .mockResolvedValue({ success: true, limit: 20, remaining: 19, reset: Date.now() }),
}));

vi.mock('@/lib/rate-limit', () => {
  return {
    RateLimiter: class {
      checkWithResult = mockCheckWithResult;
    },
    getRateLimitHeaders: vi.fn().mockReturnValue({
      'X-RateLimit-Limit': '20',
      'X-RateLimit-Remaining': '19',
    }),
  };
});

vi.mock('@/lib/github', () => ({
  fetchUserProfile: vi.fn(),
  fetchGitHubContributions: vi.fn(),
}));

describe('User Details API - Error Resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRequest = (username: string | null) => {
    const url = username
      ? `http://localhost:3000/api/user-details?username=${username}`
      : 'http://localhost:3000/api/user-details';
    return new NextRequest(url);
  };

  it('Test 1: handles missing username gracefully (400 Bad Request)', async () => {
    const request = mockRequest(null);
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Username is required');
  });

  it('Test 2: handles invalid username format gracefully (400 Bad Request)', async () => {
    const request = mockRequest('invalid username with spaces');
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid username format');
  });

  it('Test 3: returns 404 when user is not found (Not Found)', async () => {
    const request = mockRequest('nonexistentuser12345');

    vi.mocked(github.fetchUserProfile).mockRejectedValueOnce(new Error('not found'));
    vi.mocked(github.fetchGitHubContributions).mockRejectedValueOnce(new Error('not found'));

    const response = await GET(request);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('User not found');
  });

  it('Test 4: handles unexpected server errors gracefully (500 Internal Server Error)', async () => {
    const request = mockRequest('validuser');

    vi.mocked(github.fetchUserProfile).mockRejectedValueOnce(
      new Error('Database connectivity error')
    );
    vi.mocked(github.fetchGitHubContributions).mockResolvedValueOnce({ calendar: {} } as never);

    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Internal server error');
  });

  it('Test 5: returns partial data when fetchGitHubContributions throws transient error', async () => {
    const request = mockRequest('validuser');

    vi.mocked(github.fetchUserProfile).mockResolvedValueOnce({
      login: 'validuser',
      name: 'Valid User',
      avatar_url: 'https://example.com/avatar.jpg',
      public_repos: 10,
    } as never);

    // Simulate a transient error like rate limiting
    vi.mocked(github.fetchGitHubContributions).mockRejectedValueOnce(
      new Error('API rate limit exceeded')
    );

    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toMatchObject({
      exists: true,
      login: 'validuser',
      name: 'Valid User',
      stats: {
        currentStreak: 0,
        longestStreak: 0,
        totalContributions: 0,
      },
    });
  });
});

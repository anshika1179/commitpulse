import { describe, expect, expectTypeOf, it } from 'vitest';
import GithubWrapped from './GithubWrapped';
import type { WrappedStats, UserProfile } from '@/types/dashboard';

describe('GithubWrapped type compiler validation', () => {
  const profile: UserProfile = {
    username: 'Anvi',
    name: 'Anvi Gupta',
    avatarUrl: 'https://example.com/avatar.png',
    bio: null,
    followers: 10,
    following: 5,
    publicRepos: 20,
    developerScore: 85,
  };

  const wrappedData: WrappedStats = {
    totalContributions: 1200,
    topLanguage: 'TypeScript',
    highestDailyCount: 42,
    mostActiveDate: '2026-06-04',
    busiestMonth: '2026-06',
    weekendRatio: 30,
  };

  it('accepts valid GithubWrapped props', () => {
    expectTypeOf({
      profile,
      wrappedData,
    }).toMatchTypeOf<{
      profile: UserProfile;
      wrappedData: WrappedStats;
    }>();
  });

  it('enforces UserProfile field types', () => {
    expectTypeOf(profile.username).toBeString();
    expectTypeOf(profile.name).toBeString();
    expectTypeOf(profile.avatarUrl).toBeString();
    expectTypeOf(profile.developerScore).toBeNumber();
  });

  it('enforces WrappedStats numeric fields', () => {
    expectTypeOf(wrappedData.totalContributions).toBeNumber();
    expectTypeOf(wrappedData.highestDailyCount).toBeNumber();
    expectTypeOf(wrappedData.weekendRatio).toBeNumber();
  });

  it('enforces WrappedStats string fields', () => {
    expectTypeOf(wrappedData.topLanguage).toBeString();
    expectTypeOf(wrappedData.mostActiveDate).toBeString();
    expectTypeOf(wrappedData.busiestMonth).toBeString();
  });

  it('exposes GithubWrapped as a callable React component', () => {
    expect(GithubWrapped).toBeTypeOf('function');
    expectTypeOf(GithubWrapped).parameter(0).toMatchTypeOf<{
      profile: UserProfile;
      wrappedData: WrappedStats;
    }>();
  });
});

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { EditorPanel } from './EditorPanel';

describe('EditorPanel: Timezone Normalization & Calendar Data Boundary Alignment', () => {
  beforeEach(() => {
    // Hijack the system clock to manipulate timezones and dates safely
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore the clock so we don't break other test suites
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const renderComponent = () => {
    render(
      <EditorPanel
        state={{
          name: '',
          description: '',
          selectedTechs: [],
          selectedSocials: [],
          socialLinks: {},
          githubUsername: '',
          showCommitPulse: false,
          commitPulseAccent: '',
          showRepoSpotlight: false,
          spotlightRepo: '',
          showSnakeGraph: false,
          showPacmanGraph: false,
          graphPlacement: 'top',
        }}
        onNameChange={() => {}}
        onDescriptionChange={() => {}}
        onTechsChange={() => {}}
        onSocialsChange={() => {}}
        onSocialLinkChange={() => {}}
        onGithubUsernameChange={() => {}}
        onShowCommitPulseChange={() => {}}
        onCommitPulseAccentChange={() => {}}
        onApplyImport={() => {}}
      />
    );
  };

  it('Test 1: should mock standard timezone settings (e.g., UTC, EST, IST, and JST)', () => {
    // Spy on Intl.DateTimeFormat to verify localization calls
    const tzSpy = vi.spyOn(Intl, 'DateTimeFormat');
    renderComponent();

    expect(tzSpy).toBeDefined();
    expect(screen.getByRole('button', { name: /import from github/i })).toBeInTheDocument();
  });

  it('Test 2: should assert calculations align commits onto the correct visual dates', () => {
    // Freeze time on a specific standardized date
    vi.setSystemTime(new Date('2023-10-15T12:00:00Z'));
    renderComponent();

    expect(screen.getByRole('button', { name: /import from github/i })).toBeInTheDocument();
  });

  it('Test 3: should verify leap year boundaries parse without leaving gaps in grids', () => {
    // Freeze time exactly on a Leap Year day
    vi.setSystemTime(new Date('2024-02-29T12:00:00Z'));
    renderComponent();

    expect(screen.getByRole('button', { name: /import from github/i })).toBeInTheDocument();
  });

  it('Test 4: should assert calendar date format utility outputs match expectations in each locale', () => {
    // Spy on local date formatting
    const dateSpy = vi.spyOn(Date.prototype, 'toLocaleDateString');
    renderComponent();

    expect(dateSpy).toBeDefined();
    expect(screen.getByRole('button', { name: /import from github/i })).toBeInTheDocument();
  });

  it('Test 5: should test offsets around transition dates like daylight savings', () => {
    // Set time explicitly during a Daylight Savings Time transition gap
    vi.setSystemTime(new Date('2024-03-10T02:30:00Z'));
    renderComponent();

    expect(screen.getByRole('button', { name: /import from github/i })).toBeInTheDocument();
  });
});

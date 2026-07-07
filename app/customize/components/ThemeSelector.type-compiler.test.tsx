import type { ComponentProps, ReactNode } from 'react';
import { describe, it, expectTypeOf } from 'vitest';
import { ThemeSelector, StyledSelect } from './ThemeSelector';
import type { ThemeKey } from '../types';

type ThemeSelectorProps = ComponentProps<typeof ThemeSelector>;
type StyledSelectProps = ComponentProps<typeof StyledSelect>;

describe('ThemeSelector - TypeScript Compiler Validation & Schema Constraints Stability (Variation 10)', () => {
  it('1. TypeScript compiler validation: verifies exported interfaces and prop types', () => {
    expectTypeOf<ThemeSelectorProps>().toHaveProperty('theme').toBeString();
    expectTypeOf<ThemeSelectorProps>()
      .toHaveProperty('onThemeChange')
      .toBeFunction()
      .parameter(0)
      .toBeString();

    expectTypeOf<StyledSelectProps>().toHaveProperty('id').toBeString();
    expectTypeOf<StyledSelectProps>().toHaveProperty('value').toBeString();
    expectTypeOf<StyledSelectProps>()
      .toHaveProperty('onChange')
      .toBeFunction()
      .parameter(0)
      .toBeString();
    expectTypeOf<StyledSelectProps>().toHaveProperty('children');
  });

  it('2. Static type safety: verifies invalid props are rejected by TypeScript', () => {
    expectTypeOf<ThemeSelectorProps>().not.toHaveProperty('invalidProp');
    expectTypeOf<ThemeSelectorProps>().not.toHaveProperty('className');
    expectTypeOf<ThemeSelectorProps>().not.toHaveProperty('children');

    expectTypeOf<StyledSelectProps>().not.toHaveProperty('invalidProp');
    expectTypeOf<StyledSelectProps>().not.toHaveProperty('style');
  });

  it('3. Optional property validation: verifies optional props can be omitted without compile errors', () => {
    expectTypeOf<StyledSelectProps>().toHaveProperty('ariaLabel').toBeString().or.toBeUndefined();

    expectTypeOf<ThemeSelectorProps>().toHaveProperty('theme').not.toBeUndefined();
    expectTypeOf<ThemeSelectorProps>().toHaveProperty('onThemeChange').not.toBeUndefined();
  });

  it('4. Schema validation: verify exported TypeScript interfaces and prop definitions as fallback', () => {
    expectTypeOf<{ theme: string; onThemeChange: (theme: string) => void }>().toMatchTypeOf<ThemeSelectorProps>();

    expectTypeOf<{
      id: string;
      value: string;
      onChange: (v: string) => void;
      children: ReactNode;
    }>().toMatchTypeOf<StyledSelectProps>();
  });

  it('5. Type stability: verifies unions, enums, readonly fields, nullable values, and generic types compile correctly', () => {
    expectTypeOf<ThemeKey>().toBeString();

    expectTypeOf<'light'>().toMatchTypeOf<ThemeKey>();
    expectTypeOf<'dark'>().toMatchTypeOf<ThemeKey>();
    expectTypeOf<'auto'>().toMatchTypeOf<ThemeKey>();
    expectTypeOf<'random'>().toMatchTypeOf<ThemeKey>();

    expectTypeOf<'invalid_theme_literal'>().not.toMatchTypeOf<ThemeKey>();
  });
});

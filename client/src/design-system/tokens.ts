/**
 * Design System Tokens
 * 
 * Centralized design tokens for the application.
 * These tokens are also defined as CSS variables in index.css
 */

export const colors = {
  // Brand Colors
  brand: {
    primary: '#2C4C82',    // Dark Blue
    secondary: '#F2F5F2',  // Light Gray
  },
  
  // Semantic Colors
  success: 'oklch(0.65 0.15 145)',
  warning: 'oklch(0.75 0.15 85)',
  error: 'oklch(0.577 0.245 27.325)',
  info: 'oklch(0.60 0.15 240)',
} as const;

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

export const typography = {
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
} as const;

export const radius = {
  sm: 'calc(0.625rem * 0.6)',   // ~0.375rem
  md: 'calc(0.625rem * 0.8)',   // ~0.5rem
  lg: '0.625rem',               // 10px
  xl: 'calc(0.625rem * 1.4)',   // ~0.875rem
  '2xl': 'calc(0.625rem * 1.8)', // ~1.125rem
  '3xl': 'calc(0.625rem * 2.2)', // ~1.375rem
  '4xl': 'calc(0.625rem * 2.6)', // ~1.625rem
  full: '9999px',
} as const;

export const transitions = {
  duration: {
    fast: '100ms',
    normal: '150ms',
    slow: '300ms',
  },
  timing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export const breakpoints = {
  mobile: '0px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
} as const;

// Type exports for TypeScript
export type Spacing = keyof typeof spacing;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type Shadow = keyof typeof shadows;
export type Radius = keyof typeof radius;
export type Breakpoint = keyof typeof breakpoints;

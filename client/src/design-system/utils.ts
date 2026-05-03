/**
 * Design System Utilities
 * 
 * Helper functions for working with design tokens and theme values
 */

import { colors, spacing, typography, shadows, radius, transitions } from './tokens';

/**
 * Get a spacing value by key
 * @example getSpacing('md') // returns '1rem'
 */
export function getSpacing(key: keyof typeof spacing): string {
  return spacing[key];
}

/**
 * Get a font size value by key
 * @example getFontSize('lg') // returns '1.125rem'
 */
export function getFontSize(key: keyof typeof typography.fontSize): string {
  return typography.fontSize[key];
}

/**
 * Get a font weight value by key
 * @example getFontWeight('semibold') // returns 600
 */
export function getFontWeight(key: keyof typeof typography.fontWeight): number {
  return typography.fontWeight[key];
}

/**
 * Get a shadow value by key
 * @example getShadow('md') // returns the shadow CSS value
 */
export function getShadow(key: keyof typeof shadows): string {
  return shadows[key];
}

/**
 * Get a border radius value by key
 * @example getRadius('lg') // returns '0.625rem'
 */
export function getRadius(key: keyof typeof radius): string {
  return radius[key];
}

/**
 * Get a transition duration by key
 * @example getTransitionDuration('normal') // returns '150ms'
 */
export function getTransitionDuration(key: keyof typeof transitions.duration): string {
  return transitions.duration[key];
}

/**
 * Get a transition timing function by key
 * @example getTransitionTiming('ease') // returns 'cubic-bezier(0.4, 0, 0.2, 1)'
 */
export function getTransitionTiming(key: keyof typeof transitions.timing): string {
  return transitions.timing[key];
}

/**
 * Create a CSS transition string
 * @example createTransition('background-color', 'normal', 'ease')
 */
export function createTransition(
  property: string,
  duration: keyof typeof transitions.duration = 'normal',
  timing: keyof typeof transitions.timing = 'ease'
): string {
  return `${property} ${transitions.duration[duration]} ${transitions.timing[timing]}`;
}

/**
 * Get brand color
 * @example getBrandColor('primary') // returns '#2C4C82'
 */
export function getBrandColor(key: keyof typeof colors.brand): string {
  return colors.brand[key];
}

/**
 * Get semantic color
 * @example getSemanticColor('success') // returns the success color value
 */
export function getSemanticColor(key: 'success' | 'warning' | 'error' | 'info'): string {
  return colors[key];
}

/**
 * Convert hex color to RGB values
 * @example hexToRgb('#2C4C82') // returns { r: 44, g: 76, b: 130 }
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1]!, 16),
        g: parseInt(result[2]!, 16),
        b: parseInt(result[3]!, 16),
      }
    : null;
}

/**
 * Create a CSS variable reference
 * @example cssVar('brand-primary') // returns 'var(--brand-primary)'
 */
export function cssVar(name: string): string {
  return `var(--${name})`;
}

/**
 * Create a CSS variable with fallback
 * @example cssVarWithFallback('brand-primary', '#2C4C82')
 */
export function cssVarWithFallback(name: string, fallback: string): string {
  return `var(--${name}, ${fallback})`;
}

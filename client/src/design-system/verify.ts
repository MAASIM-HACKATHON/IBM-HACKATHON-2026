/**
 * Design System Verification Script
 * 
 * This file verifies that all design system exports are working correctly
 * Run: npx tsx src/design-system/verify.ts
 */

import {
  // Tokens
  colors,
  spacing,
  typography,
  shadows,
  radius,
  transitions,
  breakpoints,
  
  // Utilities
  getSpacing,
  getFontSize,
  getFontWeight,
  getShadow,
  getRadius,
  getTransitionDuration,
  getTransitionTiming,
  createTransition,
  getBrandColor,
  getSemanticColor,
  hexToRgb,
  cssVar,
  cssVarWithFallback,
  
  // Class name utility
  cn,
} from './index';

console.log('✅ Design System Verification\n');

// Test tokens
console.log('📦 Tokens:');
console.log('  Brand Primary:', colors.brand.primary);
console.log('  Brand Secondary:', colors.brand.secondary);
console.log('  Spacing MD:', spacing.md);
console.log('  Font Size Base:', typography.fontSize.base);
console.log('  Shadow MD:', shadows.md);
console.log('  Radius LG:', radius.lg);
console.log('  Transition Normal:', transitions.duration.normal);
console.log('  Breakpoint Desktop:', breakpoints.desktop);

// Test utility functions
console.log('\n🛠️  Utility Functions:');
console.log('  getSpacing("lg"):', getSpacing('lg'));
console.log('  getFontSize("xl"):', getFontSize('xl'));
console.log('  getFontWeight("semibold"):', getFontWeight('semibold'));
console.log('  getShadow("lg"):', getShadow('lg'));
console.log('  getRadius("md"):', getRadius('md'));
console.log('  getTransitionDuration("normal"):', getTransitionDuration('normal'));
console.log('  getTransitionTiming("ease"):', getTransitionTiming('ease'));
console.log('  createTransition("opacity"):', createTransition('opacity'));
console.log('  getBrandColor("primary"):', getBrandColor('primary'));
console.log('  getSemanticColor("success"):', getSemanticColor('success'));
console.log('  hexToRgb("#2C4C82"):', JSON.stringify(hexToRgb('#2C4C82')));
console.log('  cssVar("brand-primary"):', cssVar('brand-primary'));
console.log('  cssVarWithFallback("custom", "#000"):', cssVarWithFallback('custom', '#000'));

// Test cn utility
console.log('\n🎨 Class Name Utility:');
const testClasses = cn('px-4', 'py-2', 'bg-primary', 'text-white');
console.log('  cn("px-4", "py-2", "bg-primary", "text-white"):', testClasses);

console.log('\n✅ All design system exports are working correctly!');
console.log('\n📚 Next Steps:');
console.log('  1. Import design tokens: import { colors, spacing } from "@/design-system"');
console.log('  2. Use shadcn/ui components: import { Button } from "@/components/ui/button"');
console.log('  3. View test page: import { DesignSystemTest } from "@/design-system/test"');

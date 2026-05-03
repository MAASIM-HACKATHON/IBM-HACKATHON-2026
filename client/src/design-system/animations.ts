/**
 * Animation and Transition Utilities
 * 
 * Provides consistent animation and transition utilities across the application.
 * Implements requirements 16.1-16.6 for animations and transitions.
 */

import { transitions } from './tokens';

/**
 * Standard transition durations (100-300ms as per requirement 16.1)
 */
export const durations = {
  fast: transitions.duration.fast,      // 100ms
  normal: transitions.duration.normal,  // 150ms
  slow: transitions.duration.slow,      // 300ms
} as const;

/**
 * Standard easing functions
 */
export const easings = {
  ease: transitions.timing.ease,
  easeIn: transitions.timing.easeIn,
  easeOut: transitions.timing.easeOut,
  easeInOut: transitions.timing.easeInOut,
} as const;

/**
 * Transition class utilities for common UI state changes
 * Requirements: 16.1, 16.2, 16.3, 16.4
 */
export const transitionClasses = {
  // Hover state transitions (Requirement 16.2)
  hover: 'transition-colors duration-150 ease-in-out',
  hoverScale: 'transition-transform duration-150 ease-in-out hover:scale-105',
  hoverOpacity: 'transition-opacity duration-150 ease-in-out hover:opacity-80',
  
  // Focus state transitions (Requirement 16.3)
  focus: 'transition-all duration-150 ease-in-out',
  
  // General UI state transitions (Requirement 16.1)
  colors: 'transition-colors duration-150 ease-in-out',
  all: 'transition-all duration-150 ease-in-out',
  transform: 'transition-transform duration-150 ease-in-out',
  opacity: 'transition-opacity duration-150 ease-in-out',
  
  // Modal and dialog animations (Requirement 16.4)
  modal: 'transition-all duration-200 ease-in-out',
  modalBackdrop: 'transition-opacity duration-200 ease-in-out',
  
  // Sidebar and navigation
  sidebar: 'transition-all duration-300 ease-in-out',
  
  // Smooth layout shifts
  layout: 'transition-all duration-300 ease-in-out',
} as const;

/**
 * Animation keyframe classes
 */
export const animations = {
  // Fade animations
  fadeIn: 'animate-in fade-in',
  fadeOut: 'animate-out fade-out',
  
  // Slide animations
  slideInFromTop: 'animate-in slide-in-from-top',
  slideInFromBottom: 'animate-in slide-in-from-bottom',
  slideInFromLeft: 'animate-in slide-in-from-left',
  slideInFromRight: 'animate-in slide-in-from-right',
  
  // Scale animations
  scaleIn: 'animate-in zoom-in',
  scaleOut: 'animate-out zoom-out',
  
  // Spin animation for loading states
  spin: 'animate-spin',
  
  // Pulse animation for loading states
  pulse: 'animate-pulse',
} as const;

/**
 * Reduced motion utilities (Requirements 16.5, 16.6)
 * 
 * These classes respect the user's prefers-reduced-motion preference
 * and provide alternatives that avoid excessive motion.
 */
export const reducedMotionClasses = {
  // Safe transitions that work with reduced motion
  safeTransition: 'motion-safe:transition-all motion-safe:duration-150',
  safeHover: 'motion-safe:transition-colors motion-safe:duration-150',
  
  // Animations that are disabled with reduced motion
  safeAnimate: 'motion-safe:animate-in motion-reduce:animate-none',
  safeScale: 'motion-safe:hover:scale-105 motion-reduce:hover:scale-100',
  
  // Reduced motion alternatives
  reducedOpacity: 'motion-reduce:transition-opacity motion-reduce:duration-0',
  reducedNone: 'motion-reduce:transition-none',
} as const;

/**
 * Hook to detect if user prefers reduced motion
 * Requirement 16.5: Detect prefers-reduced-motion preference
 */
export function usePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Get appropriate transition class based on reduced motion preference
 * Requirement 16.6: Provide reduced motion alternatives
 */
export function getTransitionClass(
  normalTransition: string,
  reducedMotionAlternative?: string
): string {
  if (typeof window === 'undefined') return normalTransition;
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion && reducedMotionAlternative) {
    return reducedMotionAlternative;
  }
  
  return normalTransition;
}

/**
 * Common animation combinations for specific UI elements
 */
export const componentAnimations = {
  // Button animations (Requirements 16.1, 16.2)
  button: {
    base: 'transition-all duration-150 ease-in-out',
    hover: 'hover:brightness-110 hover:shadow-md',
    active: 'active:scale-95',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    full: 'transition-all duration-150 ease-in-out hover:brightness-110 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
  },
  
  // Input animations (Requirement 16.3)
  input: {
    base: 'transition-all duration-150 ease-in-out',
    focus: 'focus:ring-2 focus:ring-ring focus:ring-offset-2',
    full: 'transition-all duration-150 ease-in-out focus:ring-2 focus:ring-ring focus:ring-offset-2',
  },
  
  // Card animations (Requirement 16.2)
  card: {
    base: 'transition-all duration-150 ease-in-out',
    hover: 'hover:shadow-lg hover:scale-[1.02]',
    full: 'transition-all duration-150 ease-in-out hover:shadow-lg hover:scale-[1.02]',
  },
  
  // Modal animations (Requirement 16.4)
  modal: {
    overlay: 'animate-in fade-in duration-200',
    content: 'animate-in fade-in zoom-in-95 duration-200',
    exit: 'animate-out fade-out zoom-out-95 duration-200',
  },
  
  // Dialog animations (Requirement 16.4)
  dialog: {
    overlay: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    content: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
  },
  
  // Tooltip animations
  tooltip: {
    base: 'animate-in fade-in-0 zoom-in-95 duration-150',
    exit: 'animate-out fade-out-0 zoom-out-95 duration-150',
  },
  
  // Dropdown animations
  dropdown: {
    base: 'animate-in fade-in-0 zoom-in-95 duration-150',
    exit: 'animate-out fade-out-0 zoom-out-95 duration-150',
  },
} as const;

/**
 * Timing constants for consistent animation timing
 */
export const timing = {
  // UI state changes (Requirement 16.1)
  uiStateChange: 150, // ms
  
  // Hover states (Requirement 16.2)
  hover: 150, // ms
  
  // Focus states (Requirement 16.3)
  focus: 150, // ms
  
  // Modal/Dialog (Requirement 16.4)
  modal: 200, // ms
  dialog: 200, // ms
  
  // Sidebar transitions
  sidebar: 300, // ms
  
  // Tooltip delay
  tooltipDelay: 150, // ms
} as const;

export type TransitionClass = keyof typeof transitionClasses;
export type AnimationClass = keyof typeof animations;
export type ReducedMotionClass = keyof typeof reducedMotionClasses;

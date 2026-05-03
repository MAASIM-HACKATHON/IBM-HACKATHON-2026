/**
 * useReducedMotion Hook
 * 
 * Detects if the user prefers reduced motion based on their system settings.
 * Implements requirement 16.5: Detect prefers-reduced-motion preference
 * Implements requirement 16.6: Provide reduced motion alternatives
 */

import { useEffect, useState } from 'react';

/**
 * Hook to detect and respond to user's reduced motion preference
 * 
 * @returns boolean - true if user prefers reduced motion, false otherwise
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const prefersReducedMotion = useReducedMotion();
 *   
 *   return (
 *     <div className={prefersReducedMotion ? 'transition-none' : 'transition-all'}>
 *       Content
 *     </div>
 *   );
 * }
 * ```
 */
export function useReducedMotion(): boolean {
  // Default to false for SSR
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') return;

    // Create media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Create event listener for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add event listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Get appropriate animation class based on reduced motion preference
 * 
 * @param normalAnimation - The animation class to use normally
 * @param reducedAnimation - The animation class to use when reduced motion is preferred (optional)
 * @returns The appropriate animation class
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const prefersReducedMotion = useReducedMotion();
 *   const animationClass = getAnimationClass(
 *     prefersReducedMotion,
 *     'transition-all duration-300',
 *     'transition-opacity duration-150'
 *   );
 *   
 *   return <div className={animationClass}>Content</div>;
 * }
 * ```
 */
export function getAnimationClass(
  prefersReducedMotion: boolean,
  normalAnimation: string,
  reducedAnimation?: string
): string {
  if (prefersReducedMotion) {
    return reducedAnimation || 'transition-none';
  }
  return normalAnimation;
}

/**
 * Get appropriate transition duration based on reduced motion preference
 * 
 * @param normalDuration - Duration in milliseconds for normal motion
 * @returns Duration in milliseconds (0 if reduced motion is preferred)
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const prefersReducedMotion = useReducedMotion();
 *   const duration = getTransitionDuration(prefersReducedMotion, 300);
 *   
 *   return (
 *     <div style={{ transitionDuration: `${duration}ms` }}>
 *       Content
 *     </div>
 *   );
 * }
 * ```
 */
export function getTransitionDuration(
  prefersReducedMotion: boolean,
  normalDuration: number
): number {
  return prefersReducedMotion ? 0 : normalDuration;
}

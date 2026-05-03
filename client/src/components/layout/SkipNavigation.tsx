import { type ReactElement } from 'react';
import { cn } from '@/lib/utils';

/**
 * SkipNavigation Component
 * 
 * Provides skip navigation links for keyboard and screen reader users
 * to quickly navigate to main content areas.
 * 
 * Requirements:
 * - 14.7: Provide skip navigation links for screen reader users
 * - Task 22.3: Implement skip to main content and skip to navigation links
 * 
 * Accessibility Features:
 * - Hidden by default, visible on keyboard focus
 * - High contrast focus indicator
 * - Positioned at top of page for first Tab press
 * - Smooth scroll to target sections
 */
export function SkipNavigation(): ReactElement {
  const skipLinkClasses = cn(
    // Hidden by default using sr-only
    'sr-only',
    // Visible when focused
    'focus:not-sr-only',
    'focus:absolute',
    'focus:top-4',
    'focus:left-4',
    'focus:z-[100]',
    // Styling
    'focus:px-4',
    'focus:py-3',
    'focus:rounded-lg',
    'focus:bg-primary',
    'focus:text-primary-foreground',
    'focus:font-medium',
    'focus:text-sm',
    // Focus indicator with high contrast
    'focus:outline-none',
    'focus:ring-4',
    'focus:ring-ring',
    'focus:ring-offset-2',
    'focus:ring-offset-background',
    // Smooth transition
    'transition-all',
    'duration-150'
  );

  return (
    <>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className={skipLinkClasses}
        onClick={(e) => {
          e.preventDefault();
          const mainContent = document.getElementById('main-content');
          if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
      >
        Skip to main content
      </a>

      {/* Skip to navigation link */}
      <a
        href="#sidebar-navigation"
        className={skipLinkClasses}
        onClick={(e) => {
          e.preventDefault();
          const navigation = document.getElementById('sidebar-navigation');
          if (navigation) {
            navigation.focus();
            navigation.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
      >
        Skip to navigation
      </a>
    </>
  );
}

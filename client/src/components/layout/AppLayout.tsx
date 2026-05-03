import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { SkipNavigation } from './SkipNavigation';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Skip navigation links - Task 22.3 */}
      <SkipNavigation />
      
      <Sidebar />
      
      {/* Main content area with responsive padding and layout */}
      <div className="flex-1 flex flex-col min-h-screen ml-16 transition-all duration-300">
        {/* Main content area */}
        <main
          id="main-content"
          className={cn(
            'flex-1 w-full',
            'px-4 py-6',
            'md:px-6 md:py-8',
            'lg:px-8 lg:py-10',
            // Task 23.2: Ensure no horizontal scrolling on all viewport sizes
            // Requirement 13.4: Prevent horizontal scrolling on all viewport sizes
            'max-w-[100vw] overflow-x-hidden',
            className
          )}
          role="main"
          tabIndex={-1}
          aria-label="Main content"
        >
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

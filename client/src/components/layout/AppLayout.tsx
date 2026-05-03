import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      {/* Main content area with responsive padding and layout */}
      <div className="flex-1 flex flex-col min-h-screen ml-16 transition-all duration-300">
        {/* Header with theme toggle */}
        <header className="sticky top-0 z-30 flex items-center justify-end px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <ThemeToggle />
        </header>
        
        {/* Main content area */}
        <main
          id="main-content"
          className={cn(
            'flex-1 w-full',
            'px-4 py-6',
            'md:px-6 md:py-8',
            'lg:px-8 lg:py-10',
            'max-w-[100vw] overflow-x-hidden',
            className
          )}
          role="main"
        >
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

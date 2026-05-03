import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiHome, HiMail, HiDocumentText, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: HiHome,
    path: '/',
  },
  {
    id: 'email-generator',
    label: 'Email Generator',
    icon: HiMail,
    path: '/email-generator',
  },
  {
    id: 'resume-builder',
    label: 'Resume Builder',
    icon: HiDocumentText,
    path: '/resume-builder',
  },
];

export function Sidebar() {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Detect viewport size and auto-collapse on mobile
  useEffect(() => {
    const checkViewport = () => {
      const mobile = window.innerWidth < 768;
      if (mobile) {
        setIsExpanded(false);
      }
    };

    // Check on mount
    checkViewport();

    // Listen for resize events
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (e: React.KeyboardEvent, path: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.location.href = path;
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        id="sidebar-navigation"
        className={cn(
          'fixed left-0 top-0 h-screen bg-background border-r border-border transition-all duration-300 ease-in-out z-40',
          isExpanded ? 'w-64' : 'w-16'
        )}
        role="navigation"
        aria-label="Main navigation"
        tabIndex={-1}
      >
        <div className="flex flex-col h-full">
          {/* Header with theme toggle */}
          <div className="p-2 border-b border-border flex items-center justify-center">
            <ThemeToggle />
          </div>

          {/* Navigation items */}
          <nav className="flex-1 py-4" aria-label="Primary navigation">
            <ul className="space-y-2 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.path}
                          className={cn(
                            'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-150',
                            'hover:bg-accent hover:text-accent-foreground',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            isActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
                          )}
                          aria-label={item.label}
                          aria-current={isActive ? 'page' : undefined}
                          tabIndex={0}
                          onKeyDown={(e) => handleKeyDown(e, item.path)}
                        >
                          <Icon
                            className={cn(
                              'w-6 h-6 flex-shrink-0',
                              isActive ? 'text-primary-foreground' : 'text-foreground'
                            )}
                            aria-hidden="true"
                          />
                          {isExpanded && (
                            <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                              {item.label}
                            </span>
                          )}
                        </Link>
                      </TooltipTrigger>
                      {!isExpanded && (
                        <TooltipContent side="right" className="font-medium">
                          {item.label}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Toggle button */}
          <div className="p-2 border-t border-border">
            <button
              onClick={toggleSidebar}
              className={cn(
                'w-full flex items-center justify-center px-3 py-3 rounded-lg',
                'hover:bg-accent hover:text-accent-foreground transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              )}
              aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <>
                  <HiChevronLeft className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="ml-2 text-sm font-medium">Collapse</span>
                </>
              ) : (
                <HiChevronRight className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

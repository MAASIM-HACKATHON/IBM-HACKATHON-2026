/**
 * Layout Test Page
 * 
 * This page demonstrates the responsive layout implementation
 * with various content types and breakpoints.
 */

export default function LayoutTestPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-foreground mb-2">Layout Test Page</h1>
        <p className="text-muted-foreground">
          This page demonstrates the responsive layout with typography and spacing.
        </p>
      </div>

      {/* Typography Examples */}
      <section className="space-y-4">
        <h2 className="text-foreground">Typography Scale</h2>
        <div className="space-y-3 p-6 bg-card rounded-lg border border-border">
          <h1>Heading 1 - Responsive (24px → 30px → 36px)</h1>
          <h2>Heading 2 - Responsive (20px → 24px → 30px)</h2>
          <h3>Heading 3 - Responsive (18px → 20px → 24px)</h3>
          <h4>Heading 4 - Responsive (16px → 18px → 20px)</h4>
          <h5>Heading 5 - Responsive (14px → 16px → 18px)</h5>
          <h6>Heading 6 - Minimum 14px</h6>
          <p>
            Body text with line-height 1.5 for optimal readability. This text is 14px on mobile
            and 16px on desktop (≥1024px). Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
      </section>

      {/* Responsive Breakpoints */}
      <section className="space-y-4">
        <h2 className="text-foreground">Responsive Breakpoints</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card rounded-lg border border-border">
            <h3 className="mb-2">Mobile (&lt;768px)</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Padding: 16px horizontal, 24px vertical</li>
              <li>• Body text: 14px</li>
              <li>• Sidebar: Auto-collapsed</li>
              <li>• Single column layout</li>
            </ul>
          </div>
          
          <div className="p-6 bg-card rounded-lg border border-border">
            <h3 className="mb-2">Tablet (768-1023px)</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Padding: 24px horizontal, 32px vertical</li>
              <li>• Body text: 14px</li>
              <li>• Sidebar: Collapsible</li>
              <li>• 2-column grid</li>
            </ul>
          </div>
          
          <div className="p-6 bg-card rounded-lg border border-border">
            <h3 className="mb-2">Desktop (≥1024px)</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Padding: 32px horizontal, 40px vertical</li>
              <li>• Body text: 16px</li>
              <li>• Sidebar: Full functionality</li>
              <li>• 3-column grid</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Spacing Examples */}
      <section className="space-y-4">
        <h2 className="text-foreground">Spacing Scale</h2>
        <div className="space-y-3 p-6 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-primary" style={{ width: '4px' }}></div>
            <span className="text-sm">xs: 4px</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-2 h-8 bg-primary"></div>
            <span className="text-sm">sm: 8px</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-4 h-8 bg-primary"></div>
            <span className="text-sm">md: 16px</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-6 h-8 bg-primary"></div>
            <span className="text-sm">lg: 24px</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-primary"></div>
            <span className="text-sm">xl: 32px</span>
          </div>
        </div>
      </section>

      {/* Content Width Constraint */}
      <section className="space-y-4">
        <h2 className="text-foreground">Content Width Constraint</h2>
        <div className="p-6 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground mb-4">
            The main content area is constrained to a maximum width of 1280px (max-w-7xl)
            for optimal reading experience. This prevents content from stretching too wide
            on large displays.
          </p>
          <div className="h-2 bg-primary rounded-full" style={{ width: '100%' }}></div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Content width indicator (100% of max-w-7xl container)
          </p>
        </div>
      </section>

      {/* Horizontal Scrolling Prevention */}
      <section className="space-y-4">
        <h2 className="text-foreground">Horizontal Scrolling Prevention</h2>
        <div className="p-6 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground mb-4">
            The layout prevents horizontal scrolling on all viewport sizes using:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <code className="px-2 py-1 bg-muted rounded">max-w-[100vw]</code> on main content</li>
            <li>• <code className="px-2 py-1 bg-muted rounded">overflow-x-hidden</code> to clip overflow</li>
            <li>• Responsive padding that adapts to viewport</li>
          </ul>
        </div>
      </section>

      {/* Theme Toggle */}
      <section className="space-y-4">
        <h2 className="text-foreground">Theme System</h2>
        <div className="p-6 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground mb-4">
            The theme toggle button is located in the sticky header (top-right).
            Try switching between light and dark modes to see the responsive design
            in both themes.
          </p>
          <div className="flex gap-4">
            <div className="flex-1 p-4 bg-background border border-border rounded">
              <p className="text-sm font-medium mb-2">Light Mode</p>
              <p className="text-xs text-muted-foreground">
                Clean, bright interface with high contrast
              </p>
            </div>
            <div className="flex-1 p-4 bg-background border border-border rounded">
              <p className="text-sm font-medium mb-2">Dark Mode</p>
              <p className="text-xs text-muted-foreground">
                Easy on the eyes with WCAG AA contrast
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

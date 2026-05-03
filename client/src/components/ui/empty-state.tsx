import * as React from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Icon to display in the empty state
   */
  icon: LucideIcon
  /**
   * Title text for the empty state
   */
  title: string
  /**
   * Description text providing guidance
   */
  description: string
  /**
   * Optional action button
   */
  action?: {
    label: string
    onClick: () => void
  }
  /**
   * Optional secondary action button
   */
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

/**
 * EmptyState Component
 * 
 * Task 25.3: Add empty states with helpful guidance
 * Requirements:
 * - 17.4: Display empty state with helpful guidance when page section has no content
 * - 19.3: Optimized with React.memo to avoid unnecessary re-renders
 * 
 * Features:
 * - Icon display with themed background
 * - Title and description text
 * - Optional action buttons
 * - Accessible and responsive
 */
export const EmptyState = React.memo(function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed border-border p-8 text-center",
        className
      )}
      role="status"
      aria-label={title}
      {...props}
    >
      {/* Icon */}
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2C4C82]/10 dark:bg-[#2C4C82]/20">
        <Icon className="h-6 w-6 text-[#2C4C82] dark:text-[#2C4C82]/90" aria-hidden="true" />
      </div>

      {/* Text Content */}
      <div className="space-y-2 max-w-md">
        <p className="text-sm font-medium text-foreground">
          {title}
        </p>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Action Buttons */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {action && (
            <Button
              onClick={action.onClick}
              className="bg-[#2C4C82] hover:bg-[#2C4C82]/90"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
});

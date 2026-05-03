import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Spinner } from "./spinner"

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the loading overlay is visible
   */
  isLoading: boolean
  /**
   * Loading message to display
   */
  message?: string
  /**
   * Size of the spinner
   */
  size?: "sm" | "md" | "lg" | "xl"
  /**
   * Whether to show as a full-screen overlay
   */
  fullScreen?: boolean
}

/**
 * LoadingOverlay Component
 * 
 * Task 25.1: Add loading indicators for all async operations
 * Requirements:
 * - 17.1: Display loading indicator when user submits a form
 * - 17.5: Display progress indicator when long-running operation is in progress
 * 
 * Features:
 * - Overlay with backdrop
 * - Spinner with optional message
 * - Full-screen or inline mode
 * - Accessible with aria-live region
 */
export function LoadingOverlay({
  isLoading,
  message = "Loading...",
  size = "lg",
  fullScreen = false,
  className,
  children,
  ...props
}: LoadingOverlayProps & { children?: React.ReactNode }) {
  if (!isLoading && !children) {
    return null
  }

  return (
    <div
      className={cn(
        "relative",
        fullScreen && "fixed inset-0 z-50",
        className
      )}
      {...props}
    >
      {/* Content */}
      {children}

      {/* Loading Overlay */}
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm",
            fullScreen && "fixed"
          )}
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex flex-col items-center gap-4">
            <Spinner size={size} label={message} />
            {message && (
              <p className="text-sm font-medium text-muted-foreground">
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Inline Loading Indicator
 * 
 * Simpler loading indicator for inline use
 */
export interface InlineLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function InlineLoading({
  message = "Loading...",
  size = "md",
  className,
  ...props
}: InlineLoadingProps) {
  return (
    <div
      className={cn("flex items-center gap-3", className)}
      role="status"
      aria-live="polite"
      {...props}
    >
      <Loader2 className={cn(
        "animate-spin text-[#2C4C82]",
        size === "sm" && "h-4 w-4",
        size === "md" && "h-5 w-5",
        size === "lg" && "h-6 w-6",
        size === "xl" && "h-8 w-8"
      )} />
      {message && (
        <p className={cn(
          "font-medium text-muted-foreground",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          size === "lg" && "text-base",
          size === "xl" && "text-lg"
        )}>
          {message}
        </p>
      )}
    </div>
  )
}

import * as React from "react"
import { Upload, X, File } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

export interface FileUploadProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  /**
   * Callback when a file is selected
   */
  onFileSelect?: (file: File) => void
  
  /**
   * Callback when the file is cleared
   */
  onFileClear?: () => void
  
  /**
   * Accepted file types (e.g., ".pdf,.docx,.txt")
   */
  accept?: string
  
  /**
   * Maximum file size in bytes
   */
  maxSize?: number
  
  /**
   * Current uploaded file
   */
  file?: File | null
  
  /**
   * Whether the component is disabled
   */
  disabled?: boolean
  
  /**
   * Error message to display
   */
  error?: string
}

/**
 * FileUpload component with drag-and-drop support
 * 
 * **Validates: Requirements 7.1, 7.2, 7.5**
 * 
 * Features:
 * - Drag-and-drop file upload (Requirement 7.1)
 * - Browse and select file upload (Requirement 7.2)
 * - Display file name and size after upload (Requirement 7.5)
 */
const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      className,
      onFileSelect,
      onFileClear,
      accept,
      maxSize,
      file,
      disabled = false,
      error,
      ...props
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const dragCounter = React.useRef(0)

    // Handle file selection
    const handleFileSelect = React.useCallback(
      (selectedFile: File) => {
        if (disabled) return

        // Validate file size if maxSize is provided
        if (maxSize && selectedFile.size > maxSize) {
          return
        }

        onFileSelect?.(selectedFile)
      },
      [disabled, maxSize, onFileSelect]
    )

    // Handle file input change
    const handleFileInputChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0]
        if (selectedFile) {
          handleFileSelect(selectedFile)
        }
      },
      [handleFileSelect]
    )

    // Handle drag enter
    const handleDragEnter = React.useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
        
        if (disabled) return

        dragCounter.current++
        if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
          setIsDragging(true)
        }
      },
      [disabled]
    )

    // Handle drag leave
    const handleDragLeave = React.useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
        
        if (disabled) return

        dragCounter.current--
        if (dragCounter.current === 0) {
          setIsDragging(false)
        }
      },
      [disabled]
    )

    // Handle drag over
    const handleDragOver = React.useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
      },
      []
    )

    // Handle drop
    const handleDrop = React.useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
        
        if (disabled) return

        setIsDragging(false)
        dragCounter.current = 0

        const droppedFile = event.dataTransfer.files?.[0]
        if (droppedFile) {
          handleFileSelect(droppedFile)
        }
      },
      [disabled, handleFileSelect]
    )

    // Handle browse button click
    const handleBrowseClick = React.useCallback(() => {
      if (disabled) return
      fileInputRef.current?.click()
    }, [disabled])

    // Handle file clear
    const handleFileClear = React.useCallback(() => {
      if (disabled) return
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      
      onFileClear?.()
    }, [disabled, onFileClear])

    // Format file size
    const formatFileSize = React.useCallback((bytes: number): string => {
      if (bytes === 0) return "0 Bytes"
      
      const k = 1024
      const sizes = ["Bytes", "KB", "MB", "GB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
    }, [])

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          aria-label="File upload input"
        />

        {/* Drag and drop zone */}
        {!file && (
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all duration-200",
              isDragging
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50",
              disabled && "opacity-50 cursor-not-allowed pointer-events-none",
              error && "border-destructive bg-destructive/5"
            )}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label="Drag and drop file upload zone"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleBrowseClick()
              }
            }}
          >
            {/* Upload icon */}
            <div
              className={cn(
                "mb-4 rounded-full p-3 transition-colors",
                isDragging ? "bg-primary/10" : "bg-muted"
              )}
            >
              <Upload
                className={cn(
                  "h-8 w-8 transition-colors",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )}
              />
            </div>

            {/* Text content */}
            <div className="text-center">
              <p className="mb-1 text-sm font-medium text-foreground">
                {isDragging ? "Drop file here" : "Drag and drop file here"}
              </p>
              <p className="mb-4 text-xs text-muted-foreground">
                or
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBrowseClick}
                disabled={disabled}
              >
                Browse Files
              </Button>
            </div>

            {/* Accepted file types hint */}
            {accept && (
              <p className="mt-4 text-xs text-muted-foreground">
                Accepted formats: {accept.replace(/\./g, "").toUpperCase()}
              </p>
            )}
          </div>
        )}

        {/* File display */}
        {file && (
          <div
            className={cn(
              "flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all",
              disabled && "opacity-50"
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* File icon */}
              <div className="flex-shrink-0 rounded-md bg-primary/10 p-2">
                <File className="h-5 w-5 text-primary" />
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            {/* Clear button */}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleFileClear}
              disabled={disabled}
              aria-label="Clear file"
              className="flex-shrink-0 ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-2 text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

FileUpload.displayName = "FileUpload"

export { FileUpload }

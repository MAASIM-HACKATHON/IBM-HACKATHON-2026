import toast, { Toaster as HotToaster, Toast as HotToast } from "react-hot-toast"
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Toast variants
export type ToastVariant = "success" | "error" | "info" | "warning"

// Custom toast component
interface CustomToastProps {
  t: HotToast
  message: string
  variant: ToastVariant
}

function CustomToast({ t, message, variant }: CustomToastProps) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />,
    error: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
    info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
  }

  const styles = {
    success: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
    error: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
    info: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
    warning: "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950",
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all",
        styles[variant],
        t.visible ? "animate-in slide-in-from-top-5" : "animate-out slide-out-to-top-5"
      )}
    >
      {icons[variant]}
      <p className="flex-1 text-sm font-medium text-foreground">{message}</p>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Toast helper functions
export const showToast = {
  success: (message: string, duration = 4000) => {
    return toast.custom(
      (t) => <CustomToast t={t} message={message} variant="success" />,
      { duration }
    )
  },
  error: (message: string, duration = 5000) => {
    return toast.custom(
      (t) => <CustomToast t={t} message={message} variant="error" />,
      { duration }
    )
  },
  info: (message: string, duration = 4000) => {
    return toast.custom(
      (t) => <CustomToast t={t} message={message} variant="info" />,
      { duration }
    )
  },
  warning: (message: string, duration = 4000) => {
    return toast.custom(
      (t) => <CustomToast t={t} message={message} variant="warning" />,
      { duration }
    )
  },
}

// Toaster component to be added to app root
export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
        },
      }}
    />
  )
}

// Re-export toast for direct usage
export { toast }

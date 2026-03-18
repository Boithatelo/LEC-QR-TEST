"use client"

import { AlertCircle, CheckCircle2, Info } from "lucide-react"

import { cn } from "@/lib/utils"

export type InlineStatusVariant = "success" | "info" | "error"

export type InlineStatusPayload = {
  text: string
  variant?: InlineStatusVariant
}

const variantStyles: Record<InlineStatusVariant, { wrapper: string; icon: string }> = {
  success: {
    wrapper: "border-emerald-400 bg-emerald-100/95 text-emerald-950",
    icon: "text-emerald-700",
  },
  info: {
    wrapper: "border-[#3390DA] bg-[#DDF0FF] text-[#0A3760]",
    icon: "text-[#0B4B84]",
  },
  error: {
    wrapper: "border-rose-400 bg-rose-100/95 text-rose-900",
    icon: "text-rose-700",
  },
}

export function InlineStatusMessage({
  message,
  className,
  floating = false,
}: {
  message: InlineStatusPayload | null
  className?: string
  floating?: boolean
}) {
  if (!message) {
    return null
  }

  const variant = message.variant ?? "info"
  const styles = variantStyles[variant]
  const Icon = variant === "success" ? CheckCircle2 : variant === "error" ? AlertCircle : Info
  const title = variant === "success" ? "Success" : variant === "error" ? "Action Failed" : "Notice"

  return (
    <div
      className={cn(
        floating ? "pointer-events-none fixed inset-x-3 top-20 z-[90] md:inset-x-auto md:right-6 md:w-[min(92vw,420px)]" : "",
        className
      )}
    >
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-auto flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm shadow-lg ring-1 ring-black/5 animate-in fade-in zoom-in-95 slide-in-from-top-3 duration-300",
          styles.wrapper
        )}
      >
        <Icon className={cn("mt-0.5 h-4 w-4 shrink-0 animate-pulse", styles.icon)} />
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold tracking-[0.08em] uppercase">{title}</p>
          <p className="leading-5">{message.text}</p>
        </div>
      </div>
    </div>
  )
}

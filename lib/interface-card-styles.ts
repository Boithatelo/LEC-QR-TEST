import { cn } from "@/lib/utils"

const interfaceHoverState =
  "hover:-translate-y-0.5 hover:border-[#0B1F3A] hover:bg-[#0B1F3A] hover:shadow-[0_10px_20px_rgba(11,31,58,0.25)]"

const interfaceActiveState =
  "border-[#0B1F3A] bg-[#0B1F3A] shadow-[0_10px_20px_rgba(11,31,58,0.25)]"

export function getInterfaceActionCardClassName(active = false, className?: string): string {
  return cn(
    "group flex min-h-[112px] cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]/40",
    active ? interfaceActiveState : cn("border-[#0072CE]/25 bg-[#F7FBFF]", interfaceHoverState),
    className
  )
}

export function getInterfaceCardIconClassName(active = false, className?: string): string {
  return cn(
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
    active
      ? "bg-white text-[#0B1F3A]"
      : "bg-[#0072CE] text-white group-hover:-translate-y-0.5 group-hover:bg-white group-hover:text-[#0B1F3A]",
    className
  )
}

export function getInterfaceCardTitleClassName(active = false, className?: string): string {
  return cn(
    "block text-sm font-semibold transition-colors duration-200",
    active ? "text-white" : "text-[#0B1F3A] group-hover:text-white",
    className
  )
}

export function getInterfaceCardDescriptionClassName(active = false, className?: string): string {
  return cn(
    "block text-xs leading-5 transition-colors duration-200",
    active ? "text-[#DCEBFF]" : "text-[#1E3A6D] group-hover:text-[#DCEBFF]",
    className
  )
}

export function getInterfaceTileClassName(active = false, className?: string): string {
  return cn(
    "group rounded-xl border px-4 py-3 text-left shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]/40",
    active ? interfaceActiveState : cn("border-[#0072CE]/25 bg-white", interfaceHoverState),
    className
  )
}

export function getInterfaceTileTitleClassName(active = false, className?: string): string {
  return cn(
    "text-base font-semibold transition-colors duration-200",
    active ? "text-white" : "text-[#0B1F3A] group-hover:text-white",
    className
  )
}

export function getInterfaceTileDescriptionClassName(active = false, className?: string): string {
  return cn(
    "mt-1 text-xs transition-colors duration-200",
    active ? "text-[#DCEBFF]" : "text-[#1E3A6D] group-hover:text-[#DCEBFF]",
    className
  )
}

export function getInterfaceSurfaceCardClassName(className?: string): string {
  return cn(
    "group rounded-xl border bg-white py-0 shadow-sm transition-all duration-200",
    "border-[#0072CE]/25",
    interfaceHoverState,
    className
  )
}

export function getInterfaceSurfaceTitleClassName(className?: string): string {
  return cn("text-base font-semibold text-[#0B1F3A] transition-colors duration-200 group-hover:text-white", className)
}

export function getInterfaceSurfaceDescriptionClassName(className?: string): string {
  return cn("text-sm text-[#4A6A96] transition-colors duration-200 group-hover:text-[#DCEBFF]", className)
}

export function getInterfaceSurfaceLinkClassName(className?: string): string {
  return cn(
    "mt-4 inline-flex text-sm font-medium text-[#0B1F3A] transition-colors duration-200 group-hover:text-white group-hover:underline",
    className
  )
}

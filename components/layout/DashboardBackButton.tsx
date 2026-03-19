"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

type DashboardBackButtonProps = {
  href?: string
  ariaLabel?: string
  title?: string
  onClick?: () => void
}

export function DashboardBackButton({
  href,
  ariaLabel = "Return to dashboard",
  title = "Return to dashboard",
  onClick,
}: DashboardBackButtonProps) {
  const className =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#0072CE]/35 bg-white text-[#1E3A6D] shadow-sm transition hover:border-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white"

  if (onClick) {
    return (
      <button type="button" aria-label={ariaLabel} title={title} onClick={onClick} className={className}>
        <ArrowLeft className="h-4 w-4" />
      </button>
    )
  }

  if (!href) {
    return null
  }

  return (
    <Link href={href} aria-label={ariaLabel} title={title} className={className}>
      <ArrowLeft className="h-4 w-4" />
    </Link>
  )
}

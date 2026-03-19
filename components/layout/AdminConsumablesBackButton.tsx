import Link from "next/link"
import { ArrowLeft } from "lucide-react"

type AdminConsumablesBackButtonProps = {
  href?: string
  label?: string
  onClick?: () => void
}

export function AdminConsumablesBackButton({
  href = "/admin-consumables/dashboard",
  label = "Return to admin consumables dashboard",
  onClick,
}: AdminConsumablesBackButtonProps) {
  const className =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#0072CE]/35 bg-white text-[#1E3A6D] shadow-sm transition hover:bg-[#EEF5FD] hover:text-[#0B4B84]"

  if (onClick) {
    return (
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={onClick}
        className={className}
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
    )
  }

  return (
    <Link href={href} aria-label={label} title={label} className={className}>
      <ArrowLeft className="h-4 w-4" />
    </Link>
  )
}

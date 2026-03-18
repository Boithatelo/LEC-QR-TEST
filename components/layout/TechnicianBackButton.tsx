import Link from "next/link"
import { ArrowLeft } from "lucide-react"

type TechnicianBackButtonProps = {
  href?: string
  ariaLabel?: string
  title?: string
}

export function TechnicianBackButton({
  href = "/technician/dashboard",
  ariaLabel = "Back",
  title = "Back",
}: TechnicianBackButtonProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      title={title}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#0072CE]/35 bg-white text-[#1E3A6D] shadow-sm transition hover:border-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" />
    </Link>
  )
}

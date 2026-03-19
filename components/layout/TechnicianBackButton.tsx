import { DashboardBackButton } from "@/components/layout/DashboardBackButton"

type TechnicianBackButtonProps = {
  href?: string
  label?: string
  ariaLabel?: string
  title?: string
}

export function TechnicianBackButton({
  href = "/technician/dashboard",
  label,
  ariaLabel = label ?? "Return to dashboard",
  title = label ?? "Return to dashboard",
}: TechnicianBackButtonProps) {
  return (
    <DashboardBackButton
      href={href}
      ariaLabel={ariaLabel}
      title={title}
    />
  )
}

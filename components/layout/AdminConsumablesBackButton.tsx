type AdminConsumablesBackButtonProps = {
  href?: string
  label?: string
  onClick?: () => void
}
import { DashboardBackButton } from "@/components/layout/DashboardBackButton"

export function AdminConsumablesBackButton({
  href = "/admin-consumables/dashboard",
  label = "Return to admin consumables dashboard",
  onClick,
}: AdminConsumablesBackButtonProps) {
  return (
    <DashboardBackButton
      href={href}
      onClick={onClick}
      ariaLabel={label}
      title={label}
    />
  )
}

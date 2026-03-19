import { DashboardBackButton } from "@/components/layout/DashboardBackButton"

export function AdminFaultBackButton() {
  return (
    <DashboardBackButton
      href="/admin-fault/dashboard"
      ariaLabel="Return to dashboard"
      title="Return to dashboard"
    />
  )
}


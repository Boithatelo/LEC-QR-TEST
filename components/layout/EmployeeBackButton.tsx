import { DashboardBackButton } from "@/components/layout/DashboardBackButton"

export function EmployeeBackButton() {
  return (
    <DashboardBackButton
      href="/employee/dashboard"
      ariaLabel="Return to dashboard"
      title="Return to dashboard"
    />
  )
}

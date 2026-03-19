import { PerformanceAnalyticsPanel } from "@/components/admin-fault/PerformanceAnalyticsPanel"
import { AdminFaultBackButton } from "@/components/layout/AdminFaultBackButton"
import { EmployeePageHero } from "@/components/layout/EmployeePageHero"

export default function AdminFaultPerformancePage() {
  return (
    <div className="space-y-6">
      <AdminFaultBackButton />
      <EmployeePageHero
        title="Performance Analytics"
        description="Interactive KPI dashboard with downloadable chart images and CSV datasets for reporting."
      />
      <PerformanceAnalyticsPanel />
    </div>
  )
}


import { PerformanceAnalyticsPanel } from "@/components/admin-fault/PerformanceAnalyticsPanel"
import { EmployeePageHero } from "@/components/layout/EmployeePageHero"
import { ManagerBackButton } from "@/components/layout/ManagerBackButton"
import { ManagerPerformancePdfExport } from "@/components/manager/ManagerPerformancePdfExport"

export default function ManagerPerformancePage() {
  return (
    <div className="space-y-6">
      <ManagerBackButton />
      <EmployeePageHero
        compact
        title="Performance Analytics"
        description="Manager-level KPI and trend analysis for ticket throughput, backlog, and service quality."
      />
      <ManagerPerformancePdfExport />
      <PerformanceAnalyticsPanel />
    </div>
  )
}

import { EmployeePageHero } from "@/components/layout/EmployeePageHero"
import { ManagerResourceOversightPanel } from "@/components/manager/ManagerResourceOversightPanel"

export default function ManagerResourcesPage() {
  return (
    <div className="space-y-6">
      <EmployeePageHero
        compact
        title="Resource Oversight"
        description="Monitor consumable demand pressure and pending return flow to protect service continuity."
      />
      <ManagerResourceOversightPanel />
    </div>
  )
}

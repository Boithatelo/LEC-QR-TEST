import { EmployeeAssignedConsumablesPanel } from "@/components/consumables/EmployeeAssignedConsumablesPanel"
import { EmployeePageHero } from "@/components/layout/EmployeePageHero"
import { EmployeeBackButton } from "@/components/layout/EmployeeBackButton"

export default function EmployeeMyConsumablesPage() {
  return (
    <div className="space-y-6">
      <EmployeeBackButton />
      <EmployeePageHero
        title="My Consumables"
        description="View all consumables assigned to you by the admin consumables team."
      />
      <EmployeeAssignedConsumablesPanel />
    </div>
  )
}


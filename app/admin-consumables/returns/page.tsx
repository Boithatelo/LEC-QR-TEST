import { AdminConsumableReturnHistoryPanel } from "@/components/consumables/AdminConsumableReturnHistoryPanel"
import { EmployeePageHero } from "@/components/layout/EmployeePageHero"

export default function AdminConsumablesReturnsPage() {
  return (
    <div className="space-y-6">
      <EmployeePageHero
        compact
        title="Consumable Return History"
        description="Audit all consumable return transactions with status, date, employee, and item filters."
      />
      <AdminConsumableReturnHistoryPanel />
    </div>
  )
}


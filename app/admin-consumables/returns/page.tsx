import { AdminConsumablesBackButton } from "@/components/layout/AdminConsumablesBackButton"
import { AdminConsumableReturnHistoryPanel } from "@/components/consumables/AdminConsumableReturnHistoryPanel"
import { EmployeePageHero } from "@/components/layout/EmployeePageHero"

export default function AdminConsumablesReturnsPage() {
  return (
    <div className="space-y-6">
      <AdminConsumablesBackButton />
      <div>
        <h2 className="lec-page-title">Consumable Return History</h2>
        <p className="lec-page-subtitle">
          Audit all consumable return transactions with status, date, employee, and item filters.
        </p>
      </div>
      <AdminConsumableReturnHistoryPanel />
    </div>
  )
}


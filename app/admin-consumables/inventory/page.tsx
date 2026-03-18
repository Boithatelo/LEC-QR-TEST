import { InventoryTable } from "@/components/inventory/InventoryTable"
import { EmployeePageHero } from "@/components/layout/EmployeePageHero"

export default function AdminConsumablesInventoryPage() {
  return (
    <div className="space-y-6">
      <EmployeePageHero
        compact
        title="Assets Inventory"
        description="Review inventory assets, adjust stock counts, and verify current condition details."
      />
      <InventoryTable />
    </div>
  )
}


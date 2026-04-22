import { InventoryTable } from "@/components/inventory/InventoryTable"
import { AdminConsumablesBackButton } from "@/components/layout/AdminConsumablesBackButton"
import { EmployeePageHero } from "@/components/layout/EmployeePageHero"

export default function AdminConsumablesInventoryPage() {
  return (
    <div className="space-y-6">
      <AdminConsumablesBackButton />
      <EmployeePageHero
        compact
        title="Assets Inventory"
        description="Review inventory assets, current stock levels, and condition details."
      />
      <InventoryTable />
    </div>
  )
}


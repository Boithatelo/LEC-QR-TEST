import { AddConsumableForm } from "@/components/inventory/AddConsumableForm"
import { AdminConsumablesBackButton } from "@/components/layout/AdminConsumablesBackButton"
import { EmployeePageHero } from "@/components/layout/EmployeePageHero"

export default function AdminConsumablesPage() {
  return (
    <div className="space-y-6">
      <AdminConsumablesBackButton />
      <EmployeePageHero
        compact
        title="Add Asset"
        description="Register a new inventory item by category and technical profile."
      />
      <div>
        <AddConsumableForm />
      </div>
    </div>
  )
}


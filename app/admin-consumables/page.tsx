import { AddConsumableForm } from "@/components/inventory/AddConsumableForm"
import { EmployeePageHero } from "@/components/layout/EmployeePageHero"

export default function AdminConsumablesPage() {
  return (
    <div className="space-y-6">
      <EmployeePageHero
        compact
        title="Assets Management"
        description="View all inventory assets or add a new item by category and technical profile."
      />
      <div>
        <AddConsumableForm />
      </div>
    </div>
  )
}


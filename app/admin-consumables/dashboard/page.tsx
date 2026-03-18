import { AdminConsumableRequestApprovalPanel } from "@/components/consumables/AdminConsumableRequestApprovalPanel"
import { EmployeePageHero } from "@/components/layout/EmployeePageHero"

export default function AdminConsumablesDashboardPage() {
  return (
    <div className="space-y-6">
      <EmployeePageHero
        title="Admin Consumables Dashboard"
        description="Review employee consumable requests, process returns, and keep inventory allocations aligned with stock levels."
      />
      <AdminConsumableRequestApprovalPanel />
    </div>
  )
}


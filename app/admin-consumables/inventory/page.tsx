import Link from "next/link"

import { InventoryTable } from "@/components/inventory/InventoryTable"
import { AdminConsumablesBackButton } from "@/components/layout/AdminConsumablesBackButton"
import { EmployeePageHero } from "@/components/layout/EmployeePageHero"
import { Button } from "@/components/ui/button"

export default function AdminConsumablesInventoryPage() {
  return (
    <div className="space-y-6">
      <AdminConsumablesBackButton />
      <EmployeePageHero
        compact
        title="Assets Inventory"
        description="Review inventory assets, current stock levels, and condition details."
      />
      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href="/admin-consumables/inventory/labels?autoprint=1">
            Print QR Labels
          </Link>
        </Button>
      </div>
      <InventoryTable />
    </div>
  )
}


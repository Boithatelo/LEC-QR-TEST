import { AdminFaultTicketTable } from "@/components/tickets/AdminFaultTicketTable"
import { AdminFaultBackButton } from "@/components/layout/AdminFaultBackButton"
import { EmployeePageHero } from "@/components/layout/EmployeePageHero"

export default function AdminFaultTicketsPage() {
  return (
    <div className="space-y-6">
      <AdminFaultBackButton />
      <EmployeePageHero
        title="All Tickets"
        description="Filter tickets and change assignment, classification, priority, and status from this tab."
      />
      <AdminFaultTicketTable />
    </div>
  )
}


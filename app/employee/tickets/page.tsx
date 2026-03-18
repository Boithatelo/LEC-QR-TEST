import { EmployeeTicketHistoryTable } from "@/components/tickets/EmployeeTicketHistoryTable"
import { EmployeePageHero } from "@/components/layout/EmployeePageHero"
import { EmployeeBackButton } from "@/components/layout/EmployeeBackButton"

export default function EmployeeTicketsPage() {
  return (
    <div className="space-y-6">
      <EmployeeBackButton />
      <EmployeePageHero
        title="My Tickets"
        description="Track the status and priority of all your submitted tickets."
      />
      <EmployeeTicketHistoryTable />
    </div>
  )
}


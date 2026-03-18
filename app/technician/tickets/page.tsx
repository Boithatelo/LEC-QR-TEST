import { EmployeePageHero } from "@/components/layout/EmployeePageHero"
import { TechnicianBackButton } from "@/components/layout/TechnicianBackButton"
import { TechnicianTicketTable } from "@/components/tickets/TechnicianTicketTable"

export default function TechnicianTicketsPage() {
  return (
    <div className="space-y-6">
      <TechnicianBackButton />
      <EmployeePageHero
        title="Assigned Tickets"
        description="Only tickets assigned to your technician account are shown here."
      />
      <TechnicianTicketTable />
    </div>
  )
}


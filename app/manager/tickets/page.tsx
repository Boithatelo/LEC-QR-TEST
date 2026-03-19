import { EmployeePageHero } from "@/components/layout/EmployeePageHero"
import { ManagerTicketOversightPanel } from "@/components/manager/ManagerTicketOversightPanel"

export default function ManagerTicketsPage() {
  return (
    <div className="space-y-6">
      <EmployeePageHero
        compact
        title="Ticket Oversight"
        description="Read-only manager view of ticket health, assignment pressure, and operational backlog."
      />
      <ManagerTicketOversightPanel />
    </div>
  )
}

import { EmployeePageHero } from "@/components/layout/EmployeePageHero"
import { TechnicianBackButton } from "@/components/layout/TechnicianBackButton"
import { TechnicianTicketDetailWorkspace } from "@/components/tickets/TechnicianTicketDetailWorkspace"

type TechnicianTicketDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function TechnicianTicketDetailPage({ params }: TechnicianTicketDetailPageProps) {
  const { id } = await Promise.resolve(params)
  const ticketId = Number(id)
  if (!Number.isFinite(ticketId)) {
    return <p className="text-sm text-rose-600">Invalid ticket id.</p>
  }

  return (
    <div className="space-y-6">
      <TechnicianBackButton
        href="/technician/tickets"
        ariaLabel="Back to assigned tickets"
        title="Back to assigned tickets"
      />
      <EmployeePageHero
        title={`Ticket #${ticketId}`}
        description="Review ticket details, update status, and escalate if needed."
        compact
      />
      <TechnicianTicketDetailWorkspace ticketId={ticketId} />
    </div>
  )
}

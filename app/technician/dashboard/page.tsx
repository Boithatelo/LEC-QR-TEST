import Link from "next/link"
import { PackagePlus, Ticket, type LucideIcon } from "lucide-react"

import { EmployeePageHero } from "@/components/layout/EmployeePageHero"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const quickActions: Array<{
  href: string
  title: string
  description: string
  icon: LucideIcon
}> = [
  {
    href: "/technician/tickets",
    title: "Assigned Tickets",
    description: "Open and manage the tickets assigned to you.",
    icon: Ticket,
  },
  {
    href: "/technician/hardware-request",
    title: "Office Asset Request",
    description: "Request hardware or consumables for field work.",
    icon: PackagePlus,
  },
]

export default function TechnicianDashboardPage() {
  return (
    <div className="space-y-6">
      <EmployeePageHero
        title="Technician Dashboard"
        description="Manage your assigned tickets, escalations, and on-site support requests from one workspace."
      />

      <Card className="rounded-xl border-[#0072CE]/25 bg-white py-0 shadow-sm">
        <CardHeader className="px-6 py-5">
          <CardTitle className="text-base font-semibold text-[#0B1F3A]">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 px-6 pb-6 md:grid-cols-2 xl:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex min-h-[112px] items-start gap-3 rounded-xl border border-[#0072CE]/25 bg-[#F7FBFF] p-4 transition hover:-translate-y-0.5 hover:border-[#0B1F3A] hover:bg-[#0B1F3A] hover:shadow-[0_10px_20px_rgba(11,31,58,0.25)]"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0072CE] text-white transition-colors group-hover:bg-white group-hover:text-[#0B1F3A]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="space-y-1">
                  <span className="block text-sm font-semibold text-[#0B1F3A] transition-colors group-hover:text-white">
                    {action.title}
                  </span>
                  <span className="block text-xs leading-5 text-[#1E3A6D] transition-colors group-hover:text-[#DCEBFF]">
                    {action.description}
                  </span>
                </span>
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}


import Link from "next/link"
import { ClipboardList, Package, PackagePlus, TriangleAlert, type LucideIcon } from "lucide-react"

import { EmployeePageHero } from "@/components/layout/EmployeePageHero"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getInterfaceActionCardClassName,
  getInterfaceCardDescriptionClassName,
  getInterfaceCardIconClassName,
  getInterfaceCardTitleClassName,
} from "@/lib/interface-card-styles"

const quickActions: Array<{
  href: string
  title: string
  description: string
  icon: LucideIcon
}> = [
  {
    href: "/employee/report",
    title: "Report Fault",
    description: "Submit faults with AI-driven triage.",
    icon: TriangleAlert,
  },
  {
    href: "/employee/tickets",
    title: "My Tickets",
    description: "Track all submitted issue tickets.",
    icon: ClipboardList,
  },
  {
    href: "/employee/consumables",
    title: "Consumable Request",
    description: "Request approved consumables by branch.",
    icon: PackagePlus,
  },
  {
    href: "/employee/my-consumables",
    title: "My Consumables",
    description: "See consumables assigned by admin.",
    icon: Package,
  },
]

export default function EmployeeDashboardPage() {
  return (
    <div className="space-y-6">
      <EmployeePageHero
        title="Employee Dashboard"
        description="Electricity service support workspace for reporting faults, tracking tickets, and managing consumable requests."
      />

      <Card className="rounded-xl border-[#0072CE]/25 bg-white py-0 shadow-sm">
        <CardHeader className="px-6 py-5">
          <CardTitle className="text-base font-semibold text-[#0B1F3A]">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 px-6 pb-6 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className={getInterfaceActionCardClassName()}
              >
                <span className={getInterfaceCardIconClassName()}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="space-y-1">
                  <span className={getInterfaceCardTitleClassName()}>
                    {action.title}
                  </span>
                  <span className={getInterfaceCardDescriptionClassName()}>
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


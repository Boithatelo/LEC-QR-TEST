import Link from "next/link"
import { BarChart3, Boxes, ClipboardList, type LucideIcon } from "lucide-react"

import { ManagerDashboardOverview } from "@/components/manager/ManagerDashboardOverview"
import { EmployeePageHero } from "@/components/layout/EmployeePageHero"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const quickActions: Array<{
  href: string
  title: string
  description: string
  icon: LucideIcon
}> = [
  {
    href: "/manager/tickets",
    title: "Ticket Oversight",
    description: "Monitor live ticket flow, ownership, and unresolved workload across operations.",
    icon: ClipboardList,
  },
  {
    href: "/manager/performance",
    title: "Performance Analytics",
    description: "Track throughput, resolution rates, and category-based performance trends.",
    icon: BarChart3,
  },
  {
    href: "/manager/resources",
    title: "Resource Oversight",
    description: "Review consumable request and return pressure before service delivery is impacted.",
    icon: Boxes,
  },
]

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-6">
      <EmployeePageHero
        title="Manager Dashboard"
        description="Leadership workspace for end-to-end service oversight, KPI governance, and operational risk visibility."
      />

      <Card className="rounded-xl border-[#0072CE]/25 bg-white py-0 shadow-sm">
        <CardHeader className="px-6 py-5">
          <CardTitle className="text-base font-semibold text-[#0B1F3A]">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 px-6 pb-6 md:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.title}
                href={action.href}
                className="group flex min-h-[112px] cursor-pointer items-start gap-3 rounded-xl border border-[#0072CE]/25 bg-[#F7FBFF] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0B1F3A] hover:bg-[#0B1F3A] hover:shadow-[0_10px_20px_rgba(11,31,58,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]/40"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0072CE] text-white transition-all duration-200 group-hover:-translate-y-0.5 group-hover:bg-white group-hover:text-[#0B1F3A]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="space-y-1">
                  <span className="block text-sm font-semibold text-[#0B1F3A] transition-colors duration-200 group-hover:text-white">
                    {action.title}
                  </span>
                  <span className="block text-xs leading-5 text-[#1E3A6D] transition-colors duration-200 group-hover:text-[#DCEBFF]">
                    {action.description}
                  </span>
                </span>
              </Link>
            )
          })}
        </CardContent>
      </Card>

      <ManagerDashboardOverview />
    </div>
  )
}

import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getInterfaceSurfaceCardClassName,
  getInterfaceSurfaceDescriptionClassName,
  getInterfaceSurfaceLinkClassName,
  getInterfaceSurfaceTitleClassName,
} from "@/lib/interface-card-styles"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="lec-page-title">Role Workspace</h2>
        <p className="lec-page-subtitle">
          Switch between role-specific dashboards in the LEC IntelliSupport platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
        <Card className={getInterfaceSurfaceCardClassName()}>
          <CardHeader className="px-6 py-5">
            <CardTitle className={getInterfaceSurfaceTitleClassName()}>Employee</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className={getInterfaceSurfaceDescriptionClassName()}>
              AI-assisted fault reporting and personal ticket tracking.
            </p>
            <Link href="/employee" className={getInterfaceSurfaceLinkClassName()}>
              Open dashboard
            </Link>
          </CardContent>
        </Card>

        <Card className={getInterfaceSurfaceCardClassName()}>
          <CardHeader className="px-6 py-5">
            <CardTitle className={getInterfaceSurfaceTitleClassName()}>Technician</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className={getInterfaceSurfaceDescriptionClassName()}>
              Assigned tickets, SLA focus, and resolution execution.
            </p>
            <Link href="/technician" className={getInterfaceSurfaceLinkClassName()}>
              Open dashboard
            </Link>
          </CardContent>
        </Card>

        <Card className={getInterfaceSurfaceCardClassName()}>
          <CardHeader className="px-6 py-5">
            <CardTitle className={getInterfaceSurfaceTitleClassName()}>Admin Fault</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className={getInterfaceSurfaceDescriptionClassName()}>
              Cross-team ticket assignment, escalation, and SLA compliance.
            </p>
            <Link href="/admin-fault" className={getInterfaceSurfaceLinkClassName()}>
              Open dashboard
            </Link>
          </CardContent>
        </Card>

        <Card className={getInterfaceSurfaceCardClassName()}>
          <CardHeader className="px-6 py-5">
            <CardTitle className={getInterfaceSurfaceTitleClassName()}>Admin Consumables</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className={getInterfaceSurfaceDescriptionClassName()}>
              Manage stock levels and assignment of IT consumables.
            </p>
            <Link
              href="/admin-consumables"
              className={getInterfaceSurfaceLinkClassName()}
            >
              Open dashboard
            </Link>
          </CardContent>
        </Card>

        <Card className={getInterfaceSurfaceCardClassName()}>
          <CardHeader className="px-6 py-5">
            <CardTitle className={getInterfaceSurfaceTitleClassName()}>Manager</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className={getInterfaceSurfaceDescriptionClassName()}>
              Executive oversight for ticket operations, SLA health, and resources.
            </p>
            <Link href="/manager" className={getInterfaceSurfaceLinkClassName()}>
              Open dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


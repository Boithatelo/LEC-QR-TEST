import { EmployeeConsumableRequestPanel } from "@/components/consumables/EmployeeConsumableRequestPanel"
import { EmployeePageHero } from "@/components/layout/EmployeePageHero"
import { TechnicianBackButton } from "@/components/layout/TechnicianBackButton"

export default function TechnicianHardwareRequestPage() {
  return (
    <div className="space-y-3">
      <TechnicianBackButton />
      <EmployeePageHero
        title="Office Asset Request"
        description="Request consumables or office assets using the same flow as employee requests."
        compact
      />
      <div className="mx-auto w-full max-w-[1280px]">
        <EmployeeConsumableRequestPanel />
      </div>
    </div>
  )
}

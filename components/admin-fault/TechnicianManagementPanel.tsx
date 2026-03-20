"use client"

import { FormEvent, useEffect, useState } from "react"
import { UserRound, UsersRound, Wrench, type LucideIcon } from "lucide-react"

import {
  createEmployee,
  createTechnician,
  deleteEmployee,
  deleteTechnician,
  getEmployees,
  getTechnicians,
  type Employee,
  type Technician,
} from "@/lib/api"
import { ActionConfirmationDialog } from "@/components/ui/action-confirmation-dialog"
import { ActionFeedbackDialog } from "@/components/ui/action-feedback-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BRANCH_OPTIONS } from "@/lib/organization-options"
import {
  getInterfaceActionCardClassName,
  getInterfaceCardDescriptionClassName,
  getInterfaceCardIconClassName,
  getInterfaceCardTitleClassName,
} from "@/lib/interface-card-styles"

const skillsetOptions = [
  "IT Support Technician",
  "Network Technician",
  "Systems Administrator",
  "SCADA Support Technician",
  "Metering Technician",
  "Distribution Line Technician",
  "Substation Technician",
  "Protection & Control Technician",
  "Power Systems Technician",
  "Customer Service Systems Technician",
  "Field Service Technician",
  "Cybersecurity Technician",
]

type ManagementSection = "add-employee" | "add-technician" | "view-users"

export function TechnicianManagementPanel() {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [technicianBranch, setTechnicianBranch] = useState("")
  const [skillset, setSkillset] = useState("")
  const [isAvailable, setIsAvailable] = useState(true)
  const [employeeName, setEmployeeName] = useState("")
  const [employeeEmail, setEmployeeEmail] = useState("")
  const [employeeBranch, setEmployeeBranch] = useState("")
  const [employeeActive, setEmployeeActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingEmployee, setSavingEmployee] = useState(false)
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<number | null>(null)
  const [deletingTechnicianId, setDeletingTechnicianId] = useState<number | null>(null)
  const [loadError, setLoadError] = useState("")
  const [activeSection, setActiveSection] = useState<ManagementSection | null>(null)
  const [resultDialog, setResultDialog] = useState<{
    open: boolean
    status: "success" | "error"
    message: string
  }>({
    open: false,
    status: "success",
    message: "",
  })
  const [pendingDeletion, setPendingDeletion] = useState<
    | {
        kind: "employee" | "technician"
        id: number
        name: string
      }
    | null
  >(null)

  const showResultDialog = (status: "success" | "error", message: string) => {
    setResultDialog({
      open: true,
      status,
      message,
    })
  }

  const loadTechnicians = async () => {
    const data = await getTechnicians()
    setTechnicians(data)
  }

  const loadEmployees = async () => {
    const data = await getEmployees()
    setEmployees(data)
  }

  useEffect(() => {
    Promise.all([loadTechnicians(), loadEmployees()]).catch((loadError) => {
      setLoadError(loadError instanceof Error ? loadError.message : "Failed to load technicians.")
    })
  }, [])

  const handleDeleteEmployee = (employee: Employee) => {
    setPendingDeletion({ kind: "employee", id: employee.id, name: employee.name })
  }

  const handleDeleteTechnician = (technician: Technician) => {
    setPendingDeletion({ kind: "technician", id: technician.id, name: technician.name })
  }

  const confirmDeletion = async () => {
    if (!pendingDeletion) return

    try {
      if (pendingDeletion.kind === "employee") {
        setDeletingEmployeeId(pendingDeletion.id)
        await deleteEmployee(pendingDeletion.id)
        await loadEmployees()
        showResultDialog("success", `Employee ${pendingDeletion.name} deleted.`)
      } else {
        setDeletingTechnicianId(pendingDeletion.id)
        await deleteTechnician(pendingDeletion.id)
        await loadTechnicians()
        showResultDialog("success", `Technician ${pendingDeletion.name} deleted.`)
      }
    } catch (deleteError) {
      showResultDialog(
        "error",
        deleteError instanceof Error
          ? deleteError.message
          : pendingDeletion.kind === "employee"
            ? "Failed to delete employee."
            : "Failed to delete technician."
      )
    } finally {
      setPendingDeletion(null)
      setDeletingEmployeeId(null)
      setDeletingTechnicianId(null)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setSaving(true)
      await createTechnician({
        name: name.trim(),
        email: email.trim(),
        branch: technicianBranch,
        skillset: skillset.trim(),
        is_available: isAvailable,
      })
      setName("")
      setEmail("")
      setTechnicianBranch("")
      setSkillset("")
      setIsAvailable(true)
      await loadTechnicians()
      showResultDialog("success", "Technician created. Setup link sent to their email.")
    } catch (submitError) {
      showResultDialog("error", submitError instanceof Error ? submitError.message : "Failed to create technician.")
    } finally {
      setSaving(false)
    }
  }

  const handleEmployeeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setSavingEmployee(true)
      await createEmployee({
        name: employeeName.trim(),
        email: employeeEmail.trim(),
        branch: employeeBranch,
        is_active: employeeActive,
      })
      setEmployeeName("")
      setEmployeeEmail("")
      setEmployeeBranch("")
      setEmployeeActive(true)
      await loadEmployees()
      showResultDialog("success", "Employee created. Setup link sent to their email.")
    } catch (submitError) {
      showResultDialog("error", submitError instanceof Error ? submitError.message : "Failed to create employee.")
    } finally {
      setSavingEmployee(false)
    }
  }

  const sectionCards: Array<{
    key: ManagementSection
    title: string
    description: string
    icon: LucideIcon
  }> = [
    {
      key: "add-employee",
      title: "Add Employee",
      description: "Create a new employee account.",
      icon: UserRound,
    },
    {
      key: "add-technician",
      title: "Add Technician",
      description: "Create a technician profile.",
      icon: Wrench,
    },
    {
      key: "view-users",
      title: "View Users",
      description: "See current employees and technicians.",
      icon: UsersRound,
    },
  ]

  return (
    <Card id="technician-management" className="rounded-xl border-[#0072CE]/25 bg-white py-0 shadow-sm">
      <CardHeader className="border-b border-[#0072CE]/15 px-6 py-5">
        <CardTitle className="text-base font-semibold text-[#0B1F3A]">User & Technician Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-6 py-6">
        {loadError ? <p className="text-sm text-rose-600">{loadError}</p> : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sectionCards.map((section) => {
            const isActive = activeSection === section.key
            const Icon = section.icon
            return (
              <button
                key={section.key}
                type="button"
                aria-pressed={isActive}
                onClick={() =>
                  setActiveSection((current) => (current === section.key ? null : section.key))
                }
                className={getInterfaceActionCardClassName(isActive)}
              >
                <span className={getInterfaceCardIconClassName(isActive)}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="space-y-1">
                  <span className={getInterfaceCardTitleClassName(isActive)}>
                    {section.title}
                  </span>
                  <span className={getInterfaceCardDescriptionClassName(isActive)}>
                    {section.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {activeSection === "add-employee" ? (
          <form
            className="grid grid-cols-1 gap-4 rounded-lg border border-[#0072CE]/20 bg-[#F7FBFF] p-4 md:grid-cols-2"
            onSubmit={handleEmployeeSubmit}
          >
          <p className="md:col-span-2 text-xs text-[#4A6A96]">
            A one-time password setup link will be sent to this email address.
          </p>
          <div className="space-y-2">
            <label htmlFor="employee-name" className="text-sm font-medium text-[#1E3A6D]">
              Employee Name
            </label>
            <Input
              id="employee-name"
              value={employeeName}
              onChange={(event) => setEmployeeName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="employee-email" className="text-sm font-medium text-[#1E3A6D]">
              Employee Email
            </label>
            <Input
              id="employee-email"
              type="email"
              value={employeeEmail}
              onChange={(event) => setEmployeeEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="employee-branch" className="text-sm font-medium text-[#1E3A6D]">
              Employee Branch
            </label>
            <select
              id="employee-branch"
              className="h-10 w-full rounded-md border border-[#0072CE]/30 bg-white px-3 text-sm text-[#0B1F3A]"
              value={employeeBranch}
              onChange={(event) => setEmployeeBranch(event.target.value)}
              required
            >
              <option value="">Select branch</option>
              {BRANCH_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="employee-status" className="text-sm font-medium text-[#1E3A6D]">
              Employee Status
            </label>
            <select
              id="employee-status"
              className="h-10 w-full rounded-md border border-[#0072CE]/30 bg-white px-3 text-sm text-[#0B1F3A]"
              value={employeeActive ? "active" : "inactive"}
              onChange={(event) => setEmployeeActive(event.target.value === "active")}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={savingEmployee} className="bg-[#0072CE] text-white hover:bg-[#005EA8]">
              {savingEmployee ? "Creating..." : "Add Employee"}
            </Button>
          </div>
          </form>
        ) : null}

        {activeSection === "add-technician" ? (
          <form
            className="grid grid-cols-1 gap-4 rounded-lg border border-[#0072CE]/20 bg-[#F7FBFF] p-4 md:grid-cols-2"
            onSubmit={handleSubmit}
          >
          <p className="md:col-span-2 text-xs text-[#4A6A96]">
            A one-time password setup link will be sent to this email address.
          </p>
          <div className="space-y-2">
            <label htmlFor="technician-name" className="text-sm font-medium text-[#1E3A6D]">
              Name
            </label>
            <Input
              id="technician-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="technician-email" className="text-sm font-medium text-[#1E3A6D]">
              Email
            </label>
            <Input
              id="technician-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="technician-branch" className="text-sm font-medium text-[#1E3A6D]">
              Branch
            </label>
            <select
              id="technician-branch"
              className="h-10 w-full rounded-md border border-[#0072CE]/30 bg-white px-3 text-sm text-[#0B1F3A]"
              value={technicianBranch}
              onChange={(event) => setTechnicianBranch(event.target.value)}
              required
            >
              <option value="">Select branch</option>
              {BRANCH_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="technician-skillset" className="text-sm font-medium text-[#1E3A6D]">
              Skillset
            </label>
            <select
              id="technician-skillset"
              className="h-10 w-full rounded-md border border-[#0072CE]/30 bg-white px-3 text-sm text-[#0B1F3A]"
              value={skillset}
              onChange={(event) => setSkillset(event.target.value)}
            >
              <option value="">Select skillset</option>
              {skillsetOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="technician-availability" className="text-sm font-medium text-[#1E3A6D]">
              Availability
            </label>
            <select
              id="technician-availability"
              className="h-10 w-full rounded-md border border-[#0072CE]/30 bg-white px-3 text-sm text-[#0B1F3A]"
              value={isAvailable ? "available" : "unavailable"}
              onChange={(event) => setIsAvailable(event.target.value === "available")}
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={saving} className="bg-[#0072CE] text-white hover:bg-[#005EA8]">
              {saving ? "Creating..." : "Add Technician"}
            </Button>
          </div>
          </form>
        ) : null}

        {activeSection === "view-users" ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#0B1F3A]">Current Employees</p>
              {employees.length === 0 ? (
                <p className="text-sm text-[#4A6A96]">No employees found.</p>
              ) : (
                <div className="space-y-2">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#0072CE]/20 bg-[#F7FBFF] px-3 py-2"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#0B1F3A]">{employee.name}</p>
                        <p className="text-xs text-[#1E3A6D]">{employee.email}</p>
                        <p className="text-xs text-[#4A6A96]">Branch: {employee.branch || "Not set"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            employee.is_active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-[#0072CE]/25 bg-white text-[#1E3A6D]"
                          }
                        >
                          {employee.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                          disabled={deletingEmployeeId === employee.id}
                          onClick={() => handleDeleteEmployee(employee)}
                        >
                          {deletingEmployeeId === employee.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#0B1F3A]">Current Technicians</p>
              {technicians.length === 0 ? (
                <p className="text-sm text-[#4A6A96]">No technicians found.</p>
              ) : (
                <div className="mx-auto w-full max-w-5xl space-y-2">
                  {technicians.map((technician) => (
                    <div
                      key={technician.id}
                      className="rounded-lg border border-[#BFD8F3] bg-gradient-to-r from-[#F8FCFF] to-[#EDF6FF] p-3 shadow-[0_4px_12px_rgba(11,31,58,0.05)]"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#0072CE]/30 bg-white text-xs font-semibold text-[#0B4B84]">
                            {technician.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                          <div className="min-w-0 space-y-1">
                            <p className="truncate text-base font-semibold text-[#0B1F3A]">{technician.name}</p>
                            <p className="truncate text-xs text-[#355A84]">{technician.email}</p>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              <span className="inline-flex items-center rounded-full border border-[#A8C8E8] bg-white px-2 py-0.5 text-[11px] font-medium text-[#335E8C]">
                                Branch: {technician.branch || "Not set"}
                              </span>
                              {(technician.skillset || "No skillset")
                                .split(",")
                                .map((item) => item.trim())
                                .filter(Boolean)
                                .slice(0, 3)
                                .map((skill) => (
                                  <span
                                    key={`${technician.id}-${skill}`}
                                    className="inline-flex items-center rounded-full border border-[#C6DAEE] bg-[#F2F8FF] px-2 py-0.5 text-[11px] font-medium text-[#426A96]"
                                  >
                                    {skill}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-end gap-2 border-t border-[#D6E5F4] pt-2">
                        <span className="text-[11px] font-medium text-[#5F7FA4]">Status</span>
                        <Badge
                          variant="outline"
                          className={
                            technician.is_available
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-amber-300 bg-amber-50 text-amber-700"
                          }
                        >
                          {technician.is_available ? "Available" : "Unavailable"}
                        </Badge>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 border-rose-200 bg-white px-2.5 text-xs text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                          disabled={deletingTechnicianId === technician.id}
                          onClick={() => handleDeleteTechnician(technician)}
                        >
                          {deletingTechnicianId === technician.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>

      <ActionFeedbackDialog
        open={resultDialog.open}
        status={resultDialog.status}
        message={resultDialog.message}
        onOk={() => setResultDialog((current) => ({ ...current, open: false }))}
      />

      <ActionConfirmationDialog
        open={Boolean(pendingDeletion)}
        title={pendingDeletion?.kind === "employee" ? "Delete Employee" : "Delete Technician"}
        description={
          pendingDeletion
            ? `Delete ${pendingDeletion.kind} ${pendingDeletion.name}? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        confirmVariant="destructive"
        confirmDisabled={deletingEmployeeId !== null || deletingTechnicianId !== null}
        onConfirm={() => void confirmDeletion()}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeletion(null)
          }
        }}
      />
    </Card>
  )
}

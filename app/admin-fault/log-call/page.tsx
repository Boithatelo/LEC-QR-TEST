"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { AdminFaultBackButton } from "@/components/layout/AdminFaultBackButton"
import { EmployeePageHero } from "@/components/layout/EmployeePageHero"
import { ActionFeedbackDialog } from "@/components/ui/action-feedback-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createTicket, getEmployees, type Employee } from "@/lib/api"
import { getStoredUserSession } from "@/lib/auth"
import { BRANCH_OPTIONS, DEPARTMENT_OPTIONS } from "@/lib/organization-options"

export default function AdminFaultLogCallPage() {
  const router = useRouter()
  const [callerName, setCallerName] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [branch, setBranch] = useState("")
  const [department, setDepartment] = useState("")
  const [problemReviewed, setProblemReviewed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [resultDialog, setResultDialog] = useState<{
    open: boolean
    status: "success" | "error"
    message: string
  }>({
    open: false,
    status: "success",
    message: "",
  })

  const showResultDialog = (status: "success" | "error", nextMessage: string) => {
    setResultDialog({
      open: true,
      status,
      message: nextMessage,
    })
  }

  useEffect(() => {
    void (async () => {
      try {
        const data = await getEmployees()
        setEmployees(data.filter((item) => item.is_active))
      } catch (loadError) {
        showResultDialog("error", loadError instanceof Error ? loadError.message : "Failed to load employees.")
      }
    })()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const user = getStoredUserSession()
    if (!user || user.role !== "admin_fault") {
      showResultDialog("error", "Admin Fault session required. Please login again.")
      return
    }

    if (!callerName.trim()) {
      showResultDialog("error", "Caller name is required.")
      return
    }
    if (!employeeId) {
      showResultDialog("error", "Please select the employee account for this caller.")
      return
    }
    if (!title.trim() || !description.trim() || !branch.trim() || !department.trim()) {
      showResultDialog("error", "All fault detail fields are required.")
      return
    }
    if (!problemReviewed) {
      showResultDialog("error", "Please review and confirm the problem details before logging the call.")
      return
    }

    try {
      setSubmitting(true)
      const fullDescription = `${description.trim()}\n\nBranch: ${branch.trim()}\nDepartment: ${department.trim()}\nCaller: ${callerName.trim()}`
      const ticket = await createTicket({
        title: title.trim(),
        description: fullDescription,
        location: branch.trim(),
        employee_id: Number(employeeId),
        reporter_reviewed_problem: true,
        caller_name: callerName.trim(),
        logged_by_admin_id: user.id,
      })

      setCallerName("")
      setEmployeeId("")
      setTitle("")
      setDescription("")
      setBranch("")
      setDepartment("")
      setProblemReviewed(false)
      showResultDialog("success", ticket.routing_note ?? `Call logged as ticket #${ticket.id}.`)
    } catch (submitError) {
      showResultDialog("error", submitError instanceof Error ? submitError.message : "Failed to log call.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDialogOk = () => {
    setResultDialog((current) => ({ ...current, open: false }))
    router.push("/admin-fault/dashboard")
  }

  const handleLogAnother = () => {
    setResultDialog((current) => ({ ...current, open: false }))
  }

  return (
    <div className="space-y-6">
      <AdminFaultBackButton />
      <EmployeePageHero
        title="Log Employee Call"
        description="Capture call-in faults for employees who need admin-assisted reporting and route them into the normal fault workflow."
      />

      <Card className="mx-auto w-full max-w-[900px] rounded-xl border-[#0072CE]/25 bg-white py-0 shadow-sm">
        <CardHeader className="border-b border-[#0072CE]/15 px-5 py-4">
          <CardTitle className="text-base font-semibold text-[#0B1F3A]">Log Call</CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-5">
          <form className="mx-auto grid w-full max-w-[700px] grid-cols-1 gap-3.5 md:grid-cols-2" onSubmit={handleSubmit} autoComplete="off">
            <div className="space-y-2">
              <label htmlFor="caller-name" className="text-sm font-medium text-[#0B1F3A]">
                Caller Name
              </label>
              <Input
                id="caller-name"
                placeholder="Employee calling by phone"
                value={callerName}
                onChange={(event) => setCallerName(event.target.value)}
                className="h-9 border-[#0072CE]/30 text-[#0B1F3A]"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="employee-account" className="text-sm font-medium text-[#0B1F3A]">
                Employee Account
              </label>
              <select
                id="employee-account"
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                className="h-9 w-full rounded-md border border-[#0072CE]/30 bg-white px-3 text-sm text-[#0B1F3A]"
                required
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={String(employee.id)}>
                    {employee.name} ({employee.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="fault-title" className="text-sm font-medium text-[#0B1F3A]">
                Title
              </label>
              <Input
                id="fault-title"
                placeholder="Issue summary"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="h-9 border-[#0072CE]/30 text-[#0B1F3A]"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="fault-description" className="text-sm font-medium text-[#0B1F3A]">
                Description
              </label>
              <textarea
                id="fault-description"
                placeholder="Describe the fault and impact"
                className="min-h-20 w-full rounded-lg border border-[#0072CE]/30 px-3 py-2 text-sm text-[#0B1F3A]"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="fault-branch" className="text-sm font-medium text-[#0B1F3A]">
                Branch
              </label>
              <select
                id="fault-branch"
                value={branch}
                onChange={(event) => setBranch(event.target.value)}
                className="h-9 w-full rounded-md border border-[#0072CE]/30 bg-white px-3 text-sm text-[#0B1F3A]"
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
              <label htmlFor="fault-department" className="text-sm font-medium text-[#0B1F3A]">
                Department
              </label>
              <select
                id="fault-department"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="h-9 w-full rounded-md border border-[#0072CE]/30 bg-white px-3 text-sm text-[#0B1F3A]"
                required
              >
                <option value="">Select department</option>
                {DEPARTMENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="inline-flex cursor-pointer items-start gap-2 text-sm text-[#0B1F3A]">
                <input
                  id="problem-reviewed"
                  type="checkbox"
                  checked={problemReviewed}
                  onChange={(event) => setProblemReviewed(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border border-[#0072CE]/40"
                  required
                />
                <span>I have reviewed the problem with the reporter/caller and confirmed the details are correct.</span>
              </label>
            </div>

            <div className="md:col-span-2 flex justify-center">
              <Button
                type="submit"
                disabled={submitting}
                className="h-10 w-full max-w-[260px] rounded-lg border border-[#005DA8] bg-[#0072CE] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#005DA8] focus-visible:ring-2 focus-visible:ring-[#0072CE]/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Analyzing and Logging..." : "Log Call"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ActionFeedbackDialog
        open={resultDialog.open}
        status={resultDialog.status}
        message={resultDialog.message}
        onOk={handleDialogOk}
        secondaryActionLabel="Log Another"
        onSecondaryAction={handleLogAnother}
      />
    </div>
  )
}

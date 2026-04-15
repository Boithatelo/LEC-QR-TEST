"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { EmployeeBackButton } from "@/components/layout/EmployeeBackButton"
import { EmployeePageHero } from "@/components/layout/EmployeePageHero"
import { ActionFeedbackDialog } from "@/components/ui/action-feedback-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createTicket } from "@/lib/api"
import { getStoredUserSession } from "@/lib/auth"
import { BRANCH_OPTIONS, DEPARTMENT_OPTIONS } from "@/lib/organization-options"

export default function EmployeeReportPage() {
  const router = useRouter()
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

  const handleCreateTicket = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const user = getStoredUserSession()
    if (!user) {
      const nextMessage = "Session expired. Please login again."
      showResultDialog("error", nextMessage)
      return
    }

    if (!title.trim()) {
      const nextMessage = "Title is required."
      showResultDialog("error", nextMessage)
      return
    }

    if (!description.trim()) {
      const nextMessage = "Description is required."
      showResultDialog("error", nextMessage)
      return
    }

    if (!branch.trim()) {
      const nextMessage = "Branch is required."
      showResultDialog("error", nextMessage)
      return
    }

    if (!department.trim()) {
      const nextMessage = "Department is required."
      showResultDialog("error", nextMessage)
      return
    }
    if (!problemReviewed) {
      const nextMessage = "Please review the problem details before submitting."
      showResultDialog("error", nextMessage)
      return
    }

    try {
      setSubmitting(true)
      const fullDescription = `${description.trim()}\n\nBranch: ${branch.trim()}\nDepartment: ${department.trim()}`
      const ticket = await createTicket({
        title: title.trim(),
        description: fullDescription,
        location: branch.trim(),
        employee_id: user.id,
        reporter_reviewed_problem: true,
      })
      const nextMessage =
        ticket.routing_note ??
          `Ticket #${ticket.id} created and auto-routed.`
      showResultDialog("success", nextMessage)
      setTitle("")
      setDescription("")
      setBranch("")
      setDepartment("")
      setProblemReviewed(false)
    } catch (createError) {
      const nextMessage = createError instanceof Error ? createError.message : "Failed to create ticket."
      showResultDialog("error", nextMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDialogOk = () => {
    setResultDialog((current) => ({ ...current, open: false }))
    router.push("/employee/dashboard")
  }

  const handleReportAgain = () => {
    setResultDialog((current) => ({ ...current, open: false }))
  }

  return (
    <div className="space-y-6">
      <EmployeeBackButton />

      <EmployeePageHero
        title="Report Fault"
        description="Use the AI Help icon (available on all employee pages) for quick IT troubleshooting, then submit the manual fault form."
      />

      <Card id="manual-fault-form" className="mx-auto w-full max-w-[800px] rounded-xl border-[#0072CE]/25 bg-white py-0 shadow-sm">
        <CardHeader className="border-b border-[#0072CE]/15 px-5 py-4">
          <CardTitle className="text-base font-semibold text-[#0B1F3A]">Manual Fault Reporting Form</CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-5">
          <form className="mx-auto grid w-full max-w-[620px] grid-cols-1 gap-3.5 md:grid-cols-2" onSubmit={handleCreateTicket} autoComplete="off">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="fault-title" className="text-sm font-medium text-[#0B1F3A]">
                Title
              </label>
              <Input
                id="fault-title"
                placeholder="Issue summary"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                autoComplete="off"
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
                <span>I have reviewed this problem description and confirmed the details are accurate.</span>
              </label>
            </div>

            <div className="md:col-span-2 flex justify-center">
              <Button
                type="submit"
                disabled={submitting}
                className="h-10 w-full max-w-[260px] rounded-lg border border-[#005DA8] bg-[#0072CE] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#005DA8] focus-visible:ring-2 focus-visible:ring-[#0072CE]/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Analyzing and Submitting..." : "Submit Ticket"}
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
        secondaryActionLabel="Report Again"
        onSecondaryAction={handleReportAgain}
      />
    </div>
  )
}


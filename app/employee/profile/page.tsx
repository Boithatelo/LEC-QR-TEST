"use client"

import { FormEvent, useState } from "react"

import { EmployeePageHero } from "@/components/layout/EmployeePageHero"
import { EmployeeBackButton } from "@/components/layout/EmployeeBackButton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ActionFeedbackDialog } from "@/components/ui/action-feedback-dialog"
import { changeUserPassword } from "@/lib/api"
import { getStoredUserSession, persistUserSession } from "@/lib/auth"

export default function EmployeeProfilePage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resultDialog, setResultDialog] = useState<{
    open: boolean
    status: "success" | "error"
    message: string
  }>({
    open: false,
    status: "success",
    message: "",
  })

  const showResultDialog = (status: "success" | "error", message: string) => {
    setResultDialog({
      open: true,
      status,
      message,
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSuccess("")

    const user = getStoredUserSession()
    if (!user) {
      const message = "Session expired. Please login again."
      setError(message)
      showResultDialog("error", message)
      return
    }

    if (newPassword !== confirmPassword) {
      const message = "New password and confirmation do not match."
      setError(message)
      showResultDialog("error", message)
      return
    }

    if (newPassword.length < 8) {
      const message = "New password must be at least 8 characters."
      setError(message)
      showResultDialog("error", message)
      return
    }

    try {
      setSaving(true)
      const result = await changeUserPassword({
        user_id: user.id,
        current_password: currentPassword,
        new_password: newPassword,
      })
      persistUserSession({
        ...user,
        must_change_password: false,
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      const message = result.message || "Password changed successfully."
      setSuccess(message)
      showResultDialog("success", message)
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to change password."
      setError(message)
      showResultDialog("error", message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <EmployeeBackButton />
      <EmployeePageHero title="My Profile" description="Manage your account security by updating your password." compact />

      <Card className="mx-auto w-full max-w-[800px] rounded-xl border-[#0072CE]/25 bg-white py-0 shadow-sm">
        <CardHeader className="border-b border-[#0072CE]/15 px-5 py-4">
          <CardTitle className="text-base font-semibold text-[#0B1F3A]">Update Password</CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-5">
          <form className="mx-auto grid w-full max-w-[620px] grid-cols-1 gap-3.5 md:grid-cols-2" onSubmit={handleSubmit} autoComplete="off">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="current-password" className="text-sm font-medium text-[#0B1F3A]">
                Current Password
              </label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="h-9 border-[#0072CE]/30 text-[#0B1F3A]"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="new-password" className="text-sm font-medium text-[#0B1F3A]">
                New Password
              </label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="h-9 border-[#0072CE]/30 text-[#0B1F3A]"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="confirm-password" className="text-sm font-medium text-[#0B1F3A]">
                Confirm New Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-9 border-[#0072CE]/30 text-[#0B1F3A]"
                required
              />
            </div>
            {error ? <p className="md:col-span-2 text-sm text-[#D71920]">{error}</p> : null}
            {success ? <p className="md:col-span-2 text-sm text-[#007A3D]">{success}</p> : null}
            <div className="md:col-span-2 flex justify-center">
              <Button
                type="submit"
                disabled={saving}
                className="h-10 w-full max-w-[260px] rounded-lg border border-[#005DA8] bg-[#0072CE] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#005DA8] focus-visible:ring-2 focus-visible:ring-[#0072CE]/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : "Change Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ActionFeedbackDialog
        open={resultDialog.open}
        status={resultDialog.status}
        message={resultDialog.message}
        onOk={() => setResultDialog((current) => ({ ...current, open: false }))}
      />
    </div>
  )
}


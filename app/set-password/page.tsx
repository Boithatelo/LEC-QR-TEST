"use client"

import { FormEvent, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { setupPasswordWithInvite } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = useMemo(() => (searchParams.get("token") || "").trim(), [searchParams])

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSuccess("")

    if (!token) {
      setError("Invalid invite link. Please contact Admin Fault for a new invite.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      setSaving(true)
      const result = await setupPasswordWithInvite({
        token,
        new_password: password,
      })
      setSuccess(result.message)
      setPassword("")
      setConfirmPassword("")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to set password.")
    } finally {
      setSaving(false)
    }
  }

  const goToLogin = () => {
    router.push("/login")
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-4 py-10"
      style={{ backgroundImage: "url('/power-infrastructure.jpg')" }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(2,6,17,0.78)_0%,rgba(4,18,45,0.78)_40%,rgba(6,27,68,0.8)_100%)]" />

      <Card className="relative z-10 w-full max-w-md rounded-2xl border border-[#2A6FB2]/45 bg-[linear-gradient(180deg,rgba(8,30,66,0.88)_0%,rgba(5,20,47,0.92)_100%)] py-0 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-md">
        <CardHeader className="space-y-2 px-8 py-7">
          <CardTitle className="text-2xl font-semibold text-[#E5F1FF]">Set Your Password</CardTitle>
          <p className="text-sm text-[#9FC5EA]">Use your invite link to activate your account.</p>
        </CardHeader>

        <CardContent className="space-y-5 px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-[#C5DDF8]">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 border-[#2C5D92]/60 bg-[#0A1D44]/85 text-[#EAF4FF] placeholder:text-[#8FAED4] focus-visible:border-[#5EBCE7] focus-visible:ring-[#5EBCE7]/40"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-[#C5DDF8]">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-11 border-[#2C5D92]/60 bg-[#0A1D44]/85 text-[#EAF4FF] placeholder:text-[#8FAED4] focus-visible:border-[#5EBCE7] focus-visible:ring-[#5EBCE7]/40"
                required
              />
            </div>

            {error ? <p className="text-sm text-[#FF8A8F]">{error}</p> : null}
            {success ? <p className="text-sm text-[#9EF0C4]">{success}</p> : null}

            <Button
              type="submit"
              disabled={saving || !token}
              className="h-11 w-full bg-gradient-to-r from-[#2AAFE6] to-[#167BC8] text-white hover:from-[#1D9CD0] hover:to-[#0D67AD]"
            >
              {saving ? "Saving..." : "Set Password"}
            </Button>
          </form>

          <div className="flex items-center justify-between gap-3 text-sm">
            <button type="button" onClick={goToLogin} className="text-[#9DC5EA] transition hover:text-[#D6EAFF]">
              Back to Login
            </button>
            <Link href="/login" className="text-[#9DC5EA] transition hover:text-[#D6EAFF]">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

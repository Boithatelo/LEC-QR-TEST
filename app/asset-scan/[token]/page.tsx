"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Activity, ArrowLeft, Boxes, History, ScanLine } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getConsumableByScanToken,
  runConsumableScanAction,
  type AssetScanAction,
  type AssetScanDetail,
} from "@/lib/api"
import { getDashboardPathByRole, getStoredUserSession, type AuthUser } from "@/lib/auth"

const ACTIONS: Array<{ value: AssetScanAction; label: string }> = [
  { value: "check_out", label: "Check Out" },
  { value: "check_in", label: "Check In" },
  { value: "update_condition", label: "Update Condition" },
]

export default function AssetScanPage() {
  const params = useParams<{ token: string }>()
  const router = useRouter()
  const token = useMemo(() => {
    const raw = params?.token
    if (typeof raw !== "string") {
      return ""
    }
    const trimmed = raw.trim()
    if (!trimmed) {
      return ""
    }
    try {
      return decodeURIComponent(trimmed)
    } catch {
      return trimmed
    }
  }, [params])

  const [session, setSession] = useState<AuthUser | null>(null)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [scanDetail, setScanDetail] = useState<AssetScanDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [action, setAction] = useState<AssetScanAction>("check_out")
  const [actorUserId, setActorUserId] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [condition, setCondition] = useState("")
  const [assetStatus, setAssetStatus] = useState("")
  const [note, setNote] = useState("")
  const [actionMessage, setActionMessage] = useState("")
  const [submittingAction, setSubmittingAction] = useState(false)

  const loadScanDetail = useCallback(async () => {
    if (!token) {
      setError("Missing scan token.")
      setLoading(false)
      return
    }
    try {
      setError("")
      const payload = await getConsumableByScanToken(token)
      setScanDetail(payload)
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Failed to load scanned asset.")
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadScanDetail()
  }, [loadScanDetail])

  useEffect(() => {
    const storedSession = getStoredUserSession()
    setSession(storedSession)
    setSessionChecked(true)
    if (storedSession?.id) {
      setActorUserId((current) => current || String(storedSession.id))
    }
  }, [])

  const handleReturn = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    if (session) {
      router.push(getDashboardPathByRole(session.role))
      return
    }

    router.push("/login")
  }

  const submitScanAction = async () => {
    if (!token) {
      return
    }
    setSubmittingAction(true)
    setActionMessage("")
    setError("")

    const actorIdInt = Number(actorUserId)
    if (!Number.isFinite(actorIdInt) || actorIdInt <= 0) {
      setSubmittingAction(false)
      setError("Enter a valid Actor User ID.")
      return
    }

    const payload: {
      action: AssetScanAction
      actor_user_id: number
      employee_id?: number
      quantity?: number
      condition?: string
      status?: string
      note?: string
    } = {
      action,
      actor_user_id: actorIdInt,
      note: note.trim() || undefined,
    }

    if (action === "check_out" || action === "check_in") {
      const employeeIdInt = Number(employeeId)
      if (!Number.isFinite(employeeIdInt) || employeeIdInt <= 0) {
        setSubmittingAction(false)
        setError("Enter a valid Employee ID for this action.")
        return
      }
      payload.employee_id = employeeIdInt
    }

    if (action === "check_out" || action === "check_in") {
      const quantityInt = Number(quantity)
      if (!Number.isFinite(quantityInt) || quantityInt <= 0) {
        setSubmittingAction(false)
        setError("Quantity must be greater than 0.")
        return
      }
      payload.quantity = quantityInt
    }

    if (action === "update_condition") {
      if (!condition.trim() && !assetStatus.trim()) {
        setSubmittingAction(false)
        setError("Provide condition and/or status.")
        return
      }
      payload.condition = condition.trim() || undefined
      payload.status = assetStatus.trim() || undefined
    }

    try {
      const response = await runConsumableScanAction(token, payload)
      setActionMessage(response.message)
      await loadScanDetail()
    } catch (scanActionError) {
      setError(scanActionError instanceof Error ? scanActionError.message : "Failed to run scan action.")
    } finally {
      setSubmittingAction(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(120%_70%_at_10%_0%,#D6EBFF_0%,#EAF4FF_40%,#F5FAFF_100%)] px-4 py-6 md:px-8 md:py-10">
      <div className="pointer-events-none absolute -top-16 -left-14 h-52 w-52 rounded-full bg-[#4AA4FF]/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-20 h-64 w-64 rounded-full bg-[#2C7FC2]/12 blur-3xl" />

      <div className="relative mx-auto w-full max-w-5xl space-y-6">
        <Card className="overflow-hidden border-[#7CB1E2]/40 bg-gradient-to-br from-[#0D3965] via-[#1C578E] to-[#2C79B8] text-white shadow-[0_20px_45px_rgba(16,64,106,0.26)]">
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-white/15 pb-4">
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-white/90">
                <ScanLine className="size-3.5" />
                Live Scan Session
              </p>
              <CardTitle className="text-2xl tracking-tight text-white">Asset QR/NFC Scan Workspace</CardTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/40 bg-white/10 text-white hover:!border-white hover:!bg-white hover:!text-[#0E375F]"
              onClick={handleReturn}
            >
              <ArrowLeft className="size-4" />
              Return
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/95">
            <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs leading-6 text-white/90 md:text-sm">
              <span className="font-semibold text-white">Scan token:</span> {token || "N/A"}
            </div>
            {!sessionChecked ? (
              <p className="text-white/85">Checking browser session...</p>
            ) : session ? (
              <p>
                Signed-in user: <span className="font-semibold text-white">{session.name}</span> ({session.role})
              </p>
            ) : (
              <p className="text-[#FFE2E2]">No active browser session found. Enter Actor User ID manually for actions.</p>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <Card className="border-[#8AB8E1]/35 bg-white/85 shadow-sm backdrop-blur-sm">
            <CardContent className="py-8 text-center text-sm text-[#234A71]">Loading scanned asset...</CardContent>
          </Card>
        ) : error ? (
          <Card className="border-[#E37E7E]/35 bg-[#FFF7F7] shadow-sm">
            <CardContent className="py-8 text-center text-sm text-[#B42318]">{error}</CardContent>
          </Card>
        ) : !scanDetail ? (
          <Card className="border-[#8AB8E1]/35 bg-white/85 shadow-sm backdrop-blur-sm">
            <CardContent className="py-8 text-center text-sm text-[#234A71]">No asset data found for this token.</CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-[#8AB8E1]/35 bg-white/92 shadow-md backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2 text-base text-[#123D67]">
                  <Boxes className="size-4.5 text-[#1D6EAB]" />
                  Asset Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 text-sm text-[#234A71] md:grid-cols-3">
                <div className="rounded-lg border border-[#C9DEF2] bg-[#EEF6FF] p-3">
                  <p className="text-xs font-semibold tracking-wide uppercase text-[#5C7FA3]">Asset Tag</p>
                  <p className="mt-1 font-semibold text-[#10395F]">{scanDetail.asset.asset_tag || "N/A"}</p>
                </div>
                <div className="rounded-lg border border-[#C9DEF2] bg-[#EEF6FF] p-3">
                  <p className="text-xs font-semibold tracking-wide uppercase text-[#5C7FA3]">Name</p>
                  <p className="mt-1 font-semibold text-[#10395F]">{scanDetail.asset.item_name}</p>
                </div>
                <div className="rounded-lg border border-[#C9DEF2] bg-[#EEF6FF] p-3">
                  <p className="text-xs font-semibold tracking-wide uppercase text-[#5C7FA3]">Quantity</p>
                  <p className="mt-1 font-semibold text-[#10395F]">{scanDetail.asset.quantity}</p>
                </div>
                <div className="rounded-lg border border-[#C9DEF2] bg-[#F5FAFF] p-3">
                  <p className="text-xs font-semibold tracking-wide uppercase text-[#5C7FA3]">Condition</p>
                  <p className="mt-1 font-semibold text-[#10395F]">{scanDetail.asset.condition || "N/A"}</p>
                </div>
                <div className="rounded-lg border border-[#C9DEF2] bg-[#F5FAFF] p-3">
                  <p className="text-xs font-semibold tracking-wide uppercase text-[#5C7FA3]">Status</p>
                  <p className="mt-1 font-semibold text-[#10395F]">{scanDetail.asset.status || "N/A"}</p>
                </div>
                <div className="rounded-lg border border-[#C9DEF2] bg-[#F5FAFF] p-3">
                  <p className="text-xs font-semibold tracking-wide uppercase text-[#5C7FA3]">Assigned Employee</p>
                  <p className="mt-1 font-semibold text-[#10395F]">{scanDetail.asset.assigned_employee || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#8AB8E1]/35 bg-white/92 shadow-md backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2 text-base text-[#123D67]">
                  <Activity className="size-4.5 text-[#1D6EAB]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-[#C4DCF2] bg-gradient-to-r from-[#EDF6FF] to-[#F7FBFF] p-3">
                  <div className="flex flex-wrap gap-2">
                    {ACTIONS.map((item) => (
                      <Button
                        key={item.value}
                        size="sm"
                        variant={action === item.value ? "default" : "outline"}
                        className={action === item.value ? "shadow-sm" : "bg-white"}
                        onClick={() => setAction(item.value)}
                        type="button"
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="actor_user_id" className="text-[#143B62]">Actor User ID</Label>
                    <Input
                      id="actor_user_id"
                      className="border-[#9CC4EA] bg-white/90"
                      value={actorUserId}
                      onChange={(event) => setActorUserId(event.target.value)}
                      placeholder="Example: 12"
                    />
                  </div>

                  {(action === "check_out" || action === "check_in") ? (
                    <div className="space-y-2">
                      <Label htmlFor="employee_id" className="text-[#143B62]">Employee ID</Label>
                      <Input
                        id="employee_id"
                        className="border-[#9CC4EA] bg-white/90"
                        value={employeeId}
                        onChange={(event) => setEmployeeId(event.target.value)}
                        placeholder="Employee receiving/returning asset"
                      />
                    </div>
                  ) : null}

                  {(action === "check_out" || action === "check_in") ? (
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-[#143B62]">Quantity</Label>
                      <Input
                        id="quantity"
                        className="border-[#9CC4EA] bg-white/90"
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)}
                        placeholder="1"
                      />
                    </div>
                  ) : null}

                  {action === "update_condition" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="condition" className="text-[#143B62]">Condition</Label>
                        <Input
                          id="condition"
                          className="border-[#9CC4EA] bg-white/90"
                          value={condition}
                          onChange={(event) => setCondition(event.target.value)}
                          placeholder="New / Good / Faulty"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="asset_status" className="text-[#143B62]">Status</Label>
                        <Input
                          id="asset_status"
                          className="border-[#9CC4EA] bg-white/90"
                          value={assetStatus}
                          onChange={(event) => setAssetStatus(event.target.value)}
                          placeholder="In Stock / Checked Out / Under Repair"
                        />
                      </div>
                    </>
                  ) : null}

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="note" className="text-[#143B62]">Note (optional)</Label>
                    <Input
                      id="note"
                      className="border-[#9CC4EA] bg-white/90"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="Short scan note for audit trail"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <Button onClick={() => void submitScanAction()} disabled={submittingAction}>
                    {submittingAction ? "Running..." : "Run Action"}
                  </Button>
                  {actionMessage ? (
                    <p className="rounded-md border border-[#B7D4EF] bg-[#EEF6FF] px-3 py-2 text-sm text-[#1F4469]">
                      {actionMessage}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#8AB8E1]/35 bg-white/92 shadow-md backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2 text-base text-[#123D67]">
                  <History className="size-4.5 text-[#1D6EAB]" />
                  Recent Scan Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[#234A71]">
                {scanDetail.recent_scan_events.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-[#B8D4EE] bg-[#F7FBFF] p-3 text-[#517499]">
                    No scan events yet.
                  </p>
                ) : (
                  scanDetail.recent_scan_events.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-[#D3E2F2] bg-gradient-to-r from-[#F7FBFF] to-white p-3 shadow-[inset_4px_0_0_0_#5FA8E5]"
                    >
                      <p className="font-semibold text-[#0B1F3A]">{item.action_label}</p>
                      <p>
                        {item.actor_name ? `By ${item.actor_name}` : "By system"} on{" "}
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                      {item.target_employee_name ? <p>Target: {item.target_employee_name}</p> : null}
                      {item.quantity ? <p>Quantity: {item.quantity}</p> : null}
                      {item.linked_ticket_id ? <p>Ticket: #{item.linked_ticket_id}</p> : null}
                      {item.note ? <p>Note: {item.note}</p> : null}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

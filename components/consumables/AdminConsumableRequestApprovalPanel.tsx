"use client"

import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InlineStatusMessage, type InlineStatusPayload } from "@/components/ui/inline-status-message"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getStoredUserSession } from "@/lib/auth"
import {
  approveConsumableRequestById,
  getConsumableReturns,
  getConsumableRequests as getConsumableRequestsApi,
  getConsumables,
  receiveConsumableReturn,
  rejectConsumableReturn,
  rejectConsumableRequestById,
  type Consumable,
  type ConsumableRequest,
  type ConsumableReturn,
} from "@/lib/api"

const REFRESH_INTERVAL_MS = 15_000
const metricCardClass = "rounded-xl border border-[#0072CE]/25 bg-white py-0 shadow-sm"
const panelCardClass = "rounded-xl border border-[#0072CE]/25 bg-[#F7FBFF] py-0 shadow-sm"
const compactFieldClass =
  "h-8 rounded-md border border-[#9FBAD6] bg-white px-2 text-xs text-[#1E3A6D] focus:outline-none focus:ring-2 focus:ring-[#0072CE]/30"
const noteFieldClass =
  "min-h-20 w-full rounded-md border border-[#9FBAD6] bg-white px-2 py-1 text-xs text-[#1E3A6D] placeholder:text-[#6A87A9] focus:outline-none focus:ring-2 focus:ring-[#0072CE]/30"

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

function normalizeItemName(value: string): string {
  return value.trim().toLowerCase()
}

function toDisplayItemName(value: string): string {
  return value
    .split(" ")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(" ")
}

export function AdminConsumableRequestApprovalPanel() {
  const [requests, setRequests] = useState<ConsumableRequest[]>([])
  const [consumables, setConsumables] = useState<Consumable[]>([])
  const [returns, setReturns] = useState<ConsumableReturn[]>([])
  const [error, setError] = useState("")
  const [processingId, setProcessingId] = useState("")
  const [assignmentTypeByRequestId, setAssignmentTypeByRequestId] = useState<Record<string, "new" | "loan" | "exchange">>({})
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({})
  const [returnRejectReasons, setReturnRejectReasons] = useState<Record<number, string>>({})
  const [processingReturnId, setProcessingReturnId] = useState<number | null>(null)
  const [actionFeedback, setActionFeedback] = useState<InlineStatusPayload | null>(null)
  const feedbackTimerRef = useRef<number | null>(null)
  const currentUser = getStoredUserSession()

  const pendingRequests = requests.filter((request) => request.status === "pending")
  const approvedRequests = requests.filter((request) => request.status === "approved")
  const rejectedRequests = requests.filter((request) => request.status === "rejected")
  const pendingReturns = returns.filter((item) => item.status === "pending")
  const receivedReturns = returns.filter((item) => item.status === "received")

  const stockByName = useMemo(() => {
    const stockMap = new Map<string, number>()
    consumables.forEach((item) => {
      stockMap.set(normalizeItemName(item.item_name), item.quantity)
    })
    return stockMap
  }, [consumables])

  const showActionFeedback = (text: string, variant: InlineStatusPayload["variant"] = "success") => {
    setActionFeedback({ text, variant })
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current)
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      setActionFeedback(null)
      feedbackTimerRef.current = null
    }, 4200)
  }

  const loadAll = async (resetError = true) => {
    if (resetError) {
      setError("")
    }
    const [inventoryData, requestData, returnData] = await Promise.all([
      getConsumables(),
      getConsumableRequestsApi(),
      getConsumableReturns(),
    ])
    setConsumables(inventoryData)
    setRequests(requestData)
    setReturns(returnData)
  }

  useEffect(() => {
    const run = async (silent = false) => {
      try {
        await loadAll(!silent)
      } catch (loadError) {
        if (!silent) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load inventory stock.")
        }
      }
    }

    void run()
    const intervalId = window.setInterval(() => {
      void run(true)
    }, REFRESH_INTERVAL_MS)
    const onFocus = () => {
      void run(true)
    }
    window.addEventListener("focus", onFocus)
    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("focus", onFocus)
    }
  }, [])

  useEffect(
    () => () => {
      if (feedbackTimerRef.current) {
        window.clearTimeout(feedbackTimerRef.current)
      }
    },
    []
  )

  const handleApprove = async (requestId: string) => {
    const request = requests.find((item) => item.id === requestId)
    if (!request || request.status === "approved") {
      return
    }

    const matchedConsumable = consumables.find(
      (item) => normalizeItemName(item.item_name) === normalizeItemName(request.itemName)
    )
    if (!matchedConsumable) {
      setError(`Consumable item '${request.itemName}' was not found in inventory.`)
      return
    }

    if (request.quantity > matchedConsumable.quantity) {
      setError(`Insufficient stock for ${request.itemName}. Available: ${matchedConsumable.quantity}`)
      return
    }

    try {
      setProcessingId(requestId)
      setError("")
      const assignmentType = assignmentTypeByRequestId[request.id] ?? request.assignmentType ?? "new"
      await approveConsumableRequestById(request.db_id, currentUser?.id, assignmentType)
      await loadAll()
      showActionFeedback(`Request ${request.id} approved and stock updated.`)
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : "Failed to approve request.")
    } finally {
      setProcessingId("")
    }
  }

  const handleReject = (requestId: string) => {
    const request = requests.find((item) => item.id === requestId)
    if (!request || request.status !== "pending") {
      return
    }

    const reason = (rejectReasons[requestId] ?? "").trim()
    if (!reason) {
      setError("Please provide a reason before rejecting a request.")
      return
    }

    setError("")
    rejectConsumableRequestById(request.db_id, reason, currentUser?.id)
      .then(async () => {
        await loadAll()
        setRejectReasons((current) => ({ ...current, [requestId]: "" }))
        showActionFeedback(`Request ${request.id} rejected.`)
      })
      .catch((rejectError) => {
        setError(rejectError instanceof Error ? rejectError.message : "Failed to reject request.")
      })
  }

  const handleReceiveReturn = async (returnId: number) => {
    try {
      setError("")
      setProcessingReturnId(returnId)
      await receiveConsumableReturn(returnId, currentUser?.id)
      await loadAll()
      showActionFeedback(`Return RET-${returnId} received and inventory updated.`)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to receive returned consumable.")
    } finally {
      setProcessingReturnId(null)
    }
  }

  const handleRejectReturn = async (returnId: number) => {
    const reason = (returnRejectReasons[returnId] ?? "").trim()
    if (!reason) {
      setError("Please provide a reason before rejecting a return request.")
      return
    }

    try {
      setError("")
      setProcessingReturnId(returnId)
      await rejectConsumableReturn(returnId, reason, currentUser?.id)
      setReturnRejectReasons((current) => ({ ...current, [returnId]: "" }))
      await loadAll()
      showActionFeedback(`Return RET-${returnId} rejected.`)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to reject return request.")
    } finally {
      setProcessingReturnId(null)
    }
  }

  return (
    <div className="space-y-6">
      <InlineStatusMessage message={actionFeedback} floating />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        <Card className={metricCardClass}>
          <CardHeader className="px-6 py-5">
            <CardTitle className="text-base font-semibold text-[#1E3A6D]">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 text-2xl font-semibold text-[#0B1F3A]">{pendingRequests.length}</CardContent>
        </Card>
        <Card className={metricCardClass}>
          <CardHeader className="px-6 py-5">
            <CardTitle className="text-base font-semibold text-[#1E3A6D]">Approved Requests</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 text-2xl font-semibold text-[#0B1F3A]">{approvedRequests.length}</CardContent>
        </Card>
        <Card className={metricCardClass}>
          <CardHeader className="px-6 py-5">
            <CardTitle className="text-base font-semibold text-[#1E3A6D]">Rejected Requests</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 text-2xl font-semibold text-[#0B1F3A]">{rejectedRequests.length}</CardContent>
        </Card>
        <Card className={metricCardClass}>
          <CardHeader className="px-6 py-5">
            <CardTitle className="text-base font-semibold text-[#1E3A6D]">Total Requests</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 text-2xl font-semibold text-[#0B1F3A]">{requests.length}</CardContent>
        </Card>
        <Card className={metricCardClass}>
          <CardHeader className="px-6 py-5">
            <CardTitle className="text-base font-semibold text-[#1E3A6D]">Pending Returns</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 text-2xl font-semibold text-[#0B1F3A]">{pendingReturns.length}</CardContent>
        </Card>
      </div>

      <Card className={panelCardClass}>
        <CardHeader className="border-b border-[#BBD1E8] px-6 py-5">
          <CardTitle className="text-base font-semibold text-[#0B1F3A]">Consumable Request Queue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error ? <p className="bg-[#FFECEE] px-6 py-4 text-sm text-[#B42318]">{error}</p> : null}
          <Table>
            <TableHeader>
              <TableRow className="border-y-0 bg-[#2E6EA0] hover:bg-[#2E6EA0]">
                <TableHead className="px-6 text-[11px] font-semibold tracking-wide text-white uppercase">Request</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Employee</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Department</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Item</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Qty</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Type</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Status</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Decision Notes</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => {
                const availableStock = stockByName.get(normalizeItemName(request.itemName)) ?? 0
                const canApprove = request.status === "pending" && request.quantity <= availableStock

                return (
                  <TableRow key={request.id} className="border-b border-[#C5D5E6] bg-[#F7FAFE] hover:bg-[#EAF2FA]">
                    <TableCell className="px-6">
                      <p className="font-medium text-[#1F4469]">{request.id}</p>
                      <p className="text-xs text-[#5B7898]">{formatDate(request.requestedAt)}</p>
                    </TableCell>
                    <TableCell className="text-[#234A71]">{request.requestedBy}</TableCell>
                    <TableCell className="text-[#234A71]">{request.department}</TableCell>
                    <TableCell className="text-[#234A71]">{toDisplayItemName(request.itemName)}</TableCell>
                    <TableCell className="text-[#234A71]">{request.quantity}</TableCell>
                    <TableCell className="text-[#234A71]">
                      {request.status === "pending" ? (
                        <select
                          className={compactFieldClass}
                          value={assignmentTypeByRequestId[request.id] ?? request.assignmentType ?? "new"}
                          onChange={(event) =>
                            setAssignmentTypeByRequestId((current) => ({
                              ...current,
                              [request.id]: event.target.value as "new" | "loan" | "exchange",
                            }))
                          }
                        >
                          <option value="new">New</option>
                          <option value="loan">Loan</option>
                          <option value="exchange">Exchange</option>
                        </select>
                      ) : (
                        <Badge variant="outline" className="border-[#9CC4EA] bg-[#DDEEFF] text-[#2E6092]">
                          {request.assignmentType}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          request.status === "approved"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : request.status === "rejected"
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-[#2B4B6B]">
                      {request.status === "approved" ? (
                        <span>
                          Approved by {request.approvedBy ?? "Admin"} on {formatDate(request.approvedAt ?? request.requestedAt)}
                        </span>
                      ) : request.status === "rejected" ? (
                        <span>
                          Rejected by {request.rejectedBy ?? "Admin"} on {formatDate(request.rejectedAt ?? request.requestedAt)}.
                          {" "}
                          Reason: {request.rejectionReason ?? "No reason provided."}
                        </span>
                      ) : (
                        <textarea
                          className={noteFieldClass}
                          placeholder="Reason for not providing this consumable"
                          value={rejectReasons[request.id] ?? ""}
                          onChange={(event) =>
                            setRejectReasons((current) => ({ ...current, [request.id]: event.target.value }))
                          }
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {request.status === "approved" || request.status === "rejected" ? (
                        <p className="text-xs text-[#5B7898]">Decision completed</p>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            size="sm"
                            className="bg-[#0072CE] text-white hover:bg-[#005EA8]"
                            disabled={!canApprove || processingId === request.id}
                            onClick={() => void handleApprove(request.id)}
                          >
                            {processingId === request.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                            {processingId === request.id ? "Approving..." : "Approve"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-rose-300 text-rose-700 hover:bg-rose-50"
                            disabled={processingId === request.id}
                            onClick={() => handleReject(request.id)}
                          >
                            Reject
                          </Button>
                          {!canApprove ? (
                            <p className="text-xs text-[#B42318]">Insufficient stock. Available: {availableStock}</p>
                          ) : null}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className={panelCardClass}>
        <CardHeader className="border-b border-[#BBD1E8] px-6 py-5">
          <CardTitle className="text-base font-semibold text-[#0B1F3A]">Consumable Return Queue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-y-0 bg-[#2E6EA0] hover:bg-[#2E6EA0]">
                <TableHead className="px-6 text-[11px] font-semibold tracking-wide text-white uppercase">Return ID</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Employee</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Item</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Type</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Qty</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Reason</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Status</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-6 text-center text-sm text-[#5B7898]">
                    No return requests found.
                  </TableCell>
                </TableRow>
              ) : (
                returns.map((item) => (
                  <TableRow key={item.id} className="border-b border-[#C5D5E6] bg-[#F7FAFE] hover:bg-[#EAF2FA]">
                    <TableCell className="px-6 font-medium text-[#1F4469]">RET-{item.id}</TableCell>
                    <TableCell className="text-[#234A71]">{item.employeeName}</TableCell>
                    <TableCell className="text-[#234A71]">{toDisplayItemName(item.itemName)}</TableCell>
                    <TableCell className="text-[#234A71]">{item.assignmentType}</TableCell>
                    <TableCell className="text-[#234A71]">{item.quantity}</TableCell>
                    <TableCell className="max-w-[280px] text-xs text-[#2B4B6B]">{item.reason || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          item.status === "received"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : item.status === "rejected"
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                        }
                      >
                        {item.status}
                      </Badge>
                      {item.status === "received" ? (
                        <p className="mt-1 text-xs text-[#5B7898]">
                          Received by {item.receivedBy ?? "Admin"} on {formatDate(item.receivedAt ?? item.createdAt)}
                        </p>
                      ) : null}
                      {item.status === "rejected" ? (
                        <p className="mt-1 text-xs text-[#5B7898]">
                          Rejected by {item.rejectedBy ?? "Admin"} on {formatDate(item.rejectedAt ?? item.createdAt)}.
                          {" "}
                          Reason: {item.rejectionReason ?? "No reason provided."}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {item.status !== "pending" ? (
                        <p className="text-xs text-[#5B7898]">Decision completed</p>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            size="sm"
                            className="bg-[#0072CE] text-white hover:bg-[#005EA8]"
                            disabled={processingReturnId === item.id}
                            onClick={() => void handleReceiveReturn(item.id)}
                          >
                            {processingReturnId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                            {processingReturnId === item.id ? "Receiving..." : "Receive Return"}
                          </Button>
                          <textarea
                            className={noteFieldClass}
                            placeholder="Reason for rejecting this return request"
                            value={returnRejectReasons[item.id] ?? ""}
                            onChange={(event) =>
                              setReturnRejectReasons((current) => ({ ...current, [item.id]: event.target.value }))
                            }
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-rose-300 text-rose-700 hover:bg-rose-50"
                            disabled={processingReturnId === item.id}
                            onClick={() => void handleRejectReturn(item.id)}
                          >
                            {processingReturnId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                            Reject Return
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {receivedReturns.length > 0 ? (
        <p className="text-xs text-[#4A6A96]">Total received returns recorded: {receivedReturns.length}</p>
      ) : null}
    </div>
  )
}

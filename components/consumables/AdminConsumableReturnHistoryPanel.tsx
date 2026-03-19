"use client"

import { useEffect, useMemo, useState } from "react"

import { ActionFeedbackDialog } from "@/components/ui/action-feedback-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getConsumableReturns, type ConsumableReturn } from "@/lib/api"

function fmtDate(value?: string | null): string {
  if (!value) {
    return "N/A"
  }
  return new Date(value).toLocaleString()
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function AdminConsumableReturnHistoryPanel() {
  const [rows, setRows] = useState<ConsumableReturn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [status, setStatus] = useState<"all" | "pending" | "received" | "rejected">("all")
  const [employeeQuery, setEmployeeQuery] = useState("")
  const [itemQuery, setItemQuery] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [resultDialog, setResultDialog] = useState<{
    open: boolean
    status: "success" | "info"
    message: string
  }>({
    open: false,
    status: "success",
    message: "",
  })

  useEffect(() => {
    const run = async () => {
      try {
        setError("")
        const data = await getConsumableReturns()
        setRows(data)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load consumable returns.")
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  const filteredRows = useMemo(() => {
    const employeeQ = normalize(employeeQuery)
    const itemQ = normalize(itemQuery)
    const fromTime = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null
    const toTime = toDate ? new Date(`${toDate}T23:59:59`).getTime() : null

    return rows
      .filter((item) => (status === "all" ? true : item.status === status))
      .filter((item) => (employeeQ ? normalize(item.employeeName).includes(employeeQ) : true))
      .filter((item) => (itemQ ? normalize(item.itemName).includes(itemQ) : true))
      .filter((item) => {
        const createdTime = new Date(item.createdAt).getTime()
        if (fromTime !== null && createdTime < fromTime) {
          return false
        }
        if (toTime !== null && createdTime > toTime) {
          return false
        }
        return true
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [employeeQuery, fromDate, itemQuery, rows, status, toDate])

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (acc, item) => {
        acc.total += 1
        acc[item.status] += 1
        acc.quantity += item.quantity
        return acc
      },
      { total: 0, pending: 0, received: 0, rejected: 0, quantity: 0 }
    )
  }, [filteredRows])

  const showActionFeedback = (status: "success" | "info", message: string) => {
    setResultDialog({
      open: true,
      status,
      message,
    })
  }

  const exportCsv = () => {
    if (filteredRows.length === 0) {
      showActionFeedback("info", "No records available to export.")
      return
    }

    const header = [
      "Return ID",
      "Status",
      "Employee",
      "Item",
      "Type",
      "Quantity",
      "Reason",
      "Created At",
      "Received By",
      "Received At",
      "Rejected By",
      "Rejected At",
      "Rejection Reason",
    ]
    const lines = [
      header.join(","),
      ...filteredRows.map((item) =>
        [
          `RET-${item.id}`,
          item.status,
          item.employeeName,
          item.itemName,
          item.assignmentType,
          String(item.quantity),
          item.reason ?? "",
          item.createdAt,
          item.receivedBy ?? "",
          item.receivedAt ?? "",
          item.rejectedBy ?? "",
          item.rejectedAt ?? "",
          item.rejectionReason ?? "",
        ]
          .map((value) => escapeCsv(String(value)))
          .join(",")
      ),
    ]

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    const datePart = new Date().toISOString().slice(0, 10)
    anchor.href = url
    anchor.download = `consumable-return-history-${datePart}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
    showActionFeedback("success", `Exported ${filteredRows.length} return record${filteredRows.length === 1 ? "" : "s"}.`)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="rounded-xl border border-[#0072CE]/25 bg-white py-0 shadow-sm">
          <CardHeader className="px-6 py-4"><CardTitle className="text-sm font-semibold text-[#1E3A6D]">Filtered Returns</CardTitle></CardHeader>
          <CardContent className="px-6 pb-6 text-2xl font-semibold text-[#0B1F3A]">{summary.total}</CardContent>
        </Card>
        <Card className="rounded-xl border border-[#0072CE]/25 bg-white py-0 shadow-sm">
          <CardHeader className="px-6 py-4"><CardTitle className="text-sm font-semibold text-[#1E3A6D]">Pending</CardTitle></CardHeader>
          <CardContent className="px-6 pb-6 text-2xl font-semibold text-amber-700">{summary.pending}</CardContent>
        </Card>
        <Card className="rounded-xl border border-[#0072CE]/25 bg-white py-0 shadow-sm">
          <CardHeader className="px-6 py-4"><CardTitle className="text-sm font-semibold text-[#1E3A6D]">Received</CardTitle></CardHeader>
          <CardContent className="px-6 pb-6 text-2xl font-semibold text-emerald-700">{summary.received}</CardContent>
        </Card>
        <Card className="rounded-xl border border-[#0072CE]/25 bg-white py-0 shadow-sm">
          <CardHeader className="px-6 py-4"><CardTitle className="text-sm font-semibold text-[#1E3A6D]">Total Quantity</CardTitle></CardHeader>
          <CardContent className="px-6 pb-6 text-2xl font-semibold text-[#0B1F3A]">{summary.quantity}</CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border border-[#0072CE]/25 bg-[#F7FBFF] py-0 shadow-sm">
        <CardHeader className="border-b border-[#BBD1E8] px-6 py-5">
          <CardTitle className="text-base font-semibold text-[#0B1F3A]">Return History Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <select
              className="h-10 rounded-md border border-[#93AECA] bg-white px-3 text-sm text-[#20466D] focus:outline-none focus:ring-2 focus:ring-[#0072CE]/30"
              value={status}
              onChange={(event) => setStatus(event.target.value as "all" | "pending" | "received" | "rejected")}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="received">Received</option>
              <option value="rejected">Rejected</option>
            </select>
            <Input
              placeholder="Filter by employee"
              value={employeeQuery}
              onChange={(event) => setEmployeeQuery(event.target.value)}
              className="border-[#93AECA] bg-white text-[#20466D] placeholder:text-[#6A87A9]"
            />
            <Input
              placeholder="Filter by item"
              value={itemQuery}
              onChange={(event) => setItemQuery(event.target.value)}
              className="border-[#93AECA] bg-white text-[#20466D] placeholder:text-[#6A87A9]"
            />
            <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="border-[#93AECA] bg-white text-[#20466D]" />
            <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="border-[#93AECA] bg-white text-[#20466D]" />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-[#93AECA] bg-white text-[#20466D] hover:bg-[#E8F3FF]"
              onClick={() => {
                setStatus("all")
                setEmployeeQuery("")
                setItemQuery("")
                setFromDate("")
                setToDate("")
                showActionFeedback("info", "Filters reset.")
              }}
            >
              Reset Filters
            </Button>
            <Button className="bg-[#0072CE] text-white hover:bg-[#005DA8]" onClick={exportCsv}>
              Export CSV
            </Button>
          </div>
          {error ? <p className="text-sm text-[#B42318]">{error}</p> : null}
        </CardContent>
      </Card>

      <ActionFeedbackDialog
        open={resultDialog.open}
        status={resultDialog.status}
        message={resultDialog.message}
        onOk={() => setResultDialog((current) => ({ ...current, open: false }))}
      />

      <Card className="rounded-xl border border-[#0072CE]/25 bg-[#F7FBFF] py-0 shadow-sm">
        <CardHeader className="border-b border-[#BBD1E8] px-6 py-5">
          <CardTitle className="text-base font-semibold text-[#0B1F3A]">Return History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-y-0 bg-[#2E6EA0] hover:bg-[#2E6EA0]">
                <TableHead className="px-6 text-[11px] font-semibold tracking-wide text-white uppercase">Return ID</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Status</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Employee</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Item</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Type</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Qty</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Reason</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Created</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="px-6 py-6 text-center text-sm text-[#5B7898]">
                    Loading return history...
                  </TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="px-6 py-6 text-center text-sm text-[#5B7898]">
                    No return records match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((item) => (
                  <TableRow key={item.id} className="border-b border-[#C5D5E6] bg-[#F7FAFE] hover:bg-[#EAF2FA]">
                    <TableCell className="px-6 font-medium text-[#1F4469]">RET-{item.id}</TableCell>
                    <TableCell className="text-[#234A71]">{item.status}</TableCell>
                    <TableCell className="text-[#234A71]">{item.employeeName}</TableCell>
                    <TableCell className="text-[#234A71]">{item.itemName}</TableCell>
                    <TableCell className="text-[#234A71]">{item.assignmentType}</TableCell>
                    <TableCell className="text-[#234A71]">{item.quantity}</TableCell>
                    <TableCell className="max-w-[260px] text-xs text-[#2B4B6B]">{item.reason || "N/A"}</TableCell>
                    <TableCell className="text-xs text-[#2B4B6B]">{fmtDate(item.createdAt)}</TableCell>
                    <TableCell className="max-w-[260px] text-xs text-[#2B4B6B]">
                      {item.status === "received"
                        ? `Received by ${item.receivedBy ?? "Admin"} on ${fmtDate(item.receivedAt)}`
                        : item.status === "rejected"
                          ? `Rejected by ${item.rejectedBy ?? "Admin"} on ${fmtDate(item.rejectedAt)}. Reason: ${item.rejectionReason ?? "N/A"}`
                          : "Pending review"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

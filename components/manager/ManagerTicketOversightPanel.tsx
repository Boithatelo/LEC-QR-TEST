"use client"

import { useEffect, useMemo, useState } from "react"
import { Download, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAllTickets, type Ticket } from "@/lib/api"
import { escapeHtml, openPrintablePdfReport } from "@/lib/pdf-export"

type NormalizedTicket = Ticket & {
  normalized_status: string
}

function normalizeTicketStatus(status: string): string {
  const normalized = status.trim().toLowerCase()
  if (normalized === "open" || normalized === "pending vendor" || normalized === "pending") return "Pending"
  if (normalized === "escalated") return "In Process"
  if (normalized === "in progress" || normalized === "in process") return "In Process"
  if (normalized === "resolved" || normalized === "solved") return "Solved"
  return status
}

function formatTrackingId(id: number): string {
  return `TK-${String(id).padStart(5, "0")}`
}

function formatDateLabel(isoDate: string | undefined): string {
  if (!isoDate) return "N/A"
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export function ManagerTicketOversightPanel() {
  const [tickets, setTickets] = useState<NormalizedTicket[]>([])
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const run = async () => {
      try {
        const data = await getAllTickets()
        setTickets(data.map((ticket) => ({ ...ticket, normalized_status: normalizeTicketStatus(ticket.status) })))
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load ticket oversight data.")
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [])

  const summary = useMemo(
    () => ({
      pending: tickets.filter((ticket) => ticket.normalized_status === "Pending").length,
      inProcess: tickets.filter((ticket) => ticket.normalized_status === "In Process").length,
      solved: tickets.filter((ticket) => ticket.normalized_status === "Solved").length,
      unassigned: tickets.filter((ticket) => !ticket.technician_id).length,
    }),
    [tickets]
  )

  const filteredTickets = useMemo(() => {
    const search = query.toLowerCase()
    return tickets.filter((ticket) => {
      const requester = (ticket.caller_name || ticket.employee_name || "").toLowerCase()
      const technician = (ticket.technician_name || "Unassigned").toLowerCase()
      const matchesQuery =
        String(ticket.id).includes(search) ||
        formatTrackingId(ticket.id).toLowerCase().includes(search) ||
        (ticket.title || "").toLowerCase().includes(search) ||
        requester.includes(search) ||
        technician.includes(search)
      const matchesStatus = statusFilter === "All" || ticket.normalized_status === statusFilter
      const matchesPriority = priorityFilter === "All" || ticket.priority === priorityFilter
      return matchesQuery && matchesStatus && matchesPriority
    })
  }, [tickets, query, statusFilter, priorityFilter])

  const getTicketReportOptions = () => {
    const tableRows = filteredTickets
      .slice(0, 200)
      .map((ticket) => {
        const requester = ticket.caller_name || ticket.employee_name || `Employee #${ticket.employee_id}`
        const owner = ticket.technician_name || "Admin Fault Queue"
        return `<tr>
          <td>${escapeHtml(formatTrackingId(ticket.id))}</td>
          <td>${escapeHtml(formatDateLabel(ticket.updated_at))}</td>
          <td>${escapeHtml(requester)}</td>
          <td>${escapeHtml(ticket.title || "")}</td>
          <td>${escapeHtml(ticket.normalized_status)}</td>
          <td>${escapeHtml(ticket.priority || "N/A")}</td>
          <td>${escapeHtml(owner)}</td>
        </tr>`
      })
      .join("")

    return {
      title: "Manager Ticket Oversight Report",
      subtitle: `Filters: status=${statusFilter}, priority=${priorityFilter}, search="${query || "none"}"`,
      fileName: "manager-ticket-oversight.pdf",
      bodyHtml: `
        <section class="section">
          <h2>Snapshot</h2>
          <div class="kpi-grid">
            <div class="kpi"><div class="label">Pending</div><div class="value">${summary.pending}</div></div>
            <div class="kpi"><div class="label">In Process</div><div class="value">${summary.inProcess}</div></div>
            <div class="kpi"><div class="label">Solved</div><div class="value">${summary.solved}</div></div>
            <div class="kpi"><div class="label">Unassigned</div><div class="value">${summary.unassigned}</div></div>
          </div>
        </section>
        <section class="section">
          <h2>Ticket Table (${filteredTickets.length} rows${filteredTickets.length > 200 ? ", first 200 exported" : ""})</h2>
          <table>
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Updated</th>
                <th>Requester</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>${tableRows || "<tr><td colspan='7'>No tickets found.</td></tr>"}</tbody>
          </table>
        </section>
      `,
    }
  }

  const handlePrintTicketReport = () => {
    openPrintablePdfReport(getTicketReportOptions(), "print")
  }

  const handleSaveTicketReport = () => {
    openPrintablePdfReport(getTicketReportOptions(), "save")
  }

  return (
    <Card className="rounded-xl border-[#9CB8D3] bg-[#EDF3F9] py-0 shadow-sm">
      <CardHeader className="space-y-4 border-b border-[#B7CBE0] bg-[#E1EBF5] px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded border border-[#2D5A84] bg-[#163A5A] px-2 py-1 text-xs font-semibold text-white">
            Pending {summary.pending}
          </span>
          <span className="inline-flex items-center rounded border border-[#7997B5] bg-[#F1F6FB] px-2 py-1 text-xs font-semibold text-[#234A71]">
            In Process {summary.inProcess}
          </span>
          <span className="inline-flex items-center rounded border border-[#7997B5] bg-[#F1F6FB] px-2 py-1 text-xs font-semibold text-[#234A71]">
            Solved {summary.solved}
          </span>
          <span className="inline-flex items-center rounded border border-[#7997B5] bg-[#F1F6FB] px-2 py-1 text-xs font-semibold text-[#234A71]">
            Unassigned {summary.unassigned}
          </span>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by tracking ID, title, requester, or owner"
            className="max-w-lg border-[#93AECA] bg-white"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-md border border-[#93AECA] bg-white px-3 text-sm text-[#20466D]"
          >
            <option value="All">Status: All</option>
            <option value="Pending">Pending</option>
            <option value="In Process">In Process</option>
            <option value="Solved">Solved</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="h-10 rounded-md border border-[#93AECA] bg-white px-3 text-sm text-[#20466D]"
          >
            <option value="All">Priority: All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          <Button
            type="button"
            variant="outline"
            className="border-[#93AECA] bg-white text-[#20466D] hover:bg-[#EEF5FD]"
            onClick={handlePrintTicketReport}
          >
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-[#93AECA] bg-white text-[#20466D] hover:bg-[#EEF5FD]"
            onClick={handleSaveTicketReport}
          >
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-y-0 bg-[#2E6EA0] hover:bg-[#2E6EA0]">
                <TableHead className="w-[132px] px-4 py-3 text-[11px] font-semibold tracking-wide text-white uppercase">
                  Tracking ID
                </TableHead>
                <TableHead className="w-[120px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">
                  Updated
                </TableHead>
                <TableHead className="w-[180px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">
                  Requester
                </TableHead>
                <TableHead className="min-w-[220px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">
                  Subject
                </TableHead>
                <TableHead className="w-[120px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">
                  Status
                </TableHead>
                <TableHead className="w-[120px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">
                  Priority
                </TableHead>
                <TableHead className="w-[170px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">
                  Owner
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-6 py-6 text-center text-sm text-slate-500">
                    Loading tickets...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-6 py-6 text-center text-sm text-rose-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-6 py-6 text-center text-sm text-slate-500">
                    No tickets found for your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="border-b border-[#C5D5E6] bg-[#F7FAFE] hover:bg-[#EAF2FA]">
                    <TableCell className="px-4 py-3 text-xs font-semibold text-[#2A5D8D]">
                      {formatTrackingId(ticket.id)}
                    </TableCell>
                    <TableCell className="py-3 text-xs text-[#234A71]">{formatDateLabel(ticket.updated_at)}</TableCell>
                    <TableCell className="py-3 text-xs font-medium text-[#1F4469]">
                      {ticket.caller_name || ticket.employee_name || `Employee #${ticket.employee_id}`}
                    </TableCell>
                    <TableCell className="py-3 text-xs text-[#2A5D8D]">{ticket.title}</TableCell>
                    <TableCell className="py-3 text-xs font-semibold text-[#345F85]">{ticket.normalized_status}</TableCell>
                    <TableCell className="py-3 text-xs font-semibold text-[#345F85]">{ticket.priority}</TableCell>
                    <TableCell className="py-3 text-xs text-[#1F4469]">
                      {ticket.technician_name || "Admin Fault Queue"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

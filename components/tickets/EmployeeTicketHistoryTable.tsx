"use client"

import { useEffect, useState } from "react"
import {
  Building2,
  ChevronDown,
  CircleCheck,
  CircleDot,
  Clock3,
  MapPin,
  TriangleAlert,
  UserRound,
  Wrench,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getTicketById, getUserTickets, type Ticket, type TicketDetail } from "@/lib/api"
import { getStoredUserSession } from "@/lib/auth"
import { cn } from "@/lib/utils"

type TicketRecord = {
  id: number
  trackingId: string
  title: string
  description: string
  category: string
  location: string
  priority: string
  status: string
  technician: string
  createdAt: string
  updatedAt: string
  employeeName: string
}

const priorityOptions = ["All", "Low", "Medium", "High", "Critical"]
const statusOptions = ["All", "Pending", "In Progress", "Solved"]

const priorityBadgeStyles: Record<string, string> = {
  Low: "border-[#9CC4EA] bg-[#DDEEFF] text-[#2E6092]",
  Medium: "border-[#93D8C1] bg-[#DDF8EF] text-[#177F5A]",
  High: "border-[#F4D88D] bg-[#FFF5D8] text-[#9A6A00]",
  Critical: "border-[#F4B5B5] bg-[#FFE5E5] text-[#A33939]",
}

const statusTextStyles: Record<string, string> = {
  Pending: "text-[#D63C3C]",
  "In Progress": "text-[#6D3CC4]",
  Solved: "text-[#1E7A45]",
}

function normalizeEmployeeStatus(status: string): string {
  const normalized = status.trim().toLowerCase()
  if (normalized === "open" || normalized === "pending vendor" || normalized === "pending") {
    return "Pending"
  }
  if (normalized === "escalated" || normalized === "in progress" || normalized === "in process") {
    return "In Progress"
  }
  if (normalized === "resolved" || normalized === "solved") {
    return "Solved"
  }
  return status
}

function formatTrackingId(id: number): string {
  return `TK-${String(id).padStart(5, "0")}`
}

function formatDateLabel(value?: string | null): string {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function formatDateTime(value?: string | null): string {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleString()
}

function toDateValue(value?: string | null): number {
  if (!value) return 0
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function toRow(ticket: Ticket): TicketRecord {
  return {
    id: ticket.id,
    trackingId: formatTrackingId(ticket.id),
    title: ticket.title,
    description: ticket.description || "",
    category: ticket.category || "General IT Support",
    location: ticket.location || "",
    priority: ticket.priority,
    status: normalizeEmployeeStatus(ticket.status),
    technician:
      ticket.technician_name ??
      (ticket.technician_id ? `Technician #${ticket.technician_id}` : "Admin Fault Queue"),
    createdAt: ticket.created_at || "",
    updatedAt: ticket.updated_at || ticket.created_at || "",
    employeeName: ticket.employee_name ?? `Employee #${ticket.employee_id}`,
  }
}

export function EmployeeTicketHistoryTable() {
  const [rows, setRows] = useState<TicketRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [selectedRow, setSelectedRow] = useState<TicketRecord | null>(null)
  const [ticketDetail, setTicketDetail] = useState<TicketDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState("")

  useEffect(() => {
    const run = async () => {
      const user = getStoredUserSession()
      if (!user) {
        setError("Session expired. Please login again.")
        setLoading(false)
        return
      }

      try {
        const tickets = await getUserTickets(user.id)
        setRows(
          tickets
            .map(toRow)
            .sort((left, right) => toDateValue(right.updatedAt) - toDateValue(left.updatedAt))
        )
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load tickets.")
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  const filteredRows = rows.filter((ticket) => {
    const search = query.trim().toLowerCase()
    const matchesQuery =
      search.length === 0 ||
      ticket.trackingId.toLowerCase().includes(search) ||
      ticket.title.toLowerCase().includes(search) ||
      ticket.category.toLowerCase().includes(search) ||
      ticket.location.toLowerCase().includes(search) ||
      ticket.technician.toLowerCase().includes(search)

    const matchesPriority = priorityFilter === "All" || ticket.priority === priorityFilter
    const matchesStatus = statusFilter === "All" || ticket.status === statusFilter

    return matchesQuery && matchesPriority && matchesStatus
  })

  const summary = {
    total: rows.length,
    pending: rows.filter((row) => row.status === "Pending").length,
    inProgress: rows.filter((row) => row.status === "In Progress").length,
    solved: rows.filter((row) => row.status === "Solved").length,
  }

  const openTicketDetails = async (ticket: TicketRecord) => {
    setSelectedRow(ticket)
    setTicketDetail(null)
    setDetailError("")
    setDetailLoading(true)

    try {
      const detail = await getTicketById(ticket.id)
      setTicketDetail(detail)
    } catch (loadError) {
      setDetailError(loadError instanceof Error ? loadError.message : "Failed to load ticket details.")
    } finally {
      setDetailLoading(false)
    }
  }

  const closeTicketDetails = () => {
    setSelectedRow(null)
    setTicketDetail(null)
    setDetailError("")
    setDetailLoading(false)
  }

  const detailStatus = ticketDetail ? normalizeEmployeeStatus(ticketDetail.status) : selectedRow?.status ?? "Pending"

  return (
    <Card className="rounded-xl border border-[#9CB8D3] bg-[#EDF3F9] py-0 shadow-sm">
      <CardHeader className="space-y-4 border-b border-[#B7CBE0] bg-[#E1EBF5] px-4 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#203B63]">My Submitted Tickets</h3>
            <span className="text-xs text-[#5E7FA6]">Track status, assignment, and priority at a glance</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded border border-[#2D5A84] bg-[#163A5A] px-2 py-1 text-xs font-semibold text-white">
              Total {summary.total}
            </span>
            <span className="inline-flex items-center rounded border border-[#D9A2A2] bg-[#FFEAEA] px-2 py-1 text-xs font-semibold text-[#A33C3C]">
              Pending {summary.pending}
            </span>
            <span className="inline-flex items-center rounded border border-[#B9A5E9] bg-[#F1EBFF] px-2 py-1 text-xs font-semibold text-[#5E3AA0]">
              In Progress {summary.inProgress}
            </span>
            <span className="inline-flex items-center rounded border border-[#9ED4B2] bg-[#ECF9F1] px-2 py-1 text-xs font-semibold text-[#1E7A45]">
              Solved {summary.solved}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by tracking ID, subject, category, branch, or assignee"
            className="max-w-xl border-[#93AECA] bg-white"
          />

          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-[#93AECA] bg-white text-[#20466D]">
                  Status: {statusFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {statusOptions.map((option) => (
                  <DropdownMenuItem key={option} onClick={() => setStatusFilter(option)}>
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-[#93AECA] bg-white text-[#20466D]">
                  Priority: {priorityFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Priority</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {priorityOptions.map((option) => (
                  <DropdownMenuItem key={option} onClick={() => setPriorityFilter(option)}>
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
                <TableHead className="min-w-[250px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">
                  Subject
                </TableHead>
                <TableHead className="w-[150px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">
                  Branch
                </TableHead>
                <TableHead className="w-[130px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">
                  Status
                </TableHead>
                <TableHead className="w-[180px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">
                  Assigned To
                </TableHead>
                <TableHead className="w-[120px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">
                  Priority
                </TableHead>
                <TableHead className="w-[110px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-6 text-center text-sm text-slate-500">
                    Loading tickets...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-6 text-center text-sm text-rose-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-8 text-center text-sm text-[#234A71]">
                    No tickets match the current search or filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((ticket) => (
                  <TableRow key={ticket.id} className="border-b border-[#C5D5E6] bg-[#F7FAFE] hover:bg-[#EAF2FA]">
                    <TableCell className="px-4 py-3 text-xs font-semibold text-[#2A5D8D] underline underline-offset-2">
                      {ticket.trackingId}
                    </TableCell>
                    <TableCell className="py-3 text-xs text-[#234A71]">
                      {formatDateLabel(ticket.updatedAt)}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-[#1F4469]">{ticket.title}</p>
                        <p className="text-[11px] text-[#5E7FA6]">{ticket.category}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-xs text-[#1F4469]">
                      {ticket.location || "N/A"}
                    </TableCell>
                    <TableCell className={cn("py-3 text-xs font-semibold", statusTextStyles[ticket.status] ?? "text-[#345F85]")}>
                      {ticket.status}
                    </TableCell>
                    <TableCell className="py-3 text-xs text-[#1F4469]">
                      {ticket.technician}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        className={cn(
                          "rounded-sm border px-2 py-0.5 text-[11px] font-semibold",
                          priorityBadgeStyles[ticket.priority] ?? "border-[#9CC4EA] bg-[#DDEEFF] text-[#2E6092]"
                        )}
                      >
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <Button size="sm" variant="outline" onClick={() => void openTicketDetails(ticket)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={Boolean(selectedRow)} onOpenChange={(open) => !open && closeTicketDetails()}>
        <DialogContent className="flex max-h-[88vh] w-[calc(100vw-1.5rem)] flex-col overflow-hidden border-[#AFC6DF] bg-[#EAF1F8] p-0 sm:max-w-5xl">
          <div className="border-b border-[#96B6D8] bg-gradient-to-r from-[#1F3F6A] via-[#2F5F99] to-[#1E4E89] px-4 py-3 text-white sm:px-5">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold tracking-wide text-white sm:text-xl">
                Fault Details - Ticket #{selectedRow?.id}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#D8E8F7] sm:text-sm">
                Review the latest updates, ownership, and comments on this support request.
              </DialogDescription>
            </DialogHeader>
          </div>

          {detailLoading ? (
            <div className="px-4 py-6 text-sm text-[#234A71]">Loading ticket details...</div>
          ) : detailError ? (
            <div className="px-4 py-6 text-sm text-rose-600">{detailError}</div>
          ) : ticketDetail ? (
            <div className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3 sm:px-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-[#C8D7E8] bg-[#F5F9FE] p-2.5">
                  <p className="text-xs font-semibold tracking-wide text-[#506F95] uppercase">Requester</p>
                  <p className="mt-1.5 flex items-center gap-2 text-lg font-semibold text-[#203B63] sm:text-xl">
                    <UserRound className="h-4 w-4 text-[#56779D]" />
                    {ticketDetail.employee_name ?? selectedRow?.employeeName}
                  </p>
                </div>
                <div className="rounded-xl border border-[#C8D7E8] bg-[#F5F9FE] p-2.5">
                  <p className="text-xs font-semibold tracking-wide text-[#506F95] uppercase">Status</p>
                  <p className="mt-1.5 flex items-center gap-2 text-lg font-semibold text-[#203B63] sm:text-xl">
                    <CircleCheck className="h-4 w-4 text-[#6E59CE]" />
                    {detailStatus}
                    <CircleDot className="h-3.5 w-3.5 text-[#7A61D2]" />
                  </p>
                </div>
                <div className="rounded-xl border border-[#C8D7E8] bg-[#F5F9FE] p-2.5">
                  <p className="text-xs font-semibold tracking-wide text-[#506F95] uppercase">Priority</p>
                  <Badge
                    className={cn(
                      "mt-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold",
                      priorityBadgeStyles[ticketDetail.priority] ?? "border-[#9CC4EA] bg-[#DDEEFF] text-[#2E6092]"
                    )}
                  >
                    <TriangleAlert className="mr-1 h-3.5 w-3.5" />
                    {ticketDetail.priority}
                  </Badge>
                </div>
                <div className="rounded-xl border border-[#C8D7E8] bg-[#F5F9FE] p-2.5">
                  <p className="text-xs font-semibold tracking-wide text-[#506F95] uppercase">Last Updated</p>
                  <p className="mt-1.5 text-lg font-semibold text-[#203B63] sm:text-xl">
                    {formatDateLabel(ticketDetail.updated_at || ticketDetail.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[#748FB1] sm:text-sm">
                <span className="inline-flex items-center gap-1">
                  <CircleCheck className="h-3.5 w-3.5" />
                  Created
                </span>
                <span>|</span>
                <span>Assigned</span>
                <span>|</span>
                <span className="inline-flex items-center gap-1">
                  <Wrench className="h-3.5 w-3.5" />
                  In support workflow
                </span>
                <span>|</span>
                <span className="font-semibold text-[#4B6D95]">{detailStatus}</span>
              </div>

              <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_250px]">
                <div className="space-y-2.5">
                  <div className="rounded-2xl border border-[#C8D7E8] bg-[#F8FBFF] p-3">
                    <p className="text-xs font-semibold tracking-wide text-[#5A79A1] uppercase">Description</p>
                    <h3 className="mt-1 text-xl font-semibold text-[#203A62] sm:text-2xl">{ticketDetail.title}</h3>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#26486F]">
                      {ticketDetail.description || "No description provided."}
                    </p>

                    <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                      <div className="rounded-xl border border-[#D7E3F0] bg-white p-2.5">
                        <p className="mb-2 text-xs font-semibold tracking-wide text-[#5A79A1] uppercase">Ticket Info</p>
                        <div className="space-y-1.5 text-sm text-[#26486F]">
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#5B7EA5]" />
                            Branch: {ticketDetail.location || "N/A"}
                          </p>
                          <p className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-[#5B7EA5]" />
                            Category: {ticketDetail.category}
                          </p>
                          <p className="flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-[#5B7EA5]" />
                            Assigned to: {ticketDetail.technician_name ?? "Admin Fault Queue"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#D7E3F0] bg-white p-2.5">
                        <p className="mb-2 text-xs font-semibold tracking-wide text-[#5A79A1] uppercase">Metadata</p>
                        <div className="space-y-1.5 text-sm text-[#26486F]">
                          <p>Tracking ID: {formatTrackingId(ticketDetail.id)}</p>
                          <p>Reported: {formatDateTime(ticketDetail.created_at)}</p>
                          <p>Updated: {formatDateTime(ticketDetail.updated_at || ticketDetail.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#C8D7E8] bg-[#F8FBFF] p-3">
                    <p className="text-base font-semibold text-[#203B63] sm:text-lg">Comments</p>
                    <div className="mt-2 space-y-2.5">
                      {ticketDetail.comments.length === 0 ? (
                        <p className="text-sm text-[#5E7FA6]">No comments yet.</p>
                      ) : (
                        ticketDetail.comments.map((comment) => (
                          <div key={comment.id} className="rounded-xl border border-[#D2DEEC] bg-white p-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-[#203B63]">{comment.author_name}</p>
                              <p className="text-xs text-[#6E89AA]">{formatDateTime(comment.created_at)}</p>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-[#26486F]">{comment.comment}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="rounded-2xl border border-[#C8D7E8] bg-[#F8FBFF] p-3">
                    <p className="text-base font-semibold text-[#203B63] sm:text-lg">Status Panel</p>
                    <div className="mt-2 space-y-2">
                      <Badge
                        className={cn(
                          "rounded-md border px-2 py-0.5 text-xs font-semibold",
                          priorityBadgeStyles[ticketDetail.priority] ?? "border-[#9CC4EA] bg-[#DDEEFF] text-[#2E6092]"
                        )}
                      >
                        {ticketDetail.priority}
                      </Badge>

                      <div className="rounded-xl border border-[#D7E3F0] bg-white p-2.5 text-sm text-[#26486F]">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[#6885A8]">Current Status</span>
                          <span className={cn("font-semibold", statusTextStyles[detailStatus] ?? "text-[#203B63]")}>
                            {detailStatus}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <span className="text-[#6885A8]">Assigned Team</span>
                          <span className="font-semibold text-[#203B63]">
                            {ticketDetail.technician_name ?? "Admin Fault Queue"}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <span className="text-[#6885A8]">Branch</span>
                          <span className="font-semibold text-[#203B63]">{ticketDetail.location || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#C8D7E8] bg-[#F8FBFF] p-3">
                    <p className="text-base font-semibold text-[#203B63] sm:text-lg">Timeline</p>
                    <div className="mt-2 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="inline-flex items-center gap-2 text-sm text-[#4F6F98]">
                          <CircleCheck className="h-3.5 w-3.5 text-[#56A07A]" />
                          Ticket created
                        </p>
                        <p className="text-xs text-[#6E89AA]">{formatDateTime(ticketDetail.created_at)}</p>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="inline-flex items-center gap-2 text-sm text-[#4F6F98]">
                          <Wrench className="h-3.5 w-3.5 text-[#5E7FA6]" />
                          Assigned to support
                        </p>
                        <p className="text-xs text-[#6E89AA]">{ticketDetail.technician_name ?? "Admin Fault Queue"}</p>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="inline-flex items-center gap-2 text-sm text-[#4F6F98]">
                          <Clock3 className="h-3.5 w-3.5 text-[#7F97B3]" />
                          Current status
                        </p>
                        <p className="text-xs text-[#6E89AA]">{detailStatus}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="shrink-0 border-t border-[#C8D8EA] bg-[#EDF3F8] px-3 py-2.5 sm:px-4">
            <div className="ml-auto flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Button variant="outline" onClick={closeTicketDetails}>
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

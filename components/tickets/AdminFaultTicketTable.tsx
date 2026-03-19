"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"

import { ActionFeedbackDialog } from "@/components/ui/action-feedback-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
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
import {
  assignTechnician,
  createTicketComment,
  escalateTicketByAdmin,
  getAllTickets,
  getTechnicians,
  type Technician,
  type Ticket,
  updateTicketPriority,
  updateTicketStatus,
} from "@/lib/api"
import { getStoredUserSession } from "@/lib/auth"
import { cn } from "@/lib/utils"

type TicketRecord = {
  id: number
  tracking_id: string
  requester: string
  employee_name: string
  title: string
  description: string
  location: string
  created_at: string
  priority: string
  status: string
  technician: string
  technician_id: number | null
  latest_escalation_comment?: string | null
  latest_escalation_by?: string | null
  latest_escalation_at?: string | null
  latest_escalation_target?: string | null
}

const priorityOptions = ["Low", "Medium", "High", "Critical"]

const priorityBadgeStyles: Record<string, string> = {
  Low: "border-[#9CC4EA] bg-[#DDEEFF] text-[#2E6092]",
  Medium: "border-[#93D8C1] bg-[#DDF8EF] text-[#177F5A]",
  High: "border-[#F4D88D] bg-[#FFF5D8] text-[#9A6A00]",
  Critical: "border-[#F4B5B5] bg-[#FFE5E5] text-[#A33939]",
}

const statusTextStyles: Record<string, string> = {
  Pending: "text-[#D63C3C]",
  "In Process": "text-[#6D3CC4]",
  Solved: "text-[#1E7A45]",
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

function formatDateLabel(isoDate: string): string {
  if (!isoDate) return "N/A"
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function formatDateTime(value?: string | null): string {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleString()
}

function toRow(ticket: Ticket): TicketRecord {
  const requesterName = ticket.caller_name?.trim() || ticket.employee_name || `Employee #${ticket.employee_id}`
  return {
    id: ticket.id,
    tracking_id: formatTrackingId(ticket.id),
    requester: requesterName,
    employee_name: ticket.employee_name ?? `Employee #${ticket.employee_id}`,
    title: ticket.title,
    description: ticket.description || "",
    location: ticket.location || "",
    created_at: ticket.created_at || "",
    priority: ticket.priority,
    status: normalizeTicketStatus(ticket.status),
    technician: ticket.technician_name ?? (ticket.technician_id ? `Technician #${ticket.technician_id}` : "Unassigned"),
    technician_id: ticket.technician_id ?? null,
    latest_escalation_comment: ticket.latest_escalation_comment ?? null,
    latest_escalation_by: ticket.latest_escalation_by ?? null,
    latest_escalation_at: ticket.latest_escalation_at ?? null,
    latest_escalation_target: ticket.latest_escalation_target ?? null,
  }
}

export function AdminFaultTicketTable() {
  const [query, setQuery] = useState("")
  const [rows, setRows] = useState<TicketRecord[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [resultDialog, setResultDialog] = useState<{
    open: boolean
    status: "success" | "error"
    message: string
  }>({
    open: false,
    status: "success",
    message: "",
  })

  const [viewTicket, setViewTicket] = useState<TicketRecord | null>(null)
  const [acceptingViewTicket, setAcceptingViewTicket] = useState(false)
  const [assignTicket, setAssignTicket] = useState<TicketRecord | null>(null)
  const [assignTechnicianId, setAssignTechnicianId] = useState("")
  const [assigning, setAssigning] = useState(false)
  const [priorityTicket, setPriorityTicket] = useState<TicketRecord | null>(null)
  const [nextPriority, setNextPriority] = useState("Medium")
  const [savingPriority, setSavingPriority] = useState(false)
  const [escalationTicket, setEscalationTicket] = useState<TicketRecord | null>(null)
  const [escalationTechnicianId, setEscalationTechnicianId] = useState("")
  const [escalationComment, setEscalationComment] = useState("")
  const [escalating, setEscalating] = useState(false)
  const [commentDraft, setCommentDraft] = useState("")
  const [commentSaving, setCommentSaving] = useState(false)
  const [commentError, setCommentError] = useState("")
  const [commentSuccess, setCommentSuccess] = useState("")

  const showActionFeedback = (status: "success" | "error", message: string) => {
    setResultDialog({
      open: true,
      status,
      message,
    })
  }

  useEffect(() => {
    const run = async () => {
      try {
        const [data, technicianData] = await Promise.all([getAllTickets(), getTechnicians()])
        setRows(data.map(toRow))
        setTechnicians(technicianData)
      } catch (fetchError) {
        setLoadError(fetchError instanceof Error ? fetchError.message : "Failed to load tickets.")
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [])

  useEffect(() => {
    setCommentDraft("")
    setCommentError("")
    setCommentSuccess("")
  }, [viewTicket?.id])

  const filteredRows = rows.filter((ticket) => {
    const search = query.toLowerCase()
    const matchesQuery =
      ticket.tracking_id.toLowerCase().includes(search) ||
      ticket.title.toLowerCase().includes(search) ||
      ticket.requester.toLowerCase().includes(search) ||
      ticket.technician.toLowerCase().includes(search) ||
      String(ticket.id).includes(search)
    const matchesPriority = priorityFilter === "All" || ticket.priority === priorityFilter
    return matchesQuery && matchesPriority
  })

  const summary = {
    open: rows.filter((row) => row.status === "Pending").length,
    assigned: rows.filter((row) => row.technician_id !== null).length,
    unassigned: rows.filter((row) => row.technician_id === null).length,
    highPriority: rows.filter((row) => row.priority === "High" || row.priority === "Critical").length,
  }

  const refreshRow = async (ticketId: number) => {
    const all = await getAllTickets()
    const updated = all.find((item) => item.id === ticketId)
    if (!updated) return
    setRows((current) => current.map((row) => (row.id === ticketId ? toRow(updated) : row)))
  }

  const handleReceive = async (ticketId: number) => {
    const user = getStoredUserSession()
    const acceptedByAdminId = user?.role === "admin_fault" ? user.id : undefined
    await updateTicketStatus(ticketId, "In Process", acceptedByAdminId)
    await refreshRow(ticketId)
  }

  const handleAcceptFromDialog = async () => {
    if (!viewTicket) return
    try {
      setAcceptingViewTicket(true)
      await handleReceive(viewTicket.id)
      showActionFeedback("success", `Ticket #${viewTicket.id} accepted and moved to In Process.`)
      setViewTicket(null)
    } catch (actionError) {
      showActionFeedback("error", actionError instanceof Error ? actionError.message : "Failed to receive ticket.")
    } finally {
      setAcceptingViewTicket(false)
    }
  }

  const handleAssignSubmit = async () => {
    if (!assignTicket) return
    try {
      setAssigning(true)
      await assignTechnician(assignTicket.id, assignTechnicianId ? Number(assignTechnicianId) : null)
      await refreshRow(assignTicket.id)
      const assignedTechnician = technicians.find((option) => String(option.id) === assignTechnicianId)
      showActionFeedback(
        "success",
        assignedTechnician
          ? `Ticket #${assignTicket.id} assigned to ${assignedTechnician.name}.`
          : `Ticket #${assignTicket.id} marked as unassigned.`
      )
      setAssignTicket(null)
      setAssignTechnicianId("")
    } catch (actionError) {
      showActionFeedback("error", actionError instanceof Error ? actionError.message : "Failed to assign technician.")
    } finally {
      setAssigning(false)
    }
  }

  const handlePrioritySubmit = async () => {
    if (!priorityTicket) return
    try {
      setSavingPriority(true)
      await updateTicketPriority(priorityTicket.id, nextPriority)
      await refreshRow(priorityTicket.id)
      showActionFeedback("success", `Ticket #${priorityTicket.id} priority updated to ${nextPriority}.`)
      setPriorityTicket(null)
    } catch (actionError) {
      showActionFeedback("error", actionError instanceof Error ? actionError.message : "Failed to update priority.")
    } finally {
      setSavingPriority(false)
    }
  }

  const submitEscalation = async () => {
    if (!escalationTicket) return
    const user = getStoredUserSession()
    if (!user || user.role !== "admin_fault") {
      showActionFeedback("error", "Admin Fault session required. Please login again.")
      return
    }
    if (!escalationTechnicianId) {
      showActionFeedback("error", "Please choose the technician to escalate to.")
      return
    }
    if (!escalationComment.trim()) {
      showActionFeedback("error", "Please provide escalation details.")
      return
    }
    try {
      setEscalating(true)
      await escalateTicketByAdmin(escalationTicket.id, user.id, Number(escalationTechnicianId), escalationComment.trim())
      await refreshRow(escalationTicket.id)
      const assignedTechnician = technicians.find((option) => String(option.id) === escalationTechnicianId)
      showActionFeedback(
        "success",
        assignedTechnician
          ? `Ticket #${escalationTicket.id} escalated to ${assignedTechnician.name}.`
          : `Ticket #${escalationTicket.id} escalated successfully.`
      )
      setEscalationTicket(null)
      setEscalationTechnicianId("")
      setEscalationComment("")
    } catch (actionError) {
      showActionFeedback("error", actionError instanceof Error ? actionError.message : "Failed to escalate ticket.")
    } finally {
      setEscalating(false)
    }
  }

  const handleCommentSubmit = async () => {
    if (!viewTicket) return
    const user = getStoredUserSession()
    if (!user || user.role !== "admin_fault") {
      setCommentError("Admin Fault session required. Please login again.")
      return
    }
    if (!commentDraft.trim()) {
      setCommentError("Comment cannot be empty.")
      return
    }
    try {
      setCommentSaving(true)
      setCommentError("")
      setCommentSuccess("")
      await createTicketComment(viewTicket.id, {
        author_id: user.id,
        comment: commentDraft.trim(),
      })
      setCommentDraft("")
      setCommentSuccess("Comment sent to employee.")
      showActionFeedback("success", "Comment sent to employee.")
    } catch (submitError) {
      const nextMessage = submitError instanceof Error ? submitError.message : "Failed to send comment."
      setCommentError(nextMessage)
      showActionFeedback("error", nextMessage)
    } finally {
      setCommentSaving(false)
    }
  }

  return (
    <Card className="rounded-xl border border-[#9CB8D3] bg-[#EDF3F9] py-0 shadow-sm">
      <CardHeader className="space-y-4 border-b border-[#B7CBE0] bg-[#E1EBF5] px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded border border-[#2D5A84] bg-[#163A5A] px-2 py-1 text-xs font-semibold text-white">Open tickets {summary.open}</span>
          <span className="inline-flex items-center rounded border border-[#7997B5] bg-[#F1F6FB] px-2 py-1 text-xs font-semibold text-[#234A71]">Assigned {summary.assigned}</span>
          <span className="inline-flex items-center rounded border border-[#7997B5] bg-[#F1F6FB] px-2 py-1 text-xs font-semibold text-[#234A71]">Unassigned {summary.unassigned}</span>
          <span className="inline-flex items-center rounded border border-[#D9A2A2] bg-[#FFEAEA] px-2 py-1 text-xs font-semibold text-[#A33C3C]">High/Critical {summary.highPriority}</span>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by tracking ID, caller, or technician" className="max-w-lg border-[#93AECA] bg-white" />
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
              <DropdownMenuItem onClick={() => setPriorityFilter("All")}>All</DropdownMenuItem>
              {priorityOptions.map((item) => (
                <DropdownMenuItem key={item} onClick={() => setPriorityFilter(item)}>
                  {item}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-y-0 bg-[#2E6EA0] hover:bg-[#2E6EA0]">
                <TableHead className="w-[132px] px-4 py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Tracking ID</TableHead>
                <TableHead className="w-[120px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Updated</TableHead>
                <TableHead className="w-[180px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Name</TableHead>
                <TableHead className="min-w-[220px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Subject</TableHead>
                <TableHead className="w-[120px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Status</TableHead>
                <TableHead className="w-[170px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Last Replier</TableHead>
                <TableHead className="w-[120px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Priority</TableHead>
                <TableHead className="w-[130px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-6 text-center text-sm text-slate-500">Loading tickets...</TableCell>
                </TableRow>
              ) : loadError ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-6 text-center text-sm text-rose-600">{loadError}</TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-6 text-center text-sm text-slate-500">No tickets found.</TableCell>
                </TableRow>
              ) : (
                filteredRows.map((ticket) => (
                  <TableRow key={ticket.id} className="border-b border-[#C5D5E6] bg-[#F7FAFE] hover:bg-[#EAF2FA]">
                    <TableCell className="px-4 py-3 text-xs font-semibold text-[#2A5D8D] underline underline-offset-2">{ticket.tracking_id}</TableCell>
                    <TableCell className="py-3 text-xs text-[#234A71]">{formatDateLabel(ticket.created_at)}</TableCell>
                    <TableCell className="py-3 text-xs font-medium text-[#1F4469]">{ticket.requester}</TableCell>
                    <TableCell className="py-3 text-xs text-[#2A5D8D] underline underline-offset-2">{ticket.title}</TableCell>
                    <TableCell className={cn("py-3 text-xs font-semibold", statusTextStyles[ticket.status] ?? "text-[#345F85]")}>{ticket.status}</TableCell>
                    <TableCell className="py-3 text-xs text-[#1F4469]">{ticket.technician}</TableCell>
                    <TableCell className="py-3">
                      <Badge className={cn("rounded-sm border px-2 py-0.5 text-[11px] font-semibold", priorityBadgeStyles[ticket.priority] ?? "border-[#9CC4EA] bg-[#DDEEFF] text-[#2E6092]")}>{ticket.priority}</Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="h-8 border-[#93AECA] bg-white text-[#20466D]">
                            Actions
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ticket #{ticket.id}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setViewTicket(ticket)}>
                            Open Ticket
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setAssignTicket(ticket)
                              setAssignTechnicianId(ticket.technician_id ? String(ticket.technician_id) : "")
                            }}
                          >
                            Assign Technician
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setPriorityTicket(ticket)
                              setNextPriority(ticket.priority)
                            }}
                          >
                            Change Priority
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-rose-700 focus:text-rose-800"
                            disabled={ticket.status === "Pending"}
                            onClick={() => {
                              setEscalationTicket(ticket)
                              setEscalationTechnicianId("")
                              setEscalationComment("")
                            }}
                          >
                            Escalate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={Boolean(viewTicket)} onOpenChange={(open) => !open && setViewTicket(null)}>
        <DialogContent className="overflow-hidden border-[#9CB8D3] bg-[#F7FBFF] p-0 sm:max-w-2xl">
          <div className="border-b border-[#B7CBE0] bg-gradient-to-r from-[#204B73] to-[#2E6EA0] px-6 py-5 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold tracking-wide text-white">Fault Details - Ticket #{viewTicket?.id}</DialogTitle>
              <DialogDescription className="text-sm text-[#D8E8F7]">
                Review this ticket and decide whether to resolve or escalate.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-[#C8DAEC] bg-white p-3">
                <p className="text-[11px] font-semibold tracking-wide text-[#5B7898] uppercase">Caller</p>
                <p className="mt-1 text-base font-semibold text-[#1D3F63]">{viewTicket?.requester}</p>
              </div>
              <div className="rounded-lg border border-[#C8DAEC] bg-white p-3">
                <p className="text-[11px] font-semibold tracking-wide text-[#5B7898] uppercase">Employee Account</p>
                <p className="mt-1 text-base font-semibold text-[#1D3F63]">{viewTicket?.employee_name}</p>
              </div>
              <div className="rounded-lg border border-[#C8DAEC] bg-white p-3">
                <p className="text-[11px] font-semibold tracking-wide text-[#5B7898] uppercase">Priority</p>
                <Badge
                  className={cn(
                    "mt-1 rounded-sm border px-2 py-0.5 text-[11px] font-semibold",
                    priorityBadgeStyles[viewTicket?.priority ?? ""] ?? "border-[#9CC4EA] bg-[#DDEEFF] text-[#2E6092]"
                  )}
                >
                  {viewTicket?.priority}
                </Badge>
              </div>
              <div className="rounded-lg border border-[#C8DAEC] bg-white p-3">
                <p className="text-[11px] font-semibold tracking-wide text-[#5B7898] uppercase">Status</p>
                <p className={cn("mt-1 text-base font-semibold", statusTextStyles[viewTicket?.status ?? ""] ?? "text-[#1D3F63]")}>
                  {viewTicket?.status}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-lg border border-[#C8DAEC] bg-white p-4 md:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold tracking-wide text-[#5B7898] uppercase">Location</p>
                <p className="mt-1 text-sm font-medium text-[#1D3F63]">{viewTicket?.location || "N/A"}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-wide text-[#5B7898] uppercase">Updated</p>
                <p className="mt-1 text-sm font-medium text-[#1D3F63]">{formatDateLabel(viewTicket?.created_at || "")}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[11px] font-semibold tracking-wide text-[#5B7898] uppercase">Title</p>
                <p className="mt-1 text-lg font-semibold text-[#163A5A]">{viewTicket?.title}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[11px] font-semibold tracking-wide text-[#5B7898] uppercase">Description</p>
                <p className="mt-1 whitespace-pre-wrap rounded-md border border-[#E2ECF6] bg-[#F8FBFF] p-3 text-sm leading-6 text-[#2B4B6B]">
                  {viewTicket?.description || "No description."}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[#C8DAEC] bg-white p-4">
              <p className="text-[11px] font-semibold tracking-wide text-[#5B7898] uppercase">Comment To Employee</p>
              <textarea
                className="mt-2 min-h-24 w-full rounded-md border border-[#D5E3F1] bg-white px-3 py-2 text-sm text-[#1D3F63]"
                placeholder="Share an update or instruction for the employee..."
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
              />
              {commentError ? <p className="mt-2 text-xs text-rose-600">{commentError}</p> : null}
              {commentSuccess ? <p className="mt-2 text-xs text-emerald-700">{commentSuccess}</p> : null}
              <div className="mt-3 flex justify-end">
                <Button
                  onClick={() => void handleCommentSubmit()}
                  disabled={commentSaving}
                  className="bg-[#2E6EA0] text-white hover:bg-[#255C86]"
                >
                  {commentSaving ? "Sending..." : "Send Comment"}
                </Button>
              </div>
            </div>

            {viewTicket?.latest_escalation_comment ? (
              <div className="rounded-lg border border-[#C8DAEC] bg-white p-4">
                <p className="text-[11px] font-semibold tracking-wide text-[#5B7898] uppercase">Escalation Comment</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-[#2B4B6B]">{viewTicket.latest_escalation_comment}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#5B7898]">
                  {viewTicket.latest_escalation_by ? <span>From: {viewTicket.latest_escalation_by}</span> : null}
                  {viewTicket.latest_escalation_target ? <span>To: {viewTicket.latest_escalation_target}</span> : null}
                  {viewTicket.latest_escalation_at ? <span>{formatDateTime(viewTicket.latest_escalation_at)}</span> : null}
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="border-t border-[#D5E3F1] bg-white px-6 py-4">
            <Button
              onClick={() => void handleAcceptFromDialog()}
              disabled={!viewTicket || viewTicket.status !== "Pending" || acceptingViewTicket}
              className="bg-[#1E7A45] text-white hover:bg-[#166438]"
            >
              {acceptingViewTicket ? "Accepting..." : "Accept"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" className="border-[#9FBAD6] text-[#1C466D] hover:bg-[#EEF5FD]">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(assignTicket)} onOpenChange={(open) => !open && setAssignTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Technician - Ticket #{assignTicket?.id}</DialogTitle>
            <DialogDescription>Select who should own this ticket next.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Technician</label>
            <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800" value={assignTechnicianId} onChange={(event) => setAssignTechnicianId(event.target.value)}>
              <option value="">Unassigned</option>
              {technicians.map((option) => (
                <option key={option.id} value={String(option.id)}>
                  {option.name} ({option.branch || "No branch"})
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={() => void handleAssignSubmit()} disabled={assigning}>{assigning ? "Saving..." : "Save Assignment"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(priorityTicket)} onOpenChange={(open) => !open && setPriorityTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Priority - Ticket #{priorityTicket?.id}</DialogTitle>
            <DialogDescription>Update the urgency level for this ticket.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Priority</label>
            <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800" value={nextPriority} onChange={(event) => setNextPriority(event.target.value)}>
              {priorityOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={() => void handlePrioritySubmit()} disabled={savingPriority}>{savingPriority ? "Saving..." : "Save Priority"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(escalationTicket)} onOpenChange={(open) => !open && setEscalationTicket(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Escalate Ticket #{escalationTicket?.id}</DialogTitle>
            <DialogDescription>Choose technician and add escalation notes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm md:grid-cols-2">
              <div><p className="text-xs text-slate-500">Caller</p><p className="font-medium text-slate-800">{escalationTicket?.requester}</p></div>
              <div><p className="text-xs text-slate-500">Employee Account</p><p className="font-medium text-slate-800">{escalationTicket?.employee_name}</p></div>
              <div className="md:col-span-2"><p className="text-xs text-slate-500">Fault</p><p className="font-medium text-slate-800">{escalationTicket?.title}</p><p className="mt-1 whitespace-pre-wrap text-slate-700">{escalationTicket?.description || "No description."}</p></div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Escalate To (Technician)</label>
              <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800" value={escalationTechnicianId} onChange={(event) => setEscalationTechnicianId(event.target.value)}>
                <option value="">Select technician</option>
                {technicians.map((option) => (
                  <option key={option.id} value={String(option.id)}>{option.name} ({option.branch || "No branch"})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Escalation Notes</label>
              <textarea className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800" value={escalationComment} onChange={(event) => setEscalationComment(event.target.value)} placeholder="Why this fault is being escalated and what checks were done." />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button className="bg-rose-600 text-white hover:bg-rose-700" disabled={escalating} onClick={() => void submitEscalation()}>
              {escalating ? "Escalating..." : "Confirm Escalation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ActionFeedbackDialog
        open={resultDialog.open}
        status={resultDialog.status}
        message={resultDialog.message}
        onOk={() => setResultDialog((current) => ({ ...current, open: false }))}
      />
    </Card>
  )
}

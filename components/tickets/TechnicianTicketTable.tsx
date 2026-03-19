"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"

import { ActionFeedbackDialog } from "@/components/ui/action-feedback-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { escalateTicket, getAssignedTickets, getTechnicians, type Technician, type Ticket, updateTicketStatus } from "@/lib/api"
import { getStoredUserSession } from "@/lib/auth"
import { cn } from "@/lib/utils"

const statusBadgeStyles: Record<string, string> = {
  "In Progress": "text-[#6D3CC4]",
  Solved: "text-[#1E7A45]",
  Escalated: "text-[#B26B00]",
}

const priorityBadgeStyles: Record<string, string> = {
  Low: "border-[#9CC4EA] bg-[#DDEEFF] text-[#2E6092]",
  Medium: "border-[#93D8C1] bg-[#DDF8EF] text-[#177F5A]",
  High: "border-[#F4D88D] bg-[#FFF5D8] text-[#9A6A00]",
  Critical: "border-[#F4B5B5] bg-[#FFE5E5] text-[#A33939]",
}

type TicketViewFilter = "all" | "assigned" | "solved" | "escalated"

type EscalationDraft = {
  ticketId: number
  targetTechnicianId: number | null
  targetLabel: string
  targetRole?: "admin_fault"
}

type EscalationCommentPreview = {
  ticketId: number
  title: string
  comment: string
  by?: string | null
  at?: string | null
}

type TicketRow = {
  id: number
  trackingId: string
  reporter: string
  title: string
  description: string
  branch: string
  updated: string
  priority: string
  status: string
  escalationTarget: string
  raw: Ticket
}

const filterOptions: { key: TicketViewFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "assigned", label: "Assigned" },
  { key: "solved", label: "Solved" },
  { key: "escalated", label: "Escalated" },
]

const statusUpdateOptions: Array<{ value: string; label: string }> = [
  { value: "In Progress", label: "In Progress" },
  { value: "Solved", label: "Solved" },
]

function formatDateLabel(value?: string | null): string {
  if (!value) {
    return "N/A"
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "N/A"
  }
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function formatDateTime(value?: string | null): string {
  if (!value) {
    return "N/A"
  }
  return new Date(value).toLocaleString()
}

function normalizeTicketStatus(status: string): string {
  const normalized = status.trim().toLowerCase()
  if (normalized === "resolved" || normalized === "solved") {
    return "Solved"
  }
  if (normalized === "in progress" || normalized === "in process") {
    return "In Progress"
  }
  if (normalized === "open" || normalized === "pending vendor" || normalized === "pending") {
    return "Pending"
  }
  return status
}

function getTechnicianDisplayStatus(ticket: Ticket): string {
  const normalized = normalizeTicketStatus(ticket.status)
  if (normalized === "Pending") {
    return ticket.is_currently_assigned_to_me ? "In Progress" : "Escalated"
  }
  return normalized
}

function extractEscalationReason(commentText: string): string {
  const separatorIndex = commentText.indexOf(":")
  if (separatorIndex < 0) {
    return ""
  }
  return commentText.slice(separatorIndex + 1).trim()
}

function formatEscalationPreviewText(commentText: string, escalatedBy?: string | null): string {
  const trimmed = commentText.trim()
  const normalized = trimmed.toLowerCase()
  if (normalized.startsWith("escalated to technician") || normalized.startsWith("escalated to admin fault")) {
    const reason = extractEscalationReason(trimmed)
    if (escalatedBy) {
      return reason ? `Escalated by ${escalatedBy}: ${reason}` : `Escalated by ${escalatedBy}`
    }
    return reason ? `Escalated: ${reason}` : "Escalated"
  }
  return commentText
}

function formatTrackingId(id: number): string {
  return `TK-${String(id).padStart(5, "0")}`
}

function toRow(ticket: Ticket): TicketRow {
  return {
    id: ticket.id,
    trackingId: formatTrackingId(ticket.id),
    reporter: ticket.employee_name ?? `Employee #${ticket.employee_id}`,
    title: ticket.title,
    description: ticket.description || "No fault description provided.",
    branch: ticket.location || "N/A",
    updated: ticket.created_at || "",
    priority: ticket.priority,
    status: getTechnicianDisplayStatus(ticket),
    escalationTarget: ticket.latest_escalation_target || (ticket.is_currently_assigned_to_me ? "Current queue" : "Transferred"),
    raw: ticket,
  }
}

export function TechnicianTicketTable() {
  const currentUser = getStoredUserSession()
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [activeFilter, setActiveFilter] = useState<TicketViewFilter>("all")
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [escalatingTicketId, setEscalatingTicketId] = useState<number | null>(null)
  const [statusUpdatingTicketId, setStatusUpdatingTicketId] = useState<number | null>(null)
  const [escalationDialogOpen, setEscalationDialogOpen] = useState(false)
  const [escalationComment, setEscalationComment] = useState("")
  const [escalationDraft, setEscalationDraft] = useState<EscalationDraft | null>(null)
  const [commentPreview, setCommentPreview] = useState<EscalationCommentPreview | null>(null)
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

  const showResultDialog = (status: "success" | "error", message: string) => {
    setResultDialog({
      open: true,
      status,
      message,
    })
  }

  const loadAssignedTickets = async () => {
    const user = getStoredUserSession()
    if (!user) {
      setLoadError("Session expired. Please login again.")
      setLoading(false)
      return
    }

    const [ticketData, technicianData] = await Promise.all([getAssignedTickets(user.id), getTechnicians()])
    setAssignedTickets(ticketData)
    setTechnicians(technicianData)
    setLoadError("")
  }

  useEffect(() => {
    const run = async () => {
      try {
        await loadAssignedTickets()
      } catch (fetchError) {
        setLoadError(fetchError instanceof Error ? fetchError.message : "Failed to load assigned tickets.")
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  const openEscalationDialog = (
    ticketId: number,
    targetTechnicianId: number | null,
    targetLabel: string,
    targetRole?: "admin_fault"
  ) => {
    setEscalationComment("")
    setEscalationDraft({ ticketId, targetTechnicianId, targetLabel, targetRole })
    setEscalationDialogOpen(true)
  }

  const handleEscalate = async () => {
    if (!escalationDraft) {
      showResultDialog("error", "Choose an escalation target first.")
      return
    }

    const user = getStoredUserSession()
    if (!user) {
      showResultDialog("error", "Session expired. Please login again.")
      return
    }

    if (!escalationComment.trim()) {
      showResultDialog("error", "Escalation comment is required.")
      return
    }

    try {
      setEscalatingTicketId(escalationDraft.ticketId)
      await escalateTicket(
        escalationDraft.ticketId,
        user.id,
        escalationDraft.targetTechnicianId,
        escalationComment.trim(),
        escalationDraft.targetRole
      )
      await loadAssignedTickets()
      setEscalationDialogOpen(false)
      setEscalationComment("")
      showResultDialog("success", `Ticket #${escalationDraft.ticketId} escalated to ${escalationDraft.targetLabel}.`)
      setEscalationDraft(null)
    } catch (escalationError) {
      showResultDialog("error", escalationError instanceof Error ? escalationError.message : "Failed to escalate ticket.")
    } finally {
      setEscalatingTicketId(null)
    }
  }

  const handleStatusUpdate = async (ticket: Ticket, nextStatus: string) => {
    if (getTechnicianDisplayStatus(ticket) === nextStatus) {
      return
    }

    try {
      setStatusUpdatingTicketId(ticket.id)
      await updateTicketStatus(ticket.id, nextStatus)
      await loadAssignedTickets()
      showResultDialog(
        "success",
        nextStatus === "Solved" ? `Ticket #${ticket.id} marked as solved.` : `Ticket #${ticket.id} status updated.`
      )
    } catch (statusError) {
      showResultDialog("error", statusError instanceof Error ? statusError.message : "Failed to update ticket status.")
    } finally {
      setStatusUpdatingTicketId(null)
    }
  }

  const escalationTargets = technicians.filter((tech) => tech.user_id !== currentUser?.id)
  const filteredTickets = useMemo(() => {
    if (activeFilter === "all") {
      return assignedTickets
    }
    if (activeFilter === "assigned") {
      return assignedTickets.filter((ticket) => ticket.is_currently_assigned_to_me)
    }
    if (activeFilter === "solved") {
      return assignedTickets.filter((ticket) => getTechnicianDisplayStatus(ticket) === "Solved")
    }
    return assignedTickets.filter((ticket) => ticket.escalated_by_me && !ticket.is_currently_assigned_to_me)
  }, [activeFilter, assignedTickets])

  const rows = useMemo(() => {
    const search = query.trim().toLowerCase()
    return filteredTickets.map(toRow).filter((ticket) => {
      if (!search) {
        return true
      }
      return [
        ticket.trackingId,
        ticket.title,
        ticket.reporter,
        ticket.branch,
        ticket.escalationTarget,
        String(ticket.id),
      ].some((value) => value.toLowerCase().includes(search))
    })
  }, [filteredTickets, query])

  const summary = useMemo(
    () => ({
      open: assignedTickets.filter((ticket) => getTechnicianDisplayStatus(ticket) === "In Progress").length,
      assigned: assignedTickets.filter((ticket) => ticket.is_currently_assigned_to_me).length,
      solved: assignedTickets.filter((ticket) => getTechnicianDisplayStatus(ticket) === "Solved").length,
      escalated: assignedTickets.filter((ticket) => ticket.escalated_by_me && !ticket.is_currently_assigned_to_me).length,
    }),
    [assignedTickets]
  )

  return (
    <Card className="rounded-xl border border-[#9CB8D3] bg-[#EDF3F9] py-0 shadow-sm">
      <CardHeader className="space-y-4 border-b border-[#B7CBE0] bg-[#E1EBF5] px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded border border-[#2D5A84] bg-[#163A5A] px-2 py-1 text-xs font-semibold text-white">
            In Progress {summary.open}
          </span>
          <span className="inline-flex items-center rounded border border-[#7997B5] bg-[#F1F6FB] px-2 py-1 text-xs font-semibold text-[#234A71]">
            Assigned {summary.assigned}
          </span>
          <span className="inline-flex items-center rounded border border-[#7997B5] bg-[#F1F6FB] px-2 py-1 text-xs font-semibold text-[#234A71]">
            Solved {summary.solved}
          </span>
          <span className="inline-flex items-center rounded border border-[#D9A2A2] bg-[#FFEAEA] px-2 py-1 text-xs font-semibold text-[#A33C3C]">
            Escalated {summary.escalated}
          </span>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by tracking ID, reporter, branch, or subject"
            className="max-w-lg border-[#93AECA] bg-white"
          />

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.key}
                type="button"
                size="sm"
                variant="outline"
                className={cn(
                  "border-[#93AECA] bg-white text-[#20466D]",
                  activeFilter === option.key && "border-[#204B73] bg-[#204B73] text-white hover:bg-[#204B73] hover:text-white"
                )}
                onClick={() => setActiveFilter(option.key)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 [&_th]:whitespace-normal [&_td]:align-top [&_td]:whitespace-normal [&_td]:break-words">
        <Table className="min-w-[1080px] table-fixed">
            <TableHeader>
              <TableRow className="border-y-0 bg-[#2E6EA0] hover:bg-[#2E6EA0]">
                <TableHead className="w-[132px] px-4 py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Tracking ID</TableHead>
                <TableHead className="w-[120px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Updated</TableHead>
                <TableHead className="w-[180px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Reporter</TableHead>
                <TableHead className="min-w-[220px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Subject</TableHead>
                <TableHead className="w-[120px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Status</TableHead>
                <TableHead className="w-[120px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Priority</TableHead>
                <TableHead className="w-[170px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Escalation</TableHead>
                <TableHead className="w-[130px] py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-6 text-center text-sm text-slate-500">
                    Loading assigned tickets...
                  </TableCell>
                </TableRow>
              ) : loadError ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-6 text-center text-sm text-rose-600">
                    {loadError}
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-6 text-center text-sm text-slate-500">
                    No tickets found for this filter.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((ticket) => (
                  <TableRow key={ticket.id} className="border-b border-[#C5D5E6] bg-[#F7FAFE] hover:bg-[#EAF2FA]">
                    <TableCell className="px-4 py-3 text-xs font-semibold text-[#2A5D8D] underline underline-offset-2">
                      {ticket.trackingId}
                    </TableCell>
                    <TableCell className="py-3 text-xs text-[#234A71]">{formatDateLabel(ticket.updated)}</TableCell>
                    <TableCell className="py-3 text-xs font-medium text-[#1F4469]">{ticket.reporter}</TableCell>
                    <TableCell className="py-3 text-xs text-[#2A5D8D]">
                      <div className="space-y-1">
                        <Link href={`/technician/tickets/${ticket.id}`} className="font-semibold underline underline-offset-2">
                          {ticket.title}
                        </Link>
                        <p className="line-clamp-2 text-[#4A6887]">{ticket.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className={cn("py-3 text-xs font-semibold", statusBadgeStyles[ticket.status] ?? "text-[#345F85]")}>
                      <div className="space-y-2">
                        <p>{ticket.status}</p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-[#93AECA] bg-white text-[#20466D]"
                              disabled={statusUpdatingTicketId === ticket.id}
                            >
                              {statusUpdatingTicketId === ticket.id ? "Saving..." : "Change"}
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {statusUpdateOptions.map((option) => (
                              <DropdownMenuItem
                                key={option.value}
                                disabled={ticket.status === option.value}
                                onClick={() => void handleStatusUpdate(ticket.raw, option.value)}
                              >
                                {option.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
                    <TableCell className="py-3 text-xs text-[#1F4469]">
                      {ticket.raw.latest_escalation_comment ? (
                        <div className="space-y-2">
                          <p>{ticket.escalationTarget}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-[#93AECA] bg-white text-[#20466D]"
                            onClick={() =>
                              setCommentPreview({
                                ticketId: ticket.id,
                                title: ticket.title,
                                comment: formatEscalationPreviewText(
                                  ticket.raw.latest_escalation_comment ?? "",
                                  ticket.raw.latest_escalation_by
                                ),
                                by: ticket.raw.latest_escalation_by,
                                at: ticket.raw.latest_escalation_at,
                              })
                            }
                          >
                            View Comment
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[#4A6887]">No escalation comment</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-[#93AECA] bg-white text-[#20466D]"
                            disabled={escalatingTicketId === ticket.id || !ticket.raw.is_currently_assigned_to_me}
                          >
                            {escalatingTicketId === ticket.id ? "Escalating..." : "Actions"}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ticket #{ticket.id}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/technician/tickets/${ticket.id}`}>Open Ticket</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {escalationTargets.length === 0 ? (
                            <DropdownMenuItem disabled>No other technicians available</DropdownMenuItem>
                          ) : (
                            escalationTargets.map((target) => (
                              <DropdownMenuItem
                                key={target.id}
                                onClick={() => openEscalationDialog(ticket.id, target.id, target.name)}
                              >
                                Escalate to {target.name}
                              </DropdownMenuItem>
                            ))
                          )}
                          <DropdownMenuItem onClick={() => openEscalationDialog(ticket.id, null, "Admin Fault", "admin_fault")}>
                            Back to Admin Fault
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {!ticket.raw.is_currently_assigned_to_me ? (
                        <p className="mt-1 text-xs text-[#5C7897]">Only current owner can escalate.</p>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
        </Table>
      </CardContent>

      <Dialog open={escalationDialogOpen} onOpenChange={setEscalationDialogOpen}>
        <DialogContent className="border-[#9CB8D3] bg-[#F7FBFF]">
          <DialogHeader>
            <DialogTitle className="text-[#1D3F63]">Escalate Ticket</DialogTitle>
            <DialogDescription className="text-[#4A6887]">
              {escalationDraft
                ? `Add escalation details for ${escalationDraft.targetLabel}.`
                : "Add an escalation comment."}
            </DialogDescription>
          </DialogHeader>
          <textarea
            className="min-h-24 w-full rounded-md border border-[#B7CBE0] bg-white px-3 py-2 text-sm text-slate-800"
            placeholder="Explain why this ticket is being escalated."
            value={escalationComment}
            onChange={(event) => setEscalationComment(event.target.value)}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-[#93AECA] bg-white text-[#20466D]"
              onClick={() => {
                setEscalationDialogOpen(false)
                setEscalationDraft(null)
                setEscalationComment("")
              }}
            >
              Cancel
            </Button>
            <Button type="button" className="bg-[#204B73] text-white hover:bg-[#173754]" onClick={() => void handleEscalate()} disabled={escalatingTicketId !== null}>
              {escalatingTicketId !== null ? "Escalating..." : "Submit Escalation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(commentPreview)} onOpenChange={(open) => (!open ? setCommentPreview(null) : undefined)}>
        <DialogContent className="border-[#9CB8D3] bg-[#F7FBFF]">
          <DialogHeader>
            <DialogTitle className="text-[#1D3F63]">
              {commentPreview ? `Escalation Comment - Ticket #${commentPreview.ticketId}` : "Escalation Comment"}
            </DialogTitle>
            <DialogDescription className="text-[#4A6887]">{commentPreview ? commentPreview.title : ""}</DialogDescription>
          </DialogHeader>
          {commentPreview ? (
            <div className="space-y-2 rounded-lg border border-[#C8DAEC] bg-white p-3">
              <p className="text-sm text-slate-800">{commentPreview.comment}</p>
              <p className="text-xs text-slate-500">{formatDateTime(commentPreview.at)}</p>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" className="border-[#93AECA] bg-white text-[#20466D]" onClick={() => setCommentPreview(null)}>
              Close
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

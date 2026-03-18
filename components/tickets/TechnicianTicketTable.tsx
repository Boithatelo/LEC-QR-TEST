"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { escalateTicket, getAssignedTickets, getTechnicians, type Technician, type Ticket, updateTicketStatus } from "@/lib/api"
import { getStoredUserSession } from "@/lib/auth"
import { cn } from "@/lib/utils"

const statusBadgeStyles: Record<string, string> = {
  "In Process": "bg-blue-50 text-blue-700 border border-blue-100",
  Solved: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  Escalated: "bg-amber-50 text-amber-700 border border-amber-100",
}

const priorityBadgeStyles: Record<string, string> = {
  Low: "bg-slate-100 text-slate-700 border border-slate-200",
  Medium: "bg-indigo-50 text-indigo-700 border border-indigo-100",
  High: "bg-orange-50 text-orange-700 border border-orange-100",
  Critical: "bg-rose-50 text-rose-700 border border-rose-100",
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

const filterOptions: { key: TicketViewFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "assigned", label: "Assigned" },
  { key: "solved", label: "Solved" },
  { key: "escalated", label: "Escalated" },
]

const statusUpdateOptions: Array<{ value: string; label: string }> = [
  { value: "In Process", label: "In Process" },
  { value: "Solved", label: "Solved" },
]

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
    return "In Process"
  }
  if (normalized === "open" || normalized === "pending vendor" || normalized === "pending") {
    return "Pending"
  }
  return status
}

function getTechnicianDisplayStatus(ticket: Ticket): string {
  const normalized = normalizeTicketStatus(ticket.status)
  if (normalized === "Pending") {
    return ticket.is_currently_assigned_to_me ? "In Process" : "Escalated"
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

export function TechnicianTicketTable() {
  const currentUser = getStoredUserSession()
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [activeFilter, setActiveFilter] = useState<TicketViewFilter>("all")
  const [loading, setLoading] = useState(true)
  const [escalatingTicketId, setEscalatingTicketId] = useState<number | null>(null)
  const [statusUpdatingTicketId, setStatusUpdatingTicketId] = useState<number | null>(null)
  const [escalationDialogOpen, setEscalationDialogOpen] = useState(false)
  const [escalationComment, setEscalationComment] = useState("")
  const [escalationDraft, setEscalationDraft] = useState<EscalationDraft | null>(null)
  const [commentPreview, setCommentPreview] = useState<EscalationCommentPreview | null>(null)
  const [error, setError] = useState("")

  const loadAssignedTickets = async () => {
    const user = getStoredUserSession()
    if (!user) {
      setError("Session expired. Please login again.")
      setLoading(false)
      return
    }

    const [ticketData, technicianData] = await Promise.all([getAssignedTickets(user.id), getTechnicians()])
    setAssignedTickets(ticketData)
    setTechnicians(technicianData)
  }

  useEffect(() => {
    const run = async () => {
      try {
        await loadAssignedTickets()
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load assigned tickets.")
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
    setError("")
    setEscalationComment("")
    setEscalationDraft({ ticketId, targetTechnicianId, targetLabel, targetRole })
    setEscalationDialogOpen(true)
  }

  const handleEscalate = async () => {
    if (!escalationDraft) {
      setError("Choose an escalation target first.")
      return
    }

    const user = getStoredUserSession()
    if (!user) {
      setError("Session expired. Please login again.")
      return
    }

    if (!escalationComment.trim()) {
      setError("Escalation comment is required.")
      return
    }

    try {
      setError("")
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
      setEscalationDraft(null)
    } catch (escalationError) {
      setError(escalationError instanceof Error ? escalationError.message : "Failed to escalate ticket.")
    } finally {
      setEscalatingTicketId(null)
    }
  }

  const handleStatusUpdate = async (ticket: Ticket, nextStatus: string) => {
    if (getTechnicianDisplayStatus(ticket) === nextStatus) {
      return
    }

    try {
      setError("")
      setStatusUpdatingTicketId(ticket.id)
      await updateTicketStatus(ticket.id, nextStatus)
      await loadAssignedTickets()
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Failed to update ticket status.")
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

  return (
    <Card className="rounded-xl border border-[#9CB8D3] bg-[#EDF3F9] py-0 shadow-sm">
      <CardHeader className="space-y-4 border-b border-[#B7CBE0] bg-[#E1EBF5] px-4 py-4">
        <CardTitle className="text-base font-semibold text-[#0B1F3A]">Assigned Tickets</CardTitle>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const isActive = activeFilter === option.key
            return (
              <Button
                key={option.key}
                type="button"
                size="sm"
                variant="outline"
                className={
                  isActive
                    ? "border-[#2E6EA0] bg-[#2E6EA0] text-white hover:bg-[#255C86]"
                    : "border-[#93AECA] bg-white text-[#20466D] hover:bg-[#EAF2FA]"
                }
                onClick={() => setActiveFilter(option.key)}
              >
                {option.label}
              </Button>
            )
          })}
        </div>
      </CardHeader>

      <CardContent className="p-0 [&_[data-slot=table-container]]:overflow-x-hidden [&_th]:whitespace-normal [&_td]:whitespace-normal [&_td]:break-words [&_td]:align-top">
        {error ? <p className="px-4 pt-4 text-sm text-rose-600">{error}</p> : null}

        <div>
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="border-y-0 bg-[#2E6EA0] hover:bg-[#2E6EA0]">
                <TableHead className="px-4 py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Ticket ID</TableHead>
                <TableHead className="py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Fault Report</TableHead>
                <TableHead className="py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Reporter</TableHead>
                <TableHead className="py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Branch</TableHead>
                <TableHead className="py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Reported At</TableHead>
                <TableHead className="py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Priority</TableHead>
                <TableHead className="py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Status</TableHead>
                <TableHead className="py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Escalation Comment</TableHead>
                <TableHead className="py-3 text-[11px] font-semibold tracking-wide text-white uppercase">Escalate</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="px-6 py-6 text-center text-sm text-slate-500">
                    Loading assigned tickets...
                  </TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="px-6 py-6 text-center text-sm text-slate-500">
                    No tickets found for this filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => {
                  const displayStatus = getTechnicianDisplayStatus(ticket)
                  const escalationAuthorLabel = ticket.latest_escalation_by?.trim() ?? ""
                  return (
                    <TableRow key={ticket.id} className="border-b border-[#C5D5E6] bg-[#F7FAFE] hover:bg-[#EAF2FA]">
                      <TableCell className="px-4 py-3 text-xs font-semibold text-[#2A5D8D] underline underline-offset-2">
                        #{ticket.id}
                      </TableCell>
                      <TableCell className="py-3 text-xs text-[#1F4469]">
                        <div className="space-y-1">
                          <Link href={`/technician/tickets/${ticket.id}`} className="font-semibold text-[#2A5D8D] underline underline-offset-2">
                            {ticket.title}
                          </Link>
                          <p className="text-xs text-[#4A6A96]">{ticket.description || "No fault description provided."}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-xs font-medium text-[#1F4469]">
                        {ticket.employee_name ?? `Employee #${ticket.employee_id}`}
                      </TableCell>
                      <TableCell className="py-3 text-xs text-[#234A71]">{ticket.location || "N/A"}</TableCell>
                      <TableCell className="py-3 text-xs text-[#234A71]">{formatDateTime(ticket.created_at)}</TableCell>
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
                      <TableCell className="py-3">
                        <div className="space-y-2">
                          <Badge
                            className={cn(
                              "rounded-sm border px-2 py-0.5 text-[11px] font-semibold",
                              statusBadgeStyles[displayStatus] ?? "border-[#9CC4EA] bg-[#DDEEFF] text-[#2E6092]"
                            )}
                          >
                            {displayStatus}
                          </Badge>
                          <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-[#93AECA] bg-white text-[#20466D]"
                              disabled={statusUpdatingTicketId === ticket.id}
                            >
                              {statusUpdatingTicketId === ticket.id ? "Saving..." : "Status"}
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {statusUpdateOptions.map((option) => (
                                <DropdownMenuItem
                                  key={option.value}
                                  disabled={displayStatus === option.value}
                                  onClick={() => void handleStatusUpdate(ticket, option.value)}
                                >
                                  {option.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-xs text-[#1F4469]">
                        {ticket.latest_escalation_comment ? (
                          <div className="space-y-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-[#93AECA] bg-white text-[#20466D]"
                              onClick={() =>
                                setCommentPreview({
                                  ticketId: ticket.id,
                                  title: ticket.title,
                                  comment: formatEscalationPreviewText(
                                    ticket.latest_escalation_comment ?? "",
                                    escalationAuthorLabel || undefined
                                  ),
                                  by: ticket.latest_escalation_by,
                                  at: ticket.latest_escalation_at,
                                })
                              }
                            >
                              Comment
                          </Button>
                          {escalationAuthorLabel ? (
                            <p className="text-xs text-[#4A6A96]">From: {escalationAuthorLabel}</p>
                          ) : null}
                          {ticket.latest_escalation_target ? (
                            <p className="text-xs text-[#4A6A96]">To: {ticket.latest_escalation_target}</p>
                          ) : null}
                          </div>
                        ) : (
                          <span className="text-xs text-[#4A6A96]">No escalation comment</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-[#93AECA] bg-white text-[#20466D]"
                              disabled={escalatingTicketId === ticket.id || !ticket.is_currently_assigned_to_me}
                            >
                              {escalatingTicketId === ticket.id ? "Escalating..." : "Escalate"}
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {escalationTargets.length === 0 ? (
                              <DropdownMenuItem disabled>No other technicians available</DropdownMenuItem>
                            ) : (
                              escalationTargets.map((target) => (
                                <DropdownMenuItem
                                  key={target.id}
                                  onClick={() => openEscalationDialog(ticket.id, target.id, target.name)}
                                >
                                  {target.name}
                                </DropdownMenuItem>
                              ))
                            )}
                            <DropdownMenuItem onClick={() => openEscalationDialog(ticket.id, null, "Admin Fault", "admin_fault")}>
                              Back to Admin Fault
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {!ticket.is_currently_assigned_to_me ? (
                          <p className="mt-1 text-xs text-[#4A6A96]">Only current owner can escalate.</p>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={escalationDialogOpen} onOpenChange={setEscalationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate Ticket</DialogTitle>
            <DialogDescription>
              {escalationDraft
                ? `Add escalation comment for ${escalationDraft.targetLabel}.`
                : "Add an escalation comment."}
            </DialogDescription>
          </DialogHeader>
          <textarea
            className="min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800"
            placeholder="Explain why this ticket is being escalated."
            value={escalationComment}
            onChange={(event) => setEscalationComment(event.target.value)}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEscalationDialogOpen(false)
                setEscalationDraft(null)
                setEscalationComment("")
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleEscalate()} disabled={escalatingTicketId !== null}>
              {escalatingTicketId !== null ? "Escalating..." : "Submit Escalation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(commentPreview)} onOpenChange={(open) => (!open ? setCommentPreview(null) : undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {commentPreview ? `Escalation Comment - Ticket #${commentPreview.ticketId}` : "Escalation Comment"}
            </DialogTitle>
            <DialogDescription>{commentPreview ? commentPreview.title : ""}</DialogDescription>
          </DialogHeader>
          {commentPreview ? (
            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm text-slate-800">{commentPreview.comment}</p>
              <p className="text-xs text-slate-500">{formatDateTime(commentPreview.at)}</p>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCommentPreview(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

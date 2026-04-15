"use client"

import { Bell, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type AuthUser } from "@/lib/auth"
import {
  getNotifications,
  getTicketById,
  markNotificationsRead,
  type AppNotification,
  type TicketDetail,
} from "@/lib/api"

const topbarConfig: Array<{
  match: (pathname: string) => boolean
  parent: string
  current: string
  title: string
}> = [
  {
    match: (pathname) => pathname.startsWith("/employee/profile"),
    parent: "Employee",
    current: "Profile",
    title: "Employee Profile",
  },
  {
    match: (pathname) => pathname.startsWith("/employee/report"),
    parent: "Employee",
    current: "Report Fault",
    title: "Employee Fault Reporting",
  },
  {
    match: (pathname) => pathname.startsWith("/employee/tickets"),
    parent: "Employee",
    current: "My Tickets",
    title: "Employee Ticket History",
  },
  {
    match: (pathname) => pathname.startsWith("/employee/my-consumables"),
    parent: "Employee",
    current: "My Consumables",
    title: "Assigned Consumables",
  },
  {
    match: (pathname) => pathname.startsWith("/employee/consumables"),
    parent: "Employee",
    current: "Consumable Request",
    title: "Consumable Request Form",
  },
  {
    match: (pathname) => pathname === "/employee/dashboard",
    parent: "Employee",
    current: "Dashboard",
    title: "Employee Dashboard",
  },
  {
    match: (pathname) => pathname.startsWith("/technician/tickets/"),
    parent: "Technician",
    current: "Ticket Detail",
    title: "Technician Workbench",
  },
  {
    match: (pathname) => pathname.startsWith("/technician/hardware-request"),
    parent: "Technician",
    current: "Office Asset Request",
    title: "Consumable Request Form",
  },
  {
    match: (pathname) => pathname.startsWith("/technician/tickets"),
    parent: "Technician",
    current: "Assigned Tickets",
    title: "Assigned Ticket Queue",
  },
  {
    match: (pathname) => pathname === "/technician/dashboard",
    parent: "Technician",
    current: "Dashboard",
    title: "Technician Overview",
  },
  {
    match: (pathname) => pathname.startsWith("/admin-fault/tickets"),
    parent: "Admin Fault",
    current: "All Tickets",
    title: "Fault Control Center",
  },
  {
    match: (pathname) => pathname.startsWith("/admin-fault/performance"),
    parent: "Admin Fault",
    current: "Performance",
    title: "Performance Analytics",
  },
  {
    match: (pathname) => pathname.startsWith("/admin-fault/log-call"),
    parent: "Admin Fault",
    current: "Log Call",
    title: "Call Logging",
  },
  {
    match: (pathname) => pathname.startsWith("/admin-fault/manage-users"),
    parent: "Admin Fault",
    current: "Manage Users",
    title: "User Management",
  },
  {
    match: (pathname) => pathname === "/admin-fault/dashboard",
    parent: "Admin Fault",
    current: "Dashboard",
    title: "Fault Management Console",
  },
  {
    match: (pathname) => pathname.startsWith("/manager/tickets"),
    parent: "Manager",
    current: "Ticket Oversight",
    title: "Manager Ticket Oversight",
  },
  {
    match: (pathname) => pathname.startsWith("/manager/performance"),
    parent: "Manager",
    current: "Performance",
    title: "Manager Performance Analytics",
  },
  {
    match: (pathname) => pathname.startsWith("/manager/resources"),
    parent: "Manager",
    current: "Resource Oversight",
    title: "Manager Resource Oversight",
  },
  {
    match: (pathname) => pathname === "/manager/dashboard",
    parent: "Manager",
    current: "Dashboard",
    title: "Manager Command Center",
  },
  {
    match: (pathname) => pathname.startsWith("/admin-consumables/inventory"),
    parent: "Admin Consumables",
    current: "Assets",
    title: "Assets Inventory",
  },
  {
    match: (pathname) => pathname.startsWith("/admin-consumables/returns"),
    parent: "Admin Consumables",
    current: "Returns",
    title: "Consumable Return History",
  },
  {
    match: (pathname) => pathname === "/admin-consumables/dashboard",
    parent: "Admin Consumables",
    current: "Dashboard",
    title: "Consumables Management",
  },
  {
    match: (pathname) => pathname === "/admin-consumables",
    parent: "Admin Consumables",
    current: "Add Assets",
    title: "Add New Asset",
  },
  {
    match: (pathname) => pathname === "/dashboard",
    parent: "Workspace",
    current: "Overview",
    title: "IT Service Management",
  },
]

type TopbarProps = {
  user: AuthUser
}

function extractEscalationReason(commentText: string): string {
  const separatorIndex = commentText.indexOf(":")
  if (separatorIndex < 0) {
    return ""
  }
  return commentText.slice(separatorIndex + 1).trim()
}

function normalizeName(value?: string | null): string {
  return (value || "").trim().toLowerCase()
}

function formatTicketCommentText(
  commentText: string,
  authorName: string,
  viewer?: Pick<AuthUser, "name" | "role">
): string {
  const trimmed = commentText.trim()
  const normalized = trimmed.toLowerCase()
  if (normalized.startsWith("escalated to technician") || normalized.startsWith("escalated to admin fault")) {
    const reason = extractEscalationReason(trimmed)
    return reason ? `Escalated by ${authorName}: ${reason}` : `Escalated by ${authorName}`
  }

  const isEmployeeViewer = viewer?.role === "employee"
  const isReporterSelf = normalizeName(authorName) !== "" && normalizeName(authorName) === normalizeName(viewer?.name)
  if (!isEmployeeViewer || !isReporterSelf) {
    return commentText
  }

  const approvedMatch = trimmed.match(/^Reporter problem review approved \(rating (\d)\/5\):\s*(.*)$/i)
  if (approvedMatch) {
    const rating = approvedMatch[1]
    const detail = (approvedMatch[2] || "")
      .replace(/^Reporter\s+approved\s+the\s+fix\s+and\s+confirmed\s+resolution\.?/i, "")
      .replace(/^Reporter\s+/i, "")
      .trim()
    return detail
      ? `You approved the final review (rating ${rating}/5). ${detail}`
      : `You approved the final review (rating ${rating}/5).`
  }

  const rejectedMatch = trimmed.match(/^Reporter problem review rejected \(rating (\d)\/5\):\s*(.*)$/i)
  if (rejectedMatch) {
    const rating = rejectedMatch[1]
    const detail = (rejectedMatch[2] || "")
      .replace(/^Reporter\s+requested\s+additional\s+work\s+before\s+closure\.?/i, "")
      .replace(/^Reporter\s+/i, "")
      .trim()
    return detail
      ? `You requested more work (rating ${rating}/5). ${detail}`
      : `You requested more work (rating ${rating}/5).`
  }

  return commentText
}

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname() ?? ""
  const router = useRouter()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [ticketDetailOpen, setTicketDetailOpen] = useState(false)
  const [ticketDetailLoading, setTicketDetailLoading] = useState(false)
  const [ticketDetailError, setTicketDetailError] = useState("")
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null)
  const active = topbarConfig.find((item) => item.match(pathname))
  const parent = active?.parent ?? "Workspace"
  const current = active?.current ?? "Dashboard"
  const supportsNotifications =
    user.role === "employee" || user.role === "technician" || user.role === "admin_fault"

  useEffect(() => {
    if (!supportsNotifications) {
      return
    }

    const load = async () => {
      try {
        const payload = await getNotifications(user.id)
        setNotifications(payload.notifications)
        setUnreadCount(payload.unread_count)
      } catch {
        // Keep topbar resilient if notifications API is temporarily unavailable.
      }
    }

    void load()
    const intervalId = window.setInterval(() => {
      void load()
    }, 10000)
    return () => {
      window.clearInterval(intervalId)
    }
  }, [supportsNotifications, user.id])

  const handleOpenNotifications = async () => {
    if (!supportsNotifications) {
      return
    }
    try {
      const payload = await getNotifications(user.id)
      setNotifications(payload.notifications)
      setUnreadCount(payload.unread_count)
      if (payload.unread_count > 0) {
        const markResult = await markNotificationsRead(user.id)
        setUnreadCount(markResult.unread_count)
        setNotifications((currentItems) => currentItems.map((item) => ({ ...item, is_read: true })))
      }
    } catch {
      // Ignore transient errors from notifications refresh.
    }
  }

  const openTicketDetailsFromNotification = async (ticketId: number) => {
    setTicketDetailOpen(true)
    setTicketDetailLoading(true)
    setTicketDetailError("")
    setSelectedTicket(null)
    try {
      if (user.role === "technician") {
        const ticketPayload = await getTicketById(ticketId, { technicianUserId: user.id })
        setSelectedTicket(ticketPayload)
      } else {
        const payload = await getTicketById(ticketId)
        setSelectedTicket(payload)
      }
    } catch (loadError) {
      setTicketDetailError(loadError instanceof Error ? loadError.message : "Failed to load ticket details.")
    } finally {
      setTicketDetailLoading(false)
    }
  }

  return (
    <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between border-b border-[#D71920]/70 bg-gradient-to-r from-[#7A0000]/95 via-[#A50000]/95 to-[#D71920]/95 px-6 py-2 shadow-[0_8px_24px_rgba(122,0,0,0.28)] backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="rounded-lg border border-white/30 bg-white/12 px-3 py-2">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <span className="tracking-wide">{parent}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="tracking-wide">{current}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {supportsNotifications ? (
          <DropdownMenu onOpenChange={(open) => (open ? void handleOpenNotifications() : undefined)}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative border-white/35 bg-white/12 text-white hover:border-white hover:bg-white hover:text-[#8E0000] data-[state=open]:border-white data-[state=open]:bg-white data-[state=open]:text-[#8E0000]"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-white px-1 text-[10px] font-semibold text-[#B00000]">
                    {unreadCount}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              {notifications.length === 0 ? (
                <DropdownMenuItem disabled>No notifications yet.</DropdownMenuItem>
              ) : (
                notifications.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    className={`group block whitespace-normal rounded-md transition-colors hover:bg-[#0B1F3A] hover:text-white focus:bg-[#0B1F3A] focus:text-white data-[highlighted]:bg-[#0B1F3A] data-[highlighted]:text-white data-[highlighted]:outline-none ${item.ticket_id ? "cursor-pointer" : "cursor-default"}`}
                    onClick={() => {
                      if (item.ticket_id) {
                        void openTicketDetailsFromNotification(item.ticket_id)
                      }
                    }}
                  >
                    <p className="text-sm text-slate-800 group-data-[highlighted]:text-white">{item.message}</p>
                    <p className="mt-1 text-xs text-slate-500 group-data-[highlighted]:text-[#D5E8FF]">{new Date(item.created_at).toLocaleString()}</p>
                    {item.ticket_id ? <p className="mt-1 text-xs text-[#005DA8] group-data-[highlighted]:text-[#B5D7FF]">Click to view full ticket details</p> : null}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      <Dialog open={ticketDetailOpen} onOpenChange={setTicketDetailOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTicket ? `Ticket #${selectedTicket.id} Details` : "Ticket Details"}
            </DialogTitle>
          </DialogHeader>

          {ticketDetailLoading ? (
            <p className="text-sm text-slate-500">Loading ticket details...</p>
          ) : ticketDetailError ? (
            <p className="text-sm text-rose-600">{ticketDetailError}</p>
          ) : selectedTicket ? (
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{selectedTicket.title}</h3>
                <p className="mt-1 text-slate-700">{selectedTicket.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Category: {selectedTicket.category}</Badge>
                <Badge variant="outline">Priority: {selectedTicket.priority}</Badge>
                <Badge variant="outline">Status: {selectedTicket.status}</Badge>
                <Badge variant="outline">Reporter: {selectedTicket.employee_name ?? selectedTicket.employee_id}</Badge>
                <Badge variant="outline">Assigned: {selectedTicket.technician_name ?? "Admin Fault Queue"}</Badge>
                <Badge variant="outline">Branch: {selectedTicket.location || "N/A"}</Badge>
                <Badge variant="outline">Reported: {selectedTicket.created_at ? new Date(selectedTicket.created_at).toLocaleString() : "N/A"}</Badge>
                <Badge variant="outline">Updated: {selectedTicket.updated_at ? new Date(selectedTicket.updated_at).toLocaleString() : "N/A"}</Badge>
              </div>

              <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-800">Comments</p>
                {selectedTicket.comments.length === 0 ? (
                  <p className="text-xs text-slate-500">No comments yet.</p>
                ) : (
                  selectedTicket.comments.map((comment) => (
                    <div key={comment.id} className="rounded-md border border-slate-200 bg-white p-2">
                      <p className="text-xs font-semibold text-slate-800">{comment.author_name}</p>
                      <p className="text-xs text-slate-700">{formatTicketCommentText(comment.comment, comment.author_name, user)}</p>
                      <p className="text-[11px] text-slate-500">{new Date(comment.created_at).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>

              {user.role === "technician" ? (
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                  Manual technician actions are disabled. Admin Fault manages ticket updates and escalations.
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Select a ticket notification to view details.</p>
          )}

          <DialogFooter>
            {selectedTicket && user.role === "technician" ? (
              <Button onClick={() => router.push(`/technician/tickets/${selectedTicket.id}`)}>
                Open Technician Workbench
              </Button>
            ) : null}
            {selectedTicket && user.role === "admin_fault" ? (
              <Button variant="outline" onClick={() => router.push("/admin-fault/tickets")}>
                Open Admin Ticket Queue
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}

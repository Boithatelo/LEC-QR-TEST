"use client"

import { ArrowLeft } from "lucide-react"
import { useEffect } from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"

import { ChatbotFaultAssistant } from "@/components/chatbot/ChatbotFaultAssistant"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import { Button } from "@/components/ui/button"
import {
  type AuthUser,
  getDisplayUserName,
  getDashboardPathByRole,
  getStoredUserSession,
  isRolePathAllowed,
} from "@/lib/auth"

type AppShellProps = {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const rawPathname = usePathname()
  const pathname = rawPathname ?? ""
  const pathnameReady = rawPathname !== null
  const router = useRouter()
  const isAuthPage = pathname === "/" || pathname.startsWith("/login")
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined)

  useEffect(() => {
    const refreshSession = () => setUser(getStoredUserSession())
    // Keep local state in sync if session changes in this or another tab.
    refreshSession()
    window.addEventListener("storage", refreshSession)
    window.addEventListener("lec-auth-session-change", refreshSession)
    return () => {
      window.removeEventListener("storage", refreshSession)
      window.removeEventListener("lec-auth-session-change", refreshSession)
    }
  }, [])

  useEffect(() => {
    if (!pathnameReady) {
      return
    }

    // Wait for session hydration before enforcing route guards.
    if (user === undefined) {
      return
    }

    if (!isAuthPage && user?.role === "employee" && user.must_change_password && pathname !== "/employee/profile") {
      router.replace("/employee/profile")
      return
    }

    if (isAuthPage && user) {
      const dashboardPath = user.role === "employee" && user.must_change_password ? "/employee/profile" : getDashboardPathByRole(user.role)
      if (pathname !== dashboardPath) {
        router.replace(dashboardPath)
      }
      return
    }

    if (!isAuthPage && !user) {
      if (pathname !== "/login") {
        router.replace("/login")
      }
      return
    }

    if (!isAuthPage && user && !isRolePathAllowed(pathname, user.role)) {
      const dashboardPath = getDashboardPathByRole(user.role)
      if (pathname !== dashboardPath) {
        router.replace(dashboardPath)
      }
    }
  }, [isAuthPage, pathname, pathnameReady, router, user])

  if (!pathnameReady) {
    return null
  }

  if (isAuthPage) {
    return <div className="min-h-screen bg-slate-950">{children}</div>
  }

  if (user === undefined) {
    return null
  }

  if (!user) {
    return null
  }

  const dashboardPath =
    user.role === "employee" && user.must_change_password ? "/employee/profile" : getDashboardPathByRole(user.role)
  const showBackToDashboard = pathname !== dashboardPath
  const displayUserName = getDisplayUserName(user)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} />
      <div className="lec-shell-bg flex min-h-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="mx-auto w-full max-w-[1400px]">
            {showBackToDashboard ? (
              <div className="mb-4">
                <Button
                  variant="ghost"
                  aria-label="Return to dashboard"
                  title="Return to dashboard"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#0072CE]/35 bg-white p-0 text-[#1E3A6D] shadow-sm transition hover:bg-[#EEF5FD] hover:text-[#0B4B84]"
                  onClick={() => router.push(dashboardPath)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
            {children}
          </div>
        </main>
        {user.role === "employee" ? (
          <ChatbotFaultAssistant key={`employee-chat-${user.id}`} accountName={displayUserName} accountId={user.id} />
        ) : null}
      </div>
    </div>
  )
}

"use client"

import { useEffect } from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"

import { ChatbotFaultAssistant } from "@/components/chatbot/ChatbotFaultAssistant"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
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
  const router = useRouter()
  const isLoginPage = pathname.startsWith("/login")
  const isForgotPasswordPage = pathname.startsWith("/forgot-password")
  const isResetPasswordPage = pathname.startsWith("/reset-password")
  const isSetPasswordPage = pathname.startsWith("/set-password")
  const isAssetScanPage = pathname.startsWith("/asset-scan/")
  const isPublicPage =
    pathname === "/" ||
    isLoginPage ||
    isForgotPasswordPage ||
    isResetPasswordPage ||
    isSetPasswordPage ||
    isAssetScanPage
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
    if (!isPublicPage && user?.role === "employee" && user.must_change_password && pathname !== "/employee/profile") {
      router.replace("/employee/profile")
      return
    }

    if (isLoginPage && user) {
      const dashboardPath = user.role === "employee" && user.must_change_password ? "/employee/profile" : getDashboardPathByRole(user.role)
      if (pathname !== dashboardPath) {
        router.replace(dashboardPath)
      }
      return
    }

    if (!isPublicPage && !user) {
      if (pathname !== "/login") {
        router.replace("/login")
      }
      return
    }

    if (!isPublicPage && user && !isRolePathAllowed(pathname, user.role)) {
      const dashboardPath = getDashboardPathByRole(user.role)
      if (pathname !== dashboardPath) {
        router.replace(dashboardPath)
      }
    }
  }, [isLoginPage, isPublicPage, pathname, router, user])

  if (isPublicPage) {
    return <>{children}</>
  }

  if (user === undefined) {
    return null
  }

  if (!user) {
    return null
  }

  const displayUserName = getDisplayUserName(user)

  return (
    <div className="flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible">
      <div className="print:hidden">
        <Sidebar user={user} />
      </div>
      <div className="lec-shell-bg flex min-h-0 flex-1 flex-col print:min-h-screen print:bg-white">
        <div className="print:hidden">
          <Topbar user={user} />
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto p-6 print:overflow-visible print:p-0">
          <div className="mx-auto w-full max-w-[1400px] print:max-w-none">
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

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminFaultDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/admin-fault/dashboard")
  }, [router])

  return null
}


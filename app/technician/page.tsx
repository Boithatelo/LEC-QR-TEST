"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TechnicianDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/technician/dashboard")
  }, [router])

  return null
}


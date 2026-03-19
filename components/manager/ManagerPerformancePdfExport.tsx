"use client"

import { useEffect, useState } from "react"
import { Download, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getPerformanceMetrics, type PerformanceMetrics } from "@/lib/api"
import { escapeHtml, openPrintablePdfReport } from "@/lib/pdf-export"

function buildCountRows(rows: Array<{ name: string; count: number }>): string {
  return rows
    .map(
      (item) => `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(String(item.count))}</td></tr>`
    )
    .join("")
}

export function ManagerPerformancePdfExport() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const run = async () => {
      try {
        const data = await getPerformanceMetrics()
        setMetrics(data)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load performance metrics.")
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [])

  const getPerformanceReportOptions = () => {
    if (!metrics) return

    return {
      title: "Manager Performance Analytics Report",
      subtitle: "LEC IntelliSupport service performance summary",
      fileName: "manager-performance-report.pdf",
      bodyHtml: `
        <section class="section">
          <h2>KPI Snapshot</h2>
          <div class="kpi-grid">
            <div class="kpi"><div class="label">Total Tickets</div><div class="value">${metrics.kpis.total_tickets}</div></div>
            <div class="kpi"><div class="label">Open Tickets</div><div class="value">${metrics.kpis.open_tickets}</div></div>
            <div class="kpi"><div class="label">Resolved Tickets</div><div class="value">${metrics.kpis.resolved_tickets}</div></div>
            <div class="kpi"><div class="label">Critical Tickets</div><div class="value">${metrics.kpis.critical_tickets}</div></div>
            <div class="kpi"><div class="label">Unassigned Tickets</div><div class="value">${metrics.kpis.unassigned_tickets}</div></div>
            <div class="kpi"><div class="label">Resolved Rate</div><div class="value">${metrics.kpis.resolved_rate}%</div></div>
          </div>
        </section>
        <section class="section">
          <h2>By Status</h2>
          <table>
            <thead><tr><th>Status</th><th>Count</th></tr></thead>
            <tbody>${buildCountRows(metrics.by_status) || "<tr><td colspan='2'>No data.</td></tr>"}</tbody>
          </table>
        </section>
        <section class="section">
          <h2>By Priority</h2>
          <table>
            <thead><tr><th>Priority</th><th>Count</th></tr></thead>
            <tbody>${buildCountRows(metrics.by_priority) || "<tr><td colspan='2'>No data.</td></tr>"}</tbody>
          </table>
        </section>
        <section class="section">
          <h2>By Category</h2>
          <table>
            <thead><tr><th>Category</th><th>Count</th></tr></thead>
            <tbody>${buildCountRows(metrics.by_category) || "<tr><td colspan='2'>No data.</td></tr>"}</tbody>
          </table>
        </section>
      `,
    }
  }

  const handlePrintPerformance = () => {
    const options = getPerformanceReportOptions()
    if (!options) return
    openPrintablePdfReport(options, "print")
  }

  const handleSavePerformancePdf = () => {
    const options = getPerformanceReportOptions()
    if (!options) return
    openPrintablePdfReport(options, "save")
  }

  return (
    <div className="flex justify-end">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="border-[#93AECA] bg-white text-[#20466D] hover:bg-[#EEF5FD]"
          onClick={handlePrintPerformance}
          disabled={loading || Boolean(error) || !metrics}
        >
          <Printer className="h-4 w-4" />
          Print Performance
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-[#93AECA] bg-white text-[#20466D] hover:bg-[#EEF5FD]"
          onClick={handleSavePerformancePdf}
          disabled={loading || Boolean(error) || !metrics}
        >
          <Download className="h-4 w-4" />
          Download Performance Report
        </Button>
      </div>
    </div>
  )
}

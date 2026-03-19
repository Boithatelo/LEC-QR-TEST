"use client"

import { useEffect, useRef, useState } from "react"

import { ActionFeedbackDialog } from "@/components/ui/action-feedback-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { adjustConsumableQuantity, getConsumables, type Consumable } from "@/lib/api"
import { cn } from "@/lib/utils"

const REFRESH_INTERVAL_MS = 15_000

export function InventoryTable() {
  const [items, setItems] = useState<Consumable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [savingId, setSavingId] = useState<number | null>(null)
  const [resultDialog, setResultDialog] = useState<{
    open: boolean
    status: "success" | "error"
    message: string
  }>({
    open: false,
    status: "success",
    message: "",
  })
  const [highlightedItemId, setHighlightedItemId] = useState<number | null>(null)
  const highlightTimerRef = useRef<number | null>(null)

  const showActionFeedback = (status: "success" | "error", message: string) => {
    setResultDialog({
      open: true,
      status,
      message,
    })
  }

  const highlightRow = (itemId: number) => {
    setHighlightedItemId(itemId)
    if (highlightTimerRef.current) {
      window.clearTimeout(highlightTimerRef.current)
    }
    highlightTimerRef.current = window.setTimeout(() => {
      setHighlightedItemId(null)
      highlightTimerRef.current = null
    }, 1200)
  }

  const loadItems = async () => {
    try {
      setError("")
      const data = await getConsumables()
      setItems(data)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load consumables.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadItems()
    const intervalId = window.setInterval(() => {
      void loadItems()
    }, REFRESH_INTERVAL_MS)
    const onFocus = () => {
      void loadItems()
    }
    window.addEventListener("focus", onFocus)
    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("focus", onFocus)
    }
  }, [])

  useEffect(
    () => () => {
      if (highlightTimerRef.current) {
        window.clearTimeout(highlightTimerRef.current)
      }
    },
    []
  )

  const updateQuantity = async (item: Consumable, delta: number) => {
    try {
      setSavingId(item.id)
      setError("")
      const updated = await adjustConsumableQuantity(item.id, delta)
      setItems((currentItems) => currentItems.map((row) => (row.id === updated.id ? updated : row)))
      const deltaVerb = delta > 0 ? "increased" : "decreased"
      const itemLabel = item.asset_tag || item.item_name || `Asset #${item.id}`
      showActionFeedback("success", `${itemLabel} quantity ${deltaVerb} to ${updated.quantity}.`)
      highlightRow(item.id)
    } catch (updateError) {
      const nextMessage = updateError instanceof Error ? updateError.message : "Failed to update quantity."
      setError(nextMessage)
      showActionFeedback("error", nextMessage)
    } finally {
      setSavingId(null)
    }
  }

  const getConditionClassName = (condition: string): string => {
    const normalized = condition.toLowerCase()
    if (normalized.includes("new")) {
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    }
    if (normalized.includes("refurb")) {
      return "border-amber-200 bg-amber-50 text-amber-700"
    }
    return "border-[#9CC4EA] bg-[#DDEEFF] text-[#2E6092]"
  }

  return (
    <Card className="rounded-xl border border-[#0072CE]/25 bg-[#F7FBFF] py-0 shadow-sm">
      <CardHeader className="border-b border-[#BBD1E8] px-6 py-5">
        <CardTitle className="text-base font-semibold text-[#0B1F3A]">Assets Inventory</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-y-0 bg-[#2E6EA0] hover:bg-[#2E6EA0]">
              <TableHead className="px-6 text-[11px] font-semibold tracking-wide text-white uppercase">Asset Tag</TableHead>
              <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Category</TableHead>
              <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Type</TableHead>
              <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Brand / Model</TableHead>
              <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Serial</TableHead>
              <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Quantity</TableHead>
              <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Condition</TableHead>
              <TableHead className="text-[11px] font-semibold tracking-wide text-white uppercase">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="px-6 py-6 text-center text-sm text-[#5B7898]">
                  Loading inventory...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} className="px-6 py-6 text-center text-sm text-[#B42318]">
                  {error}
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-6 py-6 text-center text-sm text-[#5B7898]">
                  No assets found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    "border-b border-[#C5D5E6] bg-[#F7FAFE] hover:bg-[#EAF2FA]",
                    highlightedItemId === item.id
                      ? "animate-in fade-in duration-300 bg-[#E8F4FF] ring-1 ring-[#7FB3E8]/55"
                      : ""
                  )}
                >
                  <TableCell className="px-6 font-medium text-[#1F4469]">{item.asset_tag || "N/A"}</TableCell>
                  <TableCell className="text-[#234A71]">{item.category || item.department || "N/A"}</TableCell>
                  <TableCell className="text-[#234A71]">{item.subcategory || item.device_type || item.printer_type || item.item_name || "N/A"}</TableCell>
                  <TableCell className="text-[#234A71]">{`${item.brand || ""} ${item.model_number || ""}`.trim() || item.item_name || "N/A"}</TableCell>
                  <TableCell className="text-[#234A71]">{item.serial_number || "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-7 w-7 border-[#93AECA] bg-white px-0 text-[#20466D] hover:bg-[#E8F3FF]"
                        disabled={savingId === item.id || (item.quantity ?? 0) <= 0}
                        onClick={() => void updateQuantity(item, -1)}
                      >
                        -
                      </Button>
                      <span className="min-w-8 text-center text-sm font-medium text-[#1F4469]">{item.quantity ?? 0}</span>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-7 w-7 border-[#93AECA] bg-white px-0 text-[#20466D] hover:bg-[#E8F3FF]"
                        disabled={savingId === item.id}
                        onClick={() => void updateQuantity(item, 1)}
                      >
                        +
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getConditionClassName(item.condition || "N/A")}>
                      {item.condition || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#234A71]">{item.purchase_cost !== undefined && item.purchase_cost !== null ? `M ${item.purchase_cost}` : "N/A"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <ActionFeedbackDialog
        open={resultDialog.open}
        status={resultDialog.status}
        message={resultDialog.message}
        onOk={() => setResultDialog((current) => ({ ...current, open: false }))}
      />
    </Card>
  )
}

"use client"

import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getConsumables, type Consumable } from "@/lib/api"

const REFRESH_INTERVAL_MS = 15_000

export function InventoryTable() {
  const [items, setItems] = useState<Consumable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
                <TableRow key={item.id} className="border-b border-[#C5D5E6] bg-[#F7FAFE] hover:bg-[#EAF2FA]">
                  <TableCell className="px-6 font-medium text-[#1F4469]">{item.asset_tag || "N/A"}</TableCell>
                  <TableCell className="text-[#234A71]">{item.category || item.department || "N/A"}</TableCell>
                  <TableCell className="text-[#234A71]">
                    {item.subcategory || item.device_type || item.printer_type || item.item_name || "N/A"}
                  </TableCell>
                  <TableCell className="text-[#234A71]">
                    {`${item.brand || ""} ${item.model_number || ""}`.trim() || item.item_name || "N/A"}
                  </TableCell>
                  <TableCell className="text-[#234A71]">{item.serial_number || "N/A"}</TableCell>
                  <TableCell className="text-[#1F4469]">{item.quantity ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getConditionClassName(item.condition || "N/A")}>
                      {item.condition || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#234A71]">
                    {item.purchase_cost !== undefined && item.purchase_cost !== null ? `M ${item.purchase_cost}` : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

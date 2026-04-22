"use client"

import Link from "next/link"
import { ArrowLeft, Printer, QrCode, Sticker } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"

import { AssetQrImage, type AssetQrImageStatus } from "@/components/inventory/AssetQrImage"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getConsumables, type Consumable } from "@/lib/api"

function buildAssetScanUrl(asset: Consumable, appOrigin: string): string {
  if (!asset.scan_url_path) {
    return ""
  }
  if (appOrigin) {
    return `${appOrigin}${asset.scan_url_path}`
  }
  return asset.scan_url_path
}

function buildAssetTitle(asset: Consumable): string {
  const assetTag = asset.asset_tag?.trim()
  const itemName = asset.item_name?.trim()
  if (assetTag && itemName) {
    return `${assetTag} - ${itemName}`
  }
  return assetTag || itemName || `Asset #${asset.id}`
}

export default function AssetQrLabelsPage() {
  const searchParams = useSearchParams()
  const [assets, setAssets] = useState<Consumable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [appOrigin, setAppOrigin] = useState("")
  const [qrStatuses, setQrStatuses] = useState<Record<number, AssetQrImageStatus>>({})
  const hasAutoPrintedRef = useRef(false)

  const selectedAssetId = useMemo(() => {
    const raw = searchParams.get("asset")
    if (!raw) {
      return null
    }
    const parsed = Number(raw)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  }, [searchParams])

  const shouldAutoPrint = useMemo(() => {
    return searchParams.get("autoprint") === "1"
  }, [searchParams])

  useEffect(() => {
    setAppOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    const loadAssets = async () => {
      try {
        setError("")
        const payload = await getConsumables()
        setAssets(payload)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load assets.")
      } finally {
        setLoading(false)
      }
    }

    void loadAssets()
  }, [])

  const printableAssets = useMemo(() => {
    const sorted = [...assets].sort((left, right) => {
      const leftTag = (left.asset_tag || "").toLowerCase()
      const rightTag = (right.asset_tag || "").toLowerCase()
      if (leftTag && rightTag) {
        return leftTag.localeCompare(rightTag)
      }
      return left.id - right.id
    })

    if (!selectedAssetId) {
      return sorted
    }
    return sorted.filter((asset) => asset.id === selectedAssetId)
  }, [assets, selectedAssetId])

  const handleQrStatusChange = useCallback((assetId: number, status: AssetQrImageStatus) => {
    setQrStatuses((current) => {
      if (current[assetId] === status) {
        return current
      }
      return { ...current, [assetId]: status }
    })
  }, [])

  useEffect(() => {
    const initialStatuses: Record<number, AssetQrImageStatus> = {}
    for (const asset of printableAssets) {
      const scanUrl = buildAssetScanUrl(asset, appOrigin)
      initialStatuses[asset.id] = scanUrl ? "loading" : "empty"
    }
    setQrStatuses(initialStatuses)
    hasAutoPrintedRef.current = false
  }, [appOrigin, printableAssets])

  const qrCodesSettled = useMemo(() => {
    if (printableAssets.length === 0) {
      return false
    }
    return printableAssets.every((asset) => {
      const scanUrl = buildAssetScanUrl(asset, appOrigin)
      if (!scanUrl) {
        return true
      }
      const status = qrStatuses[asset.id]
      return status === "ready" || status === "error"
    })
  }, [appOrigin, printableAssets, qrStatuses])

  useEffect(() => {
    if (
      !shouldAutoPrint ||
      !appOrigin ||
      loading ||
      printableAssets.length === 0 ||
      !qrCodesSettled
    ) {
      return
    }
    if (hasAutoPrintedRef.current) {
      return
    }

    hasAutoPrintedRef.current = true
    const triggerPrint = () => {
      window.focus()
      window.print()
    }

    const frameId = window.requestAnimationFrame(() => {
      triggerPrint()
    })
    const timeoutFast = window.setTimeout(() => {
      triggerPrint()
    }, 500)
    const timeoutSlow = window.setTimeout(() => {
      triggerPrint()
    }, 1200)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timeoutFast)
      window.clearTimeout(timeoutSlow)
    }
  }, [appOrigin, loading, printableAssets.length, qrCodesSettled, shouldAutoPrint])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(120%_70%_at_8%_0%,#E8F4FF_0%,#DCEEFE_40%,#EDF6FF_100%)] p-4 md:p-8 print:bg-white">
      <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[#33A0FF]/20 blur-3xl print:hidden" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-[#1E6FB3]/12 blur-3xl print:hidden" />

      <div className="relative mx-auto w-full max-w-7xl space-y-5 print:space-y-0">
        <div className="fixed top-4 left-4 z-30 print:hidden">
          <Button
            variant="outline"
            size="icon-sm"
            asChild
            className="border-[#8BBDE6]/70 bg-white/95 text-[#11406A] shadow-sm backdrop-blur-sm hover:!border-[#2A78B6] hover:!bg-[#EAF5FF] hover:!text-[#0D3559]"
          >
            <Link href="/admin-consumables/inventory" aria-label="Back to inventory">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </div>

        <Card className="overflow-hidden border-[#7EB5E7]/40 bg-gradient-to-br from-[#0D3E69] via-[#1F649F] to-[#3492CE] text-white shadow-[0_20px_45px_rgba(16,64,106,0.28)] print:hidden">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-white/90">
                  <Sticker className="size-3.5" />
                  Sticker Output
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">Asset QR Labels</h1>
                <p className="text-sm text-white/90">
                  {selectedAssetId ? "Single asset label view." : "Bulk label view for all assets."} Ready for sticker printing.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  asChild
                  className="border-white/45 bg-white/12 text-white hover:!border-white hover:!bg-white hover:!text-[#113D66]"
                >
                  <Link href="/admin-consumables/inventory">
                    <ArrowLeft className="size-4" />
                    Back to Inventory
                  </Link>
                </Button>
                <Button
                  onClick={() => window.print()}
                  className="border border-white/20 bg-white text-[#11406A] hover:!bg-[#E8F4FF] hover:!text-[#0E365B]"
                >
                  <Printer className="size-4" />
                  Print Labels
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card className="border-[#7EB5E7]/30 bg-white/90 shadow-sm backdrop-blur-sm">
            <CardContent className="py-6 text-sm text-[#375A80]">Loading assets...</CardContent>
          </Card>
        ) : error ? (
          <Card className="border-[#D38484]/35 bg-[#FFF7F7] shadow-sm">
            <CardContent className="py-6 text-sm text-[#B42318]">{error}</CardContent>
          </Card>
        ) : printableAssets.length === 0 ? (
          <Card className="border-[#7EB5E7]/30 bg-white/90 shadow-sm backdrop-blur-sm">
            <CardContent className="py-6 text-sm text-[#375A80]">
              No matching assets found. Try removing the `asset` query parameter.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:gap-0">
            {printableAssets.map((asset) => {
              const scanUrl = buildAssetScanUrl(asset, appOrigin)
              return (
                <article
                  key={asset.id}
                  className="break-inside-avoid rounded-xl border border-[#84B7E4] bg-gradient-to-b from-white via-[#FAFDFF] to-[#F0F8FF] p-3 shadow-[0_8px_24px_rgba(39,92,143,0.14)] print:flex print:min-h-[220px] print:items-center print:justify-center print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none"
                >
                  <div className="mb-2 space-y-1 border-b border-[#C7DEF2] pb-2 print:hidden">
                    <h2 className="text-sm font-semibold text-[#0B1F3A]">{buildAssetTitle(asset)}</h2>
                    <p className="inline-flex items-center gap-1 rounded-full border border-[#B9D7F1] bg-[#ECF6FF] px-2 py-0.5 text-[11px] text-[#35597E]">
                      <QrCode className="size-3" />
                      {asset.category || "Asset"} {asset.subcategory ? `- ${asset.subcategory}` : ""}
                    </p>
                  </div>

                  <div className="mb-2 flex items-center gap-3 print:mb-0 print:block">
                    <AssetQrImage
                      value={scanUrl}
                      size={188}
                      alt={`QR label for ${asset.asset_tag || asset.item_name}`}
                      className="h-[188px] w-[188px] shrink-0 rounded-lg border-[#8CBBE3] bg-white p-1.5 print:h-[188px] print:w-[188px] print:rounded-none print:border-0 print:p-0"
                      statusKey={asset.id}
                      onStatusChange={handleQrStatusChange}
                    />
                    <div className="space-y-1 text-xs text-[#234A71] print:hidden">
                      <p><span className="font-semibold text-[#0B1F3A]">Tag:</span> {asset.asset_tag || "N/A"}</p>
                      <p><span className="font-semibold text-[#0B1F3A]">Serial:</span> {asset.serial_number || "N/A"}</p>
                      <p><span className="font-semibold text-[#0B1F3A]">Condition:</span> {asset.condition || "N/A"}</p>
                      <p><span className="font-semibold text-[#0B1F3A]">Qty:</span> {asset.quantity ?? 0}</p>
                    </div>
                  </div>

                  <p className="break-all rounded-md border border-[#CFE3F6] bg-[#F6FBFF] px-2 py-1 text-[10px] leading-4 text-[#527296] print:hidden">
                    {scanUrl || "No scan URL available"}
                  </p>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import QRCode from "qrcode"

import { cn } from "@/lib/utils"

export type AssetQrImageStatus = "loading" | "ready" | "error" | "empty"

type AssetQrImageProps = {
  value: string
  size?: number
  className?: string
  alt?: string
  statusKey?: number
  onStatusChange?: (statusKey: number, status: AssetQrImageStatus) => void
}

export function AssetQrImage({
  value,
  size = 132,
  className,
  alt = "Asset QR code",
  statusKey,
  onStatusChange,
}: AssetQrImageProps) {
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [hasError, setHasError] = useState(false)

  const reportStatus = (status: AssetQrImageStatus) => {
    if (typeof statusKey === "number" && onStatusChange) {
      onStatusChange(statusKey, status)
    }
  }

  useEffect(() => {
    let isActive = true

    if (!value.trim()) {
      reportStatus("empty")
      return () => {
        isActive = false
      }
    }

    reportStatus("loading")
    void QRCode.toDataURL(value, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: size,
    })
      .then((dataUrl) => {
        if (!isActive) {
          return
        }
        setQrDataUrl(dataUrl)
        setHasError(false)
        reportStatus("ready")
      })
      .catch(() => {
        if (!isActive) {
          return
        }
        setQrDataUrl("")
        setHasError(true)
        reportStatus("error")
      })

    return () => {
      isActive = false
    }
  }, [onStatusChange, size, statusKey, value])

  if (!value.trim()) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border border-dashed border-[#93AECA] bg-[#EDF4FF] text-[10px] text-[#4A6A96]",
          className
        )}
      >
        No scan URL
      </div>
    )
  }

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border border-[#EAA4A4] bg-[#FFF1F1] text-[10px] text-[#A12626]",
          className
        )}
      >
        QR failed
      </div>
    )
  }

  if (!qrDataUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border border-dashed border-[#93AECA] bg-[#EDF4FF] text-[10px] text-[#4A6A96]",
          className
        )}
      >
        Generating...
      </div>
    )
  }

  return (
    <Image
      src={qrDataUrl}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      className={cn("rounded-md border border-[#9CC4EA] bg-white p-1", className)}
    />
  )
}

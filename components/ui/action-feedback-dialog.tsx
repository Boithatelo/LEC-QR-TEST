"use client"

import { AlertCircle, CheckCircle2, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ActionFeedbackDialogProps = {
  open: boolean
  status: "success" | "error" | "info"
  message: string
  onOk: () => void
  title?: string
  okLabel?: string
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

export function ActionFeedbackDialog({
  open,
  status,
  message,
  onOk,
  title,
  okLabel = "OK",
  secondaryActionLabel,
  onSecondaryAction,
}: ActionFeedbackDialogProps) {
  const isSuccess = status === "success"
  const isInfo = status === "info"

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-md border-[#0072CE]/25 [&>button]:hidden"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="space-y-3">
          <span
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
              isSuccess
                ? "bg-[#EAF8F0] text-[#007A3D]"
                : isInfo
                  ? "bg-[#EAF3FF] text-[#0072CE]"
                  : "bg-[#FFEDEF] text-[#D71920]"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : isInfo ? (
              <Info className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
          </span>
          <DialogTitle className="text-[#0B1F3A]">
            {title ?? (isSuccess ? "Success" : isInfo ? "Notice" : "Action failed")}
          </DialogTitle>
          <DialogDescription className="leading-6 text-[#1E3A6D]">{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 justify-center">
          {secondaryActionLabel && onSecondaryAction ? (
            <Button
              type="button"
              variant="outline"
              className="min-w-28 border-[#0072CE]/30 text-[#0B1F3A] hover:bg-[#F4FAFF]"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          ) : null}
          <Button type="button" className="min-w-28 bg-[#0072CE] text-white hover:bg-[#005DA8]" onClick={onOk}>
            {okLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

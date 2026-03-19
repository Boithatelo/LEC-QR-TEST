"use client"

import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ActionConfirmationDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: "default" | "destructive"
  confirmDisabled?: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

export function ActionConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "default",
  confirmDisabled = false,
  onConfirm,
  onOpenChange,
}: ActionConfirmationDialogProps) {
  const destructive = confirmVariant === "destructive"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-[#0072CE]/25">
        <DialogHeader className="space-y-3">
          <span
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
              destructive ? "bg-[#FFEDEF] text-[#D71920]" : "bg-[#EAF3FF] text-[#0072CE]"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <DialogTitle className="text-[#0B1F3A]">{title}</DialogTitle>
          <DialogDescription className="leading-6 text-[#1E3A6D]">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 justify-center">
          <Button
            type="button"
            variant="outline"
            className="min-w-28 border-[#0072CE]/30 text-[#0B1F3A] hover:bg-[#F4FAFF]"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className={
              destructive
                ? "min-w-28 bg-[#D71920] text-white hover:bg-[#B5161C]"
                : "min-w-28 bg-[#0072CE] text-white hover:bg-[#005DA8]"
            }
            disabled={confirmDisabled}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

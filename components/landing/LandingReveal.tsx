"use client"

import type { CSSProperties, ReactNode } from "react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

type LandingRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  variant?: "up" | "left" | "right" | "scale"
}

export function LandingReveal({
  children,
  className,
  delay = 0,
  variant = "up",
}: LandingRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -48px 0px",
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-visible={visible ? "true" : "false"}
      data-variant={variant}
      className={cn("landing-reveal", className)}
      style={{ "--landing-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  )
}

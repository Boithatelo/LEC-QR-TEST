import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { LandingReveal } from "@/components/landing/LandingReveal"

export const metadata: Metadata = {
  title: "LEC IntelliSupport",
  description: "Real-time fault reporting and resolution for LEC operations.",
}

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#features" },
  { label: "About Us", href: "#features" },
  { label: "Contact", href: "#contact" },
] as const

const lifecycleSteps = [
  {
    title: "Fault Reported",
    summary: "Employee logs a fault with location, severity, and service impact in one guided flow.",
    latency: "00:00 - 00:30",
    detail: "Structured input improves triage quality from the first minute.",
  },
  {
    title: "AI Triage",
    summary: "Model classifies category and urgency, then recommends the best queue automatically.",
    latency: "00:30 - 01:30",
    detail: "Removes manual sorting delays and surfaces critical incidents first.",
  },
  {
    title: "Technician Routing",
    summary: "Ticket is routed to the lowest workload specialist with context and previous case patterns.",
    latency: "01:30 - 03:00",
    detail: "Assignment balances workload and keeps SLA response times predictable.",
  },
  {
    title: "Resolution & Insights",
    summary: "Actions, comments, and outcomes are logged to dashboards for post-incident analytics.",
    latency: "03:00+",
    detail: "Every solved fault strengthens future diagnosis and planning decisions.",
  },
] as const

export default function Home() {
  return (
    <main className="lec-landing">
      <section id="home" className="lec-landing-hero">
        <div className="lec-landing-bg" aria-hidden="true" />
        <div className="lec-landing-lines" aria-hidden="true" />
        <div className="lec-landing-orb" aria-hidden="true" />
        <div className="lec-landing-bottom-glow" aria-hidden="true" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-[1360px] flex-col px-5 pb-12 pt-6 md:px-8 xl:px-10">
          <header className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="lec-brand-tile">
                <Image src="/lec-logo.png" alt="LEC logo" width={166} height={50} className="h-9 w-auto object-contain sm:h-10" priority />
              </div>
              <span className="landing-display text-[24px] font-semibold tracking-[-0.03em] text-white sm:text-[30px] md:text-[42px]">
                LEC IntelliSupport
              </span>
            </div>

            <nav className="hidden items-center gap-14 text-[20px] font-medium text-white/90 lg:flex">
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} className="transition hover:text-white/65">
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link href="/login" className="lec-login-button">
              Login
            </Link>
          </header>

          <div className="flex flex-1 items-center pb-6 pt-10 lg:pt-16">
            <LandingReveal delay={120} variant="left" className="max-w-[660px]">
              <h1 className="landing-display text-[44px] font-semibold leading-[1.12] tracking-[-0.04em] text-white sm:text-[56px] md:text-[64px]">
                Powering Lesotho
                <br />
                Through Smart
                <br />
                Technology
              </h1>

              <p className="mt-6 max-w-[620px] text-[27px] leading-[1.38] text-white/82">
                Report faults. Track issues. Stay connected with LEC IntelliSupport.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/login" className="lec-cta-primary">
                  Report Faults
                </Link>
                <Link href="#features" className="lec-cta-secondary">
                  Track Issues
                </Link>
              </div>
            </LandingReveal>
          </div>
        </div>
      </section>

      <section id="features" className="lec-lifecycle-section">
        <div className="lec-lifecycle-shell">
          <LandingReveal>
            <p className="lec-section-kicker">Fault Lifecycle</p>
            <h2 className="landing-display mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl md:text-5xl">
              From outage report to resolution with a clear digital trail
            </h2>
            <p className="mt-5 max-w-3xl text-lg text-white/75 sm:text-xl">
              This workflow demonstrates engineering logic and multimedia storytelling together. Each stage has motion cues, measurable
              timing, and visible handoffs across operations.
            </p>
          </LandingReveal>

          <div className="lec-lifecycle-track">
            {lifecycleSteps.map((step, index) => (
              <LandingReveal key={step.title} delay={index * 110} variant="up">
                <article className="lec-lifecycle-card">
                  <div className="flex items-center justify-between gap-3">
                    <span className="lec-lifecycle-index">0{index + 1}</span>
                    <span className="lec-lifecycle-latency">{step.latency}</span>
                  </div>
                  <h3 className="mt-5 text-[1.22rem] font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-[1rem] leading-relaxed text-[#d7e4ff]">{step.summary}</p>
                  <p className="mt-4 border-t border-white/10 pt-4 text-sm text-white/60">{step.detail}</p>
                </article>
              </LandingReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="lec-contact-section">
        <div className="lec-contact-shell">
          <LandingReveal variant="scale">
            <div className="lec-contact-card">
              <p className="lec-section-kicker">Contact & Demo</p>
              <h2 className="landing-display mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                Ready to reduce outage downtime across every branch?
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-white/75">
                Start with the live platform, capture your first incidents, and benchmark response improvements week by week.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/login" className="lec-cta-primary">
                  Launch Platform
                </Link>
                <a href="mailto:support@lec-intellisupport.local" className="lec-cta-secondary">
                  Contact Support
                </a>
              </div>
            </div>
          </LandingReveal>
        </div>
      </section>
    </main>
  )
}

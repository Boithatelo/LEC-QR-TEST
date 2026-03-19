import type { CSSProperties } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import {
  BarChart3,
  BookOpenText,
  Bot,
  CirclePlay,
  Facebook,
  Gauge,
  LayoutDashboard,
  Ticket,
  Twitter,
  type LucideIcon,
  Workflow,
} from "lucide-react"

import { LandingReveal } from "@/components/landing/LandingReveal"

export const metadata: Metadata = {
  title: "LEC IntelliSupport",
  description: "Smarter IT service management for the modern enterprise.",
}

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Contact", href: "#contact" },
] as const

const featureCards: Array<{
  title: string
  description: string
  icon: LucideIcon
  iconClassName: string
}> = [
  {
    title: "Automated Ticketing",
    description: "Prioritize and assign tickets automatically",
    icon: Ticket,
    iconClassName: "bg-[linear-gradient(135deg,#f3162d_0%,#c91124_100%)]",
  },
  {
    title: "AI Insights",
    description: "Get actionable analytics and trends",
    icon: BarChart3,
    iconClassName: "bg-[linear-gradient(135deg,#0f1f5c_0%,#005fcc_100%)]",
  },
  {
    title: "24/7 Virtual Agent",
    description: "AI-powered support, always on",
    icon: Bot,
    iconClassName: "bg-[linear-gradient(135deg,#005fcc_0%,#2f8dff_100%)]",
  },
] as const

const solutionCards: Array<{
  title: string
  description: string
  icon: LucideIcon
  iconClassName: string
  cardClassName?: string
}> = [
  {
    title: "Real-Time Dashboard",
    description: "Monitor performance metrics",
    icon: LayoutDashboard,
    iconClassName: "bg-[#005fcc]",
  },
  {
    title: "SLA Management",
    description: "Track and meet SLA efficiently",
    icon: Gauge,
    iconClassName: "bg-[#11225a]",
  },
  {
    title: "Knowledge Base",
    description: "Access and manage solutions easily",
    icon: BookOpenText,
    iconClassName: "bg-[#f3162d]",
    cardClassName: "border-[#f6c0c8] shadow-[0_18px_44px_rgba(243,22,45,0.1)]",
  },
  {
    title: "Custom Workflows",
    description: "Tailor processes to your needs",
    icon: Workflow,
    iconClassName: "bg-[#005fcc]",
  },
] as const

const footerLinks = ["About", "Blog", "Support", "Privacy Policy", "Terms of Service"] as const

const powerBackdropStyle: CSSProperties = {
  backgroundImage:
    "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(241,244,250,0.9) 100%), url('/power-infrastructure.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
}

const demoBackdropStyle: CSSProperties = {
  backgroundImage:
    "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(238,242,249,0.88) 100%), url('/power-infrastructure.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center bottom",
}

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <span className="relative block h-8 w-8 rounded-[11px] bg-[linear-gradient(135deg,#f3162d_0%,#0d1d55_52%,#005fcc_100%)] shadow-[0_8px_18px_rgba(10,25,67,0.3)]">
        <span className="absolute left-[5px] top-[12px] h-[7px] w-[18px] -rotate-[35deg] rounded-full bg-white" />
      </span>
      <span className="landing-display text-[22px] font-semibold tracking-[-0.03em] text-white">LEC IntelliSupport</span>
    </div>
  )
}

function HeroLaptop() {
  const bars = [
    { height: "34%", color: "bg-[#005fcc]" },
    { height: "42%", color: "bg-[#2f8dff]" },
    { height: "54%", color: "bg-[#11225a]" },
    { height: "74%", color: "bg-[#f3162d]" },
    { height: "46%", color: "bg-[#005fcc]" },
    { height: "64%", color: "bg-[#f3162d]" },
    { height: "48%", color: "bg-[#1c3275]" },
    { height: "39%", color: "bg-[#2f8dff]" },
  ] as const

  return (
    <div className="landing-laptop-bob relative mx-auto w-full max-w-[600px]">
      <div className="landing-float-slow absolute left-[3%] top-[50%] hidden rounded-[16px] border border-white/16 bg-white/10 px-4 py-3 shadow-[0_18px_40px_rgba(10,26,66,0.2)] backdrop-blur-sm md:block">
        <div className="space-y-2.5">
          <div className="h-2 w-12 rounded-full bg-white/55" />
          <div className="h-2 w-20 rounded-full bg-white/35" />
          <div className="h-2 w-14 rounded-full bg-white/35" />
        </div>
      </div>

      <div className="landing-float-fast absolute right-[-2%] top-[34%] z-20 rounded-[20px] bg-white p-4 shadow-[0_22px_48px_rgba(10,26,66,0.22)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#f3162d_0%,#005fcc_100%)] text-white">
          <Bot className="h-8 w-8" />
        </div>
      </div>

      <div className="landing-float-fast absolute left-[9%] top-[35%] hidden h-8 w-8 items-center justify-center rounded-full bg-white/12 text-xs font-bold text-white md:flex">
        &#9654;
      </div>

      <div className="relative pt-4">
        <div className="landing-monitor-shell rounded-[26px] p-3">
          <div className="overflow-hidden rounded-[18px] border border-[#dfe6f2] bg-[#f8fbff]">
            <div className="flex items-center justify-between border-b border-[#e6ebf4] bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f3162d]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#005fcc]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#d3dbe9]" />
              </div>
              <div className="h-2 w-32 rounded-full bg-[#edf1f8]" />
            </div>

            <div className="space-y-4 p-5">
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { label: "Ticket", value: "Ticketing", icon: Ticket },
                  { label: "SLA", value: "Compliance", icon: Gauge },
                  { label: "Support", value: "Teams", icon: LayoutDashboard },
                  { label: "Insights", value: "Reports", icon: BarChart3 },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="landing-surface rounded-[16px] p-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf3ff] text-[#005fcc]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[11px] font-medium text-[#8b98b5]">{item.label}</p>
                          <p className="text-sm font-semibold text-[#14255d]">{item.value}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="landing-surface rounded-[18px] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#95a3be]">Live Dashboard</p>
                    <span className="h-2 w-2 rounded-full bg-[#f3162d]" />
                  </div>
                  <div className="mt-4 grid h-40 grid-cols-8 items-end gap-2 rounded-[16px] border border-[#edf1f7] bg-[linear-gradient(180deg,#fbfdff_0%,#f4f7fc_100%)] px-3 pb-4 pt-6">
                    {bars.map((bar, index) => (
                      <div key={`${bar.height}-${index}`} className="flex h-full items-end">
                        <div className={`w-full rounded-t-[8px] ${bar.color}`} style={{ height: bar.height }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="landing-surface rounded-[18px] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#95a3be]">Team Efficiency</p>
                    <span className="h-2 w-2 rounded-full bg-[#005fcc]" />
                  </div>
                  <div className="mt-5 flex items-center gap-4">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[conic-gradient(#f3162d_0_28%,#005fcc_28%_58%,#11225a_58%_82%,#d8e3f6_82%_100%)] p-4">
                      <div className="h-full w-full rounded-full bg-white" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="h-2 rounded-full bg-[#eef2f8]" />
                      <div className="h-2 w-[86%] rounded-full bg-[#eef2f8]" />
                      <div className="h-2 w-[72%] rounded-full bg-[#eef2f8]" />
                      <div className="h-2 w-[64%] rounded-full bg-[#eef2f8]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="landing-laptop-base absolute bottom-1 left-1/2 h-[18px] w-[112%] -translate-x-1/2 rounded-b-[999px]" />
        <div className="absolute bottom-0 left-1/2 h-[8px] w-28 -translate-x-1/2 rounded-b-[999px] bg-[#9aa9c2]" />

        <div className="landing-float-slow absolute bottom-[12px] left-[33%] hidden md:block">
          <div className="relative">
            <div className="mx-auto h-9 w-11 rounded-t-[18px] bg-white shadow-[0_12px_24px_rgba(31,55,100,0.16)]" />
            <div className="absolute left-[-8px] top-[-18px] h-11 w-8 rounded-full bg-[#f3162d]" />
            <div className="absolute left-[5px] top-[-26px] h-14 w-8 rotate-[16deg] rounded-full bg-[#005fcc]" />
            <div className="absolute right-[-3px] top-[-22px] h-12 w-7 -rotate-[12deg] rounded-full bg-[#183372]" />
          </div>
        </div>
      </div>
    </div>
  )
}

function DemoLaptop() {
  const rows = [
    { label: "Dashboard", badge: "High", badgeClassName: "bg-[#fee9ec] text-[#cf1128]" },
    { label: "Discussions", badge: "Low", badgeClassName: "bg-[#edf3ff] text-[#005fcc]" },
    { label: "Monitoring", badge: "High", badgeClassName: "bg-[#fee9ec] text-[#cf1128]" },
    { label: "Assets", badge: "Low", badgeClassName: "bg-[#edf3ff] text-[#005fcc]" },
    { label: "Knowledge", badge: "Mid", badgeClassName: "bg-[#eef1f6] text-[#14255d]" },
  ] as const

  return (
    <div className="relative mx-auto w-full max-w-[520px] pb-8">
      <div className="landing-monitor-shell rounded-[24px] p-3">
        <div className="overflow-hidden rounded-[18px] bg-white">
          <div className="flex items-center justify-between bg-[#101c56] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#f3162d]" />
              <span className="h-2 w-2 rounded-full bg-[#2f8dff]" />
              <span className="h-2 w-2 rounded-full bg-[#d3dbe9]" />
            </div>
            <div className="h-2 w-32 rounded-full bg-white/10" />
          </div>

          <div className="space-y-4 bg-[linear-gradient(180deg,#fbfcff_0%,#f4f7fc_100%)] p-4">
            <div className="flex items-center gap-3">
              <div className="h-7 w-24 rounded-full bg-[#f3162d]" />
              <div className="h-7 w-20 rounded-full bg-[#edf2fa]" />
              <div className="h-7 w-16 rounded-full bg-[#edf2fa]" />
            </div>

            <div className="overflow-hidden rounded-[14px] border border-[#e7edf7] bg-white">
              <div className="grid grid-cols-[1.2fr_1.2fr_0.8fr_0.8fr] gap-4 border-b border-[#edf2f8] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#98a4bc]">
                <span>Name</span>
                <span>Assigned</span>
                <span>Status</span>
                <span>Priority</span>
              </div>

              <div className="divide-y divide-[#edf2f8]">
                {rows.map((row) => (
                  <div key={row.label} className="grid grid-cols-[1.2fr_1.2fr_0.8fr_0.8fr] gap-4 px-4 py-3 text-sm text-[#14255d]">
                    <span className="font-medium">{row.label}</span>
                    <span className="text-[#7f8ba4]">Support team</span>
                    <span className="text-[#7f8ba4]">Active</span>
                    <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${row.badgeClassName}`}>{row.badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-laptop-base absolute bottom-1 left-1/2 h-[16px] w-[112%] -translate-x-1/2 rounded-b-[999px]" />
      <div className="absolute bottom-0 left-1/2 h-[8px] w-28 -translate-x-1/2 rounded-b-[999px] bg-[#9aa9c2]" />
    </div>
  )
}

function SectionEnergyBackdrop({ style }: { style: CSSProperties }) {
  return (
    <>
      <div className="absolute inset-0 opacity-[0.34]" style={style} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(46,134,255,0.16)_0%,rgba(46,134,255,0)_26%),radial-gradient(circle_at_12%_74%,rgba(243,22,45,0.14)_0%,rgba(243,22,45,0)_24%)]" />
      <div className="landing-light-wave absolute left-0 right-0 top-[24%] h-16 opacity-70" />
      <div className="landing-light-wave absolute bottom-[18%] left-[-10%] right-[-10%] h-20 opacity-65" />
    </>
  )
}

export default function Home() {
  return (
    <main className="landing-copy bg-[#f6f7fb] text-[#14255d]">
      <section className="relative overflow-hidden text-white">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(128deg, rgba(8,19,60,0.95) 0%, rgba(17,33,90,0.92) 36%, rgba(0,95,204,0.72) 74%, rgba(243,22,45,0.2) 100%), url('/power-infrastructure.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="landing-hero-fade absolute inset-0" />
        <div className="absolute inset-x-0 top-[94px] h-[2px] bg-white/10" />
        <div className="landing-energy-line absolute left-[26%] right-[4%] top-[93px] h-[4px]" />
        <div
          className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(145deg,rgba(7,18,44,0.68)_0%,rgba(7,18,44,0)_100%)]"
          style={{ clipPath: "polygon(0 16%, 42% 0, 100% 70%, 100% 100%, 0 100%)" }}
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <header className="flex items-center justify-between gap-6 py-5">
            <BrandMark />

            <nav className="hidden items-center gap-10 text-[15px] font-medium text-white/92 md:flex">
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} className="transition hover:text-white/70">
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-[10px] bg-[#f3162d] px-6 text-base font-semibold text-white shadow-[0_12px_24px_rgba(243,22,45,0.28)] transition hover:bg-[#d61126]"
            >
              Login
            </Link>
          </header>

          <div className="grid items-center gap-14 pb-16 pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:pb-20 lg:pt-16">
            <LandingReveal variant="left" className="max-w-[520px]">
              <h1 className="landing-display text-5xl font-semibold leading-[1.14] tracking-[-0.05em] text-white lg:text-[62px]">
                Smarter IT Service Management for the Modern Enterprise
              </h1>
              <p className="mt-6 max-w-[430px] text-2xl leading-10 text-white/82">
                AI-powered solutions to streamline your IT support and boost productivity.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/login"
                  className="landing-button-shine inline-flex h-[54px] items-center justify-center rounded-[10px] bg-[#f3162d] px-9 text-xl font-semibold text-white shadow-[0_14px_28px_rgba(243,22,45,0.26)] transition hover:bg-[#d61126]"
                >
                  Get Started
                </Link>
                <Link
                  href="#demo"
                  className="landing-soft-pulse inline-flex h-[54px] items-center justify-center gap-3 rounded-[10px] border border-white/24 bg-white/6 px-8 text-xl font-semibold text-white transition hover:bg-white/12"
                >
                  <CirclePlay className="h-6 w-6" />
                  Watch Demo
                </Link>
              </div>
            </LandingReveal>

            <LandingReveal variant="right" delay={120}>
              <HeroLaptop />
            </LandingReveal>
          </div>
        </div>
      </section>

      <section id="features" className="relative overflow-hidden py-16 sm:py-20">
        <SectionEnergyBackdrop style={powerBackdropStyle} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <LandingReveal className="text-center">
            <h2 className="landing-display text-4xl font-semibold tracking-[-0.04em] text-[#12235a] sm:text-5xl">
              Transform Your IT Support Operations
            </h2>
            <p className="mt-4 text-xl text-[#617198]">Empowering your team with intelligent tools</p>
          </LandingReveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {featureCards.map((card, index) => {
              const Icon = card.icon
              return (
                <LandingReveal key={card.title} delay={index * 120}>
                  <article className="landing-surface landing-card-shadow landing-hover-card rounded-[18px] px-8 py-10 text-center transition hover:-translate-y-1">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(243,22,45,0.12)_0%,rgba(243,22,45,0)_72%)]">
                      <span className={`landing-icon-bob flex h-16 w-16 items-center justify-center rounded-[18px] text-white shadow-[0_16px_28px_rgba(16,28,86,0.16)] ${card.iconClassName}`}>
                        <Icon className="h-8 w-8" />
                      </span>
                    </div>
                    <h3 className="landing-display mt-6 text-[31px] font-semibold tracking-[-0.04em] text-[#14255d]">{card.title}</h3>
                    <p className="mt-4 text-lg leading-8 text-[#617198]">{card.description}</p>
                  </article>
                </LandingReveal>
              )
            })}
          </div>
        </div>
      </section>

      <section id="solutions" className="relative overflow-hidden py-16 sm:py-20">
        <SectionEnergyBackdrop style={powerBackdropStyle} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <LandingReveal className="text-center">
            <h2 className="landing-display text-4xl font-semibold tracking-[-0.04em] text-[#12235a] sm:text-5xl">
              Why Choose LEC IntelliSupport?
            </h2>
            <p className="mt-4 text-xl text-[#617198]">Streamline your IT operations with ease</p>
          </LandingReveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {solutionCards.map((card, index) => {
              const Icon = card.icon
              return (
                <LandingReveal key={card.title} delay={index * 100}>
                  <article
                    className={`landing-surface landing-card-shadow landing-hover-card flex gap-4 rounded-[16px] px-6 py-6 transition hover:-translate-y-1 ${card.cardClassName ?? ""}`}
                  >
                    <span className={`landing-icon-bob mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-white ${card.iconClassName}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="landing-display text-[24px] font-semibold tracking-[-0.03em] text-[#14255d]">{card.title}</h3>
                      <p className="mt-2 text-base leading-7 text-[#617198]">{card.description}</p>
                    </div>
                  </article>
                </LandingReveal>
              )
            })}
          </div>
        </div>
      </section>

      <section id="demo" className="relative overflow-hidden py-16 sm:py-20">
        <SectionEnergyBackdrop style={demoBackdropStyle} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <LandingReveal className="text-center">
            <h2 className="landing-display text-4xl font-semibold tracking-[-0.04em] text-[#12235a] sm:text-5xl">
              See IntelliSupport in Action
            </h2>
            <p className="mt-4 text-xl text-[#617198]">Streamline your IT operations with ease</p>
          </LandingReveal>

          <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
            <LandingReveal variant="left" delay={80}>
              <DemoLaptop />
            </LandingReveal>

            <LandingReveal variant="right" delay={160}>
              <article className="landing-card-shadow landing-hover-card relative rounded-[24px] border border-[#e1e7f1] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(244,247,252,0.96)_100%)] px-8 py-10">
                <p className="landing-display text-[33px] font-semibold italic leading-[1.7] tracking-[-0.03em] text-[#14255d]">
                  LEC IntelliSupport has revolutionized our IT support.
                  <br />
                  Our response times have been faster.
                </p>

                <div className="mt-10 flex items-center gap-5">
                  <div className="landing-soft-pulse flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fbd6dc_0%,#ffffff_56%,#d8e7ff_100%)] text-2xl font-bold text-[#14255d] shadow-[0_14px_26px_rgba(16,28,86,0.14)]">
                    JD
                  </div>
                  <div>
                    <p className="landing-display text-[28px] font-semibold tracking-[-0.03em] text-[#14255d]">John Doe</p>
                    <p className="text-2xl italic text-[#617198]">IT Manager</p>
                  </div>
                </div>

                <div className="absolute bottom-6 right-8 text-6xl font-black leading-none text-[#b6c8eb]">&rdquo;</div>
              </article>
            </LandingReveal>
          </div>
        </div>
      </section>

      <section id="pricing" className="relative overflow-hidden py-16 text-white">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(9,20,58,0.92) 0%, rgba(16,28,86,0.92) 58%, rgba(0,95,204,0.78) 100%), url('/power-infrastructure.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center bottom",
          }}
        />
        <div className="landing-bottom-glow absolute inset-0" />

        <LandingReveal className="relative mx-auto max-w-7xl px-6 text-center lg:px-8">
          <h2 className="landing-display text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            Ready to Elevate Your IT Support?
          </h2>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="landing-button-shine inline-flex h-[58px] min-w-[320px] items-center justify-center rounded-[12px] bg-[#f3162d] px-10 text-2xl font-semibold text-white shadow-[0_16px_30px_rgba(243,22,45,0.24)] transition hover:bg-[#d61126]"
            >
              Get Started Today
            </Link>
            <Link
              href="#contact"
              className="landing-soft-pulse inline-flex h-[58px] min-w-[320px] items-center justify-center rounded-[12px] border border-[#dce4f0] bg-white px-10 text-2xl font-semibold text-[#14255d] shadow-[0_12px_24px_rgba(16,28,86,0.08)] transition hover:bg-[#f8f9fc]"
            >
              Schedule a Demo
            </Link>
          </div>
        </LandingReveal>
      </section>

      <footer id="contact" className="border-t border-white/10 bg-[linear-gradient(135deg,#0b1640_0%,#11225a_52%,#005fcc_100%)] py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <BrandMark />

          <div className="flex flex-wrap items-center justify-center gap-6 text-lg text-white/86">
            {footerLinks.map((link) => (
              <Link key={link} href="#contact" className="transition hover:text-white/70">
                {link}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#f3162d]/85">
              <Facebook className="h-4 w-4" />
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#0d1d55]/70">
              <Twitter className="h-4 w-4" />
            </span>
          </div>
        </div>
      </footer>
    </main>
  )
}

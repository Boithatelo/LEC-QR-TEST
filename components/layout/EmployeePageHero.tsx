type EmployeePageHeroProps = {
  title: string
  description: string
  compact?: boolean
  theme?: "blue" | "red"
}

export function EmployeePageHero({ title, description, compact = false, theme = "blue" }: EmployeePageHeroProps) {
  const isRedTheme = theme === "red"

  return (
    <section
      className={`rounded-2xl border px-6 text-white ${
        isRedTheme
          ? "border-[#D93838]/45 bg-gradient-to-r from-[#5E0000] via-[#A40000] to-[#E00000] shadow-[0_12px_28px_rgba(116,0,0,0.28)]"
          : "border-[#0072CE]/30 bg-gradient-to-r from-[#0B1F3A] via-[#0E2B54] to-[#0072CE] shadow-[0_12px_28px_rgba(11,31,58,0.2)]"
      } ${
        compact ? "py-4" : "py-6"
      }`}
    >
      <p className={`text-xs font-semibold tracking-[0.2em] uppercase ${isRedTheme ? "text-[#FFD0D0]" : "text-[#B9DBFF]"}`}>
        Lesotho Electricity Company
      </p>
      <h2 className={`mt-2 font-bold tracking-wide text-white ${compact ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"}`}>
        {title}
      </h2>
      <p className={`mt-2 max-w-2xl text-sm ${isRedTheme ? "text-[#FFE2E2]" : "text-[#D8EAFF]"}`}>{description}</p>
    </section>
  )
}

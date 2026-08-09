export interface SectionHeaderProps {
  title: string
  description?: string
  align?: "left" | "center" | "right"
  action?: React.ReactNode
}

export function SectionHeader({
  title,
  description,
  align = "left",
  action
}: SectionHeaderProps) {
  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right"
  }

  return (
    <div className={`mb-14 ${alignmentClasses[align]} ${align === "center" ? "mx-auto" : ""}`}>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-gradient">
        {title}
      </h2>
      {description && (
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed mx-auto">{description}</p>
      )}
      {action && <div className="mt-8">{action}</div>}
    </div>
  )
}

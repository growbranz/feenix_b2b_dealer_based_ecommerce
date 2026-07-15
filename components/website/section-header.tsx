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
    <div className={`mb-12 ${alignmentClasses[align]} ${align === "center" ? "mx-auto" : ""}`}>
      <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
      {description && (
        <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

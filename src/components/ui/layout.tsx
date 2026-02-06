import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("relative py-20 md:py-32", className)}
    >
      {children}
    </section>
  );
}

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("container mx-auto px-4 md:px-6", className)}>
      {children}
    </div>
  );
}

export function PageBackground({ pattern = "grid" }: { pattern?: "grid" | "dots" }) {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-surface" />
      <div
        className={cn(
          "absolute inset-0 opacity-50",
          pattern === "grid" ? "grid-bg" : "dot-pattern"
        )}
      />
      <div className="absolute inset-0 hero-glow" />
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "mb-16 max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left"
      )}
    >
      {eyebrow && (
        <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-muted-foreground md:text-xl">{description}</p>
      )}
    </div>
  );
}

import type { ReactNode } from "react";
import { FileText } from "lucide-react";

type Props = {
  title: string;
  updatedAt: string;
  description?: string;
  eyebrow?: string;
  children: ReactNode;
};

export function LegalPage({ title, updatedAt, description, eyebrow = "Yasal Belge", children }: Props) {
  return (
    <div className="grid gap-8">
      <header className="grid gap-3">
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            <FileText size={12} />
            {eyebrow}
          </span>
          <span className="text-[11px] text-[var(--muted)]">Son güncellenme: {updatedAt}</span>
        </div>
        <h1 className="text-4xl font-black leading-[1.1] tracking-tight md:text-5xl">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-base leading-7 text-[var(--muted)] md:text-lg">{description}</p>
        ) : null}
      </header>

      <div className="legal-body grid gap-7 text-[15px] leading-7 text-[var(--foreground)]">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-24 grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm md:p-7">
      <h2 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h2>
      <div className="grid gap-3 text-[15px] leading-7 text-[var(--foreground)]">{children}</div>
    </section>
  );
}

export function LegalCallout({ title, children, tone = "info" }: { title?: string; children: ReactNode; tone?: "info" | "warn" | "success" }) {
  const toneClasses: Record<string, string> = {
    info: "border-[var(--accent)]/30 bg-[var(--accent)]/5",
    warn: "border-amber-300/50 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/10",
    success: "border-emerald-300/50 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/10",
  };
  return (
    <div className={`rounded-xl border p-4 text-sm leading-6 ${toneClasses[tone]}`}>
      {title ? <p className="mb-1 text-sm font-bold">{title}</p> : null}
      <div className="text-[14px] leading-6 text-[var(--foreground)]">{children}</div>
    </div>
  );
}

export function LegalList({ items, ordered }: { items: string[]; ordered?: boolean }) {
  if (ordered) {
    return (
      <ol className="grid gap-2 pl-5">
        {items.map((item, i) => (
          <li key={i} className="list-decimal text-[15px] leading-7">
            {item}
          </li>
        ))}
      </ol>
    );
  }
  return (
    <ul className="grid gap-2 pl-5">
      {items.map((item, i) => (
        <li key={i} className="list-disc text-[15px] leading-7">
          {item}
        </li>
      ))}
    </ul>
  );
}

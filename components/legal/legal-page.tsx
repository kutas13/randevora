import type { ReactNode } from "react";

type Props = {
  title: string;
  updatedAt: string;
  children: ReactNode;
};

export function LegalPage({ title, updatedAt, children }: Props) {
  return (
    <div className="grid gap-6 text-[15px] leading-7 text-[var(--foreground)]">
      <header className="border-b border-[var(--line)] pb-6">
        <h1 className="text-3xl font-black md:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Son güncellenme: {updatedAt}</p>
      </header>
      <div className="legal-body grid gap-6">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="grid gap-3 text-[15px] leading-7 text-[var(--foreground)]">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2 pl-5">
      {items.map((item, i) => (
        <li key={i} className="list-disc text-[15px] leading-7">{item}</li>
      ))}
    </ul>
  );
}

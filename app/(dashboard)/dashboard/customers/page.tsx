"use client";

import { useState } from "react";
import { CalendarDays, MessageSquareText, Phone, Plus, Search, Users, Wallet } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { customers as initialCustomers } from "@/lib/mock-data";
import { formatMoney, initials } from "@/lib/utils";
import type { Customer } from "@/lib/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", notes: "" });

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  function handleAdd() {
    const newCustomer: Customer = {
      id: `cus_${Date.now()}`,
      name: form.name,
      phone: form.phone,
      appointmentCount: 0,
      totalSpend: 0,
      lastVisit: "Henüz yok",
      notes: form.notes || undefined,
    };
    setCustomers([...customers, newCustomer]);
    setForm({ name: "", phone: "", notes: "" });
    setShowModal(false);
  }

  return (
    <>
      <Topbar title="Müşteriler" subtitle="Müşteri kartları, ziyaret geçmişi, harcama ve notlar." />
      <main className="grid gap-5 p-4 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="flex h-11 max-w-md items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 text-sm text-[var(--muted)]">
            <Search size={17} />
            <input
              className="w-full bg-transparent outline-none"
              placeholder="Müşteri ara (isim veya telefon)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
          <div className="flex items-center gap-2">
            <Badge>{customers.length} müşteri</Badge>
            <Button onClick={() => setShowModal(true)}><Plus size={18} /> Müşteri ekle</Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Müşteri bulunamadı"
            description="Aradığınız kriterlere uygun müşteri yok. Yeni müşteri ekleyin veya arama terimini değiştirin."
          >
            <Button onClick={() => setShowModal(true)}><Plus size={18} /> Müşteri ekle</Button>
          </EmptyState>
        ) : (
          <section className="grid gap-3">
            {filtered.map((customer, index) => (
              <article
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className={`glass animate-fade-in cursor-pointer rounded-xl p-4 transition-all duration-200 hover:border-[var(--accent)] hover:shadow-md stagger-${Math.min(index + 1, 4)}`}
              >
                <div className="grid gap-4 md:grid-cols-[1.5fr_repeat(3,0.7fr)_1fr] md:items-center">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-950 text-sm font-bold text-white dark:from-white dark:to-neutral-200 dark:text-neutral-950">
                      {initials(customer.name)}
                    </span>
                    <span>
                      <strong className="block">{customer.name}</strong>
                      <small className="flex items-center gap-1 text-[var(--muted)]"><Phone size={12} /> {customer.phone}</small>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays size={15} className="text-[var(--muted)]" />
                    <span><b>{customer.appointmentCount}</b> randevu</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Wallet size={15} className="text-[var(--muted)]" />
                    <strong>{formatMoney(customer.totalSpend)}</strong>
                  </div>
                  <span className="text-sm text-[var(--muted)]">{customer.lastVisit}</span>
                  <span className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <MessageSquareText size={15} />
                    {customer.notes ?? "Not yok"}
                  </span>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Yeni müşteri ekle">
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-semibold">Ad soyad</label>
            <input
              className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
              placeholder="Örn: Ayşe Demir"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Telefon</label>
            <input
              className="mt-1 h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] px-3 outline-none"
              placeholder="+90 5XX XXX XX XX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Not (opsiyonel)</label>
            <textarea
              className="mt-1 min-h-20 w-full rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3 outline-none"
              placeholder="Müşteri hakkında özel notlar..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <Button onClick={handleAdd} disabled={!form.name.trim() || !form.phone.trim()} className="mt-2">
            <Plus size={18} /> Müşteri ekle
          </Button>
        </div>
      </Modal>

      <Modal open={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title="Müşteri detayı">
        {selectedCustomer && (
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-950 text-lg font-bold text-white dark:from-white dark:to-neutral-200 dark:text-neutral-950">
                {initials(selectedCustomer.name)}
              </span>
              <div>
                <h3 className="text-xl font-bold">{selectedCustomer.name}</h3>
                <p className="text-sm text-[var(--muted)]">{selectedCustomer.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3 text-center">
                <strong className="block text-xl">{selectedCustomer.appointmentCount}</strong>
                <span className="text-xs text-[var(--muted)]">Toplam randevu</span>
              </div>
              <div className="rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3 text-center">
                <strong className="block text-xl">{formatMoney(selectedCustomer.totalSpend)}</strong>
                <span className="text-xs text-[var(--muted)]">Toplam harcama</span>
              </div>
              <div className="rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3 text-center">
                <strong className="block text-xl">{selectedCustomer.lastVisit}</strong>
                <span className="text-xs text-[var(--muted)]">Son ziyaret</span>
              </div>
            </div>
            {selectedCustomer.notes && (
              <div className="rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-3">
                <p className="text-xs font-semibold text-[var(--muted)]">Notlar</p>
                <p className="mt-1 text-sm">{selectedCustomer.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { appointments } from "@/lib/mock-data";

const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function AppointmentCard({ id, label, color }: { id: string; label: string; color: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        borderLeftColor: color,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      {...listeners}
      {...attributes}
      className="cursor-grab rounded-lg border border-[var(--line)] border-l-4 bg-[var(--panel-strong)] p-2 text-xs shadow-sm active:cursor-grabbing"
    >
      <strong className="block text-[var(--foreground)]">{label}</strong>
      <span className="text-[var(--muted)]">Sürükle bırak hazır</span>
    </div>
  );
}

function Slot({ id, children }: { id: string; children?: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`min-h-20 border-b border-r border-[var(--line)] p-2 transition ${isOver ? "bg-teal-500/10" : ""}`}>
      {children}
    </div>
  );
}

export function CalendarBoard() {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const initial = useMemo(
    () => ({
      apt_1: "Pzt-09:00",
      apt_2: "Sal-10:00",
      apt_3: "Çar-13:00",
    }),
    [],
  );
  const [positions, setPositions] = useState<Record<string, string>>(initial);

  function onDragEnd(event: DragEndEvent) {
    if (!event.over) return;
    setPositions((current) => ({ ...current, [String(event.active.id)]: String(event.over?.id) }));
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--panel)]">
        <div className="grid min-w-[820px] grid-cols-[72px_repeat(7,1fr)]">
          <div className="border-b border-r border-[var(--line)] p-3 text-xs text-[var(--muted)]">Saat</div>
          {days.map((day) => (
            <div key={day} className="border-b border-r border-[var(--line)] p-3 text-sm font-semibold">
              {day}
            </div>
          ))}
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              <div className="border-b border-r border-[var(--line)] p-3 text-xs text-[var(--muted)]">
                {hour}
              </div>
              {days.map((day) => {
                const slotId = `${day}-${hour}`;
                const slotAppointments = appointments.filter((appointment) => positions[appointment.id] === slotId);
                return (
                  <Slot key={slotId} id={slotId}>
                    <div className="grid gap-2">
                      {slotAppointments.map((appointment) => (
                        <AppointmentCard key={appointment.id} id={appointment.id} label={`${appointment.customerName} · ${appointment.serviceName}`} color={appointment.color} />
                      ))}
                    </div>
                  </Slot>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </DndContext>
  );
}

type SlotInput = {
  workStart: string;
  workEnd: string;
  durationMinutes: number;
  busy: Array<{ startsAt: string; endsAt: string }>;
  stepMinutes?: number;
};

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function toClock(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function hasOverlap(candidate: { startsAt: string; endsAt: string }, busy: Array<{ startsAt: string; endsAt: string }>) {
  const candidateStart = toMinutes(candidate.startsAt);
  const candidateEnd = toMinutes(candidate.endsAt);

  return busy.some((item) => {
    const busyStart = toMinutes(item.startsAt);
    const busyEnd = toMinutes(item.endsAt);
    return candidateStart < busyEnd && candidateEnd > busyStart;
  });
}

export function getAvailableSlots({ workStart, workEnd, durationMinutes, busy, stepMinutes = 15 }: SlotInput) {
  const slots: string[] = [];
  const start = toMinutes(workStart);
  const end = toMinutes(workEnd);

  for (let cursor = start; cursor + durationMinutes <= end; cursor += stepMinutes) {
    const candidate = {
      startsAt: toClock(cursor),
      endsAt: toClock(cursor + durationMinutes),
    };

    if (!hasOverlap(candidate, busy)) {
      slots.push(candidate.startsAt);
    }
  }

  return slots;
}

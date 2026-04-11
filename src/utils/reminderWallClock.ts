/**
 * Resolves a local civil (year, month, day, hour, minute) to an existing instant.
 * - DST gap: advances minute-by-minute until the wall clock exists (next valid local time).
 * - Ambiguous local time (fall back): first matching instant wins.
 */
export function resolveLocalWallClockInstant(year: number, month: number, day: number, hour: number, minute: number): Date {
  let h = hour;
  let m = minute;

  for (let step = 0; step < 24 * 60 + 1; step++) {
    const candidate = new Date(year, month - 1, day, h, m, 0, 0);
    if (
      candidate.getFullYear() === year &&
      candidate.getMonth() === month - 1 &&
      candidate.getDate() === day &&
      candidate.getHours() === h &&
      candidate.getMinutes() === m
    ) {
      return candidate;
    }
    m += 1;
    if (m >= 60) {
      m = 0;
      h += 1;
    }
    if (h >= 24) {
      return new Date(year, month - 1, day + 1, 0, 0, 0, 0);
    }
  }

  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

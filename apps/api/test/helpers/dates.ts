const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;

export function shanghaiDateKey(value = new Date()) {
  return new Date(value.getTime() + SHANGHAI_OFFSET_MS).toISOString().slice(0, 10);
}

export function addDays(dateKey: string, days: number) {
  const value = new Date(`${dateKey}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function futureDateKey(days = 2) {
  return addDays(shanghaiDateKey(), days);
}

export function shanghaiDateTime(dateKey: string, time: string) {
  return new Date(`${dateKey}T${time}:00+08:00`);
}

export function dateOnly(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

export type EventDateStatus = 'upcoming' | 'ongoing' | 'completed';
export function getEventDateStatus(start: string | Date, end: string | Date, now = new Date()): EventDateStatus {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (![startTime, endTime, now.getTime()].every(Number.isFinite) || endTime < startTime) {
    throw new RangeError('Invalid event date range');
  }
  if (now.getTime() < startTime) return 'upcoming';
  if (now.getTime() > endTime) return 'completed';
  return 'ongoing';
}

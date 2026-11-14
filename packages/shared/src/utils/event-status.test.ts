import { describe, expect, it } from 'vitest';
import { getEventDateStatus } from './event-status.js';
describe('event timeline independent of publication', () => {
  const start = '2026-11-20T10:00:00.000Z';
  const end = '2026-11-20T12:00:00.000Z';
  it.each([
    ['2026-11-20T09:59:59.000Z', 'upcoming'],
    [start, 'ongoing'],
    [end, 'ongoing'],
    ['2026-11-20T12:00:01.000Z', 'completed'],
  ])('at %s returns %s', (now, expected) => {
    expect(getEventDateStatus(start, end, new Date(now))).toBe(expected);
  });
  it('rejects invalid and reversed dates', () => {
    expect(() => getEventDateStatus('bad', end)).toThrow(RangeError);
    expect(() => getEventDateStatus(end, start)).toThrow(RangeError);
  });
});

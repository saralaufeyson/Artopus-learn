import { describe, expect, it } from 'vitest';
import { externalUrlSchema, feeSchema } from './common.schema.js';
import { eventInputSchema } from './event.schema.js';
import { blogInputSchema } from './blog.schema.js';
describe('content validation boundaries', () => {
  it.each(['not a URL', 'javascript:alert(1)', 'http://example.com'])('rejects unsafe registration URL %s without throwing', (value) => {
    expect(externalUrlSchema.safeParse(value).success).toBe(false);
  });
  it('accepts HTTPS registration URLs', () => {
    expect(externalUrlSchema.safeParse('https://example.com/register').success).toBe(true);
  });
  it('rejects reversed times even with different timestamp precision', () => {
    const result = eventInputSchema.safeParse({
      title: 'Validation fixture', slug: 'validation-fixture', description: 'Test fixture only',
      eventType: 'workshop', locationType: 'online', location: 'Test fixture',
      startDate: '2026-11-20T10:00:00.500Z', endDate: '2026-11-20T10:00:00Z',
    });
    expect(result.success).toBe(false);
  });
  it('requires a publication time for scheduled articles', () => {
    expect(blogInputSchema.safeParse({
      title: 'Validation fixture', slug: 'validation-fixture', excerpt: '', content: '',
      category: 'Test', author: 'Test fixture', status: 'scheduled',
    }).success).toBe(false);
  });
  it('allows free events and rejects negative fees', () => {
    expect(feeSchema.safeParse({ amount: 0, currency: 'INR' }).success).toBe(true);
    expect(feeSchema.safeParse({ amount: -1, currency: 'INR' }).success).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { safeHref } from './safe-href.js';
describe('public links', () => {
  it.each(['javascript:alert(1)', 'data:text/html,unsafe', '//evil.example', '/'+String.fromCharCode(92)+'evil.example', 'https://example.com/'+String.fromCharCode(10)])('rejects unsafe href %s', value => { expect(safeHref(value)).toBeUndefined(); });
  it('accepts internal links and HTTPS registration links', () => { expect(safeHref('/classes?mode=online')).toBe('/classes?mode=online'); expect(safeHref('https://forms.gle/example')).toBe('https://forms.gle/example'); });
});

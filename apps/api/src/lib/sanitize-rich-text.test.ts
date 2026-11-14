import { describe, expect, it } from 'vitest';
import { sanitizeRichText } from './sanitize-rich-text.js';
describe('rich-text boundary', () => {
  it('removes executable attributes, scripts and unsafe links', () => {
    const output = sanitizeRichText('<script>bad()</script><p onclick="bad()">Safe</p><a href="javascript:bad()">link</a><svg onload="bad()"></svg>');
    expect(output).toContain('<p>Safe</p>');
    expect(output).not.toMatch(/script|onclick|onload|javascript|<svg/);
  });
  it('allows HTTPS YouTube embeds while rejecting other iframe sources', () => {
    expect(sanitizeRichText('<iframe src="https://www.youtube-nocookie.com/embed/abcdefghijk"></iframe>')).toContain('https://www.youtube-nocookie.com/embed/abcdefghijk');
    expect(sanitizeRichText('<iframe src="https://evil.example/embed"></iframe>')).not.toContain('evil.example');
    expect(sanitizeRichText('<iframe src="http://www.youtube.com/embed/abcdefghijk"></iframe>')).not.toContain('http:');
  });
});

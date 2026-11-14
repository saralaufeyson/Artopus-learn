export function safeHref(value: string | undefined): string | undefined {
  if (!value || [...value].some(char => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127 || char.charCodeAt(0) === 92)) return undefined;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try { return new URL(value).protocol === 'https:' ? value : undefined; } catch { return undefined; }
}

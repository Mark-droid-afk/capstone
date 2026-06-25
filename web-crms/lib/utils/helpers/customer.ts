export function normalizeName(value: string): string {
  return value.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
}

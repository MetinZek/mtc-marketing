/**
 * Plain-string interpolation for dictionary templates like
 * "View case study: {title}". Dictionaries must stay pure JSON-shaped
 * data (no function values) — they're passed as props from Server
 * Components straight into Client Components (Navbar, ContactForm,
 * Services, ...), and functions can't cross that boundary. This helper
 * is just imported code, not data, so it's safe to call from either
 * side.
 */
export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key]! : match,
  );
}

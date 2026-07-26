/** Ensures a price string displays with a leading USD symbol. */
export function formatUsdPrice(price: string): string {
  const trimmed = price.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("$")) return trimmed;
  return `$${trimmed}`;
}

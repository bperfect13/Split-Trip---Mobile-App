export function formatCurrency(
  amount: number,
): string {
  return `₹${amount.toFixed(2)}`;
}

export function roundCurrency(
  amount: number,
): number {
  return Math.round(amount * 100) / 100;
}
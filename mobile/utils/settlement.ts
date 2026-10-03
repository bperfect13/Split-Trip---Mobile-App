export type SettlementResult = {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
};

export function calculateSettlement(
  balances: Record<string, number>,
): SettlementResult[] {
  // Actual settlement algorithm will be implemented later.
  return [];
}
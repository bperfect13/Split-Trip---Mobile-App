export type DivideInput = {
  totalAmount: number;
  categories: unknown[];
};

export type DivideResult = {
  memberId: string;
  share: number;
};

export function divideExpense(
  input: DivideInput,
): DivideResult[] {
  // Actual Divide Engine will be implemented in Phase 8.
  return [];
}
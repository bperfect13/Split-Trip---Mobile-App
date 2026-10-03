import type {
  Category,
  MemberShare,
} from "../store/expenseStore";

export function calculateShares(
  categories: Category[],
): MemberShare[] {
  /*
   * We calculate money in paise instead of
   * floating-point rupees.
   *
   * This prevents rounding problems such as:
   *
   * ₹2000 ÷ 3 = ₹666.666...
   *
   * The final category shares will always add
   * up to exactly the category amount.
   */

  const shareMap = new Map<string, number>();

  for (const category of categories) {
    const participants = category.participantIds;

    if (participants.length === 0) {
      continue;
    }

    const categoryAmount = Number(category.amount);

    if (
      Number.isNaN(categoryAmount) ||
      categoryAmount <= 0
    ) {
      continue;
    }

    /*
     * Convert the category amount to paise.
     *
     * Example:
     * ₹3000.00 -> 300000 paise
     * ₹2000.00 -> 200000 paise
     */
    const totalPaise = Math.round(
      categoryAmount * 100,
    );

    /*
     * Divide the amount equally in paise.
     *
     * Example:
     *
     * ₹2000 = 200000 paise
     * 200000 ÷ 3
     *
     * Base share = 66666 paise
     * Remainder = 2 paise
     *
     * Therefore:
     * Ryan  = 66667
     * John  = 66667
     * Amit  = 66666
     *
     * Total = 200000 paise exactly
     */

    const baseShare =
      Math.floor(
        totalPaise / participants.length,
      );

    const remainder =
      totalPaise %
      participants.length;

    participants.forEach(
      (memberId, index) => {
        /*
         * Give one extra paise to the first
         * members until the remainder is used.
         */
        const memberPaise =
          baseShare +
          (index < remainder ? 1 : 0);

        const currentShare =
          shareMap.get(memberId) ?? 0;

        shareMap.set(
          memberId,
          currentShare + memberPaise,
        );
      },
    );
  }

  /*
   * Convert the final accumulated shares
   * from paise back to rupees.
   */

  return Array.from(
    shareMap.entries(),
  ).map(
    ([memberId, sharePaise]) => ({
      memberId,
      share: sharePaise / 100,
    }),
  );
}
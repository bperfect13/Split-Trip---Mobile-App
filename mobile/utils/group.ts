import type { Group, Member } from "../store/groupStore";

export function generateId(
  prefix: string,
): string {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 8)}`;
}

export function createMember(
  name: string,
): Member {
  const now = new Date().toISOString();

  return {
    id: generateId("member"),
    name: name.trim(),
  };
}

export function createGroup(
  name: string,
  ownerMember: Member,
): Group {
  const now = new Date().toISOString();

  return {
    id: generateId("group"),
    name: name.trim(),
    ownerMemberId: ownerMember.id,
    members: [ownerMember],
    createdAt: now,
    updatedAt: now,
  };
}

import type { Expense } from "../store/expenseStore";

export function canRemoveMember(
  memberId: string,
  groupExpenses: Expense[],
): boolean {
  return !groupExpenses.some((expense) => {
    if (expense.payerId === memberId) {
      return true;
    }

    const isCategoryParticipant =
      expense.categories.some((category) =>
        category.participantIds.includes(memberId),
      );

    if (isCategoryParticipant) {
      return true;
    }

    const isInShare =
      expense.shares.some(
        (share) => share.memberId === memberId,
      );

    if (isInShare) {
      return true;
    }

    const isInPayment =
      expense.payments.some(
        (payment) =>
          payment.fromMemberId === memberId ||
          payment.toMemberId === memberId,
      );

    return isInPayment;
  });
}

export function canDeleteExpense(
  expense: Expense,
): boolean {
  /*
   * An expense can currently be deleted
   * because its payments are stored inside
   * the expense itself.
   *
   * Later, when payment/settlement rules
   * become stricter, this function can
   * prevent deletion when required.
   */

  return true;
}
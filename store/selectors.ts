import { useGroupStore } from "./groupStore";
import { useExpenseStore } from "./expenseStore";

export const useGroups = () =>
  useGroupStore((state) => state.groups);

export const useCurrentGroupId = () =>
  useGroupStore((state) => state.currentGroupId);

export const useAddGroup = () =>
  useGroupStore((state) => state.addGroup);

export const useUpdateGroup = () =>
  useGroupStore((state) => state.updateGroup);

export const useDeleteGroup = () =>
  useGroupStore((state) => state.deleteGroup);

export const useRemoveMember = () =>
  useGroupStore((state) => state.removeMember);

export const useSetCurrentGroup = () =>
  useGroupStore((state) => state.setCurrentGroup);

export const useLoadGroups = () =>
  useGroupStore((state) => state.loadGroups);

export const useLoadExpenses = () =>
  useExpenseStore((state) => state.loadExpenses);

export const useExpenses = () =>
  useExpenseStore((state) => state.expenses);

export const useAddExpense = () =>
  useExpenseStore((state) => state.addExpense);

export const useUpdateExpense = () =>
  useExpenseStore((state) => state.updateExpense);

export const useDeleteExpense = () =>
  useExpenseStore((state) => state.deleteExpense);

export const useDeleteExpensesByGroup = () =>
  useExpenseStore(
    (state) => state.deleteExpensesByGroup,
  );

export const useExpensesByGroup = (groupId: string) =>
  useExpenseStore((state) =>
    state.expenses.filter(
      (expense) => expense.groupId === groupId,
    ),
  );
import { useExpenseStore } from "../store/expenseStore";
import { useGroupStore } from "../store/groupStore";

export async function initializePersistence(): Promise<void> {
  await Promise.all([
    useGroupStore.getState().loadGroups(),
    useExpenseStore.getState().loadExpenses(),
  ]);
}
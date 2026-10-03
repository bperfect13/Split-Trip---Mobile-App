import { create } from "zustand";

import { STORAGE_KEYS } from "../constants";
import {
  loadData,
  saveData,
} from "../services/storageService";

export type Category = {
  id: string;
  name: string;
  amount: number;
  participantIds: string[];
};

export type MemberShare = {
  memberId: string;
  share: number;
};

export type Payment = {
  id: string;
  expenseId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  createdAt: string;
};

export type Expense = {
  id: string;
  groupId: string;
  title: string;
  totalAmount: number;
  payerId: string;
  categories: Category[];
  shares: MemberShare[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
};

type ExpenseStore = {
  expenses: Expense[];

  setExpenses: (
    expenses: Expense[]
  ) => void;

  loadExpenses: () => Promise<void>;

  addExpense: (
    expense: Expense
  ) => Promise<void>;

  updateExpense: (
    expense: Expense
  ) => Promise<void>;

  deleteExpense: (
    expenseId: string
  ) => Promise<void>;

  deleteExpensesByGroup: (
    groupId: string
  ) => Promise<void>;

  markMemberPaid: (
    expenseId: string,
    memberId: string
  ) => Promise<void>;

  markMemberUnpaid: (
    expenseId: string,
    memberId: string
  ) => Promise<void>;
};

export const useExpenseStore =
  create<ExpenseStore>((set) => ({
    /*
     * ----------------------------------------------------
     * INITIAL STATE
     * ----------------------------------------------------
     */

    expenses: [],

    /*
     * ----------------------------------------------------
     * SET EXPENSES
     * ----------------------------------------------------
     */

    setExpenses: (expenses) => {
      set({
        expenses,
      });
    },

    /*
     * ----------------------------------------------------
     * LOAD EXPENSES
     * ----------------------------------------------------
     */

    loadExpenses: async () => {
      try {
        const expenses =
          await loadData<Expense[]>(
            STORAGE_KEYS.EXPENSES
          );

        if (expenses !== null) {
          set({
            expenses,
          });

          console.log(
            "EXPENSES LOADED:",
            expenses
          );
        } else {
          set({
            expenses: [],
          });

          console.log(
            "NO SAVED EXPENSES FOUND"
          );
        }
      } catch (error) {
        console.error(
          "FAILED TO LOAD EXPENSES:",
          error
        );

        throw error;
      }
    },

    /*
     * ----------------------------------------------------
     * ADD EXPENSE
     * ----------------------------------------------------
     */

    addExpense: async (expense) => {
      try {
        const currentExpenses =
          useExpenseStore.getState().expenses;

        const updatedExpenses = [
          ...currentExpenses,
          expense,
        ];

        /*
         * Save to AsyncStorage FIRST.
         */

        await saveData(
          STORAGE_KEYS.EXPENSES,
          updatedExpenses
        );

        /*
         * Update Zustand AFTER successful save.
         */

        set({
          expenses: updatedExpenses,
        });

        console.log(
          "EXPENSE SAVED:",
          expense.id
        );
      } catch (error) {
        console.error(
          "FAILED TO SAVE EXPENSE:",
          error
        );

        throw error;
      }
    },

    /*
     * ----------------------------------------------------
     * UPDATE EXPENSE
     * ----------------------------------------------------
     */

    updateExpense: async (expense) => {
      try {
        const currentExpenses =
          useExpenseStore.getState().expenses;

        const updatedExpenses =
          currentExpenses.map(
            (existingExpense) =>
              existingExpense.id ===
              expense.id
                ? expense
                : existingExpense
          );

        await saveData(
          STORAGE_KEYS.EXPENSES,
          updatedExpenses
        );

        set({
          expenses: updatedExpenses,
        });
      } catch (error) {
        console.error(
          "FAILED TO UPDATE EXPENSE:",
          error
        );

        throw error;
      }
    },

    /*
     * ----------------------------------------------------
     * DELETE EXPENSE
     * ----------------------------------------------------
     */

    deleteExpense: async (expenseId) => {
      try {
        const currentExpenses =
          useExpenseStore.getState().expenses;

        const updatedExpenses =
          currentExpenses.filter(
            (expense) =>
              expense.id !== expenseId
          );

        await saveData(
          STORAGE_KEYS.EXPENSES,
          updatedExpenses
        );

        set({
          expenses: updatedExpenses,
        });

        console.log(
          "EXPENSE DELETED:",
          expenseId
        );
      } catch (error) {
        console.error(
          "FAILED TO DELETE EXPENSE:",
          error
        );

        throw error;
      }
    },

    /*
     * ----------------------------------------------------
     * DELETE ALL EXPENSES FOR GROUP
     * ----------------------------------------------------
     */

    deleteExpensesByGroup: async (
      groupId
    ) => {
      try {
        const currentExpenses =
          useExpenseStore.getState().expenses;

        const updatedExpenses =
          currentExpenses.filter(
            (expense) =>
              expense.groupId !== groupId
          );

        await saveData(
          STORAGE_KEYS.EXPENSES,
          updatedExpenses
        );

        set({
          expenses: updatedExpenses,
        });

        console.log(
          "GROUP EXPENSES DELETED:",
          groupId
        );
      } catch (error) {
        console.error(
          "FAILED TO DELETE GROUP EXPENSES:",
          error
        );

        throw error;
      }
    },

    /*
     * ----------------------------------------------------
     * MARK MEMBER PAID
     * ----------------------------------------------------
     */

    markMemberPaid: async (
      expenseId,
      memberId
    ) => {
      try {
        const currentExpenses =
          useExpenseStore.getState().expenses;

        const expense =
          currentExpenses.find(
            (item) =>
              item.id === expenseId
          );

        if (!expense) {
          throw new Error(
            "Expense not found."
          );
        }

        /*
         * The owner already paid the
         * complete bill upfront.
         */

        if (
          memberId === expense.payerId
        ) {
          return;
        }

        /*
         * Find this member's share.
         */

        const memberShare =
          expense.shares.find(
            (share) =>
              share.memberId === memberId
          );

        if (!memberShare) {
          throw new Error(
            "Member does not have a share in this expense."
          );
        }

        /*
         * Prevent duplicate payment.
         */

        const alreadyPaid =
          expense.payments.some(
            (payment) =>
              payment.fromMemberId ===
              memberId
          );

        if (alreadyPaid) {
          return;
        }

        /*
         * Create payment record.
         */

        const payment: Payment = {
          id: `payment_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 8)}`,

          expenseId: expense.id,

          fromMemberId: memberId,

          toMemberId: expense.payerId,

          amount: memberShare.share,

          createdAt:
            new Date().toISOString(),
        };

        /*
         * Add payment to expense.
         */

        const updatedExpenses =
          currentExpenses.map(
            (existingExpense) => {
              if (
                existingExpense.id !==
                expenseId
              ) {
                return existingExpense;
              }

              return {
                ...existingExpense,

                payments: [
                  ...existingExpense.payments,
                  payment,
                ],

                updatedAt:
                  new Date().toISOString(),
              };
            }
          );

        /*
         * Persist payment.
         */

        await saveData(
          STORAGE_KEYS.EXPENSES,
          updatedExpenses
        );

        /*
         * Update Zustand.
         */

        set({
          expenses: updatedExpenses,
        });

        console.log(
          "MEMBER MARKED PAID:",
          memberId
        );
      } catch (error) {
        console.error(
          "FAILED TO MARK MEMBER PAID:",
          error
        );

        throw error;
      }
    },

    /*
     * ----------------------------------------------------
     * MARK MEMBER UNPAID
     * ----------------------------------------------------
     */

    markMemberUnpaid: async (
      expenseId,
      memberId
    ) => {
      try {
        const currentExpenses =
          useExpenseStore.getState().expenses;

        const expense =
          currentExpenses.find(
            (item) =>
              item.id === expenseId
          );

        if (!expense) {
          throw new Error(
            "Expense not found."
          );
        }

        /*
         * Remove this member's
         * payment record.
         */

        const updatedExpenses =
          currentExpenses.map(
            (existingExpense) => {
              if (
                existingExpense.id !==
                expenseId
              ) {
                return existingExpense;
              }

              return {
                ...existingExpense,

                payments:
                  existingExpense.payments.filter(
                    (payment) =>
                      payment.fromMemberId !==
                      memberId
                  ),

                updatedAt:
                  new Date().toISOString(),
              };
            }
          );

        /*
         * Persist change.
         */

        await saveData(
          STORAGE_KEYS.EXPENSES,
          updatedExpenses
        );

        /*
         * Update Zustand.
         */

        set({
          expenses: updatedExpenses,
        });

        console.log(
          "MEMBER MARKED UNPAID:",
          memberId
        );
      } catch (error) {
        console.error(
          "FAILED TO MARK MEMBER UNPAID:",
          error
        );

        throw error;
      }
    },
  }));
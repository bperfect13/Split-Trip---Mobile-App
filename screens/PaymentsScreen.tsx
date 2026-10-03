import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/types";

import { useGroupStore } from "../store/groupStore";
import { useExpenseStore } from "../store/expenseStore";

import { formatCurrency } from "../utils";

type PaymentsScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "Payments"
  >;

export default function PaymentsScreen({
  route,
}: PaymentsScreenProps) {
  const groupId = route.params.groupId;

  const groups = useGroupStore(
    (state) => state.groups
  );

  const expenses = useExpenseStore(
    (state) => state.expenses
  );

  const markMemberPaid =
    useExpenseStore(
      (state) => state.markMemberPaid
    );

  const markMemberUnpaid =
    useExpenseStore(
      (state) => state.markMemberUnpaid
    );

  const group = groups.find(
    (item) => item.id === groupId
  );

  const groupExpenses = expenses.filter(
    (expense) =>
      expense.groupId === groupId
  );

  if (!group) {
    return (
      <SafeAreaView className="flex-1 bg-slate-950">
        <View className="flex-1 items-center justify-center px-5">
          <Text
            className="text-center text-xl font-bold"
            style={{
              color: "#FFFFFF",
            }}
          >
            Group not found
          </Text>

          <Text
            className="mt-2 text-center text-sm"
            style={{
              color: "#9CA3AF",
            }}
          >
            This group could not be loaded.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  async function handleTogglePayment(
    expenseId: string,
    memberId: string,
    isPaid: boolean
  ) {
    try {
      if (isPaid) {
        await markMemberUnpaid(
          expenseId,
          memberId
        );
      } else {
        await markMemberPaid(
          expenseId,
          memberId
        );
      }
    } catch (error) {
      console.error(
        "Failed to update payment:",
        error
      );

      Alert.alert(
        "Something went wrong",
        "The payment status could not be updated. Please try again."
      );
    }
  }

  function getMemberShare(
    expenseId: string,
    memberId: string
  ) {
    const expense = groupExpenses.find(
      (item) => item.id === expenseId
    );

    if (!expense) {
      return 0;
    }

    return (
      expense.shares.find(
        (share) =>
          share.memberId === memberId
      )?.share ?? 0
    );
  }

  function isMemberPaid(
    expenseId: string,
    memberId: string
  ) {
    const expense = groupExpenses.find(
      (item) => item.id === expenseId
    );

    if (!expense) {
      return false;
    }

    // The person who paid the full bill
    // is automatically considered paid.
    if (
      expense.payerId === memberId
    ) {
      return true;
    }

    return expense.payments.some(
      (payment) =>
        payment.fromMemberId ===
        memberId
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-12"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View className="mb-6 mt-4">
          <Text
            className="text-3xl font-bold"
            style={{
              color: "#FFFFFF",
            }}
          >
            Payments
          </Text>

          <Text
            className="mt-2 text-sm"
            style={{
              color: "#9CA3AF",
            }}
          >
            Track who has paid their share
          </Text>

          <Text
            className="mt-1 text-base font-semibold"
            style={{
              color: "#60A5FA",
            }}
          >
            {group.name}
          </Text>
        </View>

        {groupExpenses.length === 0 ? (
          <View className="items-center rounded-3xl border border-slate-800 bg-slate-900 px-6 py-10">
            <Text
              className="text-center text-lg font-bold"
              style={{
                color: "#FFFFFF",
              }}
            >
              No expenses yet
            </Text>

            <Text
              className="mt-2 text-center text-sm"
              style={{
                color: "#9CA3AF",
              }}
            >
              Add an expense first to start
              tracking payments.
            </Text>
          </View>
        ) : (
          groupExpenses.map((expense) => (
            <View
              key={expense.id}
              className="mb-5 rounded-3xl border border-slate-800 bg-slate-900 p-5"
            >
              {/* Expense Header */}

              <View className="mb-5 flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <Text
                    className="text-lg font-bold"
                    style={{
                      color: "#FFFFFF",
                    }}
                  >
                    {expense.title}
                  </Text>

                  <Text
                    className="mt-1 text-sm"
                    style={{
                      color: "#9CA3AF",
                    }}
                  >
                    {expense.categories.length}{" "}
                    {expense.categories.length ===
                    1
                      ? "category"
                      : "categories"}
                  </Text>
                </View>

                <Text
                  className="text-lg font-bold"
                  style={{
                    color: "#60A5FA",
                  }}
                >
                  {formatCurrency(
                    expense.totalAmount
                  )}
                </Text>
              </View>

              {/* Member Payment Rows */}

              {group.members.map(
                (member) => {
                  const share =
                    getMemberShare(
                      expense.id,
                      member.id
                    );

                  // Members with no share in this
                  // expense do not need to pay.
                  if (share <= 0) {
                    return null;
                  }

                  const isOwner =
                    member.id ===
                    expense.payerId;

                  const paid =
                    isMemberPaid(
                      expense.id,
                      member.id
                    );

                  return (
                    <View
                      key={`${expense.id}-${member.id}`}
                      className="mb-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-4"
                    >
                      <View className="flex-row items-center justify-between">
                        {/* Member Information */}

                        <View className="flex-1 pr-3">
                          <Text
                            className="text-base font-bold"
                            style={{
                              color:
                                "#FFFFFF",
                            }}
                          >
                            {member.id ===
                            group.ownerMemberId
                              ? "You"
                              : member.name}
                          </Text>

                          <Text
                            className="mt-1 text-sm"
                            style={{
                              color:
                                "#9CA3AF",
                            }}
                          >
                            {formatCurrency(
                              share
                            )}
                          </Text>
                        </View>

                        {/* Payment Button */}

                        <Pressable
                          disabled={isOwner}
                          onPress={() =>
                            handleTogglePayment(
                              expense.id,
                              member.id,
                              paid
                            )
                          }
                          className={`rounded-xl px-4 py-3 ${
                            paid
                              ? "bg-green-500/15"
                              : "bg-yellow-500/15"
                          }`}
                          style={{
                            opacity:
                              isOwner
                                ? 0.9
                                : 1,
                          }}
                        >
                          <Text
                            className="text-sm font-bold"
                            style={{
                              color: paid
                                ? "#4ADE80"
                                : "#FBBF24",
                            }}
                          >
                            {paid
                              ? "PAID ✓"
                              : "NOT PAID"}
                          </Text>
                        </Pressable>
                      </View>

                      {/* Owner Explanation */}

                      {isOwner && (
                        <Text
                          className="mt-2 text-xs"
                          style={{
                            color:
                              "#6B7280",
                          }}
                        >
                          Paid upfront
                        </Text>
                      )}
                    </View>
                  );
                }
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
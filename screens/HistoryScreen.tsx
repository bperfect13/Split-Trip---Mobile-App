import {
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

import { formatCurrency, formatDate } from "../utils";

type HistoryScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "History"
  >;

export default function HistoryScreen({
  navigation,
  route,
}: HistoryScreenProps) {
  /*
   * ----------------------------------------------------
   * STORES
   * ----------------------------------------------------
   */

  const expenses = useExpenseStore(
    (state) => state.expenses
  );

  const groups = useGroupStore(
    (state) => state.groups
  );

  /*
   * ----------------------------------------------------
   * CURRENT GROUP
   * ----------------------------------------------------
   */

  const group = groups.find(
    (item) =>
      item.id === route.params.groupId
  );

  /*
   * ----------------------------------------------------
   * GROUP EXPENSES
   * ----------------------------------------------------
   */

  const groupExpenses = expenses
    .filter(
      (expense) =>
        expense.groupId ===
        route.params.groupId
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

  /*
   * ----------------------------------------------------
   * GROUP NOT FOUND
   * ----------------------------------------------------
   */

  if (!group) {
    return (
      <SafeAreaView className="flex-1 bg-slate-950">
        <View className="flex-1 items-center justify-center px-5">
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 22,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            Group not found
          </Text>

          <Pressable
            onPress={() =>
              navigation.navigate("Home")
            }
            className="mt-6 items-center justify-center rounded-2xl bg-blue-600 px-8 py-4"
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: "700",
              }}
            >
              BACK TO HOME
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * ----------------------------------------------------
   * SCREEN
   * ----------------------------------------------------
   */

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-12"
      >
        {/* HEADER */}

        <View className="pt-8">
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 30,
              fontWeight: "700",
            }}
          >
            Expenses
          </Text>

          <Text
            style={{
              color: "#9CA3AF",
              fontSize: 14,
              marginTop: 6,
            }}
          >
            {group.name}
          </Text>
        </View>

        {/* SUMMARY */}

        <View
          style={{
            marginTop: 28,
            backgroundColor: "#111827",
            borderRadius: 22,
            padding: 20,
            borderWidth: 1,
            borderColor: "#1F2937",
          }}
        >
          <Text
            style={{
              color: "#9CA3AF",
              fontSize: 12,
              fontWeight: "700",
              letterSpacing: 0.5,
            }}
          >
            TOTAL EXPENSES
          </Text>

          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 30,
              fontWeight: "700",
              marginTop: 8,
            }}
          >
            {groupExpenses.length}
          </Text>

          <Text
            style={{
              color: "#64748B",
              fontSize: 13,
              marginTop: 4,
            }}
          >
            {groupExpenses.length === 1
              ? "expense recorded"
              : "expenses recorded"}
          </Text>
        </View>

        {/* EXPENSE LIST */}

        <View className="mt-8">
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 20,
              fontWeight: "700",
            }}
          >
            Your Expenses
          </Text>

          {groupExpenses.length === 0 ? (
            <View
              style={{
                marginTop: 16,
                backgroundColor: "#111827",
                borderRadius: 22,
                padding: 24,
                borderWidth: 1,
                borderColor: "#1F2937",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 18,
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                No expenses yet
              </Text>

              <Text
                style={{
                  color: "#9CA3AF",
                  fontSize: 14,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Add your first expense from
                the group dashboard.
              </Text>
            </View>
          ) : (
            <View className="mt-4">
              {groupExpenses.map(
                (expense) => (
                  <Pressable
                    key={expense.id}
                    onPress={() =>
                      navigation.navigate(
                        "DivideResult",
                        {
                          expenseId:
                            expense.id,
                        },
                      )
                    }
                    style={{
                      backgroundColor:
                        "#111827",
                      borderRadius: 22,
                      padding: 20,
                      marginBottom: 14,
                      borderWidth: 1,
                      borderColor:
                        "#1F2937",
                    }}
                  >
                    {/* TOP ROW */}

                    <View
                      style={{
                        flexDirection:
                          "row",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          paddingRight: 12,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              "#FFFFFF",
                            fontSize: 18,
                            fontWeight:
                              "700",
                          }}
                          numberOfLines={2}
                        >
                          {expense.title}
                        </Text>

                        <Text
                          style={{
                            color:
                              "#64748B",
                            fontSize: 12,
                            marginTop: 6,
                          }}
                        >
                          {formatDate(
                            expense.createdAt
                          )}
                        </Text>
                      </View>

                      <View
                        style={{
                          paddingHorizontal:
                            12,
                          paddingVertical:
                            7,
                          borderRadius:
                            20,
                          backgroundColor:
                            "#172554",
                        }}
                      >
                        <Text
                          style={{
                            color:
                              "#60A5FA",
                            fontSize: 11,
                            fontWeight:
                              "800",
                          }}
                        >
                          EXPENSE
                        </Text>
                      </View>
                    </View>

                    {/* AMOUNT */}

                    <View
                      style={{
                        marginTop: 18,
                        flexDirection:
                          "row",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-end",
                      }}
                    >
                      <View>
                        <Text
                          style={{
                            color:
                              "#64748B",
                            fontSize: 11,
                            fontWeight:
                              "700",
                          }}
                        >
                          TOTAL BILL
                        </Text>

                        <Text
                          style={{
                            color:
                              "#FFFFFF",
                            fontSize: 25,
                            fontWeight:
                              "700",
                            marginTop: 4,
                          }}
                        >
                          {formatCurrency(
                            expense.totalAmount
                          )}
                        </Text>
                      </View>

                      <Text
                        style={{
                          color:
                            "#60A5FA",
                          fontSize: 13,
                          fontWeight:
                            "700",
                        }}
                      >
                        View →
                      </Text>
                    </View>

                    {/* CATEGORY INFO */}

                    <View
                      style={{
                        marginTop: 16,
                        paddingTop: 14,
                        borderTopWidth: 1,
                        borderTopColor:
                          "#1F2937",
                      }}
                    >
                      <Text
                        style={{
                          color:
                            "#9CA3AF",
                          fontSize: 12,
                        }}
                        numberOfLines={2}
                      >
                        {expense.categories
                          .map(
                            (category) =>
                              category.name
                          )
                          .join(" • ")}
                      </Text>

                      <Text
                        style={{
                          color:
                            "#64748B",
                          fontSize: 12,
                          marginTop: 5,
                        }}
                      >
                        {
                          expense.categories
                            .length
                        }{" "}
                        {expense.categories
                          .length === 1
                          ? "category"
                          : "categories"}
                      </Text>
                    </View>
                  </Pressable>
                )
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
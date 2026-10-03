import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useState } from "react";

import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/types";

import { useGroupStore } from "../store/groupStore";
import { useExpenseStore } from "../store/expenseStore";

import {
  calculateShares,
  generateId,
} from "../utils";

import type { Expense } from "../store/expenseStore";

type AddExpenseScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "AddExpense"
  >;

type BuilderCategory = {
  id: string;
  name: string;
  amount: string;
  participantIds: string[];
};

export default function AddExpenseScreen({
  navigation,
  route,
}: AddExpenseScreenProps) {
  /*
   * --------------------------------------------------
   * GROUP
   * --------------------------------------------------
   */

  const groups = useGroupStore(
    (state) => state.groups
  );

  const group = groups.find(
    (item) =>
      item.id === route.params.groupId
  );

  /*
   * --------------------------------------------------
   * EXPENSE STORE
   * --------------------------------------------------
   */

  const addExpense = useExpenseStore(
    (state) => state.addExpense
  );

  /*
   * --------------------------------------------------
   * STATE
   * --------------------------------------------------
   */

  const [totalAmount, setTotalAmount] =
    useState("");

  const [totalAmountError, setTotalAmountError] =
    useState("");

  const [categoryAmountError, setCategoryAmountError] =
    useState("");

  const [categories, setCategories] =
    useState<BuilderCategory[]>([]);

  const [
    isCategoryModalVisible,
    setIsCategoryModalVisible,
  ] = useState(false);

  const [newCategoryName, setNewCategoryName] =
    useState("");

  const [newCategoryAmount, setNewCategoryAmount] =
    useState("");

  const [
    selectedParticipantIds,
    setSelectedParticipantIds,
  ] = useState<string[]>([]);

  /*
   * --------------------------------------------------
   * TOTAL AMOUNT
   * --------------------------------------------------
   */

  function handleTotalAmountChange(
    value: string
  ) {
    setTotalAmount(value);

    if (totalAmountError) {
      setTotalAmountError("");
    }

    if (categoryAmountError) {
      setCategoryAmountError("");
    }
  }

  /*
   * --------------------------------------------------
   * CATEGORY MODAL
   * --------------------------------------------------
   */

  function handleOpenCategoryModal() {
    setNewCategoryName("");
    setNewCategoryAmount("");
    setSelectedParticipantIds([]);
    setIsCategoryModalVisible(true);
  }

  function handleCloseCategoryModal() {
    setNewCategoryName("");
    setNewCategoryAmount("");
    setSelectedParticipantIds([]);
    setIsCategoryModalVisible(false);
  }

  /*
   * --------------------------------------------------
   * PARTICIPANTS
   * --------------------------------------------------
   */

  function toggleParticipant(
    memberId: string
  ) {
    setSelectedParticipantIds(
      (currentIds) => {
        if (currentIds.includes(memberId)) {
          return currentIds.filter(
            (id) => id !== memberId
          );
        }

        return [
          ...currentIds,
          memberId,
        ];
      }
    );
  }

  /*
   * --------------------------------------------------
   * SAVE CATEGORY
   * --------------------------------------------------
   */

  function handleSaveCategory() {
    const trimmedName =
      newCategoryName.trim();

    const numericAmount =
      Number(newCategoryAmount);

    if (!trimmedName) {
      return;
    }

    if (
      !newCategoryAmount.trim() ||
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      return;
    }

    /*
     * Check category amount against
     * total bill.
     */

    const numericTotalBill =
      Number(totalAmount);

    if (
      !Number.isNaN(numericTotalBill) &&
      numericTotalBill > 0 &&
      numericAmount > numericTotalBill
    ) {
      Alert.alert(
        "Amount Exceeds Total Bill",
        `The category amount of ₹${numericAmount.toFixed(
          2
        )} exceeds the total bill of ₹${numericTotalBill.toFixed(
          2
        )}. Please enter a lower amount.`,
        [
          {
            text: "OK",
          },
        ]
      );

      return;
    }

    /*
     * At least one participant required.
     */

    if (
      selectedParticipantIds.length === 0
    ) {
      Alert.alert(
        "Select Participants",
        "Please select at least one participant for this category."
      );

      return;
    }

    const newCategory: BuilderCategory = {
      id: `category_${Date.now()}`,
      name: trimmedName,
      amount: newCategoryAmount,
      participantIds: [
        ...selectedParticipantIds,
      ],
    };

    setCategories(
      (currentCategories) => [
        ...currentCategories,
        newCategory,
      ]
    );

    setCategoryAmountError("");

    handleCloseCategoryModal();
  }

  /*
   * --------------------------------------------------
   * CATEGORY AMOUNT CHANGE
   * --------------------------------------------------
   */

  function handleCategoryAmountChange(
    categoryId: string,
    value: string
  ) {
    setCategories(
      (currentCategories) =>
        currentCategories.map(
          (category) =>
            category.id === categoryId
              ? {
                  ...category,
                  amount: value,
                }
              : category
        )
    );

    if (categoryAmountError) {
      setCategoryAmountError("");
    }

    const categoryAmount =
      Number(value);

    const billAmount =
      Number(totalAmount);

    if (
      value.trim() &&
      !Number.isNaN(categoryAmount) &&
      categoryAmount > 0 &&
      !Number.isNaN(billAmount) &&
      billAmount > 0 &&
      categoryAmount > billAmount
    ) {
      Alert.alert(
        "Amount Exceeds Total Bill",
        `Category amount cannot be greater than the total bill of ₹${billAmount.toFixed(
          2
        )}.`
      );
    }
  }

  /*
   * --------------------------------------------------
   * DIVIDE
   * --------------------------------------------------
   */

  async function handleDivide() {
    if (!group) {
      return;
    }

    const trimmedAmount =
      totalAmount.trim();

    /*
     * Validate total.
     */

    if (!trimmedAmount) {
      setTotalAmountError(
        "Please enter the total bill amount."
      );

      return;
    }

    const numericAmount =
      Number(trimmedAmount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      setTotalAmountError(
        "Please enter a valid amount greater than ₹0."
      );

      return;
    }

    setTotalAmountError("");

    /*
     * Validate categories.
     */

    if (categories.length === 0) {
      setCategoryAmountError(
        "Please add at least one category."
      );

      return;
    }

    /*
     * Validate category amounts.
     */

    const hasInvalidCategoryAmount =
      categories.some(
        (category) => {
          const amount =
            Number(category.amount);

          return (
            !category.amount.trim() ||
            Number.isNaN(amount) ||
            amount <= 0
          );
        }
      );

    if (hasInvalidCategoryAmount) {
      setCategoryAmountError(
        "Every category must have a valid amount greater than ₹0."
      );

      return;
    }

    /*
     * Calculate category total.
     */

    const categoryAmountsTotal =
      categories.reduce(
        (sum, category) =>
          sum + Number(category.amount),
        0
      );

    /*
     * Compare category total
     * with total bill.
     */

    const difference =
      Math.abs(
        numericAmount -
          categoryAmountsTotal
      );

    if (difference > 0.01) {
      setCategoryAmountError(
        `Category total ₹${categoryAmountsTotal.toFixed(
          2
        )} must match the total bill ₹${numericAmount.toFixed(
          2
        )}.`
      );

      return;
    }

    /*
     * Everything is valid.
     */

    setCategoryAmountError("");

    /*
     * --------------------------------------------------
     * PREPARE EXPENSE CATEGORIES
     * --------------------------------------------------
     */

    const expenseCategories =
      categories.map((category) => ({
        id: category.id,
        name: category.name,
        amount: Number(category.amount),
        participantIds:
          category.participantIds,
      }));

    /*
     * --------------------------------------------------
     * CALCULATE SHARES
     * --------------------------------------------------
     */

    const shares =
      calculateShares(
        expenseCategories
      );

    console.log(
      "Calculated Shares:",
      shares
    );

    /*
     * --------------------------------------------------
     * CREATE EXPENSE
     * --------------------------------------------------
     */

    const now =
      new Date().toISOString();

    const expense: Expense = {
      id: generateId("expense"),

      groupId:
        route.params.groupId,

      title:
        categories
          .map(
            (category) =>
              category.name
          )
          .join(" + "),

      totalAmount:
        numericAmount,

      payerId:
        group.ownerMemberId,

      categories:
        expenseCategories,

      shares,

      payments: [],

      createdAt: now,

      updatedAt: now,
    };

    /*
     * --------------------------------------------------
     * SAVE EXPENSE
     * --------------------------------------------------
     */

    try {
      await addExpense(expense);

      console.log(
        "Expense saved successfully:",
        expense
      );

      navigation.replace(
        "DivideResult",
        {
          expenseId: expense.id,
        }
      );
    } catch (error) {
      console.error(
        "Failed to save expense:",
        error
      );

      Alert.alert(
        "Could not save expense",
        "The expense could not be saved. Please try again."
      );
    }
  }

  /*
   * --------------------------------------------------
   * CATEGORY TOTAL
   * --------------------------------------------------
   */

  const categoryTotal =
    categories.reduce(
      (sum, category) => {
        const amount =
          Number(category.amount);

        if (Number.isNaN(amount)) {
          return sum;
        }

        return sum + amount;
      },
      0
    );

  const formattedCategoryTotal =
    categoryTotal.toFixed(2);

  const numericTotalAmount =
    Number(totalAmount);

  /*
   * --------------------------------------------------
   * CATEGORY MODAL VALIDATION
   * --------------------------------------------------
   */

  const isCategoryComplete =
    newCategoryName.trim().length > 0 &&
    newCategoryAmount.trim().length > 0 &&
    !Number.isNaN(
      Number(newCategoryAmount)
    ) &&
    Number(newCategoryAmount) > 0 &&
    selectedParticipantIds.length > 0;

  /*
   * --------------------------------------------------
   * GROUP NOT FOUND
   * --------------------------------------------------
   */

  if (!group) {
    return (
      <SafeAreaView className="flex-1 bg-slate-950">
        <View className="flex-1 items-center justify-center px-5">
          <Text
            className="text-xl font-bold"
            style={{
              color: "#FFFFFF",
            }}
          >
            Group not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * --------------------------------------------------
   * SCREEN
   * --------------------------------------------------
   */

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-5 pb-12"
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}

          <Animated.View
            entering={FadeInDown.duration(350)}
            className="pt-8"
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 24,
                fontWeight: "700",
                letterSpacing: -0.3,
              }}
            >
              Add Expense
            </Text>

            <Text
              style={{
                color: "#64748B",
                fontSize: 13,
                marginTop: 4,
              }}
            >
              Enter the total and add
              categories for what you're
              paying for.
            </Text>
          </Animated.View>

          {/* TOTAL BILL */}

          <Animated.View
            entering={FadeInDown
              .duration(350)
              .delay(80)}
            className="mt-8"
          >
            <Text
              className="text-sm font-bold"
              style={{
                color: "#9CA3AF",
              }}
            >
              TOTAL BILL
            </Text>

            <View
              style={{
                marginTop: 10,
                borderWidth: 1,
                borderColor: "#374151",
                borderRadius: 20,
                backgroundColor: "#111827",
                paddingHorizontal: 18,
                paddingVertical: 16,
              }}
            >
              <TextInput
                value={totalAmount}
                onChangeText={
                  handleTotalAmountChange
                }
                placeholder="₹ 3000"
                placeholderTextColor="#64748B"
                keyboardType="decimal-pad"
                returnKeyType="done"
                style={{
                  color: "#FFFFFF",
                  fontSize: 28,
                  fontWeight: "700",
                }}
              />
            </View>

            {totalAmountError ? (
              <Text
                style={{
                  color: "#EF4444",
                  fontSize: 13,
                  marginTop: 8,
                  marginLeft: 4,
                }}
              >
                {totalAmountError}
              </Text>
            ) : null}
          </Animated.View>

          {/* ==================================================
              CATEGORIES
              ================================================== */}

          <Animated.View
            entering={FadeInDown
              .duration(350)
              .delay(140)}
            className="mt-8"
          >
            {/* CATEGORY HEADER */}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 24,
                    fontWeight: "700",
                    letterSpacing: -0.3,
                  }}
                >
                  Categories
                </Text>

                <Text
                  style={{
                    color: "#64748B",
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  Split your bill into categories
                </Text>
              </View>

              <View
                style={{
                  minWidth: 38,
                  height: 34,
                  paddingHorizontal: 10,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    "rgba(37, 99, 235, 0.12)",
                  borderWidth: 1,
                  borderColor:
                    "rgba(59, 130, 246, 0.25)",
                }}
              >
                <Text
                  style={{
                    color: "#60A5FA",
                    fontSize: 13,
                    fontWeight: "700",
                  }}
                >
                  {categories.length}
                </Text>
              </View>
            </View>

            {/* CATEGORY LIST */}

            {categories.length === 0 ? (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={{
                  marginTop: 18,
                  borderRadius: 24,
                  backgroundColor: "#111827",
                  borderWidth: 1,
                  borderColor: "#1E293B",
                  paddingHorizontal: 20,
                  paddingVertical: 26,
                  alignItems: "center",
                }}
              >
                {/* PLUS ICON (TAP TO ADD CATEGORY) */}

                <Pressable
                  onPress={
                    handleOpenCategoryModal
                  }
                  android_ripple={{
                    color:
                      "rgba(59, 130, 246, 0.2)",
                    borderless: false,
                  }}
                  style={{
                    borderRadius: 18,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        "rgba(37, 99, 235, 0.12)",
                      borderWidth: 1,
                      borderColor:
                        "rgba(59, 130, 246, 0.25)",
                    }}
                  >
                    <Text
                      style={{
                        color: "#60A5FA",
                        fontSize: 30,
                        fontWeight: "300",
                      }}
                    >
                      +
                    </Text>
                  </View>
                </Pressable>

                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 18,
                    fontWeight: "700",
                    marginTop: 14,
                  }}
                >
                  No categories yet
                </Text>

                <Text
                  style={{
                    color: "#64748B",
                    fontSize: 13,
                    marginTop: 6,
                    textAlign: "center",
                    lineHeight: 19,
                  }}
                >
                  Add Food, Drinks, Petrol,
                  Hotel or any other category
                  for this bill.
                </Text>
              </Animated.View>
            ) : (
              <View className="mt-4">
                {categories.map(
                  (category, index) => {
                    const participantNames =
                      group.members
                        .filter(
                          (member) =>
                            category.participantIds.includes(
                              member.id
                            )
                        )
                        .map(
                          (member) =>
                            member.name
                        )
                        .join(", ");

                    return (
                      <Animated.View
                        key={category.id}
                        entering={FadeInDown
                          .duration(350)
                          .delay(
                            Math.min(
                              index * 60,
                              240
                            )
                          )}
                      >
                        <Pressable
                          onPress={() => {}}
                          style={({ pressed }) => ({
                            transform: [
                              {
                                scale: pressed
                                  ? 0.985
                                  : 1,
                              },
                            ],
                            opacity: pressed
                              ? 0.94
                              : 1,
                          })}
                        >
                          <View
                            style={{
                              width: "100%",
                              backgroundColor:
                                "#111827",
                              borderRadius: 20,
                              padding: 18,
                              marginBottom: 14,
                              borderWidth: 1,
                              borderColor:
                                "#1E293B",
                            }}
                          >
                            <View
                              style={{
                                flexDirection:
                                  "row",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "space-between",
                              }}
                            >
                              <Text
                                style={{
                                  color:
                                    "#60A5FA",
                                  fontSize: 12,
                                  fontWeight:
                                    "700",
                                  letterSpacing: 0.5,
                                }}
                              >
                                CATEGORY{" "}
                                {index + 1}
                              </Text>

                              <Text
                                style={{
                                  color:
                                    "#FFFFFF",
                                  fontSize: 18,
                                  fontWeight:
                                    "700",
                                }}
                              >
                                ₹
                                {
                                  category.amount
                                }
                              </Text>
                            </View>

                            <Text
                              style={{
                                color:
                                  "#FFFFFF",
                                fontSize: 18,
                                fontWeight:
                                  "700",
                                marginTop: 12,
                              }}
                            >
                              {category.name}
                            </Text>

                            {/* EDIT CATEGORY AMOUNT */}

                            <TextInput
                              value={
                                category.amount
                              }
                              onChangeText={(
                                value
                              ) =>
                                handleCategoryAmountChange(
                                  category.id,
                                  value
                                )
                              }
                              keyboardType="decimal-pad"
                              placeholder="Category amount"
                              placeholderTextColor="#64748B"
                              style={{
                                marginTop: 12,
                                backgroundColor:
                                  "#020617",
                                borderWidth: 1,
                                borderColor:
                                  "#374151",
                                borderRadius: 12,
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                color:
                                  "#FFFFFF",
                                fontSize: 15,
                              }}
                            />

                            <View
                              style={{
                                marginTop: 16,
                                borderTopWidth:
                                  1,
                                borderTopColor:
                                  "#1F2937",
                                paddingTop: 14,
                              }}
                            >
                              <Text
                                style={{
                                  color:
                                    "#64748B",
                                  fontSize: 11,
                                  fontWeight:
                                    "700",
                                  letterSpacing:
                                    0.4,
                                }}
                              >
                                PARTICIPANTS
                              </Text>

                              <Text
                                style={{
                                  color:
                                    "#FFFFFF",
                                  fontSize: 14,
                                  marginTop: 5,
                                }}
                              >
                                {participantNames ||
                                  "None"}
                              </Text>
                            </View>
                          </View>
                        </Pressable>
                      </Animated.View>
                    );
                  }
                )}

                {/* PLUS ICON TO ADD ANOTHER CATEGORY */}

                <View
                  style={{
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <Pressable
                    onPress={
                      handleOpenCategoryModal
                    }
                    android_ripple={{
                      color:
                        "rgba(59, 130, 246, 0.2)",
                      borderless: false,
                    }}
                    style={{
                      borderRadius: 18,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 18,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor:
                          "rgba(37, 99, 235, 0.12)",
                        borderWidth: 1,
                        borderColor:
                          "rgba(59, 130, 246, 0.25)",
                      }}
                    >
                      <Text
                        style={{
                          color: "#60A5FA",
                          fontSize: 30,
                          fontWeight: "300",
                        }}
                      >
                        +
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            )}

            {/* CATEGORY TOTAL */}

            {categories.length > 0 ? (
              <Animated.View
                entering={FadeInDown
                  .duration(300)
                  .delay(80)}
                style={{
                  marginTop: 2,
                  marginBottom: 14,
                  padding: 18,
                  borderRadius: 20,
                  backgroundColor: "#0F172A",
                  borderWidth: 1,
                  borderColor:
                    Math.abs(
                      numericTotalAmount -
                        categoryTotal
                    ) <= 0.01
                      ? "#166534"
                      : "#374151",
                }}
              >
                <View
                  style={{
                    flexDirection:
                      "row",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#9CA3AF",
                      fontSize: 13,
                      fontWeight:
                        "600",
                    }}
                  >
                    CATEGORY TOTAL
                  </Text>

                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 20,
                      fontWeight:
                        "700",
                    }}
                  >
                    ₹
                    {
                      formattedCategoryTotal
                    }
                  </Text>
                </View>

                {totalAmount.trim() ? (
                  <View
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTopWidth: 1,
                      borderTopColor:
                        "#1F2937",
                      flexDirection:
                        "row",
                      justifyContent:
                        "space-between",
                    }}
                  >
                    <Text
                      style={{
                        color: "#9CA3AF",
                        fontSize: 13,
                      }}
                    >
                      TOTAL BILL
                    </Text>

                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 14,
                        fontWeight:
                          "600",
                      }}
                    >
                      ₹
                      {numericTotalAmount.toFixed(
                        2
                      )}
                    </Text>
                  </View>
                ) : null}
              </Animated.View>
            ) : null}

            {/* CATEGORY ERROR */}

            {categoryAmountError ? (
              <Text
                style={{
                  color: "#EF4444",
                  fontSize: 13,
                  marginBottom: 14,
                  marginLeft: 4,
                }}
              >
                {categoryAmountError}
              </Text>
            ) : null}
          </Animated.View>

          {/* ==================================================
              DIVIDE BUTTON
              ================================================== */}

          <Animated.View
            entering={FadeInDown
              .duration(350)
              .delay(
                categories.length === 0
                  ? 280
                  : 340 + categories.length * 60
              )}
            style={{
              marginTop: 12,
            }}
          >
            <Pressable
              onPress={handleDivide}
              android_ripple={{
                color:
                  "rgba(255, 255, 255, 0.2)",
              }}
              style={{
                borderRadius: 22,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: "100%",
                  minHeight: 60,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 22,
                  backgroundColor: "#2563EB",
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 17,
                    fontWeight: "700",
                  }}
                >
                  Divide Expense
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ==================================================
          ADD CATEGORY MODAL
          ================================================== */}

      <Modal
        visible={
          isCategoryModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={
          handleCloseCategoryModal
        }
      >
        <KeyboardAvoidingView
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: 20,
            backgroundColor:
              "rgba(0, 0, 0, 0.65)",
          }}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <Animated.View
            entering={FadeIn.duration(220)}
            style={{
              backgroundColor: "#111827",
              borderRadius: 24,
              padding: 22,
              borderWidth: 1,
              borderColor: "#374151",
              maxHeight: "85%",
            }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={
                false
              }
            >
              {/* MODAL TITLE */}

              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 22,
                  fontWeight: "700",
                }}
              >
                Add Category
              </Text>

              <Text
                style={{
                  color: "#9CA3AF",
                  fontSize: 14,
                  marginTop: 6,
                }}
              >
                Add the category, amount
                and participants.
              </Text>

              {/* CATEGORY NAME */}

              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: "600",
                  marginTop: 22,
                  marginBottom: 8,
                }}
              >
                Category Name
              </Text>

              <TextInput
                value={newCategoryName}
                onChangeText={
                  setNewCategoryName
                }
                placeholder="e.g. Drinks"
                placeholderTextColor="#64748B"
                autoFocus
                autoCapitalize="words"
                returnKeyType="next"
                style={{
                  backgroundColor:
                    "#020617",
                  borderWidth: 1,
                  borderColor:
                    "#374151",
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: "#FFFFFF",
                  fontSize: 16,
                }}
              />

              {/* AMOUNT */}

              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: "600",
                  marginTop: 18,
                  marginBottom: 8,
                }}
              >
                Amount
              </Text>

              <TextInput
                value={newCategoryAmount}
                onChangeText={
                  setNewCategoryAmount
                }
                placeholder="₹ 1500"
                placeholderTextColor="#64748B"
                keyboardType="decimal-pad"
                returnKeyType="done"
                style={{
                  backgroundColor:
                    "#020617",
                  borderWidth: 1,
                  borderColor:
                    "#374151",
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: "#FFFFFF",
                  fontSize: 18,
                  fontWeight: "700",
                }}
              />

              {/* PARTICIPANTS */}

              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: "600",
                  marginTop: 20,
                  marginBottom: 4,
                }}
              >
                Participants
              </Text>

              <Text
                style={{
                  color: "#64748B",
                  fontSize: 12,
                  marginBottom: 12,
                }}
              >
                Select who is sharing this
                category.
              </Text>

              {/* PARTICIPANT LIST */}

              {group.members.map(
                (member) => {
                  const isSelected =
                    selectedParticipantIds.includes(
                      member.id
                    );

                  return (
                    <Pressable
                      key={member.id}
                      onPress={() =>
                        toggleParticipant(
                          member.id
                        )
                      }
                      style={({ pressed }) => ({
                        flexDirection:
                          "row",
                        alignItems:
                          "center",
                        backgroundColor:
                          isSelected
                            ? "#172554"
                            : "#020617",
                        borderWidth: 1,
                        borderColor:
                          isSelected
                            ? "#2563EB"
                            : "#374151",
                        borderRadius: 14,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        marginBottom: 8,
                        transform: [
                          {
                            scale: pressed
                              ? 0.98
                              : 1,
                          },
                        ],
                        opacity: pressed
                          ? 0.9
                          : 1,
                      })}
                    >
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 7,
                          borderWidth: 1.5,
                          borderColor:
                            isSelected
                              ? "#60A5FA"
                              : "#64748B",
                          backgroundColor:
                            isSelected
                              ? "#2563EB"
                              : "transparent",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          marginRight: 12,
                        }}
                      >
                        {isSelected ? (
                          <Text
                            style={{
                              color:
                                "#FFFFFF",
                              fontSize: 14,
                              fontWeight:
                                "700",
                            }}
                          >
                            ✓
                          </Text>
                        ) : null}
                      </View>

                      <Text
                        style={{
                          color:
                            "#FFFFFF",
                          fontSize: 15,
                          fontWeight:
                            "600",
                        }}
                      >
                        {member.name}
                      </Text>
                    </Pressable>
                  );
                }
              )}

              {/* MODAL BUTTONS */}

              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  marginTop: 14,
                }}
              >
                {/* CANCEL */}

                <Pressable
                  onPress={
                    handleCloseCategoryModal
                  }
                  style={({ pressed }) => ({
                    flex: 1,
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    borderRadius: 16,
                    paddingVertical: 14,
                    backgroundColor:
                      "#1F2937",
                    transform: [
                      {
                        scale: pressed
                          ? 0.97
                          : 1,
                      },
                    ],
                    opacity: pressed
                      ? 0.85
                      : 1,
                  })}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 14,
                      fontWeight:
                        "700",
                    }}
                  >
                    CANCEL
                  </Text>
                </Pressable>

                {/* DONE */}

                <Pressable
                  onPress={
                    handleSaveCategory
                  }
                  disabled={
                    !isCategoryComplete
                  }
                  style={({ pressed }) => ({
                    flex: 1,
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    borderRadius: 16,
                    paddingVertical: 14,
                    backgroundColor:
                      isCategoryComplete
                        ? "#2563EB"
                        : "#1E3A8A",
                    opacity:
                      !isCategoryComplete
                        ? 0.6
                        : pressed
                        ? 0.85
                        : 1,
                    transform: [
                      {
                        scale:
                          isCategoryComplete &&
                          pressed
                            ? 0.97
                            : 1,
                      },
                    ],
                  })}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 14,
                      fontWeight:
                        "700",
                    }}
                  >
                    DONE
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
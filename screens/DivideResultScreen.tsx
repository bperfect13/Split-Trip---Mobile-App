import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useRef, useState } from "react";

import { SafeAreaView } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/types";

import { useGroupStore } from "../store/groupStore";
import { useExpenseStore } from "../store/expenseStore";

import { formatCurrency } from "../utils";

import {
  exportExpenseAsImage,
  exportExpenseAsPdf,
  shareFile,
} from "../services/exportService";

type DivideResultScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "DivideResult"
>;

export default function DivideResultScreen({
  navigation,
  route,
}: DivideResultScreenProps) {
  const expenses = useExpenseStore(
    (state) => state.expenses,
  );

  const deleteExpense = useExpenseStore(
    (state) => state.deleteExpense,
  );

  const markMemberPaid = useExpenseStore(
    (state) => state.markMemberPaid,
  );

  const markMemberUnpaid = useExpenseStore(
    (state) => state.markMemberUnpaid,
  );

  const groups = useGroupStore(
    (state) => state.groups,
  );

  const [isExporting, setIsExporting] =
    useState(false);

  const exportViewRef =
    useRef<View>(null);

  const expense = expenses.find(
    (item) =>
      item.id === route.params.expenseId,
  );

  const group = expense
    ? groups.find(
        (item) =>
          item.id === expense.groupId,
      )
    : undefined;

  if (!expense || !group) {
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
            Expense not found
          </Text>

          <Text
            style={{
              color: "#9CA3AF",
              fontSize: 14,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            This expense could not be loaded.
          </Text>

          <Pressable
            onPress={() =>
              navigation.goBack()
            }
            style={{
              marginTop: 24,
              backgroundColor: "#2563EB",
              paddingHorizontal: 22,
              paddingVertical: 12,
              borderRadius: 14,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: "700",
              }}
            >
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * OWNER SHARE
   */

  const ownerShare =
    expense.shares.find(
      (share) =>
        share.memberId ===
        group.ownerMemberId,
    )?.share ?? 0;

  /*
   * MEMBER ROWS
   */

  const memberRows = group.members
    .map((member) => {
      const share = expense.shares.find(
        (item) =>
          item.memberId === member.id,
      );

      return {
        member,
        amount: share?.share ?? 0,
        isOwner:
          member.id ===
          group.ownerMemberId,
      };
    })
    .filter(
      (item) => item.amount > 0,
    );

  /*
   * PAYMENT STATUS
   */

  const isMemberPaid = (
    memberId: string,
  ) => {
    if (
      memberId ===
      group.ownerMemberId
    ) {
      return true;
    }

    return expense.payments.some(
      (payment) =>
        payment.fromMemberId ===
        memberId,
    );
  };

  /*
   * MONEY RECEIVED
   */

  const amountAlreadyReceived =
    expense.payments.reduce(
      (sum, payment) =>
        sum + payment.amount,
      0,
    );

  /*
   * MONEY STILL EXPECTED
   */

  const youGetBack = Math.max(
    0,
    expense.totalAmount -
      ownerShare -
      amountAlreadyReceived,
  );

  /*
   * PAID MEMBERS
   */

  const paidMembers =
    memberRows.filter(
      ({ member, isOwner }) =>
        !isOwner &&
        isMemberPaid(member.id),
    );

  /*
   * MEMBER PAYMENT BUTTON
   */

  const handleMemberPress = async (
    memberId: string,
  ) => {
    if (
      memberId ===
      group.ownerMemberId
    ) {
      return;
    }

    try {
      const currentlyPaid =
        isMemberPaid(memberId);

      if (currentlyPaid) {
        await markMemberUnpaid(
          expense.id,
          memberId,
        );
      } else {
        await markMemberPaid(
          expense.id,
          memberId,
        );
      }
    } catch (error) {
      console.error(
        "Failed to update payment status:",
        error,
      );

      Alert.alert(
        "Error",
        "The payment status could not be updated.",
      );
    }
  };

  /*
   * DELETE EXPENSE
   */

  const handleDeleteExpense = () => {
    Alert.alert(
      "Delete Expense?",
      "This will permanently remove this expense and its payment details.",
      [
        {
          text: "CANCEL",
          style: "cancel",
        },
        {
          text: "DELETE",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpense(
                expense.id,
              );

              navigation.replace(
                "History",
                {
                  groupId: group.id,
                },
              );
            } catch (error) {
              console.error(
                "Failed to delete expense:",
                error,
              );

              Alert.alert(
                "Error",
                "The expense could not be deleted.",
              );
            }
          },
        },
      ],
    );
  };

  /*
   * EXPORT PDF
   */

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);

      const uri =
        await exportExpenseAsPdf(
          expense.id,
        );

      if (uri) {
        await shareFile(
          uri,
          "application/pdf",
        );
      }
    } catch (error) {
      console.error(
        "PDF export failed:",
        error,
      );

      Alert.alert(
        "Export Failed",
        "The PDF could not be generated or shared.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  /*
   * EXPORT IMAGE
   */

  const handleExportImage = async () => {
    try {
      setIsExporting(true);

      /*
       * Give React Native a moment to render
       * the export card before capturing it.
       */

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 300),
      );

      const uri =
        await exportExpenseAsImage(
          exportViewRef,
        );

      if (uri) {
        await shareFile(
          uri,
          "image/png",
        );
      }
    } catch (error) {
      console.error(
        "Image export failed:",
        error,
      );

      Alert.alert(
        "Export Failed",
        "The image could not be generated or shared.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  /*
   * SHARE MENU
   */

  const handleShare = () => {
    Alert.alert(
      "Share Expense",
      "Choose how you want to share this expense.",
      [
        {
          text: "📄 PDF",
          onPress: handleExportPdf,
        },
        {
          text: "🖼️ Image",
          onPress: handleExportImage,
        },
        {
          text: "CANCEL",
          style: "cancel",
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView
  className="flex-1"
  contentContainerStyle={{
    paddingHorizontal: 20,
    paddingBottom: 24,
  }}
  showsVerticalScrollIndicator={false}
>
        {/* HEADER */}

        <View
          style={{
            paddingTop: 28,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 30,
              fontWeight: "700",
            }}
          >
            {expense.title}
          </Text>

          <Text
            style={{
              color: "#9CA3AF",
              fontSize: 14,
              marginTop: 6,
            }}
          >
            Here's how the bill is split.
          </Text>
        </View>

        {/* TOTAL */}

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
              fontSize: 13,
              fontWeight: "700",
            }}
          >
            TOTAL BILL
          </Text>

          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 32,
              fontWeight: "700",
              marginTop: 8,
            }}
          >
            {formatCurrency(
              expense.totalAmount,
            )}
          </Text>
        </View>

        {/* AMOUNTS TO RECEIVE */}

        <View
          style={{
            marginTop: 32,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 20,
              fontWeight: "700",
            }}
          >
            Amounts to Receive
          </Text>

          <Text
            style={{
              color: "#64748B",
              fontSize: 13,
              marginTop: 5,
            }}
          >
            Tap a member to update their
            payment.
          </Text>

          <View
            style={{
              marginTop: 16,
            }}
          >
            {memberRows.length === 0 ? (
              <View
                style={{
                  backgroundColor: "#111827",
                  borderRadius: 20,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: "#1F2937",
                }}
              >
                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  No participants in this
                  expense.
                </Text>
              </View>
            ) : (
              memberRows.map(
                ({
                  member,
                  amount,
                  isOwner,
                }) => {
                  const paid =
                    isMemberPaid(
                      member.id,
                    );

                  return (
                    <Pressable
                      key={member.id}
                      onPress={() =>
                        handleMemberPress(
                          member.id,
                        )
                      }
                      disabled={isOwner}
                      style={{
                        backgroundColor:
                          "#111827",
                        borderRadius: 20,
                        padding: 18,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor:
                          paid
                            ? "rgba(34,197,94,0.25)"
                            : "#1F2937",
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
                              fontSize: 17,
                              fontWeight:
                                "700",
                            }}
                          >
                            {isOwner
                              ? "You"
                              : member.name}
                          </Text>

                          {isOwner && (
                            <Text
                              style={{
                                color:
                                  "#64748B",
                                fontSize: 12,
                                marginTop: 4,
                              }}
                            >
                              Paid upfront
                            </Text>
                          )}
                        </View>

                        <View
                          style={{
                            paddingHorizontal:
                              12,
                            paddingVertical:
                              7,
                            borderRadius: 20,
                            backgroundColor:
                              paid
                                ? "#052E16"
                                : "#422006",
                          }}
                        >
                          <Text
                            style={{
                              color: paid
                                ? "#4ADE80"
                                : "#FCD34D",
                              fontSize: 11,
                              fontWeight:
                                "800",
                            }}
                          >
                            {paid
                              ? "PAID ✓"
                              : "DUE"}
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 24,
                          fontWeight: "700",
                          marginTop: 12,
                        }}
                      >
                        {formatCurrency(
                          amount,
                        )}
                      </Text>

                      {!isOwner && (
                        <Text
                          style={{
                            color:
                              "#64748B",
                            fontSize: 12,
                            marginTop: 6,
                          }}
                        >
                          Tap to update
                          payment
                        </Text>
                      )}
                    </Pressable>
                  );
                },
              )
            )}
          </View>
        </View>

        {/* PAYMENT SUMMARY */}

        <View
          style={{
            marginTop: 12,
            backgroundColor: "#0F172A",
            borderRadius: 22,
            padding: 20,
            borderWidth: 1,
            borderColor: "#1F2937",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 18,
              fontWeight: "700",
            }}
          >
            Your Payment Summary
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginTop: 18,
            }}
          >
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: 14,
              }}
            >
              YOU PAID
            </Text>

            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              {formatCurrency(
                expense.totalAmount,
              )}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginTop: 14,
            }}
          >
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: 14,
              }}
            >
              YOUR CONTRIBUTION
            </Text>

            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              {formatCurrency(
                ownerShare,
              )}
            </Text>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor:
                "#1F2937",
              marginTop: 18,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginTop: 18,
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
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                YOU GET BACK
              </Text>

              <Text
                style={{
                  color: "#64748B",
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                Remaining amount from
                other members
              </Text>
            </View>

            <Text
              style={{
                color: "#4ADE80",
                fontSize: 26,
                fontWeight: "800",
              }}
            >
              {formatCurrency(
                youGetBack,
              )}
            </Text>
          </View>
        </View>

        {/* PAYMENTS RECEIVED */}

        {paidMembers.length > 0 && (
          <View
            style={{
              marginTop: 14,
              backgroundColor: "#111827",
              borderRadius: 22,
              padding: 20,
              borderWidth: 1,
              borderColor: "#1F2937",
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              How You Got Back
            </Text>

            <Text
              style={{
                color: "#64748B",
                fontSize: 12,
                marginTop: 5,
              }}
            >
              Payments received from
              other members.
            </Text>

            {paidMembers.map(
              ({ member }) => {
                const payment =
                  expense.payments.find(
                    (item) =>
                      item.fromMemberId ===
                      member.id,
                  );

                if (!payment) {
                  return null;
                }

                return (
                  <View
                    key={payment.id}
                    style={{
                      flexDirection:
                        "row",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      marginTop: 16,
                      paddingTop: 14,
                      borderTopWidth: 1,
                      borderTopColor:
                        "#1F2937",
                    }}
                  >
                    <View>
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

                      <Text
                        style={{
                          color:
                            "#64748B",
                          fontSize: 11,
                          marginTop: 3,
                        }}
                      >
                        Paid
                      </Text>
                    </View>

                    <Text
                      style={{
                        color:
                          "#4ADE80",
                        fontSize: 16,
                        fontWeight:
                          "700",
                      }}
                    >
                      +
                      {formatCurrency(
                        payment.amount,
                      )}
                    </Text>
                  </View>
                );
              },
            )}
          </View>
        )}

        
      </ScrollView>
        {/* FIXED BOTTOM ACTIONS */}

<View
  style={{
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    backgroundColor: "#020617",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  }}
>
  {/* SHARE */}

  <Pressable
    onPress={handleShare}
    disabled={isExporting}
    style={{
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      backgroundColor: "#2563EB",
      paddingHorizontal: 24,
      paddingVertical: 15,
      opacity: isExporting ? 0.6 : 1,
    }}
  >
    <Text
      style={{
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
      }}
    >
      {isExporting
        ? "Preparing..."
        : "Share Expense"}
    </Text>
  </Pressable>

  {/* DELETE */}

  <Pressable
    onPress={handleDeleteExpense}
    style={{
      marginTop: 10,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "rgba(239,68,68,0.4)",
      backgroundColor: "rgba(239,68,68,0.1)",
      paddingHorizontal: 24,
      paddingVertical: 13,
    }}
  >
    <Text
      style={{
        color: "#F87171",
        fontSize: 15,
        fontWeight: "700",
      }}
    >
      Delete Expense
    </Text>
  </Pressable>
</View>
      {/* ===================================================== */}
      {/* EXPORT IMAGE CARD                                      */}
      {/* ===================================================== */}

      <View
  pointerEvents="none"
  style={{
    position: "absolute",
    left: -10000,
    top: 0,
    width: 360,
    alignItems: "center",
  }}
>
        <View
          ref={exportViewRef}
          collapsable={false}
          style={{
            width: 360,
            backgroundColor: "#0B1120",
            padding: 22,
            borderRadius: 24,
          }}
        >
          {/* BRAND */}

          <View
            style={{
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#3B82F6",
                fontSize: 28,
                fontWeight: "800",
              }}
            >
              SplitTrip
            </Text>

            <Text
              style={{
                color: "#94A3B8",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              Split expenses. Forget
              the calculations.
            </Text>
          </View>

          {/* GROUP */}

          <View
            style={{
              marginTop: 22,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 20,
                fontWeight: "700",
              }}
            >
              {group.name}
            </Text>

            <Text
              style={{
                color: "#64748B",
                fontSize: 11,
                marginTop: 4,
              }}
            >
              {new Date(
                expense.createdAt,
              ).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                },
              )}
            </Text>
          </View>

          {/* TOTAL */}

          <View
            style={{
              marginTop: 20,
              backgroundColor: "#111827",
              borderRadius: 18,
              padding: 18,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#1F2937",
            }}
          >
            <Text
              style={{
                color: "#64748B",
                fontSize: 11,
                fontWeight: "700",
              }}
            >
              TOTAL BILL
            </Text>

            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 30,
                fontWeight: "800",
                marginTop: 5,
              }}
            >
              {formatCurrency(
                expense.totalAmount,
              )}
            </Text>
          </View>

          {/* PAID BY */}

          <View
            style={{
              marginTop: 14,
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{
                color: "#64748B",
                fontSize: 10,
                fontWeight: "700",
              }}
            >
              PAID BY
            </Text>

            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: "700",
                marginTop: 3,
              }}
            >
              {group.members.find(
                (member) =>
                  member.id ===
                  expense.payerId,
              )?.name ?? "You"}
            </Text>
          </View>

          {/* CATEGORIES */}

          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: "700",
              marginTop: 22,
              marginBottom: 8,
            }}
          >
            Categories
          </Text>

          {expense.categories.map(
            (category) => (
              <View
                key={category.id}
                style={{
                  flexDirection:
                    "row",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor:
                    "#1F2937",
                }}
              >
                <Text
                  style={{
                    color: "#CBD5E1",
                    fontSize: 13,
                    flex: 1,
                  }}
                >
                  {category.name}
                </Text>

                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight:
                      "700",
                  }}
                >
                  {formatCurrency(
                    category.amount,
                  )}
                </Text>
              </View>
            ),
          )}

          {/* SHARES */}

          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: "700",
              marginTop: 22,
              marginBottom: 8,
            }}
          >
            Member Shares
          </Text>

          {memberRows.map(
            ({
              member,
              amount,
              isOwner,
            }) => {
              const paid =
                isMemberPaid(
                  member.id,
                );

              return (
                <View
                  key={member.id}
                  style={{
                    flexDirection:
                      "row",
                    alignItems:
                      "center",
                    paddingVertical: 9,
                    borderBottomWidth: 1,
                    borderBottomColor:
                      "#1F2937",
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          "#FFFFFF",
                        fontSize: 13,
                        fontWeight:
                          "600",
                      }}
                    >
                      {isOwner
                        ? "You"
                        : member.name}
                    </Text>
                  </View>

                  <Text
                    style={{
                      color:
                        "#FFFFFF",
                      fontSize: 13,
                      fontWeight:
                        "700",
                      marginRight: 10,
                    }}
                  >
                    {formatCurrency(
                      amount,
                    )}
                  </Text>

                  <View
                    style={{
                      minWidth: 50,
                      alignItems:
                        "center",
                      paddingVertical:
                        4,
                      paddingHorizontal:
                        7,
                      borderRadius: 10,
                      backgroundColor:
                        paid
                          ? "#052E16"
                          : "#422006",
                    }}
                  >
                    <Text
                      style={{
                        color: paid
                          ? "#4ADE80"
                          : "#FCD34D",
                        fontSize: 8,
                        fontWeight:
                          "800",
                      }}
                    >
                      {paid
                        ? "PAID"
                        : "DUE"}
                    </Text>
                  </View>
                </View>
              );
            },
          )}

          {/* FOOTER */}

          <Text
            style={{
              color: "#475569",
              fontSize: 9,
              textAlign: "center",
              marginTop: 20,
            }}
          >
            Generated with SplitTrip
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
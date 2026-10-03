import { useState } from "react";

import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Animated, {
  FadeInDown,
} from "react-native-reanimated";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/types";

import { useGroupStore } from "../store/groupStore";
import { useExpenseStore } from "../store/expenseStore";

import { canRemoveMember } from "../utils";

type GroupDetailsScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "GroupDetails"
  >;

function ActionCard({
  icon,
  iconSize,
  title,
  subtitle,
  borderColor,
  onPress,
}: {
  icon: string;
  iconSize: number;
  title: string;
  subtitle: string;
  borderColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(59, 130, 246, 0.15)" }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          minHeight: 88,
          borderWidth: 1,
          borderColor: borderColor,
          borderRadius: 18,
          backgroundColor: "#111827",
          paddingHorizontal: 16,
          paddingVertical: 14,
        }}
      >
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(37, 99, 235, 0.14)",
            borderWidth: 1,
            borderColor: "rgba(59, 130, 246, 0.30)",
          }}
        >
          <Text
            style={{
              color: "#60A5FA",
              fontSize: iconSize,
              fontWeight: "700",
            }}
          >
            {icon}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            marginLeft: 14,
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              marginTop: 5,
              color: "#94A3B8",
              fontSize: 13,
            }}
          >
            {subtitle}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function GroupDetailsScreen({
  navigation,
  route,
}: GroupDetailsScreenProps) {
  const [isEditingName, setIsEditingName] =
    useState(false);

  const [editedGroupName, setEditedGroupName] =
    useState("");

  /*
   * ----------------------------------------------------
   * GROUP STORE
   * ----------------------------------------------------
   */

  const groups = useGroupStore(
    (state) => state.groups
  );

  const removeMember = useGroupStore(
    (state) => state.removeMember
  );

  const updateGroup = useGroupStore(
    (state) => state.updateGroup
  );

  const deleteGroup = useGroupStore(
    (state) => state.deleteGroup
  );

  /*
   * ----------------------------------------------------
   * EXPENSE STORE
   * ----------------------------------------------------
   */

  const expenses = useExpenseStore(
    (state) => state.expenses
  );

  /*
   * Get expenses belonging to this group
   */

  const groupExpenses = expenses.filter(
    (expense) =>
      expense.groupId === route.params.groupId
  );

  /*
   * ----------------------------------------------------
   * FIND CURRENT GROUP
   * ----------------------------------------------------
   */

  const group = groups.find(
    (item) =>
      item.id === route.params.groupId
  );

  function handleStartEditingName() {
    if (!group) {
      return;
    }

    setEditedGroupName(group.name);
    setIsEditingName(true);
  }

  function handleCancelEditingName() {
    setEditedGroupName("");
    setIsEditingName(false);
  }

  async function handleSaveGroupName() {
    if (!group) {
      return;
    }

    const trimmedName =
      editedGroupName.trim();

    if (!trimmedName) {
      Alert.alert(
        "Invalid Group Name",
        "Please enter a group name."
      );

      return;
    }

    if (trimmedName === group.name) {
      setIsEditingName(false);
      return;
    }

    try {
      const updatedGroup = {
        ...group,
        name: trimmedName,
        updatedAt: new Date().toISOString(),
      };

      await updateGroup(updatedGroup);

      setIsEditingName(false);
      setEditedGroupName("");
    } catch (error) {
      console.error(
        "Failed to rename group:",
        error
      );

      Alert.alert(
        "Something went wrong",
        "The group name could not be updated. Please try again."
      );
    }
  }

  /*
   * ----------------------------------------------------
   * REMOVE MEMBER
   * ----------------------------------------------------
   */

  function handleRemoveMember(
    memberId: string,
    memberName: string
  ) {
    const canRemove = canRemoveMember(
      memberId,
      groupExpenses
    );

    if (!canRemove) {
      Alert.alert(
        "Cannot Remove Member",
        `${memberName} is already involved in one or more expenses. Remove or update those expenses before removing this member.`,
        [
          {
            text: "OK",
          },
        ]
      );

      return;
    }

    Alert.alert(
      `Remove ${memberName}?`,
      `Are you sure you want to remove ${memberName} from this group?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeMember(
                route.params.groupId,
                memberId
              );
            } catch (error) {
              console.error(
                "Failed to remove member:",
                error
              );

              Alert.alert(
                "Something went wrong",
                "The member could not be removed. Please try again."
              );
            }
          },
        },
      ]
    );
  }

  /*
   * ----------------------------------------------------
   * DEBUG LOG
   * ----------------------------------------------------
   */

  console.log(
    "SPLITTRIP MEMBERS:",
    groups.map((item) => ({
      groupName: item.name,
      members: item.members,
    }))
  );

  function handleDeleteGroup() {
    if (!group) {
      return;
    }

    Alert.alert(
      `Delete "${group.name}"?`,
      "This will permanently remove this group and its local data.",
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
              await deleteGroup(group.id);

              navigation.navigate("Home");
            } catch (error) {
              console.error(
                "Failed to delete group:",
                error
              );

              Alert.alert(
                "Something went wrong",
                "The group could not be deleted. Please try again."
              );
            }
          },
        },
      ]
    );
  }

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
            className="text-xl font-bold"
            style={{
              color: "#FFFFFF",
            }}
          >
            Group not found
          </Text>

          <Pressable
            onPress={() =>
              navigation.navigate("Home")
            }
            className="mt-6 items-center justify-center rounded-2xl bg-blue-600 px-8 py-4"
            style={({ pressed }) => ({
              transform: [
                {
                  scale: pressed ? 0.97 : 1,
                },
              ],
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text
              className="text-base font-bold"
              style={{
                color: "#FFFFFF",
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
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(350)}
        >
          {/* GROUP HEADER */}

          <View className="pt-8">
            {isEditingName ? (
              <View>
                <TextInput
                  value={editedGroupName}
                  onChangeText={
                    setEditedGroupName
                  }
                  placeholder="Group name"
                  placeholderTextColor="#64748B"
                  autoCapitalize="words"
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={
                    handleSaveGroupName
                  }
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-xl font-bold"
                  style={{
                    color: "#FFFFFF",
                  }}
                />

                <View className="mt-3 flex-row gap-3">
                  <Pressable
                    onPress={
                      handleCancelEditingName
                    }
                    className="flex-1 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3"
                    style={({ pressed }) => ({
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
                      className="text-sm font-bold"
                      style={{
                        color: "#94A3B8",
                      }}
                    >
                      CANCEL
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={
                      handleSaveGroupName
                    }
                    className="flex-1 items-center justify-center rounded-2xl bg-blue-600 px-4 py-3"
                    style={({ pressed }) => ({
                      transform: [
                        {
                          scale: pressed
                            ? 0.97
                            : 1,
                        },
                      ],
                      opacity: pressed
                        ? 0.9
                        : 1,
                    })}
                  >
                    <Text
                      className="text-sm font-bold"
                      style={{
                        color: "#FFFFFF",
                      }}
                    >
                      UPDATE GROUP
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      color: "#FFFFFF",
                      fontSize: 30,
                      fontWeight: "700",
                      letterSpacing: -0.5,
                    }}
                  >
                    {group.name}
                  </Text>

                  <Pressable
                    onPress={
                      handleStartEditingName
                    }
                    style={({ pressed }) => ({
                      marginLeft: 12,
                      borderWidth: 1,
                      borderColor:
                        "rgba(59, 130, 246, 0.4)",
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      transform: [
                        {
                          scale: pressed
                            ? 0.92
                            : 1,
                        },
                      ],
                      opacity: pressed
                        ? 0.75
                        : 1,
                    })}
                  >
                    <Text
                      style={{
                        color: "#60A5FA",
                        fontSize: 18,
                        fontWeight: "700",
                      }}
                    >
                      ✏️
                    </Text>
                  </Pressable>
                </View>

                <Text
                  className="mt-2 text-base"
                  style={{
                    color: "#94A3B8",
                  }}
                >
                  {group.members.length}{" "}
                  {group.members.length === 1
                    ? "Member"
                    : "Members"}
                </Text>
              </View>
            )}
          </View>

          {/* MEMBERS */}

          <View className="mt-8">
            <View className="flex-row items-center justify-between">
              <Text
                className="text-xl font-bold"
                style={{
                  color: "#FFFFFF",
                }}
              >
                Members
              </Text>

              <Text
                className="text-sm"
                style={{
                  color: "#94A3B8",
                }}
              >
                {group.members.length}{" "}
                {group.members.length === 1
                  ? "Member"
                  : "Members"}
              </Text>
            </View>

            <View
              style={{
                marginTop: 16,
              }}
            >
              {group.members.map((member) => {
                const isOwner =
                  member.id ===
                  group.ownerMemberId;

                return (
                  <View
                    key={member.id}
                    style={{
                      width: "100%",
                      minHeight: 56,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      backgroundColor: "#111827",
                      borderRadius: 16,
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        flex: 1,
                        color: "#FFFFFF",
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      {member.name}
                    </Text>

                    {isOwner ? (
                      <View
                        style={{
                          marginLeft: 16,
                          borderRadius: 12,
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: "#60A5FA",
                            fontSize: 14,
                            fontWeight: "700",
                          }}
                        >
                          Owner
                        </Text>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() =>
                          handleRemoveMember(
                            member.id,
                            member.name
                          )
                        }
                        style={({ pressed }) => ({
                          marginLeft: 16,
                          borderWidth: 1,
                          borderColor:
                            "rgba(239, 68, 68, 0.4)",
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          transform: [
                            {
                              scale: pressed
                                ? 0.95
                                : 1,
                            },
                          ],
                          opacity: pressed
                            ? 0.75
                            : 1,
                        })}
                      >
                        <Text
                          style={{
                            color: "#F87171",
                            fontSize: 14,
                            fontWeight: "700",
                          }}
                        >
                          Remove
                        </Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>

            {/* ACTION OPTIONS */}

            <View style={{ marginTop: 20 }}>
              <View style={{ marginBottom: 14 }}>
                <ActionCard
                  icon="+"
                  iconSize={25}
                  title="Add Member"
                  subtitle="Add people to this group"
                  borderColor="rgba(59, 130, 246, 0.28)"
                  onPress={() =>
                    navigation.navigate("AddMember", {
                      groupId: group.id,
                    })
                  }
                />
              </View>

              <View style={{ marginBottom: 14 }}>
                <ActionCard
                  icon="₹"
                  iconSize={21}
                  title="Add Expense"
                  subtitle="Add a new bill or expense"
                  borderColor="rgba(59, 130, 246, 0.28)"
                  onPress={() =>
                    navigation.navigate("AddExpense", {
                      groupId: group.id,
                    })
                  }
                />
              </View>

              <View style={{ marginBottom: 14 }}>
                <ActionCard
                  icon="▣"
                  iconSize={20}
                  title="Expenses"
                  subtitle="View group expenses"
                  borderColor="rgba(148, 163, 184, 0.22)"
                  onPress={() =>
                    navigation.navigate("History", {
                      groupId: group.id,
                    })
                  }
                />
              </View>
            </View>

            {/* DELETE GROUP */}

            <View style={{ marginTop: 10 }}>
              <Pressable
                onPress={handleDeleteGroup}
                android_ripple={{ color: "rgba(239, 68, 68, 0.2)" }}
              >
                <View
                  style={{
                    minHeight: 58,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "rgba(239, 68, 68, 0.45)",
                    backgroundColor: "rgba(239, 68, 68, 0.10)",
                    paddingHorizontal: 24,
                    paddingVertical: 14,
                  }}
                >
                  <Text
                    style={{
                      color: "#F87171",
                      fontSize: 15,
                      fontWeight: "700",
                    }}
                  >
                    Delete Group
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
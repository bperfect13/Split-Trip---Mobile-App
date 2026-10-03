import {
  KeyboardAvoidingView,
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
  FadeInDown,
} from "react-native-reanimated";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/types";

import {
  useAddGroup,
  useSetCurrentGroup,
} from "../store";

import {
  createGroup,
  createMember,
} from "../utils";

type CreateGroupScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "CreateGroup"
  >;

export default function CreateGroupScreen({
  navigation,
}: CreateGroupScreenProps) {
  const [groupName, setGroupName] =
    useState("");

  const [error, setError] =
    useState("");

  const addGroup = useAddGroup();

  const setCurrentGroup =
    useSetCurrentGroup();

  async function handleCreateGroup() {
    const trimmedName =
      groupName.trim();

    if (!trimmedName) {
      setError(
        "Please enter a group name."
      );
      return;
    }

    setError("");

    const ownerMember =
      createMember("You");

    const newGroup = createGroup(
      trimmedName,
      ownerMember
    );

    await addGroup(newGroup);

    setCurrentGroup(newGroup.id);

    navigation.replace(
      "GroupDetails",
      {
        groupId: newGroup.id,
      }
    );
  }

  function handleGroupNameChange(
    value: string
  ) {
    setGroupName(value);

    if (error) {
      setError("");
    }
  }

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
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow px-5 pb-10"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.duration(400)}
            className="flex-1"
          >
            {/* HEADER */}

            <View className="pt-8">
              <Text
                style={{
                  color: "#60A5FA",
                  fontSize: 12,
                  fontWeight: "700",
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                }}
              >
                NEW TRIP
              </Text>

              <Text
                style={{
                  marginTop: 8,
                  color: "#FFFFFF",
                  fontSize: 34,
                  fontWeight: "800",
                  letterSpacing: -0.8,
                }}
              >
                Create Group
              </Text>

              <Text
                style={{
                  marginTop: 8,
                  color: "#94A3B8",
                  fontSize: 15,
                  lineHeight: 22,
                }}
              >
                Start a new trip and keep all
                your expenses together.
              </Text>
            </View>

            {/* GROUP NAME CARD */}

            <Animated.View
              entering={FadeInDown
                .duration(400)
                .delay(100)}
              style={{
                marginTop: 34,
                borderRadius: 24,
                borderWidth: 1,
                borderColor:
                  "rgba(59, 130, 246, 0.22)",
                backgroundColor: "#111827",
                padding: 20,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 20,
                  fontWeight: "800",
                  letterSpacing: -0.2,
                }}
              >
                Group Name
              </Text>

              <Text
                style={{
                  marginTop: 6,
                  color: "#64748B",
                  fontSize: 13,
                  lineHeight: 19,
                }}
              >
                Give your trip a name so you
                can easily find it later.
              </Text>

              {/* INPUT */}

              <View
                style={{
                  marginTop: 18,
                }}
              >
                <TextInput
                  value={groupName}
                  onChangeText={
                    handleGroupNameChange
                  }
                  placeholder="e.g. Goa Trip"
                  placeholderTextColor="#64748B"
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={
                    handleCreateGroup
                  }
                  selectionColor="#60A5FA"
                  style={{
                    minHeight: 58,
                    borderRadius: 17,
                    borderWidth: 1,
                    borderColor:
                      error
                        ? "rgba(248,113,113,0.6)"
                        : "#334155",
                    backgroundColor: "#0F172A",
                    paddingHorizontal: 17,
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                />
              </View>

              {/* ERROR */}

              {error ? (
                <Text
                  style={{
                    marginTop: 9,
                    color: "#F87171",
                    fontSize: 13,
                    fontWeight: "500",
                  }}
                >
                  {error}
                </Text>
              ) : (
                <Text
                  style={{
                    marginTop: 9,
                    color: "#475569",
                    fontSize: 12,
                  }}
                >
                  Example: Goa Trip, Lonavala
                  Weekend, or College Outing
                </Text>
              )}
            </Animated.View>

            {/* CREATE GROUP BUTTON */}

            <Animated.View
              entering={FadeInDown
                .duration(400)
                .delay(180)}
              style={{
                marginTop: 24,
              }}
            >
              <Pressable
                onPress={handleCreateGroup}
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
                    Create Group
                  </Text>
                </View>
              </Pressable>
            </Animated.View>

            {/* BOTTOM HELPER */}

            <Animated.View
              entering={FadeInDown
                .duration(400)
                .delay(240)}
              style={{
                alignItems: "center",
                marginTop: 18,
              }}
            >
              <Text
                style={{
                  color: "#475569",
                  fontSize: 12,
                  textAlign: "center",
                  lineHeight: 18,
                }}
              >
                You will be added as the
                group owner automatically.
              </Text>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
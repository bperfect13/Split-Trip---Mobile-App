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

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/types";

import {
  useGroups,
  useUpdateGroup,
} from "../store";

import { createMember } from "../utils";

type AddMemberScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "AddMember"
  >;

export default function AddMemberScreen({
  navigation,
  route,
}: AddMemberScreenProps) {
  const [memberName, setMemberName] =
    useState("");

  const [error, setError] =
    useState("");

  const groups = useGroups();
  const updateGroup = useUpdateGroup();

  const group = groups.find(
    (item) =>
      item.id === route.params.groupId,
  );

  if (!group) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#020617",
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 20,
              fontWeight: "700",
            }}
          >
            Group not found
          </Text>

          <Pressable
            onPress={() =>
              navigation.navigate("Home")
            }
            style={({ pressed }) => ({
              marginTop: 24,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              backgroundColor: "#2563EB",
              paddingHorizontal: 32,
              paddingVertical: 16,
              transform: [
                {
                  scale: pressed ? 0.97 : 1,
                },
              ],
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
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

  function handleMemberNameChange(
    value: string,
  ) {
    setMemberName(value);

    if (error) {
      setError("");
    }
  }

  async function handleAddMember() {
    if (!group) {
      return;
    }

    const trimmedName =
      memberName.trim();

    if (!trimmedName) {
      setError(
        "Please enter a member name.",
      );

      return;
    }

    const memberAlreadyExists =
      group.members.some(
        (member) =>
          member.name.toLowerCase() ===
          trimmedName.toLowerCase(),
      );

    if (memberAlreadyExists) {
      setError(
        "A member with this name already exists.",
      );

      return;
    }

    setError("");

    const newMember =
      createMember(trimmedName);

    const updatedGroup = {
      ...group,
      members: [
        ...group.members,
        newMember,
      ],
      updatedAt:
        new Date().toISOString(),
    };

    await updateGroup(updatedGroup);

    navigation.goBack();
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#020617",
      }}
    >
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingBottom: 32,
          }}
        >
          {/* MEMBER NAME */}

          <View
            style={{
              marginTop: 32,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 24,
                fontWeight: "700",
                letterSpacing: -0.3,
              }}
            >
              Member Name
            </Text>

            {/* INPUT */}

            <TextInput
              value={memberName}
              onChangeText={
                handleMemberNameChange
              }
              placeholder="e.g. John"
              placeholderTextColor="#64748B"
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={
                handleAddMember
              }
              style={{
                marginTop: 16,

                width: "100%",
                minHeight: 62,

                borderWidth: 1,
                borderColor: "#263B5A",
                borderRadius: 18,

                backgroundColor: "#111827",

                color: "#FFFFFF",

                fontSize: 16,

                paddingHorizontal: 18,
                paddingVertical: 17,
              }}
            />

            {/* ERROR */}

            {error ? (
              <Text
                style={{
                  marginTop: 8,
                  color: "#F87171",
                  fontSize: 14,
                }}
              >
                {error}
              </Text>
            ) : null}
          </View>

          {/* ADD MEMBER */}

          <View style={{ marginTop: 28 }}>
            <Pressable
              onPress={handleAddMember}
              android_ripple={{
                color: "rgba(255, 255, 255, 0.2)",
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
                  Add Member
                </Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
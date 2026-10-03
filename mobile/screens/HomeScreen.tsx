import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";

import { SafeAreaView } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/types";

import {
  useGroups,
  useSetCurrentGroup,
} from "../store";

type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Home"
>;

export default function HomeScreen({
  navigation,
}: HomeScreenProps) {
  const groups = useGroups();
  const setCurrentGroup = useSetCurrentGroup();

  function handleCreateGroup() {
    navigation.navigate("CreateGroup");
  }

  function handleOpenGroup(groupId: string) {
    setCurrentGroup(groupId);

    navigation.navigate("GroupDetails", {
      groupId,
    });
  }

  /*
   * --------------------------------------------------
   * HOME SUMMARY
   * --------------------------------------------------
   */

  const totalGroups = groups.length;

  const totalMembers = groups.reduce(
    (total, group) =>
      total + group.members.length,
    0
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* ==================================================
            HERO / APP TITLE
            ================================================== */}

        <Animated.View
          entering={FadeInDown.duration(450)}
          className="pt-8"
        >
          {/* SMALL LABEL */}

          <Text
            style={{
              color: "#60A5FA",
              fontSize: 13,
              fontWeight: "700",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Your Travel Companion
          </Text>

          {/* SPLITTRIP TITLE */}

          <Text
            style={{
              marginTop: 8,
              color: "#FFFFFF",
              fontSize: 36,
              fontWeight: "800",
              letterSpacing: -1,
            }}
          >
            SplitTrip
          </Text>

          {/* SUBTITLE */}

          <Text
            style={{
              marginTop: 8,
              color: "#94A3B8",
              fontSize: 15,
              lineHeight: 22,
            }}
          >
            Your trips, expenses and group
            payments — all in one place.
          </Text>
        </Animated.View>

        {/* ==================================================
            SUMMARY CARD
            ================================================== */}

        <Animated.View
          entering={FadeInDown
            .duration(400)
            .delay(100)}
          style={{
            marginTop: 28,
            borderRadius: 24,
            borderWidth: 1,
            borderColor:
              "rgba(59, 130, 246, 0.22)",
            backgroundColor: "#111827",
            padding: 20,
          }}
        >
          {/* SUMMARY HEADER */}

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
                  fontSize: 17,
                  fontWeight: "700",
                }}
              >
                Your Groups
              </Text>

              <Text
                style={{
                  marginTop: 5,
                  color: "#64748B",
                  fontSize: 13,
                }}
              >
                Keep track of your trips
              </Text>
            </View>

            {/* GROUP ICON */}

            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 15,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  "rgba(37, 99, 235, 0.14)",
                borderWidth: 1,
                borderColor:
                  "rgba(59, 130, 246, 0.25)",
              }}
            >
              <Text
                style={{
                  color: "#60A5FA",
                  fontSize: 21,
                  fontWeight: "700",
                }}
              >
                #
              </Text>
            </View>
          </View>

          {/* SUMMARY STATS */}

          <View
            style={{
              flexDirection: "row",
              marginTop: 20,
              gap: 12,
            }}
          >
            {/* TRIPS */}

            <View
              style={{
                flex: 1,
                borderRadius: 16,
                backgroundColor: "#0F172A",
                padding: 15,
              }}
            >
              <Text
                style={{
                  color: "#60A5FA",
                  fontSize: 24,
                  fontWeight: "800",
                }}
              >
                {totalGroups}
              </Text>

              <Text
                style={{
                  marginTop: 4,
                  color: "#64748B",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {totalGroups === 1
                  ? "TRIP"
                  : "TRIPS"}
              </Text>
            </View>

            {/* MEMBERS */}

            <View
              style={{
                flex: 1,
                borderRadius: 16,
                backgroundColor: "#0F172A",
                padding: 15,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 24,
                  fontWeight: "800",
                }}
              >
                {totalMembers}
              </Text>

              <Text
                style={{
                  marginTop: 4,
                  color: "#64748B",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                MEMBERS
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ==================================================
            GROUPS SECTION
            ================================================== */}

        <Animated.View
          entering={FadeInDown
            .duration(400)
            .delay(180)}
          className="mt-8"
        >
          {/* SECTION TITLE */}

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 23,
                  fontWeight: "800",
                  letterSpacing: -0.3,
                }}
              >
                Your Trips
              </Text>

              <Text
                style={{
                  marginTop: 5,
                  color: "#64748B",
                  fontSize: 13,
                }}
              >
                Open a trip to manage everything
              </Text>
            </View>

            <Text
              style={{
                color: "#60A5FA",
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              {totalGroups}
            </Text>
          </View>

          {/* ==================================================
              NO GROUPS
              ================================================== */}

          {groups.length === 0 ? (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={{
                marginTop: 18,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: "#1E293B",
                backgroundColor: "#111827",
                padding: 24,
                alignItems: "center",
              }}
            >
              {/* PLUS (TAP TO CREATE GROUP) */}

              <Pressable
                onPress={handleCreateGroup}
                android_ripple={{
                  color:
                    "rgba(59, 130, 246, 0.2)",
                  borderless: false,
                }}
                style={{
                  borderRadius: 17,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 17,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      "rgba(37, 99, 235, 0.14)",
                    borderWidth: 1,
                    borderColor:
                      "rgba(59, 130, 246, 0.25)",
                  }}
                >
                  <Text
                    style={{
                      color: "#60A5FA",
                      fontSize: 28,
                      fontWeight: "400",
                    }}
                  >
                    +
                  </Text>
                </View>
              </Pressable>

              <Text
                style={{
                  marginTop: 14,
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                No trips yet
              </Text>

              <Text
                style={{
                  marginTop: 6,
                  color: "#64748B",
                  fontSize: 13,
                  textAlign: "center",
                  lineHeight: 18,
                }}
              >
                Create your first group to start
                tracking expenses.
              </Text>
            </Animated.View>
          ) : (
            /* ==================================================
               GROUP LIST
               ================================================== */

            <View
              style={{
                marginTop: 18,
                gap: 12,
              }}
            >
              {groups.map((group, index) => (
                <Animated.View
                  key={group.id}
                  entering={FadeInDown
                    .duration(350)
                    .delay(
                      220 + index * 80
                    )}
                >
                  <Pressable
                    onPress={() =>
                      handleOpenGroup(
                        group.id
                      )
                    }
                    style={({ pressed }) => ({
                      borderRadius: 22,
                      borderWidth: 1,
                      borderColor:
                        "rgba(59, 130, 246, 0.20)",
                      backgroundColor:
                        "#111827",
                      padding: 18,

                      transform: [
                        {
                          scale: pressed
                            ? 0.975
                            : 1,
                        },
                      ],

                      opacity: pressed
                        ? 0.9
                        : 1,

                      shadowColor:
                        "#2563EB",
                      shadowOffset: {
                        width: 0,
                        height: 5,
                      },
                      shadowOpacity:
                        pressed
                          ? 0.12
                          : 0.02,
                      shadowRadius: 12,
                      elevation:
                        pressed ? 3 : 0,
                    })}
                  >
                    {/* TOP ROW */}

                    <View
                      style={{
                        flexDirection:
                          "row",
                        alignItems:
                          "center",
                      }}
                    >
                      {/* GROUP ICON */}

                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 15,
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          backgroundColor:
                            "rgba(37, 99, 235, 0.14)",
                          borderWidth: 1,
                          borderColor:
                            "rgba(59, 130, 246, 0.25)",
                        }}
                      >
                        <Text
                          style={{
                            color:
                              "#60A5FA",
                            fontSize: 20,
                            fontWeight:
                              "800",
                          }}
                        >
                          {group.name
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>

                      {/* GROUP INFO */}

                      <View
                        style={{
                          flex: 1,
                          marginLeft: 14,
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
                          numberOfLines={1}
                        >
                          {group.name}
                        </Text>

                        <Text
                          style={{
                            marginTop: 5,
                            color:
                              "#94A3B8",
                            fontSize: 13,
                          }}
                        >
                          {group.members.length}{" "}
                          {group.members.length ===
                          1
                            ? "member"
                            : "members"}
                        </Text>
                      </View>

                      {/* ARROW */}

                      <View
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 11,
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          backgroundColor:
                            "#0F172A",
                        }}
                      >
                        <Text
                          style={{
                            color:
                              "#60A5FA",
                            fontSize: 20,
                            fontWeight:
                              "600",
                          }}
                        >
                          →
                        </Text>
                      </View>
                    </View>

                    {/* DIVIDER */}

                    <View
                      style={{
                        height: 1,
                        backgroundColor:
                          "#1F2937",
                        marginTop: 16,
                        marginBottom: 14,
                      }}
                    />

                    {/* BOTTOM INFO */}

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
                            "#64748B",
                          fontSize: 12,
                        }}
                      >
                        Group expense tracker
                      </Text>

                      <Text
                        style={{
                          color:
                            "#60A5FA",
                          fontSize: 12,
                          fontWeight:
                            "700",
                        }}
                      >
                        VIEW GROUP
                      </Text>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* ==================================================
            CREATE GROUP (ONLY WHEN TRIPS EXIST)
            ================================================== */}

        {groups.length > 0 ? (
          <Animated.View
            entering={FadeInDown
              .duration(400)
              .delay(
                280 +
                  groups.length * 80
              )}
            style={{
              marginTop: 20,
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
                  + Create New Group
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
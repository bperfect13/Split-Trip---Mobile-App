import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AddMemberScreen from "../screens/AddMemberScreen";
import HomeScreen from "../screens/HomeScreen";
import CreateGroupScreen from "../screens/CreateGroupScreen";
import GroupDetailsScreen from "../screens/GroupDetailsScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import DivideResultScreen from "../screens/DivideResultScreen";
import PaymentsScreen from "../screens/PaymentsScreen";
import HistoryScreen from "../screens/HistoryScreen";

import type { RootStackParamList } from "./types";

const Stack =
  createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0B1120",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          color: "#FFFFFF",
        },
        headerBackVisible: true,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
      />

      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
      />

      <Stack.Screen
        name="GroupDetails"
        component={GroupDetailsScreen}
      />

      <Stack.Screen
        name="AddMember"
        component={AddMemberScreen}
      />

      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
      />

      <Stack.Screen
        name="DivideResult"
        component={DivideResultScreen}
      />

      <Stack.Screen
        name="Payments"
        component={PaymentsScreen}
      />

      <Stack.Screen
        name="History"
        component={HistoryScreen}
      />
    </Stack.Navigator>
  );
}
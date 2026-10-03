import { Text, View } from "react-native";

type BalanceCardProps = {
  name: string;
  totalShare: number;
  paid: number;
  remaining: number;
};

export default function BalanceCard({
  name,
  totalShare,
  paid,
  remaining,
}: BalanceCardProps) {
  return (
    <View className="rounded-2xl bg-white p-4">
      <Text className="text-lg font-semibold text-gray-900">
        {name}
      </Text>

      <View className="mt-3 flex-row justify-between">
        <Text className="text-sm text-gray-500">
          Total Share
        </Text>

        <Text className="text-base font-medium text-gray-900">
          ₹{totalShare}
        </Text>
      </View>

      <View className="mt-2 flex-row justify-between">
        <Text className="text-sm text-gray-500">
          Paid
        </Text>

        <Text className="text-base font-medium text-gray-900">
          ₹{paid}
        </Text>
      </View>

      <View className="mt-2 flex-row justify-between">
        <Text className="text-sm text-gray-500">
          Remaining
        </Text>

        <Text className="text-base font-semibold text-gray-900">
          ₹{remaining}
        </Text>
      </View>
    </View>
  );
}
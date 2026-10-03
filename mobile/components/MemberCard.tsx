import { Text, View } from "react-native";

type MemberCardProps = {
  name: string;
  amount?: number;
  status?: "paid" | "pending";
};

export default function MemberCard({
  name,
  amount,
  status,
}: MemberCardProps) {
  return (
    <View className="rounded-2xl bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-gray-900">
          {name}
        </Text>

        {amount !== undefined && (
          <Text className="text-base font-semibold text-gray-900">
            ₹{amount}
          </Text>
        )}
      </View>

      {status && (
        <Text className="mt-1 text-sm text-gray-500">
          {status === "paid" ? "Paid" : "Pending"}
        </Text>
      )}
    </View>
  );
}
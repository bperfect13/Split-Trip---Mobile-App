import { Text, View } from "react-native";

type ExpenseCardProps = {
  title: string;
  amount: number;
  date?: string;
};

export default function ExpenseCard({
  title,
  amount,
  date,
}: ExpenseCardProps) {
  return (
    <View className="rounded-2xl bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-gray-900">
          {title}
        </Text>

        <Text className="text-base font-semibold text-gray-900">
          ₹{amount}
        </Text>
      </View>

      {date && (
        <Text className="mt-1 text-sm text-gray-500">
          {date}
        </Text>
      )}
    </View>
  );
}
import { Text, View } from "react-native";

type CategoryCardProps = {
  name: string;
  amount: number;
  participants: string[];
};

export default function CategoryCard({
  name,
  amount,
  participants,
}: CategoryCardProps) {
  return (
    <View className="rounded-2xl bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-gray-900">
          {name}
        </Text>

        <Text className="text-base font-semibold text-gray-900">
          ₹{amount}
        </Text>
      </View>

      <Text className="mt-3 text-sm font-medium text-gray-500">
        Participants
      </Text>

      {participants.map((participant) => (
        <Text
          key={participant}
          className="mt-1 text-base text-gray-800"
        >
          • {participant}
        </Text>
      ))}
    </View>
  );
}
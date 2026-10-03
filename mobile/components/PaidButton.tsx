import { Pressable, Text } from "react-native";

type PaidButtonProps = {
  paid: boolean;
  onPress: () => void;
};

export default function PaidButton({
  paid,
  onPress,
}: PaidButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`items-center justify-center rounded-xl px-4 py-3 ${
        paid ? "bg-green-100" : "bg-blue-600"
      }`}
    >
      <Text
        className={`font-semibold ${
          paid ? "text-green-700" : "text-white"
        }`}
      >
        {paid ? "✓ PAID" : "MARK PAID"}
      </Text>
    </Pressable>
  );
}
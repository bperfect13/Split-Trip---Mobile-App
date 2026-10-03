import { Pressable, Text } from "react-native";

type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function Button({
  title,
  onPress,
  disabled = false,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="items-center justify-center rounded-2xl bg-blue-600 px-6 py-4"
    >
      <Text className="text-base font-bold text-white">
        {title}
      </Text>
    </Pressable>
  );
}
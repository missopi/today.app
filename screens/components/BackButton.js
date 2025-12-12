import { Pressable, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackIcon from "../../assets/icons/back_button.svg";

// Simple back button used across screens. Keeps touch target large and visible.
export default function BackButton({ onPress, style, iconStyle }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const shorterSide = Math.min(width, height);
  const isHandheld = shorterSide < 700;

  // Scale icon size with screen size to stay legible on tablets but not shrink too small on phones.
  const iconSize = Math.min(32, Math.max(20, Math.round(shorterSide * 0.05)));
  const topOffset = insets.top + (isHandheld ? 5 : 10);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [
        {
          position: "absolute",
          top: topOffset,
          left: 16,
          width: 48,
          height: 38,
          justifyContent: "center",
          alignItems: "center",
          opacity: pressed ? 0.6 : 1,
        },
        style,
      ]}
    >
      <BackIcon width={iconSize} height={iconSize} style={iconStyle} />
    </Pressable>
  );
}

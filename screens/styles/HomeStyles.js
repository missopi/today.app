import { StyleSheet } from "react-native";
import getCardBaseStyles from "./CardBaseStyles";

export default function getStyles(isPortrait, width, height) {
  const shorter = Math.min(width, height);
  const { baseStyles, metrics } = getCardBaseStyles(width, height);
  const baseColumn = Math.min(shorter * 0.9, metrics.cardWidth);
  const columnWidth = isPortrait
    ? baseColumn
    : Math.min(width * 0.42, metrics.cardWidth);

  return StyleSheet.create({
    ...baseStyles,
    dayOfWeekSvgWrapper: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: shorter * 0.012,
    },
    dayOfWeekSvg: {
      transform: [{ scale: 1.25 }],
    },
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 5,
      backgroundColor: '#fff',
    },
    wrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: isPortrait ? 'flex-start' : 'center',
      flexDirection: isPortrait ? 'column' : 'row',
      gap: '4%',
    },
    column: {
      flexDirection: 'column',
      alignItems: 'center',
      width: columnWidth,
      maxWidth: metrics.cardWidth,
    },
    card: {
      ...baseStyles.card,
      width: '100%',
    },
  });
};

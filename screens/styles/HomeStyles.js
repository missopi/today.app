import { StyleSheet } from "react-native";
import getCardBaseStyles from "./CardBaseStyles";

export default function getStyles(isPortrait, width, height) {
  const shorter = Math.min(width, height);
  const { baseStyles, metrics } = getCardBaseStyles(width, height);
  const baseColumn = Math.min(shorter * 0.9, metrics.cardWidth);
  const columnWidth = isPortrait
    ? baseColumn
    : Math.min(width * 0.42, metrics.cardWidth);
  const titleSize = Math.min(Math.max(shorter * 0.05, 20), 40);

  return StyleSheet.create({
    ...baseStyles,
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    wrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: isPortrait ? 'column' : 'row',
      gap: isPortrait ? '0.5%' : '4%',
    },
    textTitle: {
      fontSize: titleSize,
      fontWeight: 'bold',
    },
    iconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingBottom: 8,
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
    swapButton: {
      alignSelf: "center",
      padding: 8,
    },
    swapButtonInline: {
      marginLeft: 10,
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
    portraitNextHeader: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 6,
    },
    centerGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
  });
};

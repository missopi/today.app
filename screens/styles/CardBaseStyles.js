// Styling for universal activiity card used throughout app

export default function getCardBaseStyles(width, height) {
  const shorter = Math.min(width, height);

  // Scale cards down slightly on mid-sized tablets (e.g., iPad mini) so they
  // are not the same footprint as the largest iPads, while keeping phones
  // untouched and big tablets roomy.
  const isMidTablet = shorter >= 700 && shorter < 760;
  const cardWidthCap = isMidTablet ? 470 : 500;

  const cardWidth = Math.min(shorter * 0.82, cardWidthCap);
  const textLarge = shorter * 0.06;
  const textBody = shorter * 0.035;

  const baseStyles = {
    card: {
      padding: '7%',
      borderWidth: 1,
      borderColor: "#fff",
      borderRadius: 20,
      backgroundColor: "#fff",
      flexDirection: "column",
      justifyContent: "center",
      alignSelf: "center",
      aspectRatio: 1.05,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 5,
      elevation: 4,
      marginVertical: 6,
      marginHorizontal: 4,
    },
    image: {
      flex: 1,
      borderRadius: 20,
      borderColor: "#333",
      borderWidth: 1,
      marginBottom: shorter * 0.012,
    },
    bitmapEditImage: {
      marginTop: '7%',
      marginHorizontal: '7%',
    },
    placeholder: {
      flex: 1,
      width: "100%",
      borderRadius: 12,
      backgroundColor: "#fff",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: shorter * 0.012,
    },
    placeholderText: {
      color: "#aaa",
      fontSize: textBody,
      textAlign: "center",
    },
    title: {
      fontSize: textLarge,
      fontWeight: "bold",
      textAlign: "center",
      color: "#333",
    },
    cornerRow: {
      position: "absolute",
      top: 10,
      left: 10,
      right: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      zIndex: 2,
    },
    cornerButton: {
      padding: 6,
      minWidth: 44,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    libraryCard: {
      alignSelf: 'center',
      padding: '1%',
    },
  };

  return { baseStyles, metrics: { cardWidth, textLarge, textBody } };
}

import { View, Text, TouchableOpacity, Image } from "react-native";

const getImageSource = (image) => {
  if (!image) return null;
  if (typeof image === "function" || typeof image === "number") return image;
  if (typeof image === "string") return { uri: image };
  return image?.uri && typeof image.uri === "string" ? { uri: image.uri } : null;
};

const ActivityCard = ({
  activity,
  label,
  onPress,
  readOnly = false,
  styles,
  resolveActivityImage,
  cornerContent = null,
  shrinkBitmapImage = false,
}) => {
  const resolvedImage = resolveActivityImage
    ? resolveActivityImage(activity)
    : activity?.image || null;

  const imageSource = getImageSource(resolvedImage);
  const isSvg = typeof imageSource === "function";
  const ImageComponent = isSvg ? imageSource : null;
  const isLibraryCard = activity?.fromLibrary;

  const imageContent = !imageSource
    ? null
    : isSvg ? (
        <ImageComponent width="100%" height="100%"/>
      ) : (
        <Image
          source={imageSource}
          style={[
            styles.image,
            shrinkBitmapImage && styles.bitmapEditImage,
          ]}
          resizeMode="cover"
          preserveAspectRatio="xMidYMid meet"
        />
      );

  return (
    <TouchableOpacity
      disabled={readOnly}
      onPress={readOnly ? undefined : onPress}
      style={[styles.card, isLibraryCard && styles.libraryCard]}
    >
      {cornerContent ? (
        <View style={styles.cornerRow}>{cornerContent}</View>
      ) : null}

      {activity ? (
        <>
          {imageContent}

          {!isLibraryCard && activity?.name ? (
            <Text style={styles.title}>{activity.name}</Text>
          ) : null}
        </>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ActivityCard;

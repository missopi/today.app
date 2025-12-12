/**
 * File to store all image picker code so can be used on multiple screens.
 * Will handle selected images from camera and photo gallery.
 * */ 

import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";


// Ask for permissions
export async function requestPermission(type) {
  if (type === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }
}

// Choose image from camera or photo gallery & converts pngs to jpeg
export async function pickImage(type = 'camera') {
  console.log('[pickImage] start - type:', type);

  const hasPermission = await requestPermission(type);
  console.log('[pickImage] permission granted:', hasPermission);

  if (!hasPermission) {
    alert('Permission denied. Please enable permissions in settings.');
    return null;
  }

  let result;
  try {
    if (type === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });
    }
    console.log('[pickImage] Picker result:', result);
  } catch (error) {
    console.error('[pickImage] Picker error.', error);
    return null;
  }
  
  if (result.canceled || !result.assets?.length) {
    console.log('[pickImage] cancelled or no assets');
    return null;
  }

  const asset = result.assets?.[0];
  console.log('[pickImage] Picked asset:', asset);

  if (!asset || !asset.uri) {
    console.error('[pickImage] missing or has no URI', asset);
    return null;
  }

  let imageUri = result.assets[0].uri;
  console.log('initial image uri:', imageUri);
  console.time('image conversion')
  
  // Converts a picked image to JPEG and returns its URI.
  if (imageUri.toLowerCase().endsWith('.png')) {
    console.log('png detected, attempting to convert...');

    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1024 } }], // resize to help p[erformance
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );
      console.log('[pickImage] jpeg convertion successful. New uri:', manipulatedImage.uri);
      return manipulatedImage.uri;
    } catch (error) {
      console.error('Error converting to JPEG:', error);
      return null;
    }
  }
  
  console.timeEnd('image conversion');
  return imageUri;
}

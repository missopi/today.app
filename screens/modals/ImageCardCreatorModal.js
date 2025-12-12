import { useEffect } from "react";
import { Modal, View, Text, Pressable, TouchableOpacity, TextInput, Image, useWindowDimensions } from "react-native";
import getModalStyles from '../styles/ModalStyles';

export default function ImageCardCreatorModal({
  visible,
  modalStep,
  slotRef,
  handleSetActivity,
  newCardTitle,
  setNewCardTitle,
  setModalStep,
  isPickingImage,
  setIsPickingImage,
  pickImage,
  newCardImage,
  setNewCardImage,
  saveNewCard,
  navigation,
  setActivityCallback,
  closeModal
}) {

  const isFeatureReady = true;
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;
  const styles = getModalStyles(isPortrait, width, height);

  useEffect(() => {
    if (!isFeatureReady && modalStep === 'choose') {
      //setModalStep('create');
    }
  }, [modalStep]);

  return (
    <Modal 
      visible={visible} 
      transparent={true} 
      animationType="fade" 
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={closeModal}  // ✅ Android back button
    >
      {/* ✅ FULL-SCREEN PRESSABLE OVERLAY */}
      <Pressable
        style={styles.overlay}
        onPress={closeModal}              // tap outside modal closes it
      >
        {/* ✅ INNER PRESSABLE stops touch propagation */}
        <Pressable
          style={styles.modalCard}
          onPress={(e) => e.stopPropagation()} // prevents overlay press
        >

          {/* Existing modal content unchanged below */}
          {modalStep === 'choose' && isFeatureReady && (
            <>
              <Text style={styles.modalHeader}>Choose Source</Text>
              <Text style={styles.modalDialog}>Please pick an option.</Text>
              <View style={styles.buttonColumn}>
                <TouchableOpacity
                  disabled={!isFeatureReady}
                  style={[
                    styles.smallButton,
                    !isFeatureReady && { backgroundColor: '#ccc', opacity: 0.6 }
                  ]}
                  onPress={() => {
                    if (!isFeatureReady) return;
                    let slotKey;
                    if (slotRef.current !== undefined && slotRef.current !== null) {
                      // if it's an object like { slot: "Now" } use that property
                      if (typeof slotRef.current === "object" && "slot" in slotRef.current) {
                        slotKey = slotRef.current.slot;
                      } else {
                        // otherwise just use the direct value (like 0, 1, etc.)
                        slotKey = slotRef.current;
                      }
                    } else {
                      console.warn("[Modal] slotRef.current is undefined or null");
                    }

                    setActivityCallback(slotKey, handleSetActivity);
                    navigation.navigate("LibraryScreen", { slot: String(slotKey) });
                    closeModal();
                  }}
                >
                  <Text style={[styles.imageAddText, !isFeatureReady && { color: '#666' }]}>Image Library</Text>
                </TouchableOpacity>
    
                <TouchableOpacity
                  onPress={() => {
                    setNewCardTitle('');
                    setNewCardImage(null);
                    setIsPickingImage(false);
                    setModalStep('create');
                  }}
                  style={styles.smallButton}
                >
                  <Text style={styles.smallButtonText}>Create New</Text>
                </TouchableOpacity>
    
                <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {modalStep === 'create' && !isPickingImage && (
            <>
              <Text style={styles.modalHeader}>Enter Card Title</Text>
              <Text style={styles.modalDialog}>Please enter a title to match your image.</Text>
              <TextInput
                placeholder="e.g., brush teeth"
                placeholderTextColor="#9999"
                value={newCardTitle}
                onChangeText={setNewCardTitle}
                style={styles.input}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={() => {
                    if (!newCardTitle.trim()) {
                      alert('Please enter a title.');
                      return;
                    }
                    setIsPickingImage(true);
                  }}
                  style={styles.imageAddButton}
                >
                  <Text style={styles.imageAddText}>Next</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {modalStep === 'create' && isPickingImage && (
            <>
              <Text style={styles.modalHeader}>Add Image</Text>

              {!newCardImage ? (
                <View style={styles.buttonColumn}>
                  <Text style={styles.modalDialog}>Please choose an image source.</Text>
                  <TouchableOpacity onPress={() => pickImage('camera')} style={styles.imageButton}>
                    <Text style={styles.addText}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => pickImage('gallery')} style={styles.imageButton}>
                    <Text style={styles.addText}>Photo Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPressIn={closeModal} style={styles.cancelButton}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity> 
                </View>
              ) : (
                <>
                  <View style={styles.previewView}>
                    <Image source={{ uri: newCardImage }} style={styles.previewImage} resizeMode="cover" />
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity onPress={saveNewCard} style={styles.imageAddButton}>
                      <Text style={styles.imageAddText}>Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPressIn={closeModal} style={styles.cancelButton}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity> 
                  </View>
                </>
              )}
            </>
          )}

        </Pressable>
      </Pressable>
    </Modal>
  );
}

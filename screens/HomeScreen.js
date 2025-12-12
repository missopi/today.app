// Main board screen containing the Now/Next/Then board

import { useEffect, useRef, useState } from "react";  
import { View, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import TodayBoard from "./components/TodayBoard";
import getStyles from "./styles/HomeStyles";
import { setActivityCallback } from "./components/CallbackStore";
import { pickImage } from "../utilities/imagePickerHelper";
import ImageCardCreatorModal from "./modals/ImageCardCreatorModal";
import uuid from "react-native-uuid";
import { saveBoard, updateBoard } from "../utilities/BoardStore";
import { activityLibrary } from "../data/ActivityLibrary";
import useHandheldPortraitLock from "../utilities/useHandheldPortraitLock";

export default function HomeScreen({ navigation, route }) {  // useState used to track selected activities
  const { mode, board } = route.params || {};
  const [hasChanges, setHasChanges] = useState(false);

  function resolveActivityImage(activity) {
    if (!activity) return null;
    if (activity.fromLibrary && activity.imageKey) {
      const match = activityLibrary.find(a => a.id === activity.imageKey);
      return match ? match.image : null;
    }
    return activity.image || null;
  };

  // hydrate initial state immediately so the transition doesn't render an empty shell
  const initialDayOfTheWeek = mode === 'load' && board?.cards?.[0]
    ? { ...board.cards[0], image: resolveActivityImage(board.cards[0]) }
    : null;
  const initialActivity = mode === 'load' && board?.cards?.[1]
    ? { ...board.cards[1], image: resolveActivityImage(board.cards[1]) }
    : null;

  const [boardTitle, setBoardTitle] = useState(mode === 'load' ? (board?.title || '') : '');
  const [dayOfTheWeek, setDayofTheWeek] = useState(initialDayOfTheWeek);
  const [activity, setActivity] = useState(initialActivity);

  // modal for adding custom card
  const [newCardImage, setNewCardImage] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isNewCardVisible, setIsNewCardVisible] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);

  // modal steps: choose || create || preview
  const [modalStep, setModalStep] = useState('choose');

  // saving boards
  const [currentBoardId, setCurrentBoardId] = useState(mode === 'load' ? board?.id || null : null);

  // screen orientation
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;
  const styles = getStyles(isPortrait, width, height);
  const insets = useSafeAreaInsets();

  useHandheldPortraitLock();

  // Intercept navigation to show Save modal if unsaved changes exist
  const pendingActionRef = useRef(null);

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (!hasChanges) return;

      const action = e.data.action;
      e.preventDefault();
      pendingActionRef.current = action;
      setIsSaveModalVisible(true);
    });

    return unsub; // cleanup when unmounting
  }, [navigation, hasChanges]);

  const completeNavigation = async () => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    if (action) navigation.dispatch(action);
  };

  // loading saved boards
  useEffect(() => {
    if (mode === 'load' && board && board.id !== currentBoardId) {
      loadTodayBoard(board);
    }
  }, [mode, board, currentBoardId]);

  const slotRef = useRef(null);

  function onSelectSlot(slot) {
    slotRef.current = slot;
    setNewCardTitle('');
    setNewCardImage(null);
    setIsPickingImage(false);
    setModalStep('choose');
    setIsNewCardVisible(true);
  };

  const closeModal = () => {
    setIsNewCardVisible(false);
    setNewCardImage(null);
    setNewCardTitle('');
    setIsPickingImage(false);
    setModalStep('choose');
  };

  function handleSetActivity(activity) {
    const currentSlot = typeof slotRef.current === 'string'
      ? slotRef.current
      : slotRef.current?.slot;
      
    if (currentSlot === 'Today') setDayofTheWeek(activity);
    else if (currentSlot === 'Activity') setActivity(activity);
    else console.warn('Invalid slot. Could not assign activity.');

    setHasChanges(true);
  };

  async function handleImagePick(type) {
    const imageUri = await pickImage(type);
    if (imageUri) {
      setNewCardImage(imageUri);
    } else {
      console.warn('[handleImagePick] no image returned');
    }
  };
  
  function saveNewActivityCard() {
    if (!newCardImage || !newCardTitle.trim()){
      alert("Please provide both an image and title.");
      return;
    }

    const newCard = { name: newCardTitle.trim(), image: { uri: newCardImage } };
    const currentSlot = typeof slotRef.current === 'string'
      ? slotRef.current
      : slotRef.current?.slot;

    if (currentSlot === 'Today') setDayofTheWeek(newCard);
    else if (currentSlot === 'Activity') setActivity(newCard);
    else console.warn("Invalid slot. Could not assign activity.");
    
    // reset and close
    setIsNewCardVisible(false);
    setNewCardImage(null);
    setNewCardTitle('');
    setHasChanges(true);
    slotRef.current = null;
  };

  const saveCurrentTodayBoard = async (titleFromModal) => {
    const titleToUse = titleFromModal || boardTitle;

    if (![dayOfTheWeek, activity].filter(Boolean).length) {
      alert("Please add image before saving.");
      return;
    }

    const board = {
      id: currentBoardId || uuid.v4(),
      type: 'today',
      title: titleToUse || "Today",
      cards: [dayOfTheWeek, activity].filter(Boolean),
    };

    if (currentBoardId) {
      await updateBoard(board);
    } else {
      await saveBoard(board);
    }

    setBoardTitle(titleToUse);
    setCurrentBoardId(board.id);
    setIsSaveModalVisible(false);
    setHasChanges(false);
    if (pendingActionRef.current) completeNavigation(); 
  };

  const loadTodayBoard = (board) => {
    const today = board.cards[0] ? { 
      ...board.cards[0], 
      image: resolveActivityImage(board.cards[0]) 
    } : null;

    const activity = board.cards[1] ? { 
      ...board.cards[1], 
      image: resolveActivityImage(board.cards[1]) 
    } : null;

    setDayofTheWeek(today);
    setActivity(activity);
    setCurrentBoardId(board.id);
    setBoardTitle(board.title || '');
    setHasChanges(false);
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: '#fff', flex: 1, paddingTop: Math.max(0 - insets.top, 0), paddingBottom: Math.max(0 - insets.bottom, 0) }}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <View style={{ flex: 1 }}>
        <TodayBoard 
          dayOfTheWeek={dayOfTheWeek}
          activity={activity} 
          onSelectSlot={onSelectSlot}
          readOnly={false} 
          styles={styles}
        />
      </View>
      <ImageCardCreatorModal
        visible={isNewCardVisible}
        modalStep={modalStep}
        setModalStep={setModalStep}
        slotRef={slotRef}
        handleSetActivity={handleSetActivity}
        newCardTitle={newCardTitle}
        setNewCardTitle={setNewCardTitle}
        isPickingImage={isPickingImage}
        setIsPickingImage={setIsPickingImage}
        pickImage={handleImagePick}
        newCardImage={newCardImage}
        setNewCardImage={setNewCardImage}
        setIsNewCardVisible={setIsNewCardVisible}
        saveNewCard={saveNewActivityCard}
        setActivityCallback={setActivityCallback}
        navigation={navigation}
        closeModal={closeModal}
      />
    </SafeAreaView>
  );
};

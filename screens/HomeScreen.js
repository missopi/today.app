// Main board screen containing the Now/Next/Then board

import { useCallback, useEffect, useRef, useState } from "react";  
import { Modal, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import TodayBoard from "./components/TodayBoard";
import getStyles from "./styles/HomeStyles";
import { setActivityCallback } from "./components/CallbackStore";
import { pickImage } from "../utilities/imagePickerHelper";
import ImageCardCreatorModal from "./modals/ImageCardCreatorModal";
import uuid from "react-native-uuid";
import { getBoards, saveBoard, updateBoard } from "../utilities/BoardStore";
import { activityLibrary } from "../data/ActivityLibrary";
import useHandheldPortraitLock from "../utilities/useHandheldPortraitLock";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const getLocalISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalISODate = (iso) => {
  if (typeof iso !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, monthIndex, day);
  date.setHours(12, 0, 0, 0);
  return date;
};

const addDaysLocalNoDSTSurprises = (date, days) => {
  const copy = new Date(date);
  copy.setHours(12, 0, 0, 0);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const getDefaultBoardTitle = (date, dayOffset) => {
  if (dayOffset === 0) return "Today";
  return DAY_NAMES[date.getDay()] || "Day";
};

export default function HomeScreen({ navigation, route }) {  // useState used to track selected activities
  const { mode, board } = route.params || {};
  const [hasChanges, setHasChanges] = useState(false);
  const dayOffset = Number(route?.params?.dayOffset ?? 0);
  const baseDateISO = route?.params?.baseDateISO ?? getLocalISODate(new Date());
  const parsedBase = parseLocalISODate(baseDateISO) ?? new Date();
  const targetDate = addDaysLocalNoDSTSurprises(parsedBase, dayOffset);
  const targetDateISO = getLocalISODate(targetDate);

  function resolveActivityImage(activity) {
    if (!activity) return null;
    if (activity.fromLibrary && activity.imageKey) {
      const match = activityLibrary.find(a => a.id === activity.imageKey);
      return match ? match.image : null;
    }
    return activity.image || null;
  };

  // hydrate initial state immediately so the transition doesn't render an empty shell
  const initialActivityRaw = mode === 'load'
    ? (board?.cards?.[1] ?? board?.cards?.[0] ?? null)
    : null;
  const initialActivity = initialActivityRaw
    ? { ...initialActivityRaw, image: resolveActivityImage(initialActivityRaw) }
    : null;

  const [boardTitle, setBoardTitle] = useState(
    mode === "load" ? (board?.title || "") : getDefaultBoardTitle(targetDate, dayOffset)
  );
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
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [saveModalTitle, setSaveModalTitle] = useState("");

  // screen orientation
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;
  const styles = getStyles(isPortrait, width, height);
  const insets = useSafeAreaInsets();

  useHandheldPortraitLock();

  // Intercept navigation to show Save modal if unsaved changes exist
  const pendingActionRef = useRef(null);

  function loadTodayBoard(board) {
    const activityRaw = board?.cards?.[1] ?? board?.cards?.[0] ?? null;
    const activity = activityRaw
      ? {
          ...activityRaw,
          image: resolveActivityImage(activityRaw),
        }
      : null;

    setActivity(activity);
    setCurrentBoardId(board?.id ?? null);
    setBoardTitle(board?.title || "");
    setHasChanges(false);
  }

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (!hasChanges) return;

      const action = e.data.action;
      e.preventDefault();
      pendingActionRef.current = action;
      setSaveModalTitle(boardTitle || "");
      setIsSaveModalVisible(true);
    });

    return unsub; // cleanup when unmounting
  }, [navigation, hasChanges, boardTitle]);

  const completeNavigation = async () => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    if (action) navigation.dispatch(action);
  };

  const discardAndNavigate = async () => {
    setIsSaveModalVisible(false);
    setHasChanges(false);
    await completeNavigation();
  };

  const cancelNavigation = () => {
    setIsSaveModalVisible(false);
    pendingActionRef.current = null;
  };

  // loading saved boards
  useEffect(() => {
    if (mode === 'load' && board && board.id !== currentBoardId) {
      loadTodayBoard(board);
    }
  }, [mode, board, currentBoardId]);

  // rehydrate from AsyncStorage when arriving from WeekOverview (or returning to the app)
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      (async () => {
        if (hasChanges) return;
        if (mode === "load" && board) return;

        const boards = await getBoards();
        if (cancelled) return;

        const matchingBoards = boards.filter(
          (b) => b?.baseDateISO === baseDateISO && Number(b?.dayOffset) === dayOffset
        );
        const latest = matchingBoards.length ? matchingBoards[matchingBoards.length - 1] : null;

        if (!latest) return;
        if (latest?.id && latest.id === currentBoardId) return;

        loadTodayBoard(latest);
      })();

      return () => {
        cancelled = true;
      };
    }, [hasChanges, mode, board, baseDateISO, dayOffset, currentBoardId])
  );

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

  const autoSaveBoardForActivity = (nextActivity) => {
    if (!nextActivity) return;

    const titleToUse = boardTitle || getDefaultBoardTitle(targetDate, dayOffset);
    const boardId = currentBoardId || uuid.v4();

    const boardToSave = {
      id: boardId,
      type: dayOffset === 0 ? "today" : "day",
      dateISO: targetDateISO,
      baseDateISO,
      dayOffset,
      title: titleToUse,
      cards: [nextActivity].filter(Boolean),
    };

    setHasChanges(true);

    (async () => {
      const result = currentBoardId ? await updateBoard(boardToSave) : await saveBoard(boardToSave);
      const ok = Array.isArray(result) && result.length > 0;
      if (!ok) return;

      setCurrentBoardId(boardId);
      setHasChanges(false);
    })();
  };

  function handleSetActivity(activity) {
    const currentSlot = typeof slotRef.current === 'string'
      ? slotRef.current
      : slotRef.current?.slot;
      
    if (currentSlot === 'Activity') {
      setActivity(activity);
      autoSaveBoardForActivity(activity);
    } else {
      console.warn('Invalid slot. Could not assign activity.');
    }
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

    if (currentSlot === 'Activity') {
      setActivity(newCard);
      autoSaveBoardForActivity(newCard);
    } else {
      console.warn("Invalid slot. Could not assign activity.");
    }
    
    // reset and close
    setIsNewCardVisible(false);
    setNewCardImage(null);
    setNewCardTitle('');
    slotRef.current = null;
  };

  const saveCurrentTodayBoard = async (titleFromModal) => {
    const titleToUse = titleFromModal || boardTitle;

    if (!activity) {
      alert("Please add image before saving.");
      return;
    }

    const board = {
      id: currentBoardId || uuid.v4(),
      type: dayOffset === 0 ? "today" : "day",
      dateISO: targetDateISO,
      baseDateISO,
      dayOffset,
      title: titleToUse || getDefaultBoardTitle(targetDate, dayOffset),
      cards: [activity].filter(Boolean),
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

  return (
    <SafeAreaView
      style={{ backgroundColor: '#fff', flex: 1 }}
      edges={['bottom', 'left', 'right']}
    >
      <View style={{ flex: 1 }}>
        <TodayBoard 
          activity={activity} 
          onSelectSlot={onSelectSlot}
          readOnly={false} 
          styles={styles}
          date={targetDate}
        />
      </View>
      <Modal
        visible={isSaveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelNavigation}
      >
        <View style={saveModalStyles.backdrop}>
          <View style={saveModalStyles.sheet}>
            <Text style={saveModalStyles.title}>Save changes?</Text>
            <Text style={saveModalStyles.subtitle}>
              You have unsaved changes. Save before leaving?
            </Text>
            <TextInput
              value={saveModalTitle}
              onChangeText={setSaveModalTitle}
              placeholder="Board title"
              autoCapitalize="sentences"
              style={saveModalStyles.input}
            />
            <View style={saveModalStyles.row}>
              <Pressable onPress={cancelNavigation} style={[saveModalStyles.button, saveModalStyles.secondary]}>
                <Text style={saveModalStyles.secondaryText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={discardAndNavigate} style={[saveModalStyles.button, saveModalStyles.secondary, saveModalStyles.spaced]}>
                <Text style={saveModalStyles.secondaryText}>Discard</Text>
              </Pressable>
              <Pressable
                onPress={() => saveCurrentTodayBoard(saveModalTitle)}
                style={[saveModalStyles.button, saveModalStyles.primary, saveModalStyles.spaced]}
              >
                <Text style={saveModalStyles.primaryText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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

const saveModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 20,
    justifyContent: "center",
  },
  sheet: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  spaced: {
    marginLeft: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  primary: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondary: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
  },
  secondaryText: {
    color: "#111",
    fontWeight: "600",
  },
});

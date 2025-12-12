import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = 'allboards';

// fetch all existing saved boards
export const getBoards = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load boards:', err);
    return [];
  }
};

// save a new board
export const saveBoard = async (newBoard) => {
  try {
    const existing = await getBoards();
    const updated = [...existing, newBoard];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save board:', err);
    return [];
  }
};

// update an existing board
export const updateBoard = async (updateBoard) => {
  try {
    const boards = await getBoards();
    const updated = boards.map((b) => (b.id === updateBoard.id ? updateBoard : b));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to update board:', err);
    return [];
  }
};

// delete a board
export const deleteBoard = async (id) => {
  try {
    const boards = await getBoards();
    const filtered = boards.filter((b) => b.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('Failed to delete board:', err);
    return [];
  }
};

// clear all boards!
export const clearAllBoards = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear boards:', err);
  }
};
// Flatlist of all available activity cards for users to choose from

import { useEffect, useState, useMemo, useRef } from "react";
import { Text, View, FlatList, TouchableOpacity, ScrollView, TextInput, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import styles from './styles/LibraryStyles';
import { activityLibrary } from "../data/ActivityLibrary";
import { setActivityCallback, triggerActivityCallback } from "./components/CallbackStore";
import Search from "../assets/icons/search.svg";
import { allCategories } from '../data/Categories';
import AsyncStorage from "@react-native-async-storage/async-storage";
import useHandheldPortraitLock from "../utilities/useHandheldPortraitLock";
import BackButton from "./components/BackButton";
import ActivityCard from "./components/ActivityCard";
import getCardBaseStyles from "./styles/CardBaseStyles";

const LibraryScreen = ({ navigation, route }) => {
  const slot = route?.params?.slot;
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySettings, setCategorySettings] = useState(allCategories);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const GAP = 8;
  const EDGE = 20;
  const horizontalPadding = EDGE + Math.max(insets.left, insets.right);
  const { baseStyles, metrics } = getCardBaseStyles(width, height);
  const isPortrait = height >= width;
  const desiredCols = useMemo(() => {
    if (!isPortrait) {
      if (width >= 1150) return 5;
      if (width >= 800) return 4;
      if (width >= 600) return 3;
      return 3;
    } else {
      if (width >= 1150) return 5;
      if (width >= 800) return 4;
      if (width >= 600) return 3;
      return 2;
    }
  }, [width, isPortrait]);

  // Mirror the column update pattern from AllBoardsScreen to force quick remounts on size change.
  const [numColumns, setNumColumns] = useState(desiredCols);

  useEffect(() => {
    if (numColumns !== desiredCols) {
      setNumColumns(desiredCols);
    }
  }, [desiredCols, numColumns]);

  const listKey = useMemo(
    () => `library-cols-${numColumns}-cat-${selectedCategory}`,
    [numColumns, selectedCategory]
  );
  const containerWidth = Math.max(width - (horizontalPadding * 2), 240);
  const availableWidth = Math.max(containerWidth - (GAP * (numColumns - 1)), 240);
  const cardWidth = Math.min(metrics.cardWidth, availableWidth / numColumns);
  const cardStyles = {
    ...baseStyles,
    card: {
      ...baseStyles.card,
      width: cardWidth,
      marginHorizontal: 0, // prevent double spacing now that column gap handles gutters
    },
  };

  useEffect(() => {
    if (!visibleCategories.some(cat => cat.label === selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [categorySettings]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem('categorySettings');
        if (saved) {
          setCategorySettings(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load category settings', e);
      }
    };
    loadSettings();
  }, []);

  const filteredActivities = activityLibrary.filter((activity) => {
    const matchesCategory = selectedCategory === 'All' || activity.category === selectedCategory;
    const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter out the manual "All" tab so it only renders once.
  const visibleCategories = categorySettings.filter(cat => cat.visible && cat.key !== 'All');

  useEffect(() => {
    if (!slot) {
      console.warn("No slot provided to LibraryScreen");
      return;
    }

    // set activity callback so BoardScreen can handle selection
    setActivityCallback((activity) => {
      console.log('triggering activity with:', activity)

    });
  }, [slot]);

  useHandheldPortraitLock();

  const listRef = useRef(null);

  useEffect(() => {
    // Reset scroll when filters change so cards start at the top of the list.
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [selectedCategory, searchQuery]);

  const handlePress = (activity) => {
    if (!slot) return;

    const simplifiedActivity = {
      id: activity.id,
      name: activity.name,
      category: activity.category,
      fromLibrary: true,
      imageKey: activity.id,
    };

    triggerActivityCallback(slot, simplifiedActivity);
    navigation.goBack();
  };

  const paddingTop = Math.max(40 - insets.top, 0);
  const paddingBottom = Math.max(0 - insets.bottom, 0);

  return (
    <SafeAreaView
      style={{ flex: 1, paddingTop, paddingBottom }}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <BackButton onPress={() => navigation.goBack()} />
      <View style={{ paddingHorizontal: horizontalPadding, paddingBottom: 8 }}>
        <View style={styles.searchContainer}>
          <Search width={20} height={20} style={styles.searchIcon} />
          <TextInput
            placeholder="Search"
            placeholderTextColor={'#777'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.tabs, { marginTop: 10 }]}
          contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', gap: 7 }}
        >
          <TouchableOpacity
            key="All"
            onPress={() => setSelectedCategory('All')}
            style={[styles.tab, {
              backgroundColor: selectedCategory === 'All' ? '#cdedffff' : '#fff',
              borderColor: selectedCategory === 'All' ? '#0792e2ff' : '#fff',
              borderWidth: selectedCategory === 'All' ? 2 : 1
            }]}
          >
            <Text style={[styles.tabText, { color: selectedCategory === 'All' ? '#01a2ffff' : '#ccc' }]}>
              All
            </Text>
          </TouchableOpacity>
          {visibleCategories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setSelectedCategory(cat.label)}
              style={[styles.tab, {
                backgroundColor: selectedCategory === cat.label ? '#cdedffff' : '#fff',
                borderColor: selectedCategory === cat.label ? '#0792e2ff' : '#fff',
                borderWidth: selectedCategory === cat.label ? 2 : 1
              }]}
            >
              <Text style={[styles.tabText, { color: selectedCategory === cat.label ? '#01a2ffff' : '#ccc' }]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        ref={listRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          gap: GAP,
        }}
        columnWrapperStyle={numColumns > 1 ? { gap: GAP, justifyContent: 'flex-start' } : undefined}
        ListEmptyComponent={<Text style={{ color: '#888',paddingTop: 20, textAlign: 'center' }}>No activities in this category</Text>}
        showsVerticalScrollIndicator={false}
        data={filteredActivities}
        key={listKey}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActivityCard
            activity={{ ...item, fromLibrary: true, imageKey: item.id }}
            label=""
            onPress={() => handlePress(item)}
            styles={cardStyles}
            resolveActivityImage={(activity) => activity?.image || null}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default LibraryScreen;

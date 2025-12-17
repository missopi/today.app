import { useCallback, useMemo, useState } from "react";
import { FlatList, View, useWindowDimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Sunday from "../assets/days-of-the-week/sunday.svg";
import Monday from "../assets/days-of-the-week/monday.svg";
import Tuesday from "../assets/days-of-the-week/tuesday.svg";
import Wednesday from "../assets/days-of-the-week/wednesday.svg";
import Thursday from "../assets/days-of-the-week/thursday.svg";
import Friday from "../assets/days-of-the-week/friday.svg";
import Saturday from "../assets/days-of-the-week/saturday.svg";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

import ActivityCard from "./components/ActivityCard";
import getCardBaseStyles from "./styles/CardBaseStyles";
import { getBoards } from "../utilities/BoardStore";
import { activityLibrary } from "../data/ActivityLibrary";

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

const buildRouteForOffset = (dayOffset) => (dayOffset === 0 ? "Home" : `HomeDay${dayOffset}`);
const DAY_CARD_STROKE = { color: "#3fb9ffff", width: 3, borderRadius: 20 };
const ACTIVITY_CARD_STROKE = { color: "#ffb53dff", width: 3, borderRadius: 20 };

export default function WeekOverviewScreen({ navigation, route }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLandscape = width > height;
  const numColumns = isLandscape ? 7 : 2;

  const baseDateISO = route?.params?.baseDateISO ?? getLocalISODate(new Date());
  const parsedBase = parseLocalISODate(baseDateISO) ?? new Date();

  const [boards, setBoards] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const loaded = await getBoards();
        if (!cancelled) setBoards(Array.isArray(loaded) ? loaded : []);
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const resolveActivityImage = useCallback((activity) => {
    if (!activity) return null;
    if (activity.fromLibrary && activity.imageKey) {
      const match = activityLibrary.find((a) => a.id === activity.imageKey);
      return match ? match.image : null;
    }
    return activity.image || null;
  }, []);

  const week = useMemo(() => {
    return Array.from({ length: 7 }, (_, dayOffset) => {
      const date = addDaysLocalNoDSTSurprises(parsedBase, dayOffset);
      const dayIndex = date.getDay();
      const dayName = DAY_NAMES[dayIndex] ?? "Day";
      const DaySvg = [Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday][dayIndex] ?? Sunday;

      const matchingBoards = boards.filter(
        (b) => b?.baseDateISO === baseDateISO && Number(b?.dayOffset) === dayOffset
      );
      const board = matchingBoards.length ? matchingBoards[matchingBoards.length - 1] : null;
      const activity = board?.cards?.[0] ?? null;

      return { dayOffset, dayName, DaySvg, activity };
    });
  }, [boards, baseDateISO, parsedBase]);

  const shorter = Math.min(width, height);
  const scale = Math.min(Math.max(shorter / 430, 1), 1.6);
  const GAP = 10 * scale;
  const EDGE = 16 * scale;
  const { baseStyles, metrics } = getCardBaseStyles(width, height);
  const containerWidth = Math.max(width - (EDGE + Math.max(insets.left, insets.right)) * 2, 240);
  const availableWidth = Math.max(containerWidth - (GAP * (numColumns - 1)), 240);
  const cardWidth = Math.min(metrics.cardWidth, availableWidth / numColumns);
  const cardStyles = {
    ...baseStyles,
    card: {
      ...baseStyles.card,
      width: cardWidth,
      marginHorizontal: 0,
      shadowOpacity: 0.35,
      shadowRadius: 3,
      elevation: 3,
    },
  };

  const data = useMemo(() => {
    if (isLandscape) {
      const dayCards = week.map((d) => ({ kind: "day", key: `day-${d.dayOffset}`, ...d }));
      const activityCards = week.map((d) => ({ kind: "activity", key: `act-${d.dayOffset}`, ...d }));
      return [...dayCards, ...activityCards];
    }

    // portrait: pair each day's svg card with its activity card per row
    return week.flatMap((d) => [
      { kind: "day", key: `day-${d.dayOffset}`, ...d },
      { kind: "activity", key: `act-${d.dayOffset}`, ...d },
    ]);
  }, [isLandscape, week]);

  const contentContainerStyle = {
    paddingTop: Math.max(insets.top, EDGE),
    paddingBottom: Math.max(insets.bottom, EDGE),
    paddingHorizontal: EDGE + Math.max(insets.left, insets.right),
    gap: GAP,
  };

  const columnWrapperStyle = numColumns > 1 ? { gap: GAP, justifyContent: "flex-start" } : undefined;

  const renderItem = ({ item }) => {
    const onPress = () => navigation.navigate(buildRouteForOffset(item.dayOffset), { baseDateISO });

    if (item.kind === "day") {
      return (
        <ActivityCard
          activity={{ image: item.DaySvg }}
          label=""
          onPress={onPress}
          styles={cardStyles}
          resolveActivityImage={(a) => a?.image || null}
          stroke={DAY_CARD_STROKE}
          svgWrapperStyle={{
            flex: 1,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: Math.min(width, height) * 0.012,
          }}
          svgStyle={{
            transform: [{ scale: 1.5 }],
          }}
        />
      );
    }

    return (
      <ActivityCard
        activity={item.activity}
        label="Add Activity"
        onPress={onPress}
        styles={cardStyles}
        resolveActivityImage={resolveActivityImage}
        stroke={ACTIVITY_CARD_STROKE}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={data}
        renderItem={renderItem}
        numColumns={numColumns}
        key={`cols-${numColumns}`}
        contentContainerStyle={contentContainerStyle}
        columnWrapperStyle={columnWrapperStyle}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

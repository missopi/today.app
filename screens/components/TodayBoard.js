// Visual layout for Now/Next boards

import { View } from "react-native";
import { activityLibrary } from "../../data/ActivityLibrary";
import ActivityCard from "./ActivityCard";

import Monday from "../../assets/days-of-the-week/monday.svg";
import Tuesday from "../../assets/days-of-the-week/tuesday.svg";
import Wednesday from "../../assets/days-of-the-week/wednesday.svg";
import Thursday from "../../assets/days-of-the-week/thursday.svg";
import Friday from "../../assets/days-of-the-week/friday.svg";
import Saturday from "../../assets/days-of-the-week/saturday.svg";
import Sunday from "../../assets/days-of-the-week/sunday.svg";

const DAY_SVGS = [Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday];
const DAY_CARD_STROKE = { color: "#3fb9ffff", width: 5, borderRadius: 20 };
const SVG_CARD_STROKE = { color: "#ffb53dff", width: 5, borderRadius: 20 };

const TodayBoard = ({ activity, onSelectSlot, readOnly, styles, date = new Date() }) => {
  const resolveActivityImage = (activity) => {
    if (!activity) return null;
    if (activity.fromLibrary && activity.imageKey) {
      const match = activityLibrary.find(a => a.id === activity.imageKey);
      return match ? match.image : null;
    }
    return activity.image || null;
  };

  const resolvedDate = date instanceof Date ? date : new Date(date);
  const dayIndex = resolvedDate.getDay();
  const TodaySvg = DAY_SVGS[dayIndex] ?? Sunday;
  const dayOfTheWeek = { image: TodaySvg };

  return (
    <View style={styles.container}> 
      <View style={styles.wrapper}> 
        <View style={styles.column}>
          <ActivityCard
            activity={dayOfTheWeek}
            label="Today"
            onPress={undefined}
            readOnly={true}
            styles={styles}
            resolveActivityImage={resolveActivityImage}
            svgWrapperStyle={styles.dayOfWeekSvgWrapper}
            svgStyle={styles.dayOfWeekSvg}
            stroke={DAY_CARD_STROKE}
          />
        </View>
        <View style={styles.column}>
          <ActivityCard
            activity={activity}
            label="Add Activity"
            onPress={() => onSelectSlot({ slot: "Activity" })}
            readOnly={readOnly}
            styles={styles}
            resolveActivityImage={resolveActivityImage}
            stroke={SVG_CARD_STROKE}
          />
        </View>
      </View>
    </View>
  );
};

export default TodayBoard;

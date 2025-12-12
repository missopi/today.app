// Visual layout for Now/Next boards

import { View } from "react-native";
import { activityLibrary } from "../../data/ActivityLibrary";
import ActivityCard from "./ActivityCard";

const TodayBoard = ({ dayOfTheWeek, activity, onSelectSlot, readOnly, styles }) => {
  const resolveActivityImage = (activity) => {
    if (!activity) return null;
    if (activity.fromLibrary && activity.imageKey) {
      const match = activityLibrary.find(a => a.id === activity.imageKey);
      return match ? match.image : null;
    }
    return activity.image || null;
  };

  return (
    <View style={styles.container}> 
      <View style={styles.wrapper}> 
        <View style={styles.column}>
          <ActivityCard
            activity={dayOfTheWeek}
            label="Add Today"
            onPress={() => onSelectSlot({ slot: "Today" })}
            readOnly={readOnly}
            styles={styles}
            resolveActivityImage={resolveActivityImage}
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
          />
        </View>
      </View>
    </View>
  );
};

export default TodayBoard;

import HomeScreen from "./HomeScreen";

export default function HomeScreenDay3({ navigation, route }) {
  const params = route?.params || {};
  return (
    <HomeScreen
      navigation={navigation}
      route={{ ...route, params: { ...params, dayOffset: 3 } }}
    />
  );
}


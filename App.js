import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Pressable, View, useWindowDimensions } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';

import LibraryScreen from "./screens/LibraryScreen";
import HomeScreen from "./screens/HomeScreen";
import HomeScreenDay1 from "./screens/HomeScreenDay1";
import HomeScreenDay2 from "./screens/HomeScreenDay2";
import HomeScreenDay3 from "./screens/HomeScreenDay3";
import HomeScreenDay4 from "./screens/HomeScreenDay4";
import HomeScreenDay5 from "./screens/HomeScreenDay5";
import HomeScreenDay6 from "./screens/HomeScreenDay6";

import Word from "./assets/andNext-today-words-cropped.svg";
import BackIcon from "./assets/icons/back_button.svg";

const Stack = createStackNavigator();

const getLocalISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function App() {
  const { width, height } = useWindowDimensions();
  const shorter = Math.min(width, height);

  useEffect(() => {
    const lockPhonePortrait = async () => {
      const isLargeScreen = shorter >= 600; // let tablets and larger devices rotate
      try {
        if (isLargeScreen) {
          await ScreenOrientation.unlockAsync();
        } else {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        }
      } catch (error) {
        console.warn('Could not adjust global orientation lock', error);
      }
    };

    lockPhonePortrait();
  }, [shorter]);

  const scale = Math.min(Math.max(shorter / 430, 1), 1.6);
  const iconSize = 50 * scale;
  const navIconSize = iconSize * 0.8;
  const headerSpace = 15 * scale;
  const wordWidth = 150 * scale; 
  const pageIconPaddingX = 12;
  const pageIconPaddingY = 8;

  const nextRouteByName = {
    Home: "HomeDay1",
    HomeDay1: "HomeDay2",
    HomeDay2: "HomeDay3",
    HomeDay3: "HomeDay4",
    HomeDay4: "HomeDay5",
    HomeDay5: "HomeDay6",
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={({ navigation, route }) => ({
              headerTitleAlign: "center",
              headerTitle: () => (
                <View style={{ pointerEvents: "none" }}>
                  <Word width={wordWidth} height={iconSize} style={{ marginBottom: 9 }} />
                </View>
              ),
              headerTitleContainerStyle: { left: 0, right: 0, alignItems: "center" },
              headerStyle: {
                height: 72 + headerSpace * 3,
                backgroundColor: "#fff",
                borderBottomWidth: 0,
                elevation: 0,
                shadowOpacity: 0,
                shadowRadius: 0,
                shadowOffset: { width: 0, height: 0 },
              },
              headerLeft: () => {
                if (route.name === "Home" || !navigation.canGoBack()) return null;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    onPress={() => navigation.goBack()}
                    hitSlop={10}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.6 : 1,
                      paddingHorizontal: pageIconPaddingX,
                      paddingVertical: pageIconPaddingY,
                    })}
                  >
                    <BackIcon width={navIconSize} height={navIconSize} />
                  </Pressable>
                );
              },
              headerRight: () => {
                const nextRoute = nextRouteByName[route.name];
                if (!nextRoute) return null;

                const baseDateISO = route.params?.baseDateISO ?? getLocalISODate(new Date());

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Next day"
                    onPress={() => navigation.navigate(nextRoute, { baseDateISO })}
                    hitSlop={10}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.6 : 1,
                      paddingHorizontal: pageIconPaddingX,
                      paddingVertical: pageIconPaddingY,
                    })}
                  >
                    <BackIcon
                      width={navIconSize}
                      height={navIconSize}
                      style={{ transform: [{ scaleX: -1 }] }}
                    />
                  </Pressable>
                );
              },
            })}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{
                headerLeft: () => null,
              }}
            />
            <Stack.Screen name="HomeDay1" component={HomeScreenDay1} />
            <Stack.Screen name="HomeDay2" component={HomeScreenDay2} />
            <Stack.Screen name="HomeDay3" component={HomeScreenDay3} />
            <Stack.Screen name="HomeDay4" component={HomeScreenDay4} />
            <Stack.Screen name="HomeDay5" component={HomeScreenDay5} />
            <Stack.Screen name="HomeDay6" component={HomeScreenDay6} />
            <Stack.Screen 
              name="LibraryScreen" 
              component={LibraryScreen}
              options={{
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView> 
  );
}

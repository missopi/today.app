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

import Word from "./assets/andNext-today-words-cropped.svg";
import BackIcon from "./assets/icons/back_button.svg";

const Stack = createStackNavigator();

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
  const iconSize = 45 * scale;
  const headerSpace = 10 * scale;
  const wordWidth = 150 * scale; 

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
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    })}
                  >
                    <BackIcon width={iconSize} height={iconSize} />
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
            <Stack.Screen 
              name="LibraryScreen" 
              component={LibraryScreen}
              options={{
                headerShown: true,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView> 
  );
}

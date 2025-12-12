import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, useWindowDimensions } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';

import LibraryScreen from "./screens/LibraryScreen";
import HomeScreen from "./screens/HomeScreen";

import Word from "./assets/andNext-today-words-cropped.svg";

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
  const iconSize = 30 * scale;
  const headerSpace = 10 * scale;
  const wordWidth = 150 * scale; 

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Home"
            screenOptions={{ headerMode: 'screen' }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={({ navigation }) => ({ 
                headerTitle: '',
                headerStyle: {
                  height: 72 + headerSpace * 3,
                },
                headerLeft: () => (
                  <View style={{ pointerEvents: 'none' }}>
                    <Word width={wordWidth} height={iconSize} style={{ marginLeft: 8, marginBottom: 9 }} />
                  </View>
                ),
              })}
            />
            <Stack.Screen 
              name="LibraryScreen" 
              component={LibraryScreen}
              options={() => ({
              headerTransparent: true,
              headerShown: false,
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView> 
  );
}

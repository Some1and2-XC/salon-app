import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { User } from "./db/index.ts";

// Screen imports
import { ExampleHome } from "./pages/index.tsx";
import { BookingScreen } from "./pages/booking.js";
import { CheckinScreen } from "./pages/checkin.js";
import { CheckinConfirmScreen } from "./pages/checkinConfirm.js";
import { HomeScreen } from "./pages/home.js";
import { LoginScreen } from "./pages/login.js";
import { SignupScreen } from "./pages/signup.js";

const Stack = createStackNavigator();

import {
    NAV_EXAMPLE_HOME,
    NAV_BOOKING,
    NAV_CHECKIN,
    NAV_CHECKINCONFIRM,
    NAV_HOME,
    NAV_LOGIN,
    NAV_SIGNUP

} from "./consts.ts";

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={ NAV_EXAMPLE_HOME }>

        <Stack.Screen name={ NAV_EXAMPLE_HOME } component={ ExampleHome } />

        <Stack.Screen name={ NAV_BOOKING } component={ BookingScreen } />
        <Stack.Screen name={ NAV_CHECKIN } component={ CheckinScreen } />
        <Stack.Screen name={ NAV_CHECKINCONFIRM } component={ CheckinConfirmScreen } />
        <Stack.Screen name={ NAV_HOME } component={ HomeScreen } />
        <Stack.Screen name={ NAV_LOGIN } component={ LoginScreen } />
        <Stack.Screen name={ NAV_SIGNUP } component={ SignupScreen } />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

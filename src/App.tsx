import { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { User as FBUser, onAuthStateChanged } from 'firebase/auth';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { auth } from "./firebaseConfig";

import { User } from "./db/index";
import { sty } from "./styles";

// Screen imports
import { ExampleHome } from "./pages/index";
import { BookingScreen } from "./pages/booking";
import { CheckinScreen } from "./pages/checkin";
import { CheckinConfirmScreen } from "./pages/checkinConfirm";
import { HomeScreen } from "./pages/home";
import { LoginScreen } from "./pages/login";
import { SignupScreen } from "./pages/signup";
import { QRScreen } from "./pages/qr-generator"
const Stack = createStackNavigator();

import {
    NAV_EXAMPLE_HOME,
    NAV_BOOKING,
    NAV_CHECKIN,
    NAV_CHECKINCONFIRM,
    NAV_HOME,
    NAV_LOGIN,
    NAV_SIGNUP,
    NAV_QR
} from "./consts";

export default function App() {

  const [user, setUser] = useState<FBUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      // const uid = user.uid;
      setUser(user);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  // Doesn't render until we know if the user is logged in or not.
  // May be replaced with a spinner in the future.
  if (!authReady) return null;

  // Sets the initial route.
  // Thought should be put into if the default unauthenticated screen should be the login screen
  // or signup (I think login is a sensible default).
  // const initialRoute: string = user ? NAV_EXAMPLE_HOME : NAV_LOGIN;
  const initialRoute: string = NAV_EXAMPLE_HOME; // for debugging and dev purposes

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={ initialRoute }>

        <Stack.Screen name={ NAV_EXAMPLE_HOME } component={ ExampleHome } />
        <Stack.Screen name={ NAV_BOOKING } component={ BookingScreen } />
        <Stack.Screen name={ NAV_CHECKIN } component={ CheckinScreen } />
        <Stack.Screen name={ NAV_CHECKINCONFIRM } component={ CheckinConfirmScreen } />
        <Stack.Screen name={ NAV_HOME } component={ HomeScreen } />
        <Stack.Screen name={ NAV_LOGIN } component={ LoginScreen } />
        <Stack.Screen name={ NAV_SIGNUP } component={ SignupScreen } />
        <Stack.Screen name={ NAV_QR } component={ QRScreen } /> 

        {/*

        // Can be used for only allowing some screens to be reached while logged in.
        // May be replaced with some "screen" class that has the
        //  - Route Name
        //  - Route Element
        //  - Authentication Requirements (i.e. admin/user/unauthenticated)

        {user ? (<>
          <Stack.Screen name={ NAV_EXAMPLE_HOME } component={ ExampleHome } />
          <Stack.Screen name={ NAV_BOOKING } component={ BookingScreen } />
          <Stack.Screen name={ NAV_CHECKIN } component={ CheckinScreen } />
          <Stack.Screen name={ NAV_CHECKINCONFIRM } component={ CheckinConfirmScreen } />
          <Stack.Screen name={ NAV_HOME } component={ HomeScreen } />
        </>) : (<>
          <Stack.Screen name={ NAV_LOGIN } component={ LoginScreen } />
          <Stack.Screen name={ NAV_SIGNUP } component={ SignupScreen } />
        </>)}

        */}

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

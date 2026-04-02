import { useState, useEffect } from 'react';

import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
// Shows behind buttons
import * as NavigationBar from "expo-navigation-bar";

import { User as FBUser, onAuthStateChanged } from 'firebase/auth';

import { auth } from "./firebaseConfig";
import { sty } from "./styles";

// Screen imports
import { ExampleHome } from "./pages/index";
import { BookingScreen } from "./pages/booking";
import { CheckinScreen } from "./pages/checkin";
import { CheckinConfirmScreen } from "./pages/checkinConfirm";
import { AdminCheckinConfirm } from "./pages/adminCheckinConfirm";
import { AdminCheckinConfirmList } from "./pages/adminCheckinConfirmList";
import { HomeScreen } from "./pages/home";
import { LoginScreen } from "./pages/login";
import { SignupScreen } from "./pages/signup";
import { AdminAppointmentTypesScreen } from "./pages/appTypes";
import { BarcodeScannerScreen } from "./pages/barcodeScanner";
import { QRScreen } from './pages/qrGenerator';
import { AdminHomepageScreen } from './pages/adminHomepage';
import { AddEmployeeScreen } from './pages/addEmployee';

const Stack = createStackNavigator();

import {
        NAV_EXAMPLE_HOME,
        NAV_BOOKING,
        NAV_CHECKIN,
        NAV_CHECKINCONFIRM,
        NAV_CHECKIN_CONFIRM_ADMIN,
        NAV_CHECKIN_CONFIRM_ADMIN_LIST,
        NAV_HOME,
        NAV_LOGIN,
        NAV_SIGNUP,
        NAV_APP_TYPES,
        NAV_QR,
        NAV_BARCODE_SCANNER,
        NAV_ADMIN_HOMEPAGE,
        NAV_ADD_EMPLOYEE
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
    // const initialRoute: string = user ? NAV_HOME : NAV_LOGIN;
    const initialRoute: string = NAV_EXAMPLE_HOME; // for debugging and dev purposes

    return (<SafeAreaProvider>
        <SafeAreaView style={{ flex: 1}} edges={["left", "right"]}>
            <StatusBar translucent backgroundColor="transparent" />
            <NavigationContainer>
                <Stack.Navigator initialRouteName={ initialRoute }
                    screenOptions={{ headerShown: false }}
                >

                    <Stack.Screen
                        name={ NAV_EXAMPLE_HOME }
                        component={ ExampleHome }
                        // options={{ headerShown: false }}
                        />
                    <Stack.Screen name={ NAV_BOOKING } component={ BookingScreen } />
                    <Stack.Screen name={ NAV_CHECKIN } component={ CheckinScreen } />
                    <Stack.Screen name={ NAV_CHECKINCONFIRM } component={ CheckinConfirmScreen } />
                    <Stack.Screen name={ NAV_CHECKIN_CONFIRM_ADMIN } component={ AdminCheckinConfirm } />
                    <Stack.Screen name={ NAV_CHECKIN_CONFIRM_ADMIN_LIST } component={ AdminCheckinConfirmList } />
                    <Stack.Screen name={ NAV_HOME } component={ HomeScreen } />
                    <Stack.Screen name={ NAV_LOGIN } component={ LoginScreen } />
                    <Stack.Screen name={ NAV_SIGNUP } component={ SignupScreen } />
                    <Stack.Screen name={ NAV_APP_TYPES } component={ AdminAppointmentTypesScreen } />
                    <Stack.Screen name={ NAV_QR } component={ QRScreen} />
                    <Stack.Screen name={ NAV_BARCODE_SCANNER } component={BarcodeScannerScreen} />
                    <Stack.Screen name={ NAV_ADMIN_HOMEPAGE } component={AdminHomepageScreen} />
                    <Stack.Screen name={ NAV_ADD_EMPLOYEE } component={AddEmployeeScreen} />

                    {/*

                    // Can be used for only allowing some screens to be reached while logged in.
                    // May be replaced with some "screen" class that has the
                    //    - Route Name
                    //    - Route Element
                    //    - Authentication Requirements (i.e. admin/user/unauthenticated)

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
        </SafeAreaView>

    </SafeAreaProvider>);
}

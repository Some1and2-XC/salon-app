import { useState, useEffect, useMemo } from "react";

import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
// Shows behind buttons
import * as NavigationBar from "expo-navigation-bar";

import { User as FBUser, onAuthStateChanged } from "firebase/auth";
import Toast from "react-native-toast-message";

import { auth } from "./firebaseConfig";
import { sty, useTheme } from "./styles";

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
import { QRScreen } from "./pages/qrGenerator";
import { AdminHomepageScreen } from "./pages/adminHomepage";
import { AddEmployeeScreen } from "./pages/addEmployee";
import { SetAvailabilityScreen } from "./pages/setAvailability";
import { SetThemeScreen } from "./pages/setTheme";

const Stack = createStackNavigator();

import {
    NAV_EXAMPLE_HOME,
    NAV_BOOKING,
    NAV_CHECKIN,
    NAV_CHECKINCONFIRM,
    NAV_CHECKIN_CONFIRM_ADMIN,
    NAV_CHECKIN_CONFIRM_ADMIN_LIST,
    NAV_CHECKIN_APPOINTMENT_CONFIRM,
    NAV_HOME,
    NAV_LOGIN,
    NAV_SIGNUP,
    NAV_APP_TYPES,
    NAV_QR,
    NAV_BARCODE_SCANNER,
    NAV_ADMIN_HOMEPAGE,
    NAV_ADD_EMPLOYEE,
    NAV_SET_AVAILABILITY,
    NAV_SET_THEME,
} from "./consts";

import { colorSchemeDefault, MAP_COLOR_SCHEME } from "./colorScheme";

export default function App() {
    // Inits scheme from storage
    useEffect(() => {
        useTheme.getState().loadScheme();
    }, [useTheme]);

    const commonUi = useTheme((state) => state.getCommonUi)();
    const scheme = useTheme((state) => state.scheme);
    const colorScheme = MAP_COLOR_SCHEME[scheme] ?? colorSchemeDefault;

    const [user, setUser] = useState<FBUser | null>(null);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setAuthReady(true);
        });

        return unsub;
    }, []);

    // Sets the initial route.
    // Thought should be put into if the default unauthenticated screen should be the login screen
    // or signup (I think login is a sensible default).
    // const initialRoute: string = user ? NAV_HOME : NAV_LOGIN;
    const initialRoute: string = NAV_EXAMPLE_HOME; // for debugging and dev purposes

    // Doesn't render until we know if the user is logged in or not.
    // May be replaced with a spinner in the future.
    if (!authReady) return null;

    const navTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: colorScheme.pageBackground,
        },
    };

    return (
        <GestureHandlerRootView>
        <SafeAreaProvider>
            <SafeAreaView
                style={commonUi.screen.safeArea}
                edges={["left", "right", "top", "bottom"]}
            >
                <StatusBar translucent backgroundColor="transparent" />

                <NavigationContainer theme={navTheme}>
                    <Stack.Navigator
                        initialRouteName={initialRoute}
                        screenOptions={{ headerShown: false }}
                    >
                        <Stack.Screen
                            name={NAV_EXAMPLE_HOME}
                            component={ExampleHome}
                            options={{ title: "Dev-Home"}}
                        />
                        <Stack.Screen
                            name={NAV_BOOKING}
                            component={BookingScreen}
                            options={{ title: "Salon - Booking"}}
                        />
                        <Stack.Screen
                            name={NAV_CHECKIN}
                            component={CheckinScreen}
                            options={{ title: "Salon - Check-In"}}
                        />
                        <Stack.Screen
                            name={NAV_CHECKINCONFIRM}
                            component={CheckinConfirmScreen}
                            options={{ title: "Salon - Check-In Confirmation"}}
                        />
                        <Stack.Screen
                            name={NAV_CHECKIN_CONFIRM_ADMIN}
                            component={AdminCheckinConfirm}
                            options={{ title: "Salon - Check-In Confirmation"}}
                        />
                        <Stack.Screen
                            name={NAV_CHECKIN_CONFIRM_ADMIN_LIST}
                            component={AdminCheckinConfirmList}
                            options={{ title: "Salon - Check-In Final"}}
                        />
                        <Stack.Screen
                            name={NAV_CHECKIN_APPOINTMENT_CONFIRM}
                            component={AdminCheckinConfirmList}
                            options={{ title: "Salon - Appointment Confirmation"}}
                        />
                        <Stack.Screen
                            name={NAV_HOME}
                            component={HomeScreen}
                            options={{ title: "Salon"}}
                        />
                        <Stack.Screen
                            name={NAV_LOGIN}
                            component={LoginScreen}
                            options={{ title: "Salon - Login"}}
                        />
                        <Stack.Screen
                            name={NAV_SIGNUP}
                            component={SignupScreen}
                            options={{ title: "Salon - Sign Up"}}
                        />
                        <Stack.Screen
                            name={NAV_APP_TYPES}
                            component={AdminAppointmentTypesScreen}
                            options={{ title: "Salon - Appointment Types Administration"}}
                        />
                        <Stack.Screen
                            name={NAV_QR}
                            component={QRScreen}
                            options={{ title: "Salon - Check-In QR Code"}}
                        />
                        <Stack.Screen
                            name={NAV_BARCODE_SCANNER}
                            component={BarcodeScannerScreen}
                            options={{ title: "Salon - Check-In QR Scanner"}}
                        />
                        <Stack.Screen
                            name={NAV_ADMIN_HOMEPAGE}
                            component={AdminHomepageScreen}
                            options={{ title: "Salon - Admin Home"}}
                        />
                        <Stack.Screen
                            name={NAV_SET_THEME}
                            component={SetThemeScreen}
                            options={{ title: "Salon - Set Theme"}}
                        />
                        <Stack.Screen
                            name={NAV_ADD_EMPLOYEE}
                            component={AddEmployeeScreen}
                            options={{ title: "Salon - Employee Administration"}}
                        />
                        <Stack.Screen
                            name={NAV_SET_AVAILABILITY}
                            component={SetAvailabilityScreen}
                            options={{ title: "Salon - Employee Availability"}}
                        />
                    </Stack.Navigator>
                    <Toast />
                </NavigationContainer>
            </SafeAreaView>
        </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

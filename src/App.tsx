import { useState, useEffect, useMemo } from "react";

import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
// Shows behind buttons
import * as NavigationBar from "expo-navigation-bar";

import { User as FBUser, onAuthStateChanged } from "firebase/auth";

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

import { MAP_COLOR_SCHEME } from "./colorScheme";

export default function App() {
    // Inits scheme from storage
    useEffect(() => {
        useTheme.getState().loadScheme();
    }, [useTheme]);

    const commonUi = useTheme((state) => state.getCommonUi)();
    const scheme = useTheme((state) => state.scheme);
    const colorScheme = MAP_COLOR_SCHEME[scheme] ?? colorSchemeBrown;

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
        <SafeAreaProvider>
            <SafeAreaView
                style={commonUi.screen.safeArea}
                edges={["left", "right"]}
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
                            // options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name={NAV_BOOKING}
                            component={BookingScreen}
                        />
                        <Stack.Screen
                            name={NAV_CHECKIN}
                            component={CheckinScreen}
                        />
                        <Stack.Screen
                            name={NAV_CHECKINCONFIRM}
                            component={CheckinConfirmScreen}
                        />
                        <Stack.Screen
                            name={NAV_CHECKIN_CONFIRM_ADMIN}
                            component={AdminCheckinConfirm}
                        />
                        <Stack.Screen
                            name={NAV_CHECKIN_CONFIRM_ADMIN_LIST}
                            component={AdminCheckinConfirmList}
                        />
                        <Stack.Screen name={NAV_HOME} component={HomeScreen} />
                        <Stack.Screen
                            name={NAV_LOGIN}
                            component={LoginScreen}
                        />
                        <Stack.Screen
                            name={NAV_SIGNUP}
                            component={SignupScreen}
                        />
                        <Stack.Screen
                            name={NAV_APP_TYPES}
                            component={AdminAppointmentTypesScreen}
                        />
                        <Stack.Screen name={NAV_QR} component={QRScreen} />
                        <Stack.Screen
                            name={NAV_BARCODE_SCANNER}
                            component={BarcodeScannerScreen}
                        />
                        <Stack.Screen
                            name={NAV_ADMIN_HOMEPAGE}
                            component={AdminHomepageScreen}
                        />
                        <Stack.Screen
                            name={NAV_ADD_EMPLOYEE}
                            component={AddEmployeeScreen}
                        />
                        <Stack.Screen
                            name={NAV_SET_AVAILABILITY}
                            component={SetAvailabilityScreen}
                        />
                        <Stack.Screen
                            name={NAV_SET_THEME}
                            component={SetThemeScreen}
                        />

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
        </SafeAreaProvider>
    );
}

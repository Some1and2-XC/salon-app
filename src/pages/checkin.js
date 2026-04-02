import { useEffect } from "react";
import { Text, View, Button } from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { apiFetch } from "../utils";
import { showAppToast } from "../toastUtils";

import {
    NAV_QR,
    NAV_LOGIN,
    NAV_EXAMPLE_HOME,
    TOAST_TYPE_SUCCESS,
    TOAST_TYPE_ERROR,
    TOAST_TYPE_INFO,
} from "../consts";

import { sty } from "../styles";

export function CheckinScreen({ navigation }) {

    const returnToHomePage = () => {
        navigation.navigate(NAV_EXAMPLE_HOME);
    };

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigation.navigate(NAV_LOGIN);
            }
        });

        return unsubscribe;
    }, [navigation]);

    const handleGenerateQR = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            navigation.navigate(NAV_LOGIN);
            return;
        }

        const res = await apiFetch("/appointments");

        if (!res.ok) {
            console.log("Error status", res.status);
            return;
        }

        const data = await res.json();

        if (!data || data.length === 0) {
            showAppToast(
                TOAST_TYPE_WARNING,
                "No Appointment",
                "You must book an appointment before checking in."
            );
            return;
        }

        navigation.navigate(NAV_QR, { data });
    };

    return (
        <View style={sty.container}>

            <Text style={sty.h1}>Check In</Text>

            <Button
                title="HOME"
                onPress={returnToHomePage}
            />

            <Button
                title="QR Code"
                onPress={handleGenerateQR}
            />

            {/* Temporary testing button */}

            <Button title="Toast Success" onPress={() => showAppToast(TOAST_TYPE_SUCCESS , "Header", "Content")} />
            <Button title="Toast Error"   onPress={() => showAppToast(TOAST_TYPE_ERROR   , "Header", "Content")} />
            <Button title="Toast Info"    onPress={() => showAppToast(TOAST_TYPE_INFO    , "Header", "Content")} />

        </View>
    );
}

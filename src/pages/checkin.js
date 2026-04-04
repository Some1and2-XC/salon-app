import { useEffect } from "react";
import { Text, View, Button } from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { apiFetch, showAppToast } from "../utils";

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

    const handleGenerateQR = async() => {

        apiFetch(`/appointments`)
            .then((res) => res.json())
            // TODO replace with global popup handler (or just remove)
            .then((res) => {
                if (!data || data.length == 0) {
                    if(Platform.OS === 'web') {
                        alert('You must book an appointment before checking in');
                    }
                    else {
                        Toast.show({
                            type: 'info',
                            text1: 'No Appointment',
                            text2: 'You must book an appointment before checking in'
                        });
                    }
                    return;
                }
                return res;
            })
            .then((res) => navigation.navigate(NAV_QR, { data: data }))
            .catch((error) => showAppToast(TOAST_TYPE_ERROR, `Getting Appointments Failed! Error: \`${error}\``))
            ;

    }

    return (
        <View style={sty.container}>

            <Text style={sty.h1}>Check In</Text>
            {/* TODO make this a list of user appointments */}
            <Button style={sty.button} title={"QR Code"} onPress={handleGenerateQR} />
        </View>
    );
}

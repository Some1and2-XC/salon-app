import { useEffect } from 'react';
import { StyleSheet, Text, View, Button, Platform } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { apiFetch } from "../utils";
import Toast from 'react-native-toast-message';

import {
    NAV_QR,
    NAV_LOGIN,
    NAV_EXAMPLE_HOME
} from "../consts";

import { sty } from "../styles";

export function CheckinScreen({ navigation }) {

    const handleGenerateQR = async() => {
        const auth = getAuth();
        const user = auth.currentUser;

        if(!user) {
            // Maybe add something that lets users know that they should be logged in to view their QR codes
            navigation.navigate(NAV_LOGIN);
            return;
        }

        try {

            const res = await apiFetch('/appointments');
            const data = await res.json();

            // TODO replace with global popup handler (or just remove

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

            navigation.navigate(NAV_QR, { data: data })
        }
        catch(e) {
            // TODO replace with global popup handler.
            console.error("Error: ", e);
        }

    }

    return (
        <View style={sty.container}>
            <Text style={sty.h1}>Check In</Text>
            {/* TODO make this a list of user appointments */}
            <Button style={sty.button} title={"QR Code"} onPress={handleGenerateQR} />
        </View>
    );
}

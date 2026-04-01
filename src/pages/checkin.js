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

    const returnToHomePage = () => {
        navigation.navigate(NAV_EXAMPLE_HOME);
    };

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if(!user) {
                navigation.navigate(NAV_LOGIN);
                return;
            }
        });

        return unsubscribe;
    }, []);

    const handleGenerateQR = async() => {
        const auth = getAuth();
        const user = auth.currentUser;

        const token = await user.getIdToken();

        const res = await apiFetch(`/appointments`);

        if(!res.ok) {
            console.log("Error status", res.status);
            return;
        }

        const data = await res.json();

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
        console.log(data);

        navigation.navigate(NAV_QR, { data: data });
    }

    return (
        <View style={sty.container}>
            <Text style={sty.h1}>Check In</Text>
            <Button style={sty.button} title={"HOME"} onPress={returnToHomePage} />
            <Button style={sty.button} title={"QR Code"} onPress={handleGenerateQR} />
        </View>
    );
}

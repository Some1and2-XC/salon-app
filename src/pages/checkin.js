import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Touchable, Platform } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { apiFetch } from "../utils";
import Toast from 'react-native-toast-message';

import {
    NAV_QR,
    NAV_LOGIN
} from "../consts";

export function CheckinScreen({ navigation }) {

    const [message, setMessage] = useState('');

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

    //const fakeUser = { uid: "test123" }; use to test qr generation without logging in

    const handleGenerateQR = async() => {
        console.warn("test");
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

        navigation.navigate(NAV_QR, { userID: user.uid });
    }

    return (
        <View>
            <Text>Check In</Text>
            <TouchableOpacity onPress={handleGenerateQR}>
                <Text>Show My QR Code</Text>
            </TouchableOpacity>
        </View>
    );
}

import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Touchable } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import {
    NAV_QR,
    NAV_LOGIN
} from "../consts";

export function CheckinScreen({ navigation }) {

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

    const handleGenerateQR = () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if(!user) {
            navigation.navigate(NAV_LOGIN);
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

import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Button } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { apiFetch } from "../utils";
import Toast from 'react-native-toast-message';

import {
    NAV_QR,
    NAV_LOGIN,
    NAV_EXAMPLE_HOME
} from "../consts";

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

    //const fakeUser = { uid: "test123" }; use to test qr generation without logging in

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

        navigation.navigate(NAV_QR, { userID: user.uid });
    }

    return (
        <View style={styles.container}>
            <View style={styles.titleWrapper}>
                <Text style={styles.title}>Check In</Text>
            </View>
            <View style={styles.contentWrapper}>
                <TouchableOpacity style={styles.Button} onPress={returnToHomePage}>
                    <Text style={styles.ButtonText}>HOME</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.Button} onPress={handleGenerateQR}>
                    <Text style={styles.ButtonText}>SHOW MY QR CODE</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    titleWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        height: 100,
    },
    title: {
        fontSize: 35,
        fontWeight: 600
    },
    contentWrapper: {
        marginTop: 20,
        flex: 1,
        alignItems: 'center',
    },
    Button: {
        width: '90%',
        padding: 15,
        backgroundColor: '#007BFF',
        alignItems: 'center'
    },
    ButtonText: {
        color: 'white',
        fontWeight: 500
    }
});

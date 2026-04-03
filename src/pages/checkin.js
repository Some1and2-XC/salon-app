import { useEffect, useState } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { apiFetch } from "../utils";
import Toast from 'react-native-toast-message';

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

    const [loading, setLoading] = useState(false);

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
    }, []);

    const handleGenerateQR = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                navigation.navigate(NAV_LOGIN);
                return;
            }

            const token = await user.getIdToken();

            const res = await apiFetch(`/appointments`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                console.log("Error status", res.status);
                return;
            }

            const data = await res.json();

            if (!data || data.length === 0) {
                if (Platform.OS === 'web') {
                    alert('You must book an appointment before checking in');
                } else {
                    Toast.show({
                        type: 'info',
                        text1: 'No Appointment',
                        text2: 'You must book an appointment before checking in'
                    });
                }
                return;
            }

            const appointment = data[0];

            navigation.navigate(NAV_QR, {
                userId: user.uid,
                appointmentId: appointment.id || appointment._id
            });

        } catch (err) {
            console.error(err);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={sty.container}>

            <Text style={sty.h1}>Check In</Text>

            <Button title="HOME" onPress={returnToHomePage} />
            <Button
                title={loading ? "Loading..." : "QR Code"}
                onPress={handleGenerateQR}
            />
        </View>
    );
}
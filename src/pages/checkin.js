import { useEffect, useState } from 'react';
import { Text, Platform, FlatList, TouchableOpacity, View, StyleSheet } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { apiFetch } from "../utils";
import Toast from 'react-native-toast-message';

import {
    NAV_QR,
    NAV_LOGIN,
} from "../consts";

import { sty } from "../styles";

export function CheckinScreen({ navigation }) {

    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigation.navigate(NAV_LOGIN);
                return;
            }

            fetchAppointments(user);
        });

        return unsubscribe;
    }, []);

    const fetchAppointments = async (user) => {
        try {
            const token = await user.getIdToken();

            const res = await apiFetch('/appointments', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

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

            setAppointments(data);

        } catch (e) {
            console.error(e);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to fetch appointments'
            });
        }
    };

    const renderItem = ({ item }) => {
        const formattedDate = new Date(item.start_time * 1000).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() =>
                    navigation.navigate(NAV_QR, {
                        userId: item.user_id,
                        appointmentId: item.id || item._id
                    })
                }
            >
                <Text style={styles.title}>Appointment</Text>
                <Text>{formattedDate}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={sty.container}>
            <Text style={sty.h1}>Check In</Text>

            <FlatList
                data={appointments}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 15,
        marginVertical: 8,
        backgroundColor: "#eee",
        borderRadius: 10
    },
    title: {
        fontWeight: "bold"
    }
});
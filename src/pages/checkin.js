import { useEffect, useState } from "react";
import { Text, View, FlatList, TouchableOpacity, Platform } from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { apiFetch } from "../utils";
import Toast from "react-native-toast-message";

import {
    NAV_QR,
    NAV_LOGIN,
} from "../consts";

import { sty } from "../styles";

export function CheckinScreen({ navigation }) {

    const [appointments, setAppointments] = useState([]);

    // Auth check
    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigation.navigate(NAV_LOGIN);
            }
        });

        return unsubscribe;
    }, []);

    // Fetch appointments
    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            navigation.navigate(NAV_LOGIN);
            return;
        }

        apiFetch(`/appointments`)
            .then((res) => res.json())
            .then((data) => {

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
            })
            .catch(console.error);

    }, []);

    // Render appointment
    const renderItem = ({ item }) => {
        const formattedDate = new Date(item.start_time * 1000).toLocaleString();

        return (
            <TouchableOpacity
                style={sty.card}
                onPress={() =>
                    navigation.navigate(NAV_QR, {
                        userId: item.user_id,
                        appointmentId: item.id || item._id
                    })
                }
            >
                <Text>Appointment</Text>
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
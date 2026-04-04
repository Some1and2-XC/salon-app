import { useEffect, useState } from 'react';
import { Text, FlatList, TouchableOpacity, View, StyleSheet } from 'react-native';
import { apiFetch, assertFetchSuccessful, showAppToast } from "../utils";

import {
    NAV_QR,
    TOAST_TYPE_SUCCESS,
    TOAST_TYPE_ERROR
} from "../consts";

import { sty } from "../styles";

export function CheckinScreen({ navigation }) {

    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        let cancelled = false;

        apiFetch(`/appointments`)
            .then(assertFetchSuccessful)
            .then((res) => res.json())
            .then((data) => {
                if (cancelled) return;
                if (!data || data.length === 0) {
                    showAppToast(TOAST_TYPE_SUCCESS, "Oops!", "You have no appointments");
                    return;
                }
                setAppointments(data);
            })
            .catch((err) => {
                if(!cancelled) {
                    console.error(err);
                    showAppToast(TOAST_TYPE_ERROR, "Oops!", err.message || "Something went wrong");
                }
            });
            
            return () => { cancelled = true; };
    }, []);

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
                        appointment: item
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
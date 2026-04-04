import { useEffect, useState } from 'react';
import { Text, Platform, FlatList, TouchableOpacity, View, StyleSheet, Alert } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { apiFetch, assertFetchSuccessful } from "../utils";

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
        const token = await user.getIdToken();

        apiFetch(`/appointments`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(assertFetchSuccessful)
            .then((res) => res.json())
            .then((data) => {
                if (!data || data.length === 0) {
                    //Integrate toast message
                    return;
                }
                setAppointments(data);
            })
            .catch((err) => {
                console.error(err);
                Alert.alert("Server Error", err.message || "Something went wrong");
            });              
    }

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
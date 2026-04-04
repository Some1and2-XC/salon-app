import { useEffect, useState } from 'react';
import { Text, FlatList, TouchableOpacity, View, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { apiFetch, assertFetchSuccessful, showAppToast } from "../utils";

import {
    NAV_QR,
    NAV_LOGIN,
} from "../consts";

import { sty } from "../styles";

export function CheckinScreen({ navigation }) {

    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const fetchAppointments = async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            
            if (!user) {
                navigation.navigate(NAV_LOGIN);
                return;
            }
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
                        showAppToast(0, "Oops!", "You have no appointments");
                        return;
                    }
                    setAppointments(data);
                })
                .catch((err) => {
                    console.error(err);
                    showAppToast(1, "Oops!", err.message || "Something went wrong");
                });   
            }   
            
            fetchAppointments();       
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
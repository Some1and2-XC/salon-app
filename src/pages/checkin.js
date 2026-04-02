import { useEffect, useState } from 'react';
import { Text, Platform, FlatList, TouchableOpacity, View, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { apiFetch } from "../utils";
import Toast from 'react-native-toast-message';

import {
    NAV_QR,
    NAV_LOGIN,
} from "../consts";

import { sty } from "../styles";
import { commonUi } from '../styles';

export function CheckinScreen({ navigation }) {

    const [appointments, setAppointments] = useState([]);

    useEffect(()=> {
        const fetchAppointments = async() => {
            const auth = getAuth();
            const user = auth.currentUser;

            if(!user) {
                // Maybe add something that lets users know that they should be logged in to view their QR codes
                navigation.navigate(NAV_LOGIN);
                return;
            }

            try {

                const res = await apiFetch('/appointments');
                const data = await res.json();

                // TODO replace with global popup handler (or just remove

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

                setAppointments(data);
            }
            catch(e) {
                // TODO replace with global popup handler.
                console.error(e);
            }
        };
        fetchAppointments();
    }, []);

    const renderItem = ({ item }) => {
        const formattedDate = new Date(item.start_time * 1000).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
        })
        return (
            <TouchableOpacity
                style={styles.formCard}
                onPress={() => navigation.navigate(NAV_QR, { appointment: item })}
            >
                <Text>{"Appointment"}</Text>
                <Text>{formattedDate}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={sty.container}>
            <Text style={sty.h1}>Check In</Text>
            {/* TODO make this a list of user appointments */}
            <FlatList
                data={appointments}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    formCard: commonUi.auth.formCard
});


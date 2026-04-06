import { useEffect, useMemo, useState } from 'react';
import { Text, FlatList, Pressable, View, StyleSheet } from 'react-native';
import { apiFetch, assertFetchSuccessful, showAppToast } from "../utils";
import {
    APPOINTMENT_STATE_MAPPINGS,
    NAV_QR,
    NAV_HOME,
    TOAST_TYPE_SUCCESS,
    TOAST_TYPE_ERROR,
    APPOINTMENT_STATE_UNCONFIRMED,
    APPOINTMENT_STATE_ACCEPTED,
    APPOINTMENT_STATE_CONFIRMED,
    APPOINTMENT_STATE_CANCELLED,
    APPOINTMENT_STATE_COMPLETED,
} from "../consts";
import { useTheme } from "../styles";
import { colorSchemeGreens } from "../colorScheme";
import { BackButton } from "../components/BackButton";

export function CheckinScreen({ navigation }) {

    const commonUi = useTheme((state) => state.getCommonUi)();
    const colorScheme = useTheme((state) => state.getScheme)() ?? colorSchemeGreens;
    const styles = useMemo(() => makeStyles(colorScheme), [colorScheme]);

    const [appointments, setAppointments] = useState([]);
    const [appointmentsSorted, setAppointmentsSorted] = useState([]);


    // Effect that gets triggered per update of the appointment data.
    // This is used to always have the data sorted.
    useEffect(() => {
        if (!appointments) return;
        const appointment_state_id_order = [
            APPOINTMENT_STATE_ACCEPTED,
            APPOINTMENT_STATE_CONFIRMED,
            APPOINTMENT_STATE_UNCONFIRMED,
            APPOINTMENT_STATE_CANCELLED,
            APPOINTMENT_STATE_COMPLETED,
        ];
        const sorted = [...appointments].sort((a, b) => {
            // Compares the state ID
            const state_diff = appointment_state_id_order.indexOf(a.appointment_state_id) - appointment_state_id_order.indexOf(b.appointment_state_id);
            if (state_diff != 0) return state_diff;
            // Compares start time
            return a.start_time - b.start_time;
        })
        setAppointmentsSorted(sorted);
    }, [appointments]);


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
                if (!cancelled) {
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

        const appointmentState = APPOINTMENT_STATE_MAPPINGS[item.appointment_state_id];

        return (
            <Pressable
                style={({ pressed }) => [styles.card, pressed && commonUi.card.pressed]}
                onPress={() => navigation.navigate(NAV_QR, { appointment: item })}
            >
                <Text style={styles.cardTitle}>{appointmentState}</Text>
                <Text style={styles.cardDate}>{formattedDate}</Text>
            </Pressable>
        );
    };

    return (
        <View style={[commonUi.screen.pageMargins, commonUi.screen.pageInnerGaps]}>

            <BackButton navigation={navigation} />

            <View style={ commonUi.hero.heroCard }>

                <View style={commonUi.hero.heroTopRow}>
                    <Text style={commonUi.hero.kicker}>Check In</Text>
                </View>

                <View style={commonUi.hero.heroTextBlock}>
                    <Text style={commonUi.hero.heroTitle}>Your Appointments</Text>
                    <Text style={commonUi.hero.heroTitleAccent}>Dashboard</Text>
                    <Text style={commonUi.hero.heroText}>
                        Manage and view upcoming appointments in one clean, smooth workspace.
                    </Text>
                </View>

            </View>


            <FlatList
                data={appointmentsSorted}
                contentContainerStyle={commonUi.screen.pageInnerGaps}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
            />
        </View>
    );
}

function makeStyles(colorScheme) {
    return StyleSheet.create({
        card: {
            padding: 16,
            backgroundColor: colorScheme.whiteWarmCard,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
        },
        cardTitle: {
            fontWeight: "700",
            fontSize: 15,
            color: colorScheme.textDark,
            marginBottom: 4,
        },
        cardDate: {
            fontSize: 13,
            color: colorScheme.textMuted,
        },
    });
}

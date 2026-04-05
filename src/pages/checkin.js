import { useEffect, useMemo, useState } from 'react';
import { Text, FlatList, Pressable, View, StyleSheet } from 'react-native';
import { apiFetch, assertFetchSuccessful, showAppToast } from "../utils";
import { NAV_QR, NAV_HOME, TOAST_TYPE_SUCCESS, TOAST_TYPE_ERROR } from "../consts";
import { useTheme } from "../styles";
import { colorSchemeGreens } from "../colorScheme";

export function CheckinScreen({ navigation }) {

    const commonUi = useTheme((state) => state.getCommonUi)();
    const colorScheme = useTheme((state) => state.getScheme)() ?? colorSchemeGreens;
    const styles = useMemo(() => makeStyles(colorScheme), [colorScheme]);

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

        return (
            <Pressable
                style={({ pressed }) => [styles.card, pressed && commonUi.card.pressed]}
                onPress={() => navigation.navigate(NAV_QR, { appointment: item })}
            >
                <Text style={styles.cardTitle}>Appointment</Text>
                <Text style={styles.cardDate}>{formattedDate}</Text>
            </Pressable>
        );
    };

    return (
        <View style={[commonUi.screen.pageMargins, commonUi.screen.pageInnerGaps]}>
            <Text style={styles.heading}>Check In</Text>
            <Pressable
                style={({ pressed }) => [
                    styles.backButton,
                    pressed && commonUi.card.cardPressed,
                ]}
                onPress={() => navigation.navigate(NAV_HOME)}
            >
                <Text style={styles.backButtonArrow}>←</Text>
                <Text style={styles.backButtonText}>Back to Home</Text>
            </Pressable>

            <FlatList
                data={appointments}
                contentContainerStyle={commonUi.screen.pageInnerGaps}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
            />
        </View>
    );
}

function makeStyles(colorScheme) {
    return StyleSheet.create({
        heading: {
            fontSize: 32,
            fontWeight: '700',
            color: colorScheme.textDarkest,
        },
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
        backButton: {
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            backgroundColor: colorScheme.whiteWarmCard,
            borderRadius: 999,
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
        },
        backButtonArrow: {
            fontSize: 18,
            color: colorScheme.textAccentSoft,
            marginRight: 8,
            fontWeight: "800",
        },
        backButtonText: {
            fontSize: 14,
            fontWeight: "700",
            color: colorScheme.textDefault,
        },
    });
}

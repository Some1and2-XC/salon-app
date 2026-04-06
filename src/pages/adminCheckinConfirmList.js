import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    Pressable,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";

import {
    APPOINTMENT_STATE_CANCELLED,
    APPOINTMENT_STATE_CONFIRMED,
    TOAST_TYPE_SUCCESS,
 } from "../consts";

import { useTheme } from "../styles";
import { colorSchemeGreens } from "../colorScheme";
import { apiFetch, assertFetchSuccessful, showAppToast } from "../utils";
import { BackButton } from "../components/BackButton";

export function AdminCheckinConfirmList({ navigation }) {
    const commonUi = useTheme((state) => state.getCommonUi)();
    const colorScheme =
        useTheme((state) => state.getScheme)() ?? colorSchemeGreens;
    const styles = useMemo(() => makeStyles(colorScheme), [colorScheme]);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const [appointmentUserMap, setAppointmentUserMap] = useState({});

    const load = useCallback(() => {
        setError(null);
        apiFetch("/appointments", { method: "GET" })
            .then(assertFetchSuccessful)
            .then(res => res.json())
            .then((data) => {
                const appointments = Array.isArray(data) ? data : [];

                // filter appointments to only show those that have not been confirmed

                const filtered = appointments.filter(
                    (appt) => ![APPOINTMENT_STATE_CONFIRMED, APPOINTMENT_STATE_CANCELLED]
                        .includes(appt.appointment_state_id)
                );
                setItems(filtered);
                return filtered;
            })
            .then(appointments => getUsersForAppointments(appointments))
            .then(map => setAppointmentUserMap(map))
            .catch((e) => {
                console.error(e);
                setError("Could not load appointments.");
                setItems([]);
                setAppointmentUserMap({});
            })
            .finally(() => {
                setLoading(false);
                setRefreshing(false);
            })
    }, []);

    // filter appointments to only show those that have not been confirmed

    useEffect(() => {
        load();
    }, [load]);

    const onRefresh = () => {
        setRefreshing(true);
        load();
    };

    // maps appointment uuids to user objects

    const getUsersForAppointments = (data) => {

        if(!data) {
            return Promise.resolve({});
        }

        const map = {};

        const promises = data.map((appt) => {
            if (!appt.user_uuid) return Promise.resolve();

            return(
                apiFetch(`/users/${appt.user_uuid}`, { method: 'GET' })
                    .then(assertFetchSuccessful)
                    .then(res => res.json())
                    .then((user) => {
                        map[appt.uuid] = user
                    })
                    .catch((e) => {
                        console.error(e);
                    })
            )
        })

        return Promise.all(promises).then(() => map);
    };

    // Handle Confirm/Deny Buttons on each Appointment Card

    const handleResponse = async (confirmed, item) => {

        if (!item.uuid) {
            console.error("Attempted to update appointment state but appointment.uuid is not set!");
            showAppToast(TOAST_TYPE_ERROR, "Confirmed", "Attempted to update appointment state but appointment.uuid is not set!");
            return;
        }

        apiFetch(`/appointments/${item.uuid}`, {
            method: "PATCH",
            body: JSON.stringify({
                appointment_state_id: confirmed
                    ? APPOINTMENT_STATE_CONFIRMED
                    : APPOINTMENT_STATE_CANCELLED,
            }),
        })
            .then(assertFetchSuccessful)
            .then(res => res.json())
            .then(() => setItems((prev) => prev.filter((appt) => appt.uuid !== item.uuid)))
            .catch((err) => showAppToast(TOAST_TYPE_ERROR, "Server Error", err))
            .finally(() => {
                if (confirmed) showAppToast(TOAST_TYPE_SUCCESS, "Confirmed!", "Successfully confirmed customer check in!");
                else showAppToast(TOAST_TYPE_SUCCESS, "Denied!", "Denied Customer Check In");
            })
            ;

    };

    // Render Each card

    const renderItem = ({ item }) => {
        const appointmentDate = item?.start_time
            ? new Date(Number(item.start_time * 1000)).toLocaleString()
            : "—";

        const user = appointmentUserMap[item?.uuid];

        const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ");
        const email = user?.email ? ` (${user?.email})` : "";

        return (
            <View style={commonUi.card.pageCard}>
                <View style={styles.cardTop}>
                    <Text style={styles.cardTitle}>
                        {`${name} ${email}`}
                    </Text>
                    <Text style={styles.cardChevron}>→</Text>
                </View>
                <Text style={styles.cardMeta}>Appointment Date: {appointmentDate}</Text>
                <View style={commonUi.card.actions}>
                    <Pressable
                        style={({ pressed }) => [commonUi.card.btnConfirm, pressed && commonUi.card.pressed]}
                        onPress={() => handleResponse(true, item)}
                    >
                        <Text style={commonUi.card.btnConfirmText}>Confirm</Text>
                    </Pressable>
                    <Pressable
                        style={({ pressed }) => [commonUi.card.btnDeny, pressed && commonUi.card.pressed]}
                        onPress={() => handleResponse(false, item)}
                    >
                        <Text style={commonUi.card.btnDenyText}>Deny</Text>
                    </Pressable>
                </View>
            </View>

        );
    };

    return (
        <View style={[commonUi.screen.pageMargins, commonUi.screen.pageInnerGaps ]}>

            <BackButton navigation={navigation} />

            <View style={commonUi.card.accentCard}>
                <View style={commonUi.card.accentCardBlob} />
                <Text style={commonUi.card.kicker}>Operations</Text>
                <Text style={commonUi.card.cardTitle}>Waiting Room</Text>
                <Text style={commonUi.card.cardSubtitle}>
                    Confirm or Deny Appointment Requests.
                </Text>
            </View>

            {loading ? (
                <View style={styles.loaderWrap}>
                    <ActivityIndicator
                        size="large"
                        color={colorScheme.textAccent}
                    />
                </View>
            ) : null}

            {error ? (
                <View style={styles.banner}>
                    <Text style={styles.bannerText}>{error}</Text>
                </View>
            ) : null}


            <FlatList
                data={items}
                keyExtractor={(item, index) =>
                    String(item?.uuid ?? item?.id ?? index)
                }
                renderItem={renderItem}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.empty}>
                            <Text style={styles.emptyTitle}>No appointments</Text>
                            <Text style={styles.emptyText}>
                                When clients book or check in, their requests will
                                appear here.
                            </Text>
                        </View>
                    ) : null
                }
                contentContainerStyle={commonUi.screen.pageInnerGaps}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colorScheme.textAccent}
                    />
                }
            />
        </View>
    );
}

function makeStyles(colorScheme) {
    return StyleSheet.create({
        loaderWrap: {
            paddingVertical: 20,
            alignItems: "center",
        },
        banner: {
            backgroundColor: colorScheme.panelBackground,
            borderRadius: 16,
            padding: 12,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
        },
        bannerText: {
            color: colorScheme.feedbackError,
            fontWeight: "600",
            textAlign: "center",
            fontSize: 14,
        },
        card: {
            backgroundColor: colorScheme.whiteWarmCard,
            borderRadius: 22,
            padding: 16,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
        },
        cardTop: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
        },
        cardTitle: {
            fontSize: 16,
            fontWeight: "800",
            color: colorScheme.textDark,
            flex: 1,
            paddingRight: 8,
        },
        cardChevron: {
            fontSize: 20,
            fontWeight: "700",
            color: colorScheme.textAccent,
        },
        cardMeta: {
            fontSize: 13,
            color: colorScheme.textMuted,
            marginBottom: 6,
        },
        cardHint: {
            fontSize: 12,
            fontWeight: "600",
            color: colorScheme.textLabel,
        },
        empty: {
            backgroundColor: colorScheme.whiteWarmCard,
            borderRadius: 24,
            padding: 22,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
            alignItems: "center",
        },
        emptyTitle: {
            fontSize: 18,
            fontWeight: "800",
            color: colorScheme.textDark,
            marginBottom: 8,
        },
        emptyText: {
            fontSize: 14,
            color: colorScheme.textMuted,
            textAlign: "center",
            lineHeight: 21,
        },
    });
}

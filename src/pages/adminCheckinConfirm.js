import React, { useEffect, useMemo, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    Pressable,
    ScrollView,
    ActivityIndicator,
} from "react-native";

import {
    NAV_CHECKIN_CONFIRM_ADMIN_LIST,
    APPOINTMENT_STATE_ACCEPTED,
    APPOINTMENT_STATE_CANCELLED,
    TOAST_TYPE_SUCCESS
} from "../consts";
import { useTheme } from "../styles";
import { colorSchemeGreens } from "../colorScheme";

import { apiFetch, assertFetchSuccessful, showAppToast } from "../utils";
import { AdminBackBar } from "../components/AdminBackBar";

/**
 * Admin confirm/deny for an appointment. Pass the appointment via route.params,
 * or the first open appointment is loaded when params are omitted (dev / debug).
 */
export function AdminCheckinConfirm({ navigation, route }) {

    const commonUi = useTheme((state) => state.getCommonUi)();
    const colorScheme =
        useTheme((state) => state.getScheme)() ?? colorSchemeGreens;
    const styles = useMemo(() => makeStyles(colorScheme), [colorScheme]);

    const [appointment, setAppointment ] = useState(route.params?.appointment || null);
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(false);
    const [loadingAppointment, setLoadingAppointment] = useState(false);
    const [loadError, setLoadError] = useState(null);

    // Check if you have been passed an appointment object or no
    // If not then render the first appointment from the booked appointments 
    useEffect(() => {

        if (appointment) {
            setLoadingAppointment(false);
            return;
        }

        setLoadingAppointment(true);
        setLoadError(null);

        apiFetch("/appointments", { method: "GET" })
            .then(assertFetchSuccessful)
            .then((res) => res.json())
            .then((arr) => {
                if (Array.isArray(arr) && arr[0]) {
                    setAppointment(arr[0]);
                } else {
                    setLoadError("No appointments found.");
                }
            })
            .catch(() => setLoadError("Could not load appointments."))
            .finally(() => setLoadingAppointment(false))
            ;
    }, []);

    // User Fetching Effect
    useEffect(() => {
        if (!appointment || !appointment.user_uuid) {
            setUser(null);
            return;
        }

        setLoadingUser(true);
        setLoadError(null);

        // Needs to pass the user token to validate the admin (only the admin can access the list of users)
        apiFetch(`/users/${appointment.user_uuid}`, { 
            method: "GET"
        })
            .then(assertFetchSuccessful)
            .then((res) => res.json())
            .then((user) => setUser(user))
            .catch(() => setLoadError("Could not load customer details."))
            .finally(() => setLoadingUser(false))
            ;

    }, [appointment]);

    // Appointment Fetching Effect
    const handleResponse = async (confirmed) => {
        const fetch_body = {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                appointment_state_id: confirmed
                    ? APPOINTMENT_STATE_ACCEPTED
                    : APPOINTMENT_STATE_CANCELLED,
            }),
        };

        if (appointment.uuid) {
            apiFetch(`/appointments/${appointment.uuid}`, fetch_body)
                .then(assertFetchSuccessful)
                .then(res => res.json())
                .catch((e) => {
                    console.error(e);
                })
        } else {
            console.error(
                "Attempted to update appointment state but appointment.uuid is not set!"
            );
        }

        if(confirmed) {
            showAppToast(TOAST_TYPE_SUCCESS, "Confirmed!", "Successfully confirmed customer check in!");
        }
        else {
            showAppToast(TOAST_TYPE_SUCCESS, "Denied!", "Denied Customer Check In");
        }

        navigation.navigate(NAV_CHECKIN_CONFIRM_ADMIN_LIST);
    };

    const customerLine = (() => {
        if (loadingUser) return "Loading customer…";
        if (!user) return "—";

        console.log("user", user);
        const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
        const email = user.email ? ` (${user.email})` : "";
        return `${name || "Customer"}${email}`;
    })();

    const lastModifiedMs = appointment?.last_modified
        ? Number(appointment.last_modified)
        : NaN;
    const lastModifiedLabel = Number.isFinite(lastModifiedMs)
        ? new Date(lastModifiedMs).toLocaleString()
        : "—";

    const showSpinner = loadingAppointment || (appointment && loadingUser);

    return (
        <ScrollView
            style={{ backgroundColor: colorScheme.pageBackground }}
            contentContainerStyle={[
                commonUi.screen.pageMargins,
                commonUi.screen.pageInnerGaps,
                { paddingBottom: 28 },
            ]}
        >
            <AdminBackBar navigation={navigation} />

            <View style={commonUi.card.accentCard}>
                <View style={commonUi.card.accentCardBlob} />
                <Text style={commonUi.card.kicker}>Front desk</Text>
                <Text style={commonUi.card.cardTitle}>Confirm booking</Text>
                <Text style={commonUi.card.cardSubtitle}>
                    Review the visit below, then accept or decline the check-in.
                </Text>
            </View>

            {loadError ? (
                <View style={commonUi.card.pageCard}>
                    <Text style={styles.errorText}>{loadError}</Text>
                </View>
            ) : null}

            {showSpinner ? (
                <View style={styles.centerPad}>
                    <ActivityIndicator
                        size="large"
                        color={colorScheme.textAccent}
                    />
                </View>
            ) : (
                <View style={commonUi.card.pageCard}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Customer</Text>
                        <Text style={styles.value}>{customerLine}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Last updated</Text>
                        <Text style={styles.value}>{lastModifiedLabel}</Text>
                    </View>

                    <View style={styles.actions}>
                        <Pressable
                            style={({ pressed }) => [styles.btnConfirm, pressed && commonUi.card.pressed]}
                            onPress={() => handleResponse(true)}
                        >
                            <Text style={styles.btnConfirmText}>Confirm</Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [styles.btnDeny, pressed && commonUi.card.pressed]}
                            onPress={() => handleResponse(false)}
                        >
                            <Text style={styles.btnDenyText}>Deny</Text>
                        </Pressable>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

function makeStyles(colorScheme) {
    return StyleSheet.create({
        row: {
            marginBottom: 14,
        },
        label: {
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 0.8,
            textTransform: "uppercase",
            color: colorScheme.textLabel,
            marginBottom: 4,
        },
        value: {
            fontSize: 15,
            fontWeight: "600",
            color: colorScheme.textDark,
            lineHeight: 22,
        },
        errorText: {
            fontSize: 14,
            fontWeight: "600",
            color: colorScheme.feedbackError,
            textAlign: "center",
        },
        centerPad: {
            paddingVertical: 32,
            alignItems: "center",
        },
        actions: {
            flexDirection: "row",
            gap: 12,
            marginTop: 8,
        },
        btnConfirm: {
            flex: 1,
            backgroundColor: colorScheme.darkSurface,
            borderRadius: 24,
            paddingVertical: 16,
            alignItems: "center",
        },
        btnConfirmText: {
            color: colorScheme.whiteWarm,
            fontSize: 15,
            fontWeight: "800",
        },
        btnDeny: {
            flex: 1,
            backgroundColor: colorScheme.panelBackgroundAlt,
            borderRadius: 24,
            paddingVertical: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
        },
        btnDenyText: {
            color: colorScheme.danger,
            fontSize: 15,
            fontWeight: "800",
        },
    });
}

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

        let cancelled = false;
        setLoadingAppointment(true);
        setLoadError(null);

        apiFetch("/appointments", { method: "GET" })
            .then(assertFetchSuccessful)
            .then((res) => res.json())
            .then((arr) => {
                if (cancelled) return;
                if (Array.isArray(arr) && arr[0]) {
                    setAppointment(arr[0]);
                } else {
                    setLoadError("No appointments found.");
                }
            })
            .catch(() => {
                if (!cancelled) setLoadError("Could not load appointments.");
            })
            .finally(() => {
                if (!cancelled) setLoadingAppointment(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // User Fetching Effect

    useEffect(() => {
        if (!appointment || !appointment.user_uuid) {
            setUser(null);
            return;
        }

        let cancelled = false;
        setLoadingUser(true);
        setLoadError(null);

        // Needs to pass the user token to validate the admin (only the admin can access the list of users)

        apiFetch(`/users/${appointment.user_uuid}`, { 
            method: "GET"
        })
            .then(assertFetchSuccessful)
            .then((res) => res.json())
            .then((user) => {
                if (!cancelled) setUser(user);
            })
            .catch(() => {
                if (!cancelled) setLoadError("Could not load customer details.");
            })
            .finally(() => {
                if (!cancelled) setLoadingUser(false);
            });

        return () => {
            cancelled = true;
        };
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
            showAppToast(0, "Confirmed!", "Successfully confirmed customer check in!");
        }
        else {
            showAppToast(0, "Denied!", "Denied Customer Check In");
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
                { paddingBottom: 28 },
            ]}
        >
            <AdminBackBar navigation={navigation} />

            <View style={styles.heroCard}>
                <View style={styles.blobSoft} />
                <Text style={styles.kicker}>Front desk</Text>
                <Text style={styles.title}>Confirm booking</Text>
                <Text style={styles.subtitle}>
                    Review the visit below, then accept or decline the check-in.
                </Text>
            </View>

            {loadError ? (
                <View style={styles.panel}>
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
                <View style={styles.panel}>
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
                            style={({ pressed }) => [
                                styles.btnConfirm,
                                pressed && styles.pressed,
                            ]}
                            onPress={() => handleResponse(true)}
                        >
                            <Text style={styles.btnConfirmText}>Confirm</Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [
                                styles.btnDeny,
                                pressed && styles.pressed,
                            ]}
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
        heroCard: {
            position: "relative",
            overflow: "hidden",
            borderRadius: 28,
            paddingHorizontal: 20,
            paddingVertical: 22,
            backgroundColor: colorScheme.accentTint,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colorScheme.borderAccentSoft,
        },
        blobSoft: {
            position: "absolute",
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colorScheme.accentBlob,
            right: -30,
            top: -20,
            opacity: 0.25,
        },
        kicker: {
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: colorScheme.textAccentSoft,
            marginBottom: 8,
            zIndex: 1,
        },
        title: {
            fontSize: 26,
            fontWeight: "800",
            color: colorScheme.textDarkest,
            marginBottom: 8,
            zIndex: 1,
        },
        subtitle: {
            fontSize: 14,
            lineHeight: 21,
            color: colorScheme.textSubtle,
            maxWidth: "95%",
            zIndex: 1,
        },
        panel: {
            backgroundColor: colorScheme.whiteWarmCard,
            borderRadius: 24,
            padding: 18,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
        },
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
        pressed: {
            opacity: 0.92,
            transform: [{ scale: 0.99 }],
        },
    });
}


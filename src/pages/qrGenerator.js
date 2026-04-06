import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import QRCode from 'react-native-qrcode-svg';
import { useTheme } from "../styles";
import { apiFetch, assertFetchSuccessful, showAppToast } from "../utils";
import { APPOINTMENT_STATE_UNCONFIRMED, APPOINTMENT_STATE_ACCEPTED, TOAST_TYPE_ERROR, NAV_HOME } from "../consts";
import { BackButton } from "../components/BackButton";

export function QRScreen({ route, navigation }) {

    // This is the amount of time between queries to check the status of the appointment.
    // This is in ms (2000 = 2 seconds).
    const REFRESH_INTERVAL = 2000;

    const commonUi = useTheme((state) => state.getCommonUi)();
    const { appointment } = route.params;

    console.log(appointment);

    const qrValue = JSON.stringify({
        appointment
    });
    const appt_uuid = appointment.uuid;

    // Timer requests
    const interval_ref = useRef(null);

    useFocusEffect(useCallback(() => {

        const check_appointment = () => apiFetch(`/appointments/${appt_uuid}`)
            .then(assertFetchSuccessful)
            .then((res) => res.json())
            .then((res) => {
                // Redirects if the status has changed.
                if (res.appointment_state_id && res.appointment_state_id != APPOINTMENT_STATE_UNCONFIRMED && res.appointment_state_id != APPOINTMENT_STATE_ACCEPTED) {
                    navigation.navigate(NAV_HOME, { toastMessage: `Appointment \`${appt_uuid}\` has been confirmed!`});
                }
            })
            .catch((err) => showAppToast(TOAST_TYPE_ERROR, "Server Error", err))
            ;

        check_appointment();
        interval_ref.current = setInterval(check_appointment, REFRESH_INTERVAL);
        return () => clearInterval(interval_ref.current);

    }, []));

    return (

        <View style={[commonUi.screen.pageMargins, commonUi.screen.pageInnerGaps, { alignItems: "center" }]}>

            <BackButton navigation={navigation} />

            <Text style={commonUi.card.kicker}>Check-in ready! Show this QR Code to the admin.</Text>

            <View style={commonUi.screen.centerWrap}>
                <QRCode value={qrValue} size={250} />
            </View>
        </View>
    );
}

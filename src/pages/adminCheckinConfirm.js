import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { NAV_CHECKIN_CONFIRM_ADMIN_LIST } from "../consts";
import { sty } from "../styles";
import { apiFetch } from "../utils";

export function AdminCheckinConfirm({ navigation, route }) {

    const { userId, appointmentId } = route.params || {};
    const [status, setStatus] = useState("Processing...");

    useEffect(() => {
        handleCheckin();
    }, []);

    const handleCheckin = async () => {
        try {
            if (!userId || !appointmentId) {
                throw new Error("Missing QR data");
            }

            const res = await apiFetch(`/appointments/${appointmentId}`, {
                method: "PATCH",
                body: JSON.stringify({
                    status: "checked_in"
                })
            });

            if (!res.ok) {
                throw new Error("Check-in failed");
            }

            setStatus("Check-in successful ✅");

            Toast.show({
                type: "success",
                text1: "Success",
                text2: "User checked in successfully"
            });

            setTimeout(() => {
                navigation.navigate(NAV_CHECKIN_CONFIRM_ADMIN_LIST);
            }, 2000);

        } catch (err) {
            console.error(err);

            setStatus("Check-in failed ❌");

            Toast.show({
                type: "error",
                text1: "Error",
                text2: err.message
            });
        }
    };

    return (
        <View style={sty.container}>
            <Text style={sty.h1}>Admin Check-In</Text>
            <Text>{status}</Text>
        </View>
    );
}
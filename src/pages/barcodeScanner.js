import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

import { sty } from "../styles";
import { NAV_CHECKIN_CONFIRM_ADMIN } from "../consts";

export function BarcodeScannerScreen({ navigation }) {

    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={sty.container}>
                <Text>We need camera permission</Text>
                <Text onPress={requestPermission}>Grant Permission</Text>
            </View>
        );
    }

    const handleBarCodeScanned = ({ data }) => {
        if (scanned) return;

        setScanned(true);

        try {
            const parsed = JSON.parse(data);

            navigation.navigate(NAV_CHECKIN_CONFIRM_ADMIN, {
                userId: parsed.userId,
                appointmentId: parsed.appointmentId
            });

        } catch (err) {
            Alert.alert("Invalid QR Code");
            setScanned(false);
        }
    };

    return (
        <View style={sty.container}>
            <CameraView
                style={sty.container}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={handleBarCodeScanned}
            />
        </View>
    );
}
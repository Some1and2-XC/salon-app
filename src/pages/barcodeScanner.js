import React, { useEffect, useState } from "react";
import { Button, View, Text, Alert, Platform } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";

import { sty } from "../styles";
import { NAV_CHECKIN_CONFIRM_ADMIN } from "../consts";

export function BarcodeScannerScreen({ navigation }) {

    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View>
                <Text>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    // function toggleCameraFacing() {
    //     setFacing(current => (current === 'back' ? 'front' : 'back'));
    // }

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
                style={{ flex: 1 }}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                onBarCodeScanned={handleBarCodeScanned}
                facing={facing}
                />
        </View>
    );

}
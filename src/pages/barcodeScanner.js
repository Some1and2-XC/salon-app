import React, { useEffect, useState } from "react";
import { Button, View, Text, Alert, Platform } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";

import { sty } from "../styles";
export function BarcodeScannerScreen() {

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
        console.log("Found URL:", data);
        Alert.alert("Found URL", data);
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

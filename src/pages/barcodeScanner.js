import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, Platform } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";

import { sty } from "../styles";
export function BarcodeScannerScreen() {

    const [hasPermission, setHasPermission] = useState(null);

    useEffect(() => {
        if (Platform.OS !== "web") {
            const getPermission = async () => {
                const { status } = await BarCodeScanner.requestPermissionsAsync();
                setHasPermission(status === "granted");
            };

            getPermission();
        }
    }, []);

    // Web fallback
    if (Platform.OS === "web") {
        return (
            <View style={sty.containerCentered}>
                <Text>Barcode scanner is not supported on web.</Text>
                <Text>Please run the app on a mobile device.</Text>
            </View>
        );
    }

    if (hasPermission === null) {
        return <Text>Requesting camera permission...</Text>;
    }

    if (hasPermission === false) {
        return <Text>No camera access</Text>;
    }

    const handleBarCodeScanned = ({ data }) => {
        console.log("Found URL:", data);
        Alert.alert("Found URL", data);
    };

    return (
        <View style={sty.containerCentered}>
            <BarCodeScanner
                onBarCodeScanned={handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />
        </View>
    );
}

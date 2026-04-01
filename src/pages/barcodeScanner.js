import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, Alert, Platform } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";

import { sty } from "../styles";
import { NAV_CHECKIN_CONFIRM_ADMIN } from "../consts";

export function BarcodeScannerScreen({ navigation }) {

    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (Platform.OS !== "web") {
            const getPermission = async () => {
                const { status } = await BarCodeScanner.requestPermissionsAsync();
                setHasPermission(status === "granted");
            };
            getPermission();
        }
    }, []);

    if (Platform.OS === "web") {
        return (
            <View style={sty.containerCentered}>
                <Text>Barcode scanner is not supported on web.</Text>
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
        <View style={sty.containerCentered}>
            <BarCodeScanner
                onBarCodeScanned={handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />

            {scanned && (
                <Button title="Scan Again" onPress={() => setScanned(false)} />
            )}
        </View>
    );
}
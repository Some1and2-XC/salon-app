import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { NAV_CHECKIN_CONFIRM_ADMIN } from "../consts";

import { useTheme } from "../styles";
import { colorSchemeGreens } from "../colorScheme";
import { AdminBackBar } from "../components/AdminBackBar";

export function BarcodeScannerScreen({ navigation }) {
    const commonUi = useTheme((state) => state.getCommonUi)();
    const colorScheme =
        useTheme((state) => state.getScheme)() ?? colorSchemeGreens;
    const styles = useMemo(() => makeStyles(colorScheme), [colorScheme]);

    const [facing] = useState("back");
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    const handleBarCodeScanned = ({ data }) => {
        if (scanned) return;

        setScanned(true);

        try {
            const parsed = JSON.parse(data);

            navigation.navigate(NAV_CHECKIN_CONFIRM_ADMIN, {
                appointment: parsed.appointment
            });

        } catch (err) {
            Alert.alert("Invalid QR Code");
            setScanned(false);
        }
    };

    if (!permission) {
        return (
            <View
                style={[
                    commonUi.screen.pageMargins,
                    { backgroundColor: colorScheme.pageBackground, flex: 1 },
                ]}
            >
                <AdminBackBar navigation={navigation} />
                <View style={styles.loaderWrap}>
                    <ActivityIndicator
                        size="large"
                        color={colorScheme.textAccent}
                    />
                </View>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View
                style={[
                    commonUi.screen.pageMargins,
                    { backgroundColor: colorScheme.pageBackground, flex: 1 },
                ]}
            >
                <AdminBackBar navigation={navigation} />

                <View style={styles.heroCard}>
                    <Text style={styles.kicker}>Tools</Text>
                    <Text style={styles.title}>Camera access</Text>
                    <Text style={styles.subtitle}>
                        Allow the camera so you can scan QR codes and barcodes at
                        the desk.
                    </Text>
                </View>

                <Pressable
                    style={({ pressed }) => [
                        styles.primaryBtn,
                        pressed && styles.pressed,
                    ]}
                    onPress={requestPermission}
                >
                    <Text style={styles.primaryBtnText}>Grant permission</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.root,
                { backgroundColor: colorScheme.pageBackground },
            ]}
        >
            <View style={commonUi.screen.pageMargins}>
                <AdminBackBar navigation={navigation} />

                <View style={styles.heroCard}>
                    <Text style={styles.kicker}>Tools</Text>
                    <Text style={styles.title}>Barcode scanner</Text>
                    <Text style={styles.subtitle}>
                        Point the camera at a QR code. Results appear in an alert.
                    </Text>
                </View>
            </View>

            <View style={styles.cameraShell}>
                <CameraView
                    style={StyleSheet.absoluteFill}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                    onBarCodeScanned={handleBarCodeScanned}
                    facing={facing}
                />
            </View>
        </View>
    );
}

function makeStyles(colorScheme) {
    return StyleSheet.create({
        root: {
            flex: 1,
        },
        loaderWrap: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        heroCard: {
            borderRadius: 28,
            paddingHorizontal: 20,
            paddingVertical: 20,
            backgroundColor: colorScheme.accentTint,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colorScheme.borderAccentSoft,
        },
        kicker: {
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: colorScheme.textAccentSoft,
            marginBottom: 8,
        },
        title: {
            fontSize: 24,
            fontWeight: "800",
            color: colorScheme.textDarkest,
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 14,
            lineHeight: 21,
            color: colorScheme.textSubtle,
            maxWidth: "96%",
        },
        primaryBtn: {
            backgroundColor: colorScheme.darkSurface,
            borderRadius: 24,
            paddingVertical: 16,
            alignItems: "center",
        },
        primaryBtnText: {
            color: colorScheme.whiteWarm,
            fontSize: 15,
            fontWeight: "800",
        },
        pressed: {
            opacity: 0.92,
            transform: [{ scale: 0.99 }],
        },
        cameraShell: {
            flex: 1,
            marginHorizontal: 14,
            marginBottom: 14,
            borderRadius: 28,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
            backgroundColor: colorScheme.panelBackground,
        },
    });
}

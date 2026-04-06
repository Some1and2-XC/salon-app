import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { NAV_CHECKIN_CONFIRM_ADMIN } from "../consts";

import { useTheme } from "../styles";
import { colorSchemeDefault, MAP_COLOR_SCHEME } from "../colorScheme";
import { BackButton } from "../components/BackButton";
import { useIsFocused } from '@react-navigation/native';
import { showAppToast } from "../utils";

export function BarcodeScannerScreen({ navigation }) {

    const commonUi = useTheme((state) => state.getCommonUi)();
    const scheme = useTheme((state) => state.scheme);
    const colorScheme = MAP_COLOR_SCHEME[scheme] ?? colorSchemeDefault;

    const styles = useMemo(() => makeStyles(colorScheme), [colorScheme]);

    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    const isFocused = useIsFocused();

    const handleBarCodeScanned = ({ data }) => {

        if (scanned) return;

        setScanned(true);

        try {
            const parsed = JSON.parse(data);

            navigation.navigate(NAV_CHECKIN_CONFIRM_ADMIN, {
                appointment: parsed.appointment
            });

        } catch (err) {
            showAppToast(1, "Oops!", "Invalid QR code");
            setScanned(false);
        }
    };

    if (!permission) {
        return (
            <View
                style={[
                    commonUi.screen.pageMargins,
                    commonUi.screen.pageInnerGaps,
                    { backgroundColor: colorScheme.pageBackground, flex: 1 },
                ]}
            >
                <BackButton navigation={navigation} />
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
                    commonUi.screen.pageInnerGaps,
                    { backgroundColor: colorScheme.pageBackground, flex: 1 },
                ]}
            >
                <BackButton navigation={navigation} />

                <View style={commonUi.card.accentCard}>
                    <Text style={commonUi.card.kicker}>Operations</Text>
                    <Text style={commonUi.card.cardTitle}>Check-In QR Scanner</Text>
                    <Text style={commonUi.card.cardSubtitle}>
                        Allow the camera so you can scan QR codes.
                    </Text>
                </View>

                <Pressable
                    style={({ pressed }) => [
                        commonUi.auth.primaryButton,
                        pressed && commonUi.card.pressed,
                    ]}
                    onPress={requestPermission}
                >
                    <Text style={commonUi.auth.primaryButtonText}>Grant permission</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={[ commonUi.screen.pageMargins, commonUi.screen.pageInnerGaps, { flex: 1 } ]}>

            <BackButton navigation={navigation} />

            <View style={commonUi.card.accentCard}>
                <Text style={commonUi.card.kicker}>Tools</Text>
                <Text style={commonUi.card.cardTitle}>Barcode scanner</Text>
                <Text style={commonUi.card.cardSubtitle}>
                    Point the camera at a QR code. Results appear in an alert.
                </Text>
            </View>

            <View style={styles.cameraShell}>
                {isFocused && <CameraView
                    facing="back"
                    autoFocus="on"
                    barCodeScannerSettings={{
                        barCodeTypes: ["qr"],
                    }}
                    onBarcodeScanned={handleBarCodeScanned}
                />}
            </View>

        </View>
    );
}

function makeStyles(colorScheme) {
    return StyleSheet.create({
        loaderWrap: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        cameraShell: {
            flex: 1,
            borderRadius: 28,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
            backgroundColor: colorScheme.panelBackground,
        },
    });
}

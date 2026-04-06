import React, { useMemo } from "react";
import { Pressable, Text, StyleSheet } from "react-native";

import { useTheme } from "../styles";
import { colorSchemeGreens } from "../colorScheme";

/**
 * Navigates back to the admin dashboard. Use at the top of admin-only screens.
 */
export function BackButton({ navigation }) {
    const colorScheme =
        useTheme((state) => state.getScheme)() ?? colorSchemeGreens;
    const styles = useMemo(() => makeStyles(colorScheme), [colorScheme]);

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Previous Page"
            style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
            onPress={() => navigation.goBack()}
        >
            <Text style={styles.arrow}>←</Text>
            <Text style={styles.label}>Back</Text>
        </Pressable>
    );

}

function makeStyles(colorScheme) {
    return StyleSheet.create({
        bar: {
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            backgroundColor: colorScheme.whiteWarmCard,
            borderRadius: 999,
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
            gap: 8,
        },
        pressed: {
            opacity: 0.9,
            transform: [{ scale: 0.99 }],
        },
        arrow: {
            fontSize: 18,
            color: colorScheme.textAccent,
            fontWeight: "800",
        },
        label: {
            fontSize: 14,
            fontWeight: "700",
            color: colorScheme.textDark,
        },
    });
}

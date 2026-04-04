import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    Pressable,
    ScrollView,
    Animated,
    useWindowDimensions,
} from "react-native";

import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import {
    NAV_CHECKIN_CONFIRM_ADMIN,
    NAV_CHECKIN_CONFIRM_ADMIN_LIST,
    NAV_APP_TYPES,
    NAV_BARCODE_SCANNER,
    NAV_ADD_EMPLOYEE,
    NAV_SET_AVAILABILITY,
    NAV_LOGIN,
    NAV_SET_THEME,
} from "../consts";
import { useTheme } from "../styles";
import { colorSchemeGreens } from "../colorScheme";

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
}

function getTodayLabel() {
    const today = new Date();
    return today.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
}

const ADMIN_ACTIONS = [
    {
        route: NAV_CHECKIN_CONFIRM_ADMIN,
        pill: "Front desk",
        icon: "✦",
        title: "Confirm check-in",
        description:
            "Review arrivals and confirm client check-ins from the admin queue.",
        variant: "primary",
    },
    {
        route: NAV_CHECKIN_CONFIRM_ADMIN_LIST,
        pill: "Operations",
        icon: "◎",
        title: "Check-in list",
        description:
            "See all pending confirmations and manage the check-in pipeline.",
        variant: "secondary",
    },
    {
        route: NAV_APP_TYPES,
        pill: "Catalog",
        icon: "◇",
        title: "Appointment types",
        description: "Configure services and how they appear when booking.",
        variant: "primary",
    },
    {
        route: NAV_BARCODE_SCANNER,
        pill: "Tools",
        icon: "▣",
        title: "Barcode scanner",
        description: "Open the scanner for quick product or code lookup.",
        variant: "secondary",
    },
    {
        route: NAV_ADD_EMPLOYEE,
        pill: "Team",
        icon: "✶",
        title: "Add employee",
        description: "Create staff accounts and keep the roster up to date.",
        variant: "primary",
    },
    {
        route: NAV_SET_AVAILABILITY,
        pill: "Scheduling",
        icon: "⏱",
        title: "Set availability",
        description: "Define when stylists and services can be booked.",
        variant: "secondary",
    },
];

export function AdminHomepageScreen({ navigation }) {
    const commonUi = useTheme((state) => state.getCommonUi)();
    const colorScheme = useTheme((state) => state.getScheme)() ?? colorSchemeGreens;
    const styles = useMemo(() => makeStyles(colorScheme), [colorScheme]);

    const { width } = useWindowDimensions();

    const float1 = useRef(new Animated.Value(0)).current;
    const float2 = useRef(new Animated.Value(0)).current;
    const fadeIn = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(18)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeIn, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.timing(slideUp, {
                toValue: 0,
                duration: 700,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(float1, {
                    toValue: 1,
                    duration: 3600,
                    useNativeDriver: true,
                }),
                Animated.timing(float1, {
                    toValue: 0,
                    duration: 3600,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(float2, {
                    toValue: 1,
                    duration: 4300,
                    useNativeDriver: true,
                }),
                Animated.timing(float2, {
                    toValue: 0,
                    duration: 4300,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [fadeIn, slideUp, float1, float2]);

    const blob1Y = float1.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -14],
    });

    const blob2Y = float2.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 16],
    });

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.navigate(NAV_LOGIN);
        } catch (error) {
            console.log("Logout error:", error);
        }
    };

    return (
        <ScrollView>
            <Animated.View
                style={[
                    commonUi.screen.pageMargins,
                    {
                        opacity: fadeIn,
                        transform: [{ translateY: slideUp }],
                    },
                ]}
            >
                <View style={commonUi.hero.heroCard}>
                    <Animated.View
                        style={[
                            commonUi.hero.blobOne,
                            { transform: [{ translateY: blob1Y }] },
                        ]}
                    />
                    <Animated.View
                        style={[
                            commonUi.hero.blobTwo,
                            { transform: [{ translateY: blob2Y }] },
                        ]}
                    />
                    <Animated.View
                        style={[
                            commonUi.hero.blobThree,
                            {
                                left: width * 0.56,
                                transform: [{ translateY: blob1Y }],
                            },
                        ]}
                    />

                    <View style={commonUi.hero.heroTopRow}>
                        <Text style={commonUi.hero.kicker}>{getGreeting()}</Text>
                    </View>

                    <View style={commonUi.hero.heroTextBlock}>
                        <Text style={commonUi.hero.heroTitle}>Salon Studio</Text>
                        <Text style={commonUi.hero.heroTitleAccent}>Admin</Text>
                        <Text style={styles.heroText}>
                            Manage staff, services, and front-desk tools from one
                            dashboard.
                        </Text>
                    </View>

                    <View style={commonUi.hero.metaRow}>
                        <View style={commonUi.hero.metaChip}>
                            <Text style={commonUi.hero.metaChipText}>
                                {getTodayLabel()}
                            </Text>
                        </View>
                    </View>

                    <View style={commonUi.hero.heroFadeWrap}>
                        <View style={commonUi.hero.heroFadeMain} />
                        <View style={commonUi.hero.heroFadeSmall} />
                    </View>
                </View>

                {ADMIN_ACTIONS.map((action) =>
                    action.variant === "primary" ? (
                        <Pressable
                            key={action.route}
                            style={({ pressed }) => [
                                styles.primaryActionCard,
                                pressed && styles.cardPressed,
                            ]}
                            onPress={() => navigation.navigate(action.route)}
                        >
                            <View style={styles.cardGlow} />
                            <View style={styles.cardHeaderRow}>
                                <View style={styles.iconWrapLarge}>
                                    <Text style={styles.iconLarge}>{action.icon}</Text>
                                </View>
                                <View style={styles.pillDark}>
                                    <Text style={styles.pillDarkText}>{action.pill}</Text>
                                </View>
                            </View>
                            <Text style={styles.primaryTitle}>{action.title}</Text>
                            <Text style={styles.primaryDescription}>
                                {action.description}
                            </Text>

                            <View style={styles.primaryFooter}>
                                <Text style={styles.primaryFooterText}>Open</Text>
                                <Text style={styles.primaryArrow}>→</Text>
                            </View>
                        </Pressable>
                    ) : (
                        <Pressable
                            key={action.route}
                            style={({ pressed }) => [
                                styles.secondaryActionCardFull,
                                pressed && styles.cardPressed,
                            ]}
                            onPress={() => navigation.navigate(action.route)}
                        >
                            <View style={styles.smallTopRow}>
                                <View style={styles.iconWrapSmall}>
                                    <Text style={styles.iconSmall}>{action.icon}</Text>
                                </View>
                                <Text style={styles.cornerText}>{action.pill}</Text>
                            </View>

                            <Text style={styles.secondaryTitle}>{action.title}</Text>
                            <Text style={styles.secondaryDescription}>
                                {action.description}
                            </Text>
                        </Pressable>
                    )
                )}

                <View style={styles.bottomSpacer} />

                <Pressable
                    style={({ pressed }) => [
                        styles.logoutBar,
                        pressed && styles.logoutBarPressed,
                    ]}
                    onPress={() => navigation.navigate(NAV_SET_THEME)}
                >
                    <Text style={styles.logoutBarText}>Set Theme &#x1F3A8;</Text>
                </Pressable>

                <View style={styles.bottomSpacer} />

                <Pressable
                    style={({ pressed }) => [
                        styles.logoutBar,
                        pressed && styles.logoutBarPressed,
                    ]}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutBarText}>Log Out</Text>
                </Pressable>
            </Animated.View>
        </ScrollView>
    );
}

function makeStyles(colorScheme) {
    return StyleSheet.create({
        heroText: {
            fontSize: 15,
            lineHeight: 22,
            color: colorScheme.textSubtle,
            maxWidth: "78%",
        },

        primaryActionCard: {
            position: "relative",
            overflow: "hidden",
            backgroundColor: colorScheme.darkSurface,
            borderRadius: 28,
            paddingHorizontal: 18,
            paddingTop: 18,
            paddingBottom: 18,
            marginBottom: 14,
            minHeight: 205,
            width: "100%",
        },

        cardGlow: {
            position: "absolute",
            width: 170,
            height: 170,
            borderRadius: 85,
            backgroundColor: colorScheme.accentGlow,
            top: -40,
            right: -30,
            opacity: 0.13,
        },

        cardHeaderRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
        },

        iconWrapLarge: {
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: colorScheme.overlayWhiteSoft,
            alignItems: "center",
            justifyContent: "center",
        },

        iconLarge: {
            fontSize: 22,
            color: colorScheme.accentHighlight,
        },

        pillDark: {
            backgroundColor: colorScheme.overlayAccentSoft,
            borderRadius: 999,
            paddingHorizontal: 11,
            paddingVertical: 7,
        },

        pillDarkText: {
            color: colorScheme.accentHighlight,
            fontSize: 12,
            fontWeight: "700",
        },

        primaryTitle: {
            fontSize: 26,
            lineHeight: 31,
            fontWeight: "800",
            color: colorScheme.whiteWarm,
            marginBottom: 9,
            maxWidth: "82%",
        },

        primaryDescription: {
            fontSize: 14,
            lineHeight: 21,
            color: colorScheme.textOnDark,
            maxWidth: "94%",
            marginBottom: 18,
        },

        primaryFooter: {
            marginTop: "auto",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },

        primaryFooterText: {
            color: colorScheme.whiteWarm,
            fontWeight: "700",
            fontSize: 14.5,
        },

        primaryArrow: {
            color: colorScheme.accentHighlight,
            fontSize: 22,
            fontWeight: "700",
        },

        secondaryActionCardFull: {
            backgroundColor: colorScheme.whiteWarmCard,
            borderRadius: 28,
            paddingHorizontal: 18,
            paddingTop: 18,
            paddingBottom: 18,
            minHeight: 150,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
            width: "100%",
            marginBottom: 14,
        },

        smallTopRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
        },

        iconWrapSmall: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colorScheme.panelBackgroundAlt,
            alignItems: "center",
            justifyContent: "center",
        },

        iconSmall: {
            fontSize: 18,
            color: colorScheme.textAccentSoft,
        },

        cornerText: {
            fontSize: 12,
            fontWeight: "700",
            color: colorScheme.textLabel,
        },

        secondaryTitle: {
            fontSize: 22,
            lineHeight: 26,
            fontWeight: "800",
            color: colorScheme.textDark,
            marginBottom: 6,
        },

        secondaryDescription: {
            fontSize: 13.5,
            lineHeight: 20,
            color: colorScheme.textMuted,
            maxWidth: "92%",
        },

        bottomSpacer: {
            height: 10,
        },

        logoutBar: {
            backgroundColor: colorScheme.accentButton,
            borderRadius: 28,
            paddingVertical: 16,
            paddingHorizontal: 18,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 6,
            width: "100%",
        },

        logoutBarPressed: {
            opacity: 0.92,
            transform: [{ scale: 0.99 }],
        },

        logoutBarText: {
            fontSize: 15,
            fontWeight: "800",
            color: colorScheme.textDefault,
            letterSpacing: 0.2,
        },

        cardPressed: {
            opacity: 0.93,
            transform: [{ scale: 0.985 }],
        },
    });
}

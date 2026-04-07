import React, { useEffect, useRef, useState } from "react";
import {
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
    NAV_CHECKIN_APPOINTMENT_CONFIRM,
    NAV_APP_TYPES,
    NAV_BARCODE_SCANNER,
    NAV_ADD_EMPLOYEE,
    NAV_SET_AVAILABILITY,
    NAV_LOGIN,
    NAV_SET_THEME,
} from "../consts";
import { useTheme } from "../styles";
import { colorSchemeGreens } from "../colorScheme";
import {
    AppIcon,
    IconPalette
} from "../icons";

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
        route: NAV_CHECKIN_APPOINTMENT_CONFIRM,
        pill: "Front desk",
        icon: "clipboard-check",
        title: "Confirm Appointment Requests",
        description:
            "Review arrivals and confirm appointment requests from the appointment queue.",
    },
    {
        route: NAV_BARCODE_SCANNER,
        pill: "Operations",
        icon: "qrcode",
        title: "Check-In Scanner",
        description: "Open the scanner to check-in a customer.",
    },
    {
        route: NAV_CHECKIN_CONFIRM_ADMIN_LIST,
        pill: "Operations",
        icon: "users",
        title: "Waiting Room",
        description:
            "View and call for Clients in the Waiting Room.",
    },
    {
        route: NAV_APP_TYPES,
        pill: "Catalog",
        icon: "list-ul",
        title: "Appointment types",
        description: "Configure services and how they appear when booking.",
    },
    {
        route: NAV_ADD_EMPLOYEE,
        pill: "Team",
        icon: "user-plus",
        title: "Add employee",
        description: "Create staff accounts and keep the roster up to date.",
    },
    {
        route: NAV_SET_AVAILABILITY,
        pill: "Scheduling",
        icon: "clock",
        title: "Set availability",
        description: "Define when stylists and services can be booked.",
    },
];

export function AdminHomepageScreen({ navigation }) {
    const commonUi = useTheme((state) => state.getCommonUi)();
    const colorScheme = useTheme((state) => state.getScheme)() ?? colorSchemeGreens;

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
                    commonUi.screen.pageInnerGaps,
                    { opacity: fadeIn, transform: [{ translateY: slideUp }] },
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
                        <Text style={commonUi.hero.heroText}>
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

                {ADMIN_ACTIONS.map((action) => (
                    <Pressable
                        key={action.route}
                        style={({ pressed }) => [
                            commonUi.card.secondaryActionCard,
                            pressed && commonUi.card.cardPressed,
                        ]}
                        onPress={() => navigation.navigate(action.route)}
                    >
                        <View style={commonUi.card.smallTopRow}>
                            <View style={commonUi.card.iconWrapSmall}>
                                <AppIcon name={action.icon} size={16} color={colorScheme.textAccent} />
                            </View>
                            <Text style={commonUi.card.cornerText}>{action.pill}</Text>
                        </View>

                        <Text style={commonUi.card.secondaryTitle}>{action.title}</Text>
                        <Text style={commonUi.card.secondaryDescription}>{action.description}</Text>
                    </Pressable>
                ))}

                <Pressable
                    style={({ pressed }) => [
                        commonUi.auth.inlineCtaButton,
                        pressed && commonUi.card.pressed,
                    ]}
                    onPress={() => navigation.navigate(NAV_SET_THEME)}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                        <Text style={commonUi.auth.inlineCtaButtonText}>
                            Set Theme
                        </Text>
                        <IconPalette size={16} color={ colorScheme.textDefault } style={{ marginLeft: 6 }} />
                    </View>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        commonUi.auth.inlineCtaButton,
                        pressed && commonUi.card.pressed,
                    ]}
                    onPress={handleLogout}
                >
                    <Text style={commonUi.auth.inlineCtaButtonText}>Log Out</Text>
                </Pressable>
            </Animated.View>
        </ScrollView>
    );
}

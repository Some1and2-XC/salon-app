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
import { showAppToast } from "../utils";
import { NAV_BOOKING, NAV_CHECKIN, NAV_LOGIN, NAV_SET_THEME, TOAST_TYPE_SUCCESS } from "../consts";
import { useTheme } from "../styles";
import { colorSchemeGreens, MAP_COLOR_SCHEME } from "../colorScheme";

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

export function HomeScreen({ navigation, route }) {

    const commonUi = useTheme((state) => state.getCommonUi)();
    const scheme = useTheme((state) => state.scheme);
    const colorScheme = MAP_COLOR_SCHEME[scheme] ?? colorSchemeBrown;

    const { width, height } = useWindowDimensions();

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

    useEffect(() => {
        if (!route?.params?.toastMessage) return;
        showAppToast(TOAST_TYPE_SUCCESS, route?.params?.toastMessage);
    }, []);

    const blob1Y = float1.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -14],
    });

    const blob2Y = float2.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 16],
    });

    const handleLogout = async () => {
        await signOut(auth);
        navigation.navigate(NAV_LOGIN);
    };

    const heroMinHeight = Math.max(240, Math.min(height * 0.33, 310));

    return (
        <ScrollView style={ commonUi.screen.pageMargins }>
            <Animated.View
                style={[ commonUi.screen.pageInnerGaps, {
                    opacity: fadeIn,
                    transform: [{ translateY: slideUp }],
                }]}
            >

                <View style={ commonUi.hero.heroCard }>

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
                        <Text style={commonUi.hero.heroTitleAccent}>Dashboard</Text>
                        <Text style={commonUi.hero.heroText}>
                            Manage check-ins and book appointments in one clean, smooth
                            workspace.
                        </Text>
                    </View>

                    <View style={commonUi.hero.metaRow}>
                        <View style={commonUi.hero.metaChip}>
                            <Text style={commonUi.hero.metaChipText}>{getTodayLabel()}</Text>
                        </View>
                    </View>

                    <View style={commonUi.hero.heroFadeWrap}>
                        <View style={commonUi.hero.heroFadeMain} />
                        <View style={commonUi.hero.heroFadeSmall} />
                    </View>
                </View>

                <Pressable
                    style={({ pressed }) => [
                        commonUi.card.primaryActionCard,
                        pressed && commonUi.card.cardPressed,
                    ]}
                    onPress={() => navigation.navigate(NAV_CHECKIN)}
                >
                    <View style={commonUi.card.cardGlow} />
                    <View style={commonUi.card.cardHeaderRow}>
                        <View style={commonUi.card.iconWrapLarge}>
                            <Text style={commonUi.card.iconLarge}>✦</Text>
                        </View>
                        <View style={commonUi.card.pillDark}>
                            <Text style={commonUi.card.pillDarkText}>Front Desk</Text>
                        </View>
                    </View>
                    <Text style={commonUi.card.primaryTitle}>Customer Check In</Text>
                    <Text style={commonUi.card.primaryDescription}>
                        Quickly confirm a client's arrival and keep the check-in
                        experience fast and organized.
                    </Text>
                    <View style={commonUi.card.primaryFooter}>
                        <Text style={commonUi.card.primaryFooterText}>Open check-in</Text>
                        <Text style={commonUi.card.primaryArrow}>→</Text>
                    </View>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        commonUi.card.secondaryActionCard,
                        pressed && commonUi.card.cardPressed,
                    ]}
                    onPress={() => navigation.navigate(NAV_BOOKING)}
                >
                    <View style={commonUi.card.smallTopRow}>
                        <View style={commonUi.card.iconWrapSmall}>
                            <Text style={commonUi.card.iconSmall}>◎</Text>
                        </View>
                        <Text style={commonUi.card.cornerText}>Schedule</Text>
                    </View>
                    <Text style={commonUi.card.secondaryTitle}>Book Appointment</Text>
                    <Text style={commonUi.hero.heroText}>
                        Create a new booking with a smoother scheduling flow.
                    </Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        commonUi.auth.inlineCtaButton,
                        pressed && commonUi.auth.cardPressed,
                    ]}
                    onPress={() => navigation.navigate(NAV_SET_THEME) }
                >
                    <Text style={commonUi.auth.inlineCtaButtonText}>Set Theme &#x1F3A8;</Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        commonUi.auth.inlineCtaButton,
                        pressed && commonUi.auth.cardPressed,
                    ]}
                    onPress={handleLogout}
                >
                    <Text style={commonUi.auth.inlineCtaButtonText}>Log Out</Text>
                </Pressable>
            </Animated.View>
        </ScrollView>
    );
}

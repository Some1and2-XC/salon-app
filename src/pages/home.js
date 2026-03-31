import React, { useEffect, useRef } from "react";
import {
    StyleSheet,
    Text,
    View,
    Pressable,
    SafeAreaView,
    Platform,
    StatusBar,
    ScrollView,
    Animated,
    useWindowDimensions,
} from "react-native";

import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { NAV_CHECKIN, NAV_BOOKING, NAV_LOGIN } from "../consts";

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

export function HomeScreen({ navigation }) {
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

    const heroMinHeight = Math.max(240, Math.min(height * 0.33, 310));

    return (
        <SafeAreaView
            style={[styles.safeArea, Platform.OS === "web" && styles.safeAreaWeb]}
        >
            <StatusBar barStyle="dark-content" />
            <ScrollView
                style={[
                    styles.scrollView,
                    Platform.OS === "web" && styles.scrollViewWeb,
                ]}
                contentContainerStyle={[styles.scrollContent, { minHeight: height }]}
                showsVerticalScrollIndicator={false}
                bounces={true}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View
                    style={[
                        styles.pageWrap,
                        {
                            minHeight: height,
                            opacity: fadeIn,
                            transform: [{ translateY: slideUp }],
                        },
                    ]}
                >
                    <View style={styles.screenInner}>
                        <View style={[styles.heroCard, { minHeight: heroMinHeight }]}>
                            <Animated.View
                                style={[
                                    styles.blobOne,
                                    { transform: [{ translateY: blob1Y }] },
                                ]}
                                />
                            <Animated.View
                                style={[
                                    styles.blobTwo,
                                    { transform: [{ translateY: blob2Y }] },
                                ]}
                                />
                            <Animated.View
                                style={[
                                    styles.blobThree,
                                    {
                                        left: width * 0.56,
                                        transform: [{ translateY: blob1Y }],
                                    },
                                ]}
                                />

                            <View style={styles.heroTopRow}>
                                <Text style={styles.kicker}>{getGreeting()}</Text>
                            </View>

                            <View style={styles.heroTextBlock}>
                                <Text style={styles.heroTitle}>Salon Studio</Text>
                                <Text style={styles.heroTitleAccent}>Dashboard</Text>
                                <Text style={styles.heroText}>
                                    Manage check-ins and book appointments in one clean, smooth
                                    workspace.
                                </Text>
                            </View>

                            <View style={styles.metaRow}>
                                <View style={styles.metaChip}>
                                    <Text style={styles.metaChipText}>{getTodayLabel()}</Text>
                                </View>
                            </View>

                            <View style={styles.heroFadeWrap}>
                                <View style={styles.heroFadeMain} />
                                <View style={styles.heroFadeSmall} />
                            </View>
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.primaryActionCard,
                                pressed && styles.cardPressed,
                            ]}
                            onPress={() => navigation.navigate(NAV_CHECKIN)}
                            >
                            <View style={styles.cardGlow} />
                            <View style={styles.cardHeaderRow}>
                                <View style={styles.iconWrapLarge}>
                                    <Text style={styles.iconLarge}>✦</Text>
                                </View>
                                <View style={styles.pillDark}>
                                    <Text style={styles.pillDarkText}>Front Desk</Text>
                                </View>
                            </View>

                        <Text style={styles.primaryTitle}>Customer Check In</Text>
                        <Text style={styles.primaryDescription}>
                            Quickly confirm a client’s arrival and keep the check-in
                            experience fast and organized.
                        </Text>

                        <View style={styles.primaryFooter}>
                            <Text style={styles.primaryFooterText}>Open check-in</Text>
                            <Text style={styles.primaryArrow}>→</Text>
                        </View>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.secondaryActionCardFull,
                                pressed && styles.cardPressed,
                            ]}
                            onPress={() => navigation.navigate(NAV_BOOKING)}
                            >
                            <View style={styles.smallTopRow}>
                                <View style={styles.iconWrapSmall}>
                                    <Text style={styles.iconSmall}>◎</Text>
                                </View>
                                <Text style={styles.cornerText}>Schedule</Text>
                            </View>

                            <Text style={styles.secondaryTitle}>Book Appointment</Text>
                            <Text style={styles.secondaryDescription}>
                                Create a new booking with a smoother scheduling flow.
                            </Text>
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
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f5efe9",
    },

    safeAreaWeb: {
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
    },

    scrollView: {
        flex: 1,
    },

    scrollViewWeb: {
        minHeight: 0,
    },

    scrollContent: {
        flexGrow: 1,
        paddingBottom: 18,
    },

    pageWrap: {
        flex: 1,
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 10,
    },

    screenInner: {
        flex: 1,
        minHeight: "100%",
    },

    heroCard: {
        position: "relative",
        overflow: "hidden",
        borderRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 32,
        backgroundColor: "#ead7ca",
        marginBottom: 14,
        justifyContent: "space-between",
        width: "100%",
    },

    heroTopRow: {
        zIndex: 2,
    },

    heroTextBlock: {
        zIndex: 2,
        marginTop: 8,
        marginBottom: 18,
    },

    heroFadeWrap: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: -2,
        alignItems: "center",
    },

    heroFadeMain: {
        width: "84%",
        height: 26,
        backgroundColor: "#f3e7de",
        borderTopLeftRadius: 100,
        borderTopRightRadius: 100,
        opacity: 0.72,
    },

    heroFadeSmall: {
        width: "56%",
        height: 14,
        backgroundColor: "#f3e7de",
        marginTop: -4,
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        opacity: 0.95,
    },

    blobOne: {
        position: "absolute",
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: "#d4ab93",
        right: -55,
        top: -45,
        opacity: 0.35,
    },

    blobTwo: {
        position: "absolute",
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "#f6ece4",
        right: 48,
        bottom: -42,
        opacity: 0.95,
    },

    blobThree: {
        position: "absolute",
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: "#c7896b",
        top: 102,
        opacity: 0.12,
    },

    kicker: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1.7,
        textTransform: "uppercase",
        color: "#7f5d4d",
    },

    heroTitle: {
        fontSize: 38,
        fontWeight: "800",
        lineHeight: 41,
        color: "#231712",
    },

    heroTitleAccent: {
        fontSize: 38,
        fontWeight: "800",
        lineHeight: 41,
        color: "#9b664d",
        marginBottom: 12,
    },

    heroText: {
        fontSize: 15,
        lineHeight: 22,
        color: "#5e473c",
        maxWidth: "78%",
    },

    metaRow: {
        zIndex: 2,
        flexDirection: "row",
        flexWrap: "wrap",
    },

    metaChip: {
        backgroundColor: "#241713",
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 999,
        alignSelf: "flex-start",
    },

    metaChipText: {
        color: "#fffaf6",
        fontWeight: "700",
        fontSize: 12.5,
    },

    primaryActionCard: {
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#241713",
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
        backgroundColor: "#b97f5f",
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
        backgroundColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",
    },

    iconLarge: {
        fontSize: 22,
        color: "#f2d0b9",
    },

    pillDark: {
        backgroundColor: "rgba(242,208,185,0.12)",
        borderRadius: 999,
        paddingHorizontal: 11,
        paddingVertical: 7,
    },

    pillDarkText: {
        color: "#f2d0b9",
        fontSize: 12,
        fontWeight: "700",
    },

    primaryTitle: {
        fontSize: 26,
        lineHeight: 31,
        fontWeight: "800",
        color: "#fff8f3",
        marginBottom: 9,
        maxWidth: "82%",
    },

    primaryDescription: {
        fontSize: 14,
        lineHeight: 21,
        color: "#d8c2b5",
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
        color: "#fff8f3",
        fontWeight: "700",
        fontSize: 14.5,
    },

    primaryArrow: {
        color: "#f2d0b9",
        fontSize: 22,
        fontWeight: "700",
    },

    secondaryActionCardFull: {
        backgroundColor: "#fff8f2",
        borderRadius: 28,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 18,
        minHeight: 150,
        borderWidth: 1,
        borderColor: "#ead9ce",
        width: "100%",
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
        backgroundColor: "#f2e4d8",
        alignItems: "center",
        justifyContent: "center",
    },

    iconSmall: {
        fontSize: 18,
        color: "#7e5d4d",
    },

    cornerText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#8b6d5e",
    },

    secondaryTitle: {
        fontSize: 22,
        lineHeight: 26,
        fontWeight: "800",
        color: "#281c17",
        marginBottom: 6,
    },

    secondaryDescription: {
        fontSize: 13.5,
        lineHeight: 20,
        color: "#6a5348",
        maxWidth: "92%",
    },

    bottomSpacer: {
        height: 10,
    },

    logoutBar: {
        backgroundColor: "#d8b59f",
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
        color: "#2b1b15",
        letterSpacing: 0.2,
    },

    cardPressed: {
        opacity: 0.93,
        transform: [{ scale: 0.985 }],
    },
});
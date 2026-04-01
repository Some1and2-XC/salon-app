import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Alert,
    Pressable,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

import { auth } from "../firebaseConfig";
import { apiFetch } from "../utils";
import { sty } from "../styles";
import { NAV_HOME, NAV_SIGNUP, FIREBASE_AUTH_ERROR_MESSAGES  } from "../consts";

export function LoginScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [feedbackType, setFeedbackType] = useState("");

    const onLogin = async () => {
        // TODO centralize email + password validation.
        const trimmedEmail = email.trim();
        setFeedbackMessage("");
        setFeedbackType("");
        if (!trimmedEmail || !password) {
            setFeedbackMessage("Please enter your email and password.");
            setFeedbackType("error");
            return;
        }

        signInWithEmailAndPassword(auth, trimmedEmail, password)
            .then(() => apiFetch("/users/me"))
            .then((res) => res.json())
            // TODO replace loggedInAs with just pulling from the firebase token itself.
            .then((res) => navigation.navigate(NAV_HOME, { loggedInAs: trimmedEmail }))
            // TODO replace with global popup
            .catch((error) => {
                console.error("Login Failed", error);
                // TODO while replacing with global popup, fixing the inconsistency between the feedback for this
                // vs feedback for onForgotPassword
                setFeedbackMessage(FIREBASE_AUTH_ERROR_MESSAGES[error.code] ?? "Could not send password reset email. Please try again.");
                setFeedbackType("error");
            })
            ;

    };

    const onForgotPassword = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            // TODO replace with global popup
            Alert.alert(
                "Enter Email",
                "Type your email above first, then tap Forgot Password."
            );
            return;
        }

        sendPasswordResetEmail(auth, trimmedEmail)
            .then(() => Alert.alert("Reset Email Sent", "If an account exists for this email, a password reset link has been sent."))
            // TODO replace with global popup
            .catch((error) => Alert.alert(
                "Password Reset",
                FIREBASE_AUTH_ERROR_MESSAGES[error.code] ?? "Could not send password reset email. Please try again."
            ))
            ;

    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />

            <KeyboardAvoidingView
                style={styles.keyboardWrap}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.pageWrap}>
                        <View style={styles.centerWrap}>
                            <Text style={styles.salonTitle}>SALON APP</Text>

                            <View style={styles.formCard}>
                                <Text style={styles.formTitle}>Log In</Text>

                                <Text style={styles.formDescription}>
                                    Enter your email and password to continue.
                                </Text>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Email</Text>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#8b6d5e"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Password</Text>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your password"
                                        placeholderTextColor="#8b6d5e"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>

                                {feedbackMessage ? (
                                    <Text
                                        style={[
                                            styles.feedbackText,
                                            feedbackType === "success"
                                                ? styles.feedbackSuccess
                                                : styles.feedbackError,
                                        ]}
                                    >
                                        {feedbackMessage}
                                    </Text>
                                ) : null}

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.primaryButton,
                                        pressed && styles.cardPressed,
                                    ]}
                                    onPress={onLogin}
                                >
                                    <Text style={styles.primaryButtonText}>Log In</Text>
                                </Pressable>

                                <View style={styles.dividerWrap}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>OR</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                <View style={styles.signupInlineWrap}>
                                    <Text style={styles.signupText}>
                                        Don&apos;t have an account?
                                    </Text>

                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.signupButton,
                                            pressed && styles.cardPressed,
                                        ]}
                                        onPress={() => navigation.navigate(NAV_SIGNUP)}
                                    >
                                        <Text style={styles.signupButtonText}>
                                            Create Account
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f5efe9",
    },

    keyboardWrap: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
    },

    pageWrap: {
        flex: 1,
        paddingHorizontal: 16,
    },

    centerWrap: {
        flex: 1,
        justifyContent: "center",
    },

    salonTitle: {
        fontSize: 34,
        fontWeight: "800",
        textAlign: "center",
        color: "#2b1b15",
        marginBottom: 28,
        letterSpacing: 1,
    },

    formCard: {
        backgroundColor: "#fff8f2",
        borderRadius: 26,
        padding: 20,
        borderWidth: 1,
        borderColor: "#ead9ce",
    },

    formTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#281c17",
        marginBottom: 6,
    },

    formDescription: {
        fontSize: 13.5,
        color: "#6a5348",
        marginBottom: 16,
    },

    inputGroup: {
        marginBottom: 14,
    },

    inputLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: "#8b6d5e",
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },

    input: {
        backgroundColor: "#f3e7de",
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: "#e5d2c5",
        fontSize: 15,
        fontWeight: "600",
        color: "#2b1b15",
    },
    feedbackText: {
        marginTop: 2,
        marginBottom: 10,
        fontSize: 13,
        fontWeight: "700",
    },
    feedbackError: {
        color: "#b3261e",
    },
    feedbackSuccess: {
        color: "#1d7a32",
    },

    primaryButton: {
        backgroundColor: "#241713",
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 6,
    },

    primaryButtonText: {
        color: "#fff8f3",
        fontSize: 15,
        fontWeight: "800",
    },

    secondaryButton: {
        backgroundColor: "#f2e4d8",
        borderRadius: 24,
        paddingVertical: 15,
        alignItems: "center",
        marginTop: 10,
    },

    secondaryButtonText: {
        color: "#2b1b15",
        fontSize: 14,
        fontWeight: "700",
    },

    dividerWrap: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 18,
        marginBottom: 16,
    },

    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#e3d2c7",
    },

    dividerText: {
        marginHorizontal: 12,
        fontSize: 12,
        fontWeight: "700",
        color: "#8b6d5e",
        letterSpacing: 0.8,
    },

    signupInlineWrap: {
        alignItems: "center",
    },

    signupText: {
        fontSize: 14,
        color: "#5e473c",
        marginBottom: 10,
    },

    signupButton: {
        backgroundColor: "#ead7ca",
        borderRadius: 999,
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderWidth: 1,
        borderColor: "#e0cabc",
    },

    signupButtonText: {
        fontSize: 14,
        fontWeight: "800",
        color: "#2b1b15",
    },

    cardPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
});

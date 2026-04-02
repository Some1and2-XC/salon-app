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
import { commonUi } from "../styles";
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
    safeArea: commonUi.screen.safeArea,
    keyboardWrap: commonUi.screen.keyboardWrap,
    scrollContent: commonUi.screen.scrollContent,
    pageWrap: commonUi.screen.pageWrapWide,
    centerWrap: commonUi.screen.centerWrap,
    salonTitle: commonUi.auth.salonTitle,
    formCard: commonUi.auth.formCard,
    formTitle: commonUi.auth.formTitle,
    formDescription: commonUi.auth.formDescription,
    inputGroup: commonUi.auth.inputGroup,
    inputLabel: commonUi.auth.inputLabel,
    input: commonUi.auth.input,
    feedbackText: commonUi.auth.feedbackText,
    feedbackError: commonUi.auth.feedbackError,
    feedbackSuccess: commonUi.auth.feedbackSuccess,
    primaryButton: commonUi.auth.primaryButton,
    primaryButtonText: commonUi.auth.primaryButtonText,

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

    dividerWrap: commonUi.auth.dividerWrap,
    dividerLine: commonUi.auth.dividerLine,
    dividerText: commonUi.auth.dividerText,

    signupInlineWrap: {
        alignItems: "center",
    },

    signupText: commonUi.auth.inlineCtaPromptText,
    signupButton: commonUi.auth.inlineCtaButton,
    signupButtonText: commonUi.auth.inlineCtaButtonText,
    cardPressed: commonUi.auth.cardPressed,
});

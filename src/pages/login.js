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
import { useTheme } from "../styles";
import { NAV_HOME, NAV_SIGNUP, FIREBASE_AUTH_ERROR_MESSAGES  } from "../consts";
import { colorScheme } from "../colorScheme";

export function LoginScreen({ navigation }) {

    const commonUi = useTheme((state) => state.getCommonUi)();
    const colorScheme = useTheme((state) => state.getScheme)();

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
        <KeyboardAvoidingView>
            <ScrollView style={commonUi.screen.pageMargins}>
                <Text style={commonUi.auth.salonTitle}>SALON APP</Text>

                <View style={commonUi.auth.formCard}>
                    <Text style={commonUi.auth.formTitle}>Log In</Text>

                    <Text style={commonUi.auth.formDescription}>
                        Enter your email and password to continue.
                    </Text>

                    <View style={commonUi.auth.inputGroup}>
                        <Text style={commonUi.auth.inputLabel}>Email</Text>

                        <TextInput
                            style={commonUi.auth.input}
                            placeholder="Enter your email"
                            placeholderTextColor={colorScheme.textLabel}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={commonUi.auth.inputGroup}>
                        <Text style={commonUi.auth.inputLabel}>Password</Text>

                        <TextInput
                            style={commonUi.auth.input}
                            placeholder="Enter your password"
                            placeholderTextColor={colorScheme.textLabel}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {feedbackMessage ? (
                        <Text
                            style={[
                                commonUi.auth.feedbackText,
                                feedbackType === "success"
                                    ? commonUi.auth.feedbackSuccess
                                    : commonUi.auth.feedbackError,
                            ]}
                        >
                            {feedbackMessage}
                        </Text>
                    ) : null}

                    <Pressable
                        style={({ pressed }) => [
                            commonUi.auth.primaryButton,
                            pressed && commonUi.auth.cardPressed,
                        ]}
                        onPress={onLogin}
                    >
                        <Text style={commonUi.auth.primaryButtonText}>Log In</Text>
                    </Pressable>

                    <View style={commonUi.auth.dividerWrap}>
                        <View style={commonUi.auth.dividerLine} />
                        <Text style={commonUi.auth.dividerText}>OR</Text>
                        <View style={commonUi.auth.dividerLine} />
                    </View>

                    <View style={commonUi.auth.signupInlineWrap}>
                        <Text style={commonUi.auth.signupText}>
                            Don&apos;t have an account?
                        </Text>

                        <Pressable
                            style={({ pressed }) => [
                                commonUi.auth.signupButton,
                                pressed && commonUi.auth.cardPressed,
                            ]}
                            onPress={() => navigation.navigate(NAV_SIGNUP)}
                        >
                            <Text style={commonUi.auth.signupButtonText}>
                                Create Account
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

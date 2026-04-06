import React, { useState } from "react";
import {
    Text,
    View,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    ScrollView,
} from "react-native";
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { apiFetch, showAppToast } from "../utils";
import { useTheme } from "../styles";
import { colorSchemeDefault, MAP_COLOR_SCHEME } from "../colorScheme";
import {
    NAV_HOME,
    NAV_ADMIN_HOMEPAGE,
    NAV_SIGNUP,
    FIREBASE_AUTH_ERROR_MESSAGES,
    TOAST_TYPE_SUCCESS,
    TOAST_TYPE_ERROR,
} from "../consts";


export function LoginScreen({ navigation }) {
    const commonUi = useTheme((state) => state.getCommonUi)();
    const scheme = useTheme((state) => state.scheme);
    const colorScheme = MAP_COLOR_SCHEME[scheme] ?? colorSchemeDefault;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onLogin = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail || !password) {
            showAppToast(
                TOAST_TYPE_ERROR,
                "Missing Fields",
                "Please enter your email and password."
            );
            return;
        }

        signInWithEmailAndPassword(auth, trimmedEmail, password)
            .then(() => apiFetch("/users/me"))
            .then((res) => res.json())
            .then((user) =>
                navigation.navigate(
                    user.admin ? NAV_ADMIN_HOMEPAGE : NAV_HOME,
                    {
                        toastMessage: `Logged in as ${trimmedEmail}`,
                    }
                )
            )
            .catch((error) =>
                showAppToast(
                    TOAST_TYPE_ERROR,
                    "Login Failed",
                    FIREBASE_AUTH_ERROR_MESSAGES[error.code] ?? "Login failed. Please try again."
                )
            );
    };

    const onForgotPassword = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            showAppToast(
                TOAST_TYPE_ERROR,
                "Enter Email",
                "Type your email above first, then tap Forgot Password."
            );
            return;
        }

        sendPasswordResetEmail(auth, trimmedEmail)
            .then(() =>
                showAppToast(
                    TOAST_TYPE_SUCCESS,
                    "Reset Email Sent",
                    "If an account exists for this email, a password reset link has been sent."
                )
            )
            .catch((error) =>
                showAppToast(
                    TOAST_TYPE_ERROR,
                    "Password Reset",
                    FIREBASE_AUTH_ERROR_MESSAGES[error.code] ??
                        "Could not send password reset email. Please try again."
                )
            );
    };

    return (
        <KeyboardAvoidingView>
            <ScrollView style={[commonUi.screen.pageMargins, commonUi.screen.pageInnerGaps ]}>
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
                            returnKeyType="next"
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
                            returnKeyType="done"
                            onSubmitEditing={onLogin}
                        />

                        <Pressable onPress={onForgotPassword}>
                            <Text style={commonUi.auth.forgotPasswordText}>Forgot Password?</Text>
                        </Pressable>
                    </View>

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

                    <View style={{ alignItems: "center" }}>
                        <Text style={commonUi.auth.inlineCtaPromptText}>
                            Don't have an account?
                        </Text>

                        <Pressable
                            style={({ pressed }) => [
                                commonUi.auth.inlineCtaButton,
                                pressed && commonUi.auth.cardPressed,
                            ]}
                            onPress={() => navigation.navigate(NAV_SIGNUP)}
                        >
                            <Text style={commonUi.auth.inlineCtaButtonText}>
                                Create Account
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

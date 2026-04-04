import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Pressable,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { auth } from "../firebaseConfig";
import { apiFetch, showAppToast } from "../utils";
import { useTheme } from "../styles";
import { NAV_HOME, NAV_SIGNUP, FIREBASE_AUTH_ERROR_MESSAGES, TOAST_TYPE_SUCCESS, TOAST_TYPE_ERROR } from "../consts";
import { colorScheme } from "../colorScheme";

export function SignupScreen({ navigation }) {

    const commonUi = useTheme((state) => state.getCommonUi)();
    const colorScheme = useTheme((state) => state.getScheme)();

    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const onSignUp = async () => {
        // TODO centralize email + password validation.
        const trimmedEmail = email.trim();
        const trimmedFirstName = firstName.trim();
        const trimmedLastName = lastName.trim();

        if (
            !trimmedEmail ||
            !password ||
            !trimmedFirstName ||
            !trimmedLastName ||
            !confirmPassword
        ) {
            showAppToast(TOAST_TYPE_ERROR, "Please fill in all fields.");
            return;
        }

        if (trimmedFirstName.length < 2) {
            showAppToast(TOAST_TYPE_ERROR, "First name must be at least 2 characters.");
            return;
        }

        if (trimmedLastName.length < 2) {
            showAppToast(TOAST_TYPE_ERROR, "Last name must be at least 2 characters.");
            return;
        }

        if (password.length < 6) {
            showAppToast(TOAST_TYPE_ERROR, "Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            showAppToast(TOAST_TYPE_ERROR, "Passwords do not match.");
            return;
        }

        createUserWithEmailAndPassword(auth, trimmedEmail, password)
            .then(() => apiFetch("/users", {
                method: "POST",
                body: JSON.stringify({
                    email: trimmedEmail,
                    first_name: trimmedFirstName,
                    last_name: trimmedLastName,
                    phone: null,
                }),
            }))
            .then((res) => res.json())
            .then((res) => navigation.navigate(NAV_HOME, {
                toastMessage: `Account created for ${trimmedEmail}`,
            }))
            .catch((error) => showAppToast(TOAST_TYPE_ERROR, "Sign Up Failed", FIREBASE_AUTH_ERROR_MESSAGES[error.code] ?? "Sign up failed. Please try again."))
            ;

    };

    return (
        <KeyboardAvoidingView>
            <ScrollView style={commonUi.screen.pageMargins}>

                <Text style={commonUi.auth.salonTitle}>SALON APP</Text>

                <View style={commonUi.auth.formCard}>
                    <Text style={commonUi.auth.formTitle}>Create Account</Text>

                    <Text style={commonUi.auth.formDescription}>
                        Enter your details below to create your account.
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
                        <Text style={commonUi.auth.inputLabel}>First Name</Text>

                        <TextInput
                            style={commonUi.auth.input}
                            placeholder="Enter your first name"
                            placeholderTextColor={colorScheme.textLabel}
                            value={firstName}
                            onChangeText={setFirstName}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={commonUi.auth.inputGroup}>
                        <Text style={commonUi.auth.inputLabel}>Last Name</Text>

                        <TextInput
                            style={commonUi.auth.input}
                            placeholder="Enter your last name"
                            placeholderTextColor={colorScheme.textLabel}
                            value={lastName}
                            onChangeText={setLastName}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={commonUi.auth.inputGroup}>
                        <Text style={commonUi.auth.inputLabel}>Password</Text>

                        <TextInput
                            style={commonUi.auth.input}
                            placeholder="Enter a password"
                            placeholderTextColor={colorScheme.textLabel}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <View style={commonUi.auth.inputGroup}>
                        <Text style={commonUi.auth.inputLabel}>
                            Confirm Password
                        </Text>

                        <TextInput
                            style={commonUi.auth.input}
                            placeholder="Re-enter your password"
                            placeholderTextColor={colorScheme.textLabel}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            commonUi.auth.primaryButton,
                            pressed && commonUi.auth.cardPressed,
                        ]}
                        onPress={onSignUp}
                    >
                        <Text style={commonUi.auth.primaryButtonText}>
                            Sign Up
                        </Text>
                    </Pressable>

                    <View style={commonUi.auth.dividerWrap}>
                        <View style={commonUi.auth.dividerLine} />
                        <Text style={commonUi.auth.dividerText}>OR</Text>
                        <View style={commonUi.auth.dividerLine} />
                    </View>

                    <View style={{ alignItems: "center" }}>
                        <Text style={commonUi.auth.inlineCtaPromptText}>
                            Already have an account?
                        </Text>

                        <Pressable
                            style={({ pressed }) => [
                                commonUi.auth.inlineCtaButton,
                                pressed && commonUi.auth.cardPressed,
                            ]}
                            onPress={() => navigation.navigate(NAV_LOGIN)}
                        >
                            <Text style={commonUi.auth.inlineCtaButtonText}>
                                Back to Login
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

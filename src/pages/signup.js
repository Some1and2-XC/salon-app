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
import { apiFetch } from "../utils";
import { useTheme } from "../styles";
import { NAV_HOME, NAV_LOGIN, FIREBASE_AUTH_ERROR_MESSAGES } from "../consts";
import { colorScheme } from "../colorScheme";

export function SignupScreen({ navigation }) {

    const commonUi = useTheme((state) => state.getCommonUi)();
    const scheme = useTheme((state) => state.scheme);
    const colorScheme = MAP_COLOR_SCHEME[scheme] ?? colorSchemeBrown;

    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [feedbackType, setFeedbackType] = useState("");

    const onSignUp = async () => {
        // TODO centralize email + password validation.
        const trimmedEmail = email.trim();
        const trimmedFirstName = firstName.trim();
        const trimmedLastName = lastName.trim();
        setFeedbackMessage("");
        setFeedbackType("");

        if (
            !trimmedEmail ||
            !password ||
            !trimmedFirstName ||
            !trimmedLastName ||
            !confirmPassword
        ) {
            setFeedbackMessage("Please fill in all fields.");
            setFeedbackType("error");
            return;
        }

        if (trimmedFirstName.length < 2) {
            setFeedbackMessage("First name must be at least 2 characters.");
            setFeedbackType("error");
            return;
        }

        if (trimmedLastName.length < 2) {
            setFeedbackMessage("Last name must be at least 2 characters.");
            setFeedbackType("error");
            return;
        }

        if (password.length < 6) {
            setFeedbackMessage("Password must be at least 6 characters.");
            setFeedbackType("error");
            return;
        }

        if (password !== confirmPassword) {
            setFeedbackMessage("Passwords do not match.");
            setFeedbackType("error");
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
            // TODO replace loggedInAs with just pulling from the firebase token itself.
            .then((res) => navigation.navigate(NAV_HOME, {
                toastMessage: `Account created for ${trimmedEmail}`,
            }))
            .catch((error) => {
                // TODO replace with global popup
                console.error("Sign Up Failed", error);
                setFeedbackMessage(FIREBASE_AUTH_ERROR_MESSAGES[error.code] ?? "Sign up failed. Please try again.");
                setFeedbackType("error");
            })
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

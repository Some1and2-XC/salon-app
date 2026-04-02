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
import { commonUi } from "../styles";
import { NAV_HOME, NAV_LOGIN, FIREBASE_AUTH_ERROR_MESSAGES } from "../consts";

export function SignupScreen({ navigation }) {
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
        <SafeAreaView
            style={[styles.safeArea, Platform.OS === "web" && styles.safeAreaWeb]}
        >
            <StatusBar barStyle="dark-content" />

            {/* TODO Remove all platform specific behavior */}
            <KeyboardAvoidingView
                style={styles.keyboardWrap}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    style={[
                        styles.scrollView,
                        Platform.OS === "web" && styles.scrollViewWeb,
                    ]}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    nestedScrollEnabled={true}
                >
                    <View style={styles.pageWrap}>
                        <View style={styles.centerWrap}>
                            <Text style={styles.salonTitle}>SALON APP</Text>

                            <View style={styles.formCard}>
                                <Text style={styles.formTitle}>Create Account</Text>

                                <Text style={styles.formDescription}>
                                    Enter your details below to create your account.
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
                                    <Text style={styles.inputLabel}>First Name</Text>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your first name"
                                        placeholderTextColor="#8b6d5e"
                                        value={firstName}
                                        onChangeText={setFirstName}
                                        autoCapitalize="words"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Last Name</Text>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your last name"
                                        placeholderTextColor="#8b6d5e"
                                        value={lastName}
                                        onChangeText={setLastName}
                                        autoCapitalize="words"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Password</Text>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter a password"
                                        placeholderTextColor="#8b6d5e"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>
                                        Confirm Password
                                    </Text>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Re-enter your password"
                                        placeholderTextColor="#8b6d5e"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
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
                                    onPress={onSignUp}
                                >
                                    <Text style={styles.primaryButtonText}>
                                        Sign Up
                                    </Text>
                                </Pressable>

                                <View style={styles.dividerWrap}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>OR</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                <View style={styles.loginInlineWrap}>
                                    <Text style={styles.loginText}>
                                        Already have an account?
                                    </Text>

                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.loginButton,
                                            pressed && styles.cardPressed,
                                        ]}
                                        onPress={() => navigation.navigate(NAV_LOGIN)}
                                    >
                                        <Text style={styles.loginButtonText}>
                                            Back to Login
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
    safeAreaWeb: commonUi.screen.safeAreaWeb,
    keyboardWrap: commonUi.screen.keyboardWrap,
    scrollView: commonUi.screen.scrollView,
    scrollViewWeb: commonUi.screen.scrollViewWeb,
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

    dividerWrap: commonUi.auth.dividerWrap,
    dividerLine: commonUi.auth.dividerLine,
    dividerText: commonUi.auth.dividerText,

    loginInlineWrap: {
        alignItems: "center",
    },

    loginText: commonUi.auth.inlineCtaPromptText,
    loginButton: commonUi.auth.inlineCtaButton,
    loginButtonText: commonUi.auth.inlineCtaButtonText,
    cardPressed: commonUi.auth.cardPressed,
});

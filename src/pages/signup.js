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
import { NAV_HOME, NAV_LOGIN } from "../consts";

function getSignUpErrorMessage(code) {
    switch (code) {
        case "auth/email-already-in-use":
            return "An account already exists with this email.";
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        case "auth/weak-password":
            return "Password must be at least 6 characters.";
        default:
            return "Sign up failed. Please try again.";
    }
}

export function SignupScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [feedbackType, setFeedbackType] = useState("");

    const onSignUp = async () => {
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

        try {
            await createUserWithEmailAndPassword(auth, trimmedEmail, password);

            const res = await apiFetch("/users", {
                method: "POST",
                body: JSON.stringify({
                    email: trimmedEmail,
                    first_name: trimmedFirstName,
                    last_name: trimmedLastName,
                    phone: null,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to create user in backend!");
            }

            navigation.navigate(NAV_HOME, {
                toastMessage: `Account created for ${trimmedEmail}`,
            });
        } catch (error) {
            console.error("Sign Up Failed", error);
            setFeedbackMessage(getSignUpErrorMessage(error.code));
            setFeedbackType("error");
        }
    };

    return (
        <SafeAreaView
            style={[styles.safeArea, Platform.OS === "web" && styles.safeAreaWeb]}
        >
            <StatusBar barStyle="dark-content" />

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
    safeArea: {
        flex: 1,
        backgroundColor: "#f5efe9",
    },

    safeAreaWeb: {
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
    },

    keyboardWrap: {
        flex: 1,
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

    loginInlineWrap: {
        alignItems: "center",
    },

    loginText: {
        fontSize: 14,
        color: "#5e473c",
        marginBottom: 10,
    },

    loginButton: {
        backgroundColor: "#ead7ca",
        borderRadius: 999,
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderWidth: 1,
        borderColor: "#e0cabc",
    },

    loginButtonText: {
        fontSize: 14,
        fontWeight: "800",
        color: "#2b1b15",
    },

    cardPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
});
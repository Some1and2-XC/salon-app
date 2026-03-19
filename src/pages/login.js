import { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Button,
    Alert,
} from 'react-native';

import { apiFetch } from "../utils";
import { sty } from "../styles";
import { NAV_SIGNUP } from "../consts";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

function getLoginErrorMessage(code) {
  switch (code) {
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/user-not-found":
      return "No account exists with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return "Login failed. Please try again.";
  }
}

import {
    NAV_HOME,
} from "../consts";

export function LoginScreen({ navigation }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onLogin = async () => {

        const trimmedEmail = email.trim();
        const auth = getAuth();

        if (!trimmedEmail || !password) {
            Alert.alert("Missing Fields", "Please enter your email and password.");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, trimmedEmail, password);
            // Ensures user exists in back-end.
            const res = await apiFetch("/users/me");
            // TODO this may be an inappropriate response to not finding a user in the back-end
            // considering the user must exist within firebase.
            // Different behaviour should be looked into.
            if (!res.ok) throw new Error("User not found in backend!");
            navigation.navigate(NAV_HOME);

            // No navigation needed. App.js auth-gate will switch screens automatically.
        } catch (error) {
            console.error("Login Failed", getLoginErrorMessage(error.code));
            Alert.alert("Login Failed", getLoginErrorMessage(error.code));
        }
    };

    const onForgotPassword = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            Alert.alert(
                "Enter Email",
                "Type your email above first, then tap Forgot Password."
            );
            return;
        }

        try {
            await sendPasswordResetEmail(auth, trimmedEmail);
            Alert.alert("Email Sent", "Check your email to reset your password.");
        } catch (error) {
            let msg = "Could not send password reset email.";
            if (error.code === "auth/user-not-found") {
                msg = "No account exists with this email.";
            } else if (error.code === "auth/invalid-email") {
                msg = "Please enter a valid email address.";
            }
            Alert.alert("Password Reset", msg);
        }
    };

    return (

        <View style={ sty.container }>
            <Text style={ sty.h1 }>Welcome Back</Text>
            {/* <Text>Log in to continue</Text> */}

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                />

            <Button
                title="Log in"
                onPress={onLogin}
                />

            <Button
                title="Forgot Password?"
                onPress={onForgotPassword}
                />

            <View />

            <Text>Don’t have an account?</Text>

            <Button
                title="Create Account"
                onPress={() => navigation.navigate(NAV_SIGNUP)}
                />

        </View>

    );

}

import { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Alert,
    Button
} from 'react-native';

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { apiFetch } from "../utils";
import { sty } from "../styles";
import { NAV_LOGIN } from "../consts";

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

    const onSignUp = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail || !password || !firstName || !lastName || !confirmPassword) {
            Alert.alert("Missing Fields", "Please fill in all fields.");
            return;
        }

        if (firstName.length < 2) {
            Alert.alert("Invalid First Name! Must be at least 2 characters.");
            return;
        }

        if (lastName.length < 2) {
            Alert.alert("Invalid Last Name! Must be at least 2 characters.");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Weak Password", "Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Passwords Don’t Match", "Please make sure both passwords match.");
            return;
        }

        try {
            // Creates user in firebase DB
            await createUserWithEmailAndPassword(auth, trimmedEmail, password);
            // Creates user in our DB
            const res = await apiFetch("/users", {
                method: "POST",
                body: JSON.stringify({email, first_name: firstName, last_name: lastName, phone: null}),
            });

            if (!res.ok) throw new Error("Failed to create user in backend!");

            Alert.alert("Success", "Account created successfully!");
            // App.js auth-gate will show Home after signup automatically.
            // If you prefer returning to login, uncomment:
            // navigation.navigate(NAV_LOGIN);
        } catch (error) {
            console.error("Sign Up Failed", getSignUpErrorMessage(error.code));
            Alert.alert("Sign Up Failed", getSignUpErrorMessage(error.code));
        }
    };

    return (
        <View style={ sty.container }>
            <Text style={ sty.h1 } >Create Account</Text>
            {/* <Text style={ sty.h1 } >Sign up to continue</Text> */}

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="none"
            />

            <TextInput
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="none"
            />

            <TextInput
                placeholder="Password (min 6 chars)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TextInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

            <Button
                title="Sign Up"
                onPress={onSignUp}
                />

            <View />

            <Text>Already have an account?</Text>

            <Button
                title="Back to Login"
                onPress={() => navigation.navigate(NAV_LOGIN)}
                />

        </View>
    );

}

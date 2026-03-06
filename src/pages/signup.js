import { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Button,
    TouchableOpacity
} from 'react-native';

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

import {
    NAV_LOGIN
} from "../consts";

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
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const onSignUp = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail || !password || !confirmPassword) {
            Alert.alert("Missing Fields", "Please fill in all fields.");
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
            await createUserWithEmailAndPassword(auth, trimmedEmail, password);
            Alert.alert("Success", "Account created successfully!");
            // App.js auth-gate will show Home after signup automatically.
            // If you prefer returning to login, uncomment:
            // navigation.navigate(NAV_LOGIN);
        } catch (error) {
            Alert.alert("Sign Up Failed", getSignUpErrorMessage(error.code));
        }
    };

    return (
        <View>
            <Text>Create Account</Text>
            <Text>Sign up to continue</Text>

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
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

            <TouchableOpacity onPress={onSignUp}>
                <Text>Sign Up</Text>
            </TouchableOpacity>

            <View />

            <Text>Already have an account?</Text>
            <TouchableOpacity
                onPress={() => navigation.navigate(NAV_LOGIN)}
            >
                <Text>Back to Login</Text>
            </TouchableOpacity>
        </View>
    );

}

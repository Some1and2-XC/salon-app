import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';

export function SignupScreen({ navigation }) {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = () => {
        if (!username || !email || !password) {
            alert("Please fill all fields");
            return;
        }

        alert("Account Created!");
        navigation.navigate("Log In");
    };

    return (
        <View>
            <Text>Sign Up</Text>

            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />

            <TextInput
                placeholder="Email"
                value={email}
            onChangeText={setEmail}
            />

            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Button
                title="Create Account"
                onPress={handleSignUp}
            />

            <Button
                title="Back to Login"
                onPress={() => navigation.goBack()}
            />
        </View>
    );
}

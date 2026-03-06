import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';

export function LoginScreen({ navigation }) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (username === "" && password === "") {
            navigation.replace("Home");
        } else {
            Alert.alert("Login Failed", "Invalid username or password");
        }
    }


    return (
        <View>
            <Text>Login</Text>

            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />

            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Button
                title="Sign In"
                onPress={handleLogin}
            />

            <Button
                title="Go to Sign Up"
                onPress={() => navigation.navigate("Sign Up")}
            />
        </View>
    );
}

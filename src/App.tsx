import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { User } from "./db/index.ts";
import { ExampleHome } from "./pages/index.tsx";

const Stack = createStackNavigator();

// The different endpoints for various navigation values.
const NAV_EXAMPLE_HOME: string = "example-home";

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={ NAV_EXAMPLE_HOME }>
        <Stack.Screen name={ NAV_EXAMPLE_HOME } component={ ExampleHome } />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

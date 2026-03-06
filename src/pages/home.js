import { StyleSheet, Text, View, Button } from 'react-native';

import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

import {
    NAV_CHECKIN,
    NAV_BOOKING,
} from "../consts";

export function HomeScreen({ navigation }) {

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <View>
      <Text>Salon App Home</Text>

      <Button
        title="Customer Check In"
        onPress={() => navigation.navigate(NAV_CHECKIN)}
        />

      <View style={{ height: 20 }} />

      <Button
        title="Book Appointment"
        onPress={() => navigation.navigate(NAV_BOOKING)}
        />

      <View style={{ height: 20 }} />

      <Button title="Log Out" color="red" onPress={handleLogout} />
    </View>
  );

}

import { StyleSheet, Text, View, Button } from 'react-native';

export function HomeScreen({ navigation }) {
    return (
        <View>

        <Button
            title="Customer Check In"
            onPress={() => navigation.navigate("Customer Check In")}
        />

        <View style={{ height: 20 }} />

        <Button
            title="Book Appointment"
            onPress={() => navigation.navigate("Booking")}
        />
        </View>
    );
}
